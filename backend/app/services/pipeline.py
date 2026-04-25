"""
Core Hybrid AI Pipeline for VERITAS
Coordinates Translation, ML Models, LLM Agents, OSINT, and the Supreme Judge.
"""

import asyncio
import logging
from typing import List
from datetime import datetime
from urllib.parse import urlparse

from app.models.schemas import (
    AnalysisRequest, 
    AnalysisResponse, 
    Highlight,
    GeminiHighlight,
    CriteriaScore
)
from app.services.ml.ml_models import analyze_text_ml
from app.services.llm.bias_agent import run_bias_agent
from app.services.llm.logic_agent import run_logic_agent
from app.services.llm.fact_agent import run_fact_agent
from app.services.llm.judge_agent import run_judge_agent
from app.services.osint import verify_claims_osint, check_domain_reputation

logger = logging.getLogger(__name__)

from app.utils import get_domain

async def process_article(request: AnalysisRequest) -> AnalysisResponse:
    """
    The main execution flow for the Hybrid AI Pipeline.
    """
    logger.info(f"Starting Hybrid Pipeline for: {request.title}")
    
    headline = request.title.strip()
    full_text = " ".join([p.text for p in request.paragraphs])
    article_domain = get_domain(request.url)
    
    # ---------------------------------------------------------
    # STEP 1: ML METRICS
    # ---------------------------------------------------------
    ml_metrics = await analyze_text_ml(full_text)
    logger.info(f"ML Metrics obtained: {ml_metrics}")
    
    # ---------------------------------------------------------
    # STEP 3: COGNITIVE MICRO-AGENTS
    # ---------------------------------------------------------
    formatted_text_parts = [f"[ID: {p.id}] {p.text}" for p in request.paragraphs]
    formatted_article_text = "\n\n".join(formatted_text_parts)
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    common_prompt = f"""
    TODAY'S DATE IS: {current_date}.
    IMPORTANT: You MUST generate all your output text strictly in the '{request.language}' language.
    SOURCE URL: {request.url}
    HEADLINE: {headline}
    ARTICLE TEXT:
    {formatted_article_text}
    """
    
    bias_task = run_bias_agent(common_prompt, ml_metrics=ml_metrics)
    logic_task = run_logic_agent(common_prompt, ml_metrics=ml_metrics)
    fact_task = run_fact_agent(common_prompt)
    reputation_task = check_domain_reputation(article_domain)
    
    results = await asyncio.gather(
        bias_task, logic_task, fact_task, reputation_task,
        return_exceptions=True
    )
    bias_res, logic_res, fact_res, reputation_res = results

    if isinstance(bias_res, Exception):
        logger.error(f"Bias agent failed: {bias_res}")
        bias_res = None
    if isinstance(logic_res, Exception):
        logger.error(f"Logic agent failed: {logic_res}")
        logic_res = None
    if isinstance(fact_res, Exception):
        logger.error(f"Fact agent failed: {fact_res}")
        fact_res = None
    if isinstance(reputation_res, Exception):
        logger.error(f"Reputation task failed: {reputation_res}")
        reputation_res = None
    
    all_highlights: List[GeminiHighlight] = []
    if bias_res and getattr(bias_res, "highlights", None):
        all_highlights.extend(bias_res.highlights)
    if logic_res and getattr(logic_res, "highlights", None):
        all_highlights.extend(logic_res.highlights)
        
    verifiable_claims = []
    if fact_res and getattr(fact_res, "verifiable_claims", None):
        verifiable_claims = fact_res.verifiable_claims
        
    # ---------------------------------------------------------
    # STEP 4: OSINT VERIFICATION
    # ---------------------------------------------------------
    osint_results = {
        "domain_reputation": reputation_res.model_dump() if reputation_res else None,
        "osint_claims": []
    }
    
    if verifiable_claims:
        from app.models.schemas import VerifiableClaim
        osint_highlights = await verify_claims_osint(verifiable_claims)
        if osint_highlights:
            all_highlights.extend(osint_highlights)
            osint_results["osint_claims"] = [h.model_dump() for h in osint_highlights]
            
    # ---------------------------------------------------------
    # STEP 5: SUPREME JUDGE
    # ---------------------------------------------------------
    verdict = await run_judge_agent(
        ml_metrics=ml_metrics,
        agent_highlights=all_highlights,
        osint_results=osint_results,
        language=request.language
    )
    
    if not verdict:
        logger.error("Judge Agent failed. Using fallback.")
        return AnalysisResponse(
            trust_score=50,
            criteria=CriteriaScore(
                source_verification=50, objectivity=50, headline_relevance=50, factual_density=50, logical_consistency=50
            ),
            explainer="Помилка при генерації фінального вердикту Judge Agent.",
            highlights=[]
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
    
    return AnalysisResponse(
        trust_score=verdict.trust_score,
        criteria=verdict.criteria,
        explainer=verdict.explainer,
        highlights=final_api_highlights,
        ml_metrics=ml_metrics
    )
