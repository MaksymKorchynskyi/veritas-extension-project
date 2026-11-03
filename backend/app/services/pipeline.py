"""Головний конвеєр аналізу статті за моделлю Metzger (2007) зі скорингом BRS."""

import asyncio
import logging
from dataclasses import dataclass, field
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    CriteriaScore,
    DomainReputationResult,
    ExtractedClaimResult,
    GeminiHighlight,
    Highlight,
    JudgeEvaluation,
    ParagraphModel,
    ScoringInputs,
    VerifiableClaim,
)
from app.services.cross_verification import check_domain_reputation, verify_claims
from app.services.llm.article_metrics_extractor import extract_article_metrics
from app.services.llm.base_agent import run_agent
from app.services.llm.claim_extractor import extract_factual_claims
from app.services.scoring import (
    aggregate_trust_score,
    calculate_credibility,
    calculate_objectivity,
    calculate_transparency,
)
from app.utils import get_domain

logger = logging.getLogger(__name__)

NEUTRAL_DOMAIN_TRUST = 0.5  # неінформативний пріор
NEUTRAL_SCORE = 50

SUMMARY_SYSTEM_PROMPT = """You are the VERITAS AnalysisSummaryGenerator. Your task is to write a concise, professional analytical summary of an article's credibility assessment.

PROTOCOL:
1. Write 3-5 sentences in the LANGUAGE specified in the prompt.
2. Start by describing the source and its domain reputation.
3. Summarize key findings: how many claims were verified, whether citations are present, and if manipulative language was detected.
4. Conclude with the overall trust verdict using the numerical scores provided.
5. Maintain a clinical, professional tone. Do not editorialize. Do not use emojis.
6. If the credibility is below 50, emphasize which specific factors dragged the score down.
7. If cross-verification contradicted claims, mention this explicitly as a critical finding."""


# Без docstring навмисно: Pydantic додав би його в JSON-схему, яку бачить модель.
class SummaryOutput(BaseModel):  # noqa: D101
    summary: str = Field(..., description="3-5 sentence analytical summary")


@dataclass
class _Verification:
    """Результат перехресної верифікації тез для подальшого скорингу."""

    highlights: list[GeminiHighlight] = field(default_factory=list)
    claims: list[ExtractedClaimResult] = field(default_factory=list)
    n_confirmed: int = 0
    n_contradicted: int = 0
    cv_results: dict[str, list[dict[str, str]]] = field(
        default_factory=lambda: {"verified_claims": []}
    )

    @property
    def n_unverified(self) -> int:
        """Кількість реально перевірених тез, які не вдалося ні підтвердити, ні спростувати."""
        return len(self.claims) - self.n_confirmed - self.n_contradicted


async def _gather_evidence(
    request: AnalysisRequest, article_text: str, article_domain: str
) -> tuple[list[VerifiableClaim], DomainReputationResult | None]:
    """Паралельно витягує тези та перевіряє репутацію домену; збої замінює порожніми значеннями."""
    common_prompt = f"""
    TODAY'S DATE IS: {datetime.now().strftime("%Y-%m-%d")}.
    SOURCE URL: {request.url}
    HEADLINE: {request.title.strip()}
    ARTICLE TEXT:
    {article_text}
    """

    fact_res, reputation_res = await asyncio.gather(
        extract_factual_claims(common_prompt),
        check_domain_reputation(article_domain),
        return_exceptions=True,
    )

    facts = None
    if isinstance(fact_res, BaseException):
        logger.error("Fact agent failed: %s", fact_res)
    else:
        facts = fact_res

    reputation = None
    if isinstance(reputation_res, BaseException):
        logger.error("Reputation task failed: %s", reputation_res)
    else:
        reputation = reputation_res

    return (facts.verifiable_claims if facts else []), reputation


async def _cross_verify(claims: list[VerifiableClaim]) -> _Verification:
    """Перевіряє тези через DuckDuckGo та готує дані для метрик і скорингу."""
    verification = _Verification()
    if not claims:
        return verification

    (
        highlights,
        verification.n_confirmed,
        verification.n_contradicted,
        details,
    ) = await verify_claims(claims)
    if highlights:
        verification.highlights.extend(highlights)
        verification.cv_results["verified_claims"] = [
            {"snippet": f"Paragraph {h.paragraph_id} claim contradicted: {h.reason}"}
            for h in highlights
        ]

    verification.claims = [
        ExtractedClaimResult(
            paragraph_id=d["paragraph_id"],
            claim_text=d["claim_text"],
            status=d["status"],
            evidence_url=d["evidence_url"],
        )
        for d in details
    ]
    return verification


def _fallback_response() -> AnalysisResponse:
    """Нейтральна відповідь, якщо агент метрик не спрацював."""
    return AnalysisResponse(
        trust_score=NEUTRAL_SCORE,
        criteria=CriteriaScore(
            credibility=NEUTRAL_SCORE, transparency=NEUTRAL_SCORE, objectivity=NEUTRAL_SCORE
        ),
        explainer="Помилка при генерації фінального вердикту Judge Agent.",
        highlights=[],
    )


def _count_words(paragraphs: list[ParagraphModel]) -> int:
    return sum(len(p.text.split()) for p in paragraphs)


async def _summarize(prompt: str, fallback: str) -> str:
    """Генерує фінальний AI-підсумок; при збої повертає `fallback`."""
    try:
        result = await run_agent(prompt, SUMMARY_SYSTEM_PROMPT, SummaryOutput)
    except Exception as exc:  # noqa: BLE001 - підсумок не критичний, є запасний варіант
        logger.warning("Summary generation failed, falling back: %s", exc)
        return fallback
    return result.summary if result else fallback


async def process_article(request: AnalysisRequest) -> AnalysisResponse:
    """Головний конвеєр аналізу за моделлю Metzger (2007).

    Кроки: збір свідчень (тези та репутація домену), перехресна верифікація,
    метрики статті, скоринг BRS (Jøsang & Ismail, 2002) і фінальний AI-підсумок.
    Якщо агент метрик недоступний, повертає нейтральну відповідь без `scoring_inputs`.
    """
    logger.info("Starting Metzger Pipeline for: %s", request.title)

    headline = request.title.strip()
    article_text = "\n\n".join(f"[ID: {p.id}] {p.text}" for p in request.paragraphs)
    article_domain = get_domain(request.url)
    total_words = _count_words(request.paragraphs)

    claims, reputation = await _gather_evidence(request, article_text, article_domain)
    verification = await _cross_verify(claims)

    judge: JudgeEvaluation | None = await extract_article_metrics(
        article_text=article_text,
        cv_results=verification.cv_results,
        language=request.language,
    )
    if not judge:
        logger.error("Judge Agent failed. Using fallback.")
        return _fallback_response()

    n_conf = verification.n_confirmed
    n_contra = verification.n_contradicted
    n_unverified = verification.n_unverified
    citations_count = judge.citations_count
    emotional_words_count = judge.emotional_words_count
    domain_trust = reputation.trust_index if reputation else NEUTRAL_DOMAIN_TRUST

    logger.info(
        "[BRS] Inputs: conf=%d, contra=%d, unverified=%d, domain_trust=%.2f, "
        "citations=%d, emotional=%d, words=%d",
        n_conf,
        n_contra,
        n_unverified,
        domain_trust,
        citations_count,
        emotional_words_count,
        total_words,
    )

    credibility = calculate_credibility(
        n_conf, n_contra, domain_trust, citations_count, emotional_words_count, n_unverified
    )
    transparency = calculate_transparency(citations_count)
    objectivity = calculate_objectivity(emotional_words_count, total_words)
    trust_score = aggregate_trust_score(credibility, transparency, objectivity)

    logger.info(
        "[BRS] Scores: cred=%.1f, trans=%.1f, obj=%.1f → trust=%s",
        credibility,
        transparency,
        objectivity,
        trust_score,
    )

    highlights = [
        Highlight(
            paragraph_id=h.paragraph_id,
            severity=h.severity,
            category=h.category or "",
            reason=h.reason or "",
        )
        for h in [*verification.highlights, *judge.highlights]
    ]

    lang_label = "Ukrainian" if request.language == "uk" else "English"
    claim_texts = (
        ", ".join(c.claim_text for c in verification.claims) if verification.claims else "None"
    )
    summary_prompt = f"""You must write your response ENTIRELY in {lang_label}.

ARTICLE TITLE: {headline}
SOURCE DOMAIN: {article_domain}

SCORING RESULTS:
- Trust Score: {trust_score}/100
- Credibility: {round(credibility, 1)}/100 (cross-verified confirmed: {n_conf}, contradicted: {n_contra}, unverified: {n_unverified})
- Transparency: {round(transparency, 1)}/100 (explicit citations found: {citations_count})
- Objectivity: {round(objectivity, 1)}/100 (manipulative phrases: {emotional_words_count}, total words: {total_words})
- Domain trust index: {domain_trust}

HIGHLIGHTS FOUND: {len(highlights)}
EXTRACTED CLAIMS: {claim_texts}

ARTICLE METRICS EXTRACTOR NOTES:
{judge.explainer}
"""
    explainer = await _summarize(summary_prompt, fallback=judge.explainer)

    return AnalysisResponse(
        trust_score=trust_score,
        criteria=CriteriaScore(
            credibility=round(credibility, 1),
            transparency=round(transparency, 1),
            objectivity=round(objectivity, 1),
        ),
        explainer=explainer,
        highlights=highlights,
        scoring_inputs=ScoringInputs(
            n_confirmed=n_conf,
            n_contradicted=n_contra,
            n_unverified=n_unverified,
            domain_trust=round(domain_trust, 2),
            citations_count=citations_count,
            emotional_words_count=emotional_words_count,
            total_words=total_words,
            found_citations=judge.found_citations,
            found_emotional_words=judge.found_emotional_words,
        ),
        extracted_claims=verification.claims,
    )
