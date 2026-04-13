import asyncio
import hashlib
import time
from typing import Dict, Tuple
from fastapi import APIRouter, HTTPException

from app.models.schemas import AnalysisRequest, AnalysisResponse, CriteriaScore, Highlight
from app.utils import extract_links
from app.services.agents import extract_analysis_data, run_validation_agent
from app.services.osint import verify_claims_osint, check_domain_reputation
from app.services.scoring import (
    calculate_source_score,
    calculate_objectivity_score,
    calculate_headline_score,
    calculate_density_score,
    calculate_logic_score,
    aggregate_trust_score,
    generate_explainer,
    get_domain,
)

router = APIRouter()

# In-memory cache: SHA256(text+lang) -> (timestamp, AnalysisResponse)
_analysis_cache: Dict[str, Tuple[float, AnalysisResponse]] = {}
CACHE_TTL = 3600 * 12  # 12 hours

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_article(request: AnalysisRequest):
    """
    Analyze article credibility using WMFA v2.0 algorithm with Concurrent Execution.
    """
    headline = request.title.strip()
    
    if not request.paragraphs:
        raise HTTPException(status_code=400, detail="Article text too short (no paragraphs found)")
        
    full_text = " ".join([p.text for p in request.paragraphs])
    word_count = len(full_text.split())
    
    if len(full_text) < 50:
        raise HTTPException(status_code=400, detail="Article text too short (minimum 50 characters)")
    
    if not headline:
        raise HTTPException(status_code=400, detail="Headline is required")
        
    article_domain = get_domain(request.url)
        
    # Check Cache based on Domain + Headline + Language
    cache_key = hashlib.sha256(f"{article_domain}_{headline}_{request.language}".encode()).hexdigest()
    if cache_key in _analysis_cache:
        cached_time, cached_response = _analysis_cache[cache_key]
        if time.time() - cached_time < CACHE_TTL:
            return cached_response
    
    # 🚀 Конкурентне виконання задач
    links_task = asyncio.to_thread(extract_links, request.html_content, article_domain)
    ai_task = extract_analysis_data(request.paragraphs, headline, url=request.url, language=request.language)
    reputation_task = check_domain_reputation(article_domain)
    
    article_links, raw_data, reputation = await asyncio.gather(links_task, ai_task, reputation_task)
    
    # 🌍 OSINT INTERNET VERIFICATION
    if raw_data.verifiable_claims:
        osint_highlights = await verify_claims_osint(raw_data.verifiable_claims)
        if osint_highlights:
            raw_data.highlights.extend(osint_highlights)
            
    # ⚡ ВАЛІДАЦІЯ (SUPREME JUDGE)
    # Збираємо сумарі метрик для агента
    counts_summary = f"Toxic: {raw_data.toxic_words_count}, clickbait triggers: {raw_data.clickbait_triggers_count}, logical fallacies: {raw_data.logical_fallacies_count}"
    
    validation_res = await run_validation_agent(
        paragraphs=request.paragraphs,
        headline=headline,
        unverified_highlights=raw_data.highlights,
        counts_summary=counts_summary,
        language=request.language
    )
    
    final_highlights = validation_res.approved_highlights if validation_res else raw_data.highlights
    
    # Step 2: Обчислення метрик
    source_score = calculate_source_score(
        article_domain=article_domain,
        links=article_links,
        text_citations=raw_data.text_citations,
        article_text=full_text,
        reputation_index=reputation.trust_index if reputation else None
    )
    
    objectivity_score = calculate_objectivity_score(
        toxic_count=raw_data.toxic_words_count,
        opinion_count=raw_data.opinion_sentences_count,
        word_count=word_count
    )
    
    headline_score = calculate_headline_score(
        clickbait_triggers=raw_data.clickbait_triggers_count,
        mismatch_severity=raw_data.headline_mismatch_severity,
        headline=headline
    )
    
    density_score = calculate_density_score(
        text=full_text,
        entity_count=raw_data.named_entities_count,
        word_count=word_count
    )
    
    logic_score = calculate_logic_score(
        fallacy_count=raw_data.logical_fallacies_count,
        imbalance_detected=raw_data.imbalance_detected
    )
    
    # 🧨 WMFA v5.0 CRITICAL PENALTY CHECK
    # Штраф -40 застосовується ТІЛЬКИ для доведених фейків (OSINT), а не для токсичності
    has_contradiction = any("спростовано" in str(h.category).lower() or "contradict" in str(h.category).lower() or "fake" in str(h.category).lower() for h in final_highlights)
    
    # Step 3: Агрегація
    trust_score = aggregate_trust_score(
        source_score=source_score,
        objectivity_score=objectivity_score,
        headline_score=headline_score,
        density_score=density_score,
        logic_score=logic_score,
        has_contradiction=has_contradiction,
        reputation_index=reputation.trust_index if reputation else None
    )
    
    # Step 4: Фінальний Пояснювач
    python_explainer = generate_explainer(
        trust_score=trust_score,
        source_score=source_score,
        objectivity_score=objectivity_score,
        headline_score=headline_score,
        density_score=density_score,
        logic_score=logic_score,
        has_contradiction=has_contradiction,
        reputation_index=reputation.trust_index if reputation else None,
        language=request.language
    )
    
    # Combine sources of explainers
    if validation_res and validation_res.final_explainer:
        explainer = validation_res.final_explainer
    else:
        base_explainer = raw_data.analysis_summary
        if reputation and reputation.background_summary:
            rep_prefix = "Publisher Reputation:" if request.language == "en" else "Репутація видання:"
            base_explainer = f"[{rep_prefix} {reputation.background_summary}] {base_explainer}"
            
        explainer = f"{base_explainer} {python_explainer}"
    
    highlights = [
        Highlight(
            paragraph_id=h.paragraph_id, 
            severity=h.severity, 
            category=h.category or "", 
            reason=h.reason or ""
        )
        for h in final_highlights
    ]
    
    response = AnalysisResponse(
        trust_score=round(trust_score),
        criteria=CriteriaScore(
            source_verification=round(source_score),
            objectivity=round(objectivity_score),
            headline_relevance=round(headline_score),
            factual_density=round(density_score),
            logical_consistency=round(logic_score)
        ),
        explainer=explainer,
        highlights=highlights
    )
    
    # Save to Cache
    _analysis_cache[cache_key] = (time.time(), response)
    
    return response

