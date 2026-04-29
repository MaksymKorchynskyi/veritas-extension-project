"""
Core Hybrid AI Pipeline for VERITAS
Coordinates LLM Agents, OSINT, and Python-side Math for the Metzger (2007) Credibility Framework.
"""

import asyncio
import logging
from datetime import datetime
from pydantic import BaseModel, Field

from app.models.schemas import (
    AnalysisRequest, 
    AnalysisResponse, 
    Highlight,
    CriteriaScore,
    ScoringInputs,
    ExtractedClaimResult
)
from app.services.llm.claim_extractor import extract_factual_claims
from app.services.llm.article_metrics_extractor import extract_article_metrics
from app.services.osint import verify_claims_osint, check_domain_reputation
from app.utils import get_domain

logger = logging.getLogger(__name__)

async def process_article(request: AnalysisRequest) -> AnalysisResponse:
    """
    The main execution flow for the Metzger (2007) Pipeline.
    """
    logger.info(f"Starting Metzger Pipeline for: {request.title}")
    
    headline = request.title.strip()
    formatted_text_parts = [f"[ID: {p.id}] {p.text}" for p in request.paragraphs]
    formatted_article_text = "\n\n".join(formatted_text_parts)
    article_domain = get_domain(request.url)
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    # ---------------------------------------------------------
    # STEP 1: PARALLEL DATA GATHERING (Facts + Reputation)
    # ---------------------------------------------------------
    common_prompt = f"""
    TODAY'S DATE IS: {current_date}.
    SOURCE URL: {request.url}
    HEADLINE: {headline}
    ARTICLE TEXT:
    {formatted_article_text}
    """
    
    fact_task = extract_factual_claims(common_prompt)
    reputation_task = check_domain_reputation(article_domain)
    total_words = len(formatted_article_text.split())
    
    fact_res, reputation_res = await asyncio.gather(
        fact_task, reputation_task,
        return_exceptions=True
    )
    
    if isinstance(fact_res, Exception):
        logger.error(f"Fact agent failed: {fact_res}")
        fact_res = None
    if isinstance(reputation_res, Exception):
        logger.error(f"Reputation task failed: {reputation_res}")
        reputation_res = None
        
    verifiable_claims = []
    if fact_res and getattr(fact_res, "verifiable_claims", None):
        verifiable_claims = fact_res.verifiable_claims

    # ---------------------------------------------------------
    # STEP 2: OSINT VERIFICATION (Google/DuckDuckGo)
    # ---------------------------------------------------------
    osint_results = {"osint_claims": []}
    all_highlights = []
    claim_statuses = {}  # paragraph_id -> status
    
    if verifiable_claims:
        osint_highlights, n_conf, n_contra = await verify_claims_osint(verifiable_claims)
        if osint_highlights:
            all_highlights.extend(osint_highlights)
            osint_results["osint_claims"] = [
                {"snippet": f"Paragraph {h.paragraph_id} claim contradicted: {h.reason}"} 
                for h in osint_highlights
            ]
            for h in osint_highlights:
                claim_statuses[h.paragraph_id] = "CONTRADICTED"
    else:
        n_conf, n_contra = 0, 0
        osint_highlights = []

    n_unverified = len(verifiable_claims) - n_conf - n_contra if verifiable_claims else 0
    
    # Build per-claim result list for frontend
    extracted_claims_results = []
    for claim in verifiable_claims:
        status = claim_statuses.get(claim.paragraph_id, "UNVERIFIED")
        if status == "UNVERIFIED" and n_conf > 0:
            # If this claim was not contradicted and we have confirms, check if it was confirmed
            # Simple heuristic: confirmed claims are those not in the contradicted set
            pass
        extracted_claims_results.append(
            ExtractedClaimResult(
                paragraph_id=claim.paragraph_id,
                claim_text=claim.claim_text,
                status=status
            )
        )

    # ---------------------------------------------------------
    # STEP 3: METZGER JUDGE AGENT (Accuracy & Objectivity)
    # ---------------------------------------------------------
    judge_res = await extract_article_metrics(
        article_text=formatted_article_text,
        osint_results=osint_results,
        language=request.language
    )
    
    if not judge_res:
        logger.error("Judge Agent failed. Using fallback.")
        return AnalysisResponse(
            trust_score=50,
            criteria=CriteriaScore(
                credibility=50, transparency=50, objectivity=50
            ),
            explainer="Помилка при генерації фінального вердикту Judge Agent.",
            highlights=[]
        )
        
    if judge_res.highlights:
        all_highlights.extend(judge_res.highlights)

    # ---------------------------------------------------------
    # STEP 4: MATHEMATICAL SCORING — Jøsang & Ismail (2002)
    # Beta Reputation System: E(p) = (r + W·a) / (r + s + W)
    # ---------------------------------------------------------
    from app.services.scoring import (
        calculate_credibility,
        calculate_transparency,
        calculate_objectivity,
        aggregate_trust_score
    )

    # Extract domain trust index as BRS base rate (prior 'a')
    domain_trust = 0.5  # uninformative prior (default)
    if reputation_res and hasattr(reputation_res, "trust_index"):
        domain_trust = reputation_res.trust_index

    citations_count = getattr(judge_res, "citations_count", 0)
    emotional_words_count = getattr(judge_res, "emotional_words_count", 0)

    logger.info(
        f"[BRS] Inputs: conf={n_conf}, contra={n_contra}, unverified={n_unverified}, "
        f"domain_trust={domain_trust:.2f}, citations={citations_count}, "
        f"emotional={emotional_words_count}, words={total_words}"
    )

    credibility = calculate_credibility(n_conf, n_contra, domain_trust, citations_count, emotional_words_count, n_unverified)
    transparency = calculate_transparency(citations_count)
    objectivity = calculate_objectivity(emotional_words_count, total_words)
    trust_score = aggregate_trust_score(credibility, transparency, objectivity)

    logger.info(
        f"[BRS] Scores: cred={credibility:.1f}, trans={transparency:.1f}, "
        f"obj={objectivity:.1f} → trust={trust_score}"
    )

    final_api_highlights = [
        Highlight(
            paragraph_id=h.paragraph_id, 
            severity=h.severity, 
            category=h.category or "", 
            reason=h.reason or ""
        )
        for h in all_highlights
    ]

    # ---------------------------------------------------------
    # STEP 5: POST-SCORING AI SUMMARY
    # Generate explainer AFTER scoring is done, with full context
    # ---------------------------------------------------------
    from app.services.llm.base_agent import run_agent
    from app.models.schemas import JudgeEvaluation

    lang_label = "Ukrainian" if request.language == "uk" else "English"
    summary_prompt = f"""You must write your response ENTIRELY in {lang_label}.

ARTICLE TITLE: {headline}
SOURCE DOMAIN: {article_domain}

SCORING RESULTS:
- Trust Score: {trust_score}/100
- Credibility: {round(credibility, 1)}/100 (OSINT confirmed: {n_conf}, contradicted: {n_contra}, unverified: {n_unverified})
- Transparency: {round(transparency, 1)}/100 (explicit citations found: {citations_count})
- Objectivity: {round(objectivity, 1)}/100 (manipulative phrases: {emotional_words_count}, total words: {total_words})
- Domain trust index: {domain_trust}

HIGHLIGHTS FOUND: {len(final_api_highlights)}
EXTRACTED CLAIMS: {', '.join([c.claim_text for c in extracted_claims_results]) if extracted_claims_results else 'None'}

ARTICLE METRICS EXTRACTOR NOTES:
{judge_res.explainer if judge_res else 'N/A'}
"""

    summary_system_prompt = """You are the VERITAS AnalysisSummaryGenerator. Your task is to write a concise, professional analytical summary of an article's credibility assessment.

PROTOCOL:
1. Write 3-5 sentences in the LANGUAGE specified in the prompt.
2. Start by describing the source and its domain reputation.
3. Summarize key findings: how many claims were verified, whether citations are present, and if manipulative language was detected.
4. Conclude with the overall trust verdict using the numerical scores provided.
5. Maintain a clinical, professional tone. Do not editorialize. Do not use emojis.
6. If the credibility is below 50, emphasize which specific factors dragged the score down.
7. If OSINT contradicted claims, mention this explicitly as a critical finding."""

    class SummaryOutput(BaseModel):
        summary: str = Field(..., description="3-5 sentence analytical summary")

    try:
        summary_result = await run_agent(summary_prompt, summary_system_prompt, SummaryOutput)
        final_explainer = summary_result.summary if summary_result else judge_res.explainer
    except Exception as e:
        logger.warning(f"Summary generation failed, falling back: {e}")
        final_explainer = judge_res.explainer

    scoring_inputs = ScoringInputs(
        n_confirmed=n_conf,
        n_contradicted=n_contra,
        n_unverified=n_unverified,
        domain_trust=round(domain_trust, 2),
        citations_count=citations_count,
        emotional_words_count=emotional_words_count,
        total_words=total_words,
        found_citations=getattr(judge_res, "found_citations", []),
        found_emotional_words=getattr(judge_res, "found_emotional_words", [])
    )

    return AnalysisResponse(
        trust_score=trust_score,
        criteria=CriteriaScore(
            credibility=round(credibility, 1),
            transparency=round(transparency, 1),
            objectivity=round(objectivity, 1)
        ),
        explainer=final_explainer,
        highlights=final_api_highlights,
        scoring_inputs=scoring_inputs,
        extracted_claims=extracted_claims_results,
        ml_metrics={}
    )
