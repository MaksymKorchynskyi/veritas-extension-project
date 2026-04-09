"""
VERITAS Backend API
FastAPI application with WMFA v2.0 analysis engine
Phase 4: Enhanced source verification and AI explainer integration
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .models import AnalysisRequest, AnalysisResponse, CriteriaScore, Highlight
from .utils import clean_html, extract_links, count_words
from .ai_service import extract_analysis_data
from .core import (
    calculate_source_score,
    calculate_objectivity_score,
    calculate_headline_score,
    calculate_density_score,
    calculate_logic_score,
    aggregate_trust_score,
    generate_explainer,
    get_domain,
)

app = FastAPI(
    title="VERITAS API",
    description="News Credibility Analyzer - WMFA v2.0 Algorithm",
    version="0.4.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": "0.4.0", "algorithm": "WMFA v2.0", "phase": 4}


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_article(request: AnalysisRequest):
    """
    Analyze article credibility using WMFA v2.0 algorithm.
    
    Phase 4 Process:
    1. Extract raw data counts using Gemini AI (with war context awareness)
    2. Calculate individual criterion scores using Python formulas
    3. Apply source verification with domain weighting
    4. Generate AI-powered explainer summary
    5. Aggregate to final weighted trust score
    """
    # Validate input
    text = request.text.strip()
    headline = request.headline.strip()
    
    if len(text) < 50:
        raise HTTPException(
            status_code=400, 
            detail="Article text too short (minimum 50 characters)"
        )
    
    if not headline:
        raise HTTPException(
            status_code=400, 
            detail="Headline is required"
        )
    
    # Get article domain for source verification (Anti-SEO)
    article_domain = get_domain(request.url)
    
    # Step 1: Extract raw data using Gemini (with war context rules)
    raw_data = await extract_analysis_data(text, headline)
    
    # Get AI-generated analysis summary
    ai_summary = raw_data.get("analysis_summary", "")
    
    # Step 2: Calculate individual scores using Python formulas
    
    # 2.1 Source Verification (35%) - with domain weighting + text fallback
    source_score = calculate_source_score(
        article_domain=article_domain,
        links=[],  # Frontend extracts links, passed via request in future
        text_citations=raw_data.get("text_citations", []),
        article_text=text  # Phase 4: Text-based citation fallback
    )
    
    # 2.2 Objectivity (20%) - war context applied in AI prompt
    objectivity_score = calculate_objectivity_score(
        toxic_count=raw_data.get("toxic_words_count", 0),
        opinion_count=raw_data.get("opinion_sentences_count", 0)
    )
    
    # 2.3 Headline Relevance (15%) - with Python-side clickbait detection
    headline_score = calculate_headline_score(
        clickbait_triggers=raw_data.get("clickbait_triggers_count", 0),
        mismatch_severity=raw_data.get("headline_mismatch_severity", 0),
        headline=headline  # Python checks CAPSLOCK + keywords
    )
    
    # 2.4 Factual Density (15%)
    density_score = calculate_density_score(
        text=text,
        entity_count=raw_data.get("named_entities_count", 0)
    )
    
    # 2.5 Logical Consistency (15%)
    logic_score = calculate_logic_score(
        fallacy_count=raw_data.get("logical_fallacies_count", 0),
        imbalance_detected=raw_data.get("imbalance_detected", False)
    )
    
    # Step 3: Aggregate to final trust score
    trust_score = aggregate_trust_score(
        source_score=source_score,
        objectivity_score=objectivity_score,
        headline_score=headline_score,
        density_score=density_score,
        logic_score=logic_score
    )
    
    # Step 4: Generate combined explainer (Python + AI)
    python_explainer = generate_explainer(
        trust_score=trust_score,
        source_score=source_score,
        objectivity_score=objectivity_score,
        headline_score=headline_score,
        density_score=density_score,
        logic_score=logic_score
    )
    
    # Combine AI summary with Python explainer
    if ai_summary and not ai_summary.startswith("Analysis"):
        explainer = f"{ai_summary} {python_explainer}"
    else:
        explainer = python_explainer
    
    # Build highlights from raw data
    highlights = [
        Highlight(text=h["text"], severity=h["severity"], reason=h.get("reason", ""))
        for h in raw_data.get("highlights", [])
    ]
    
    # Build response
    return AnalysisResponse(
        trust_score=trust_score,
        criteria=CriteriaScore(
            source_verification=round(source_score, 2),
            objectivity=round(objectivity_score, 2),
            headline_relevance=round(headline_score, 2),
            factual_density=round(density_score, 2),
            logical_consistency=round(logic_score, 2)
        ),
        explainer=explainer,
        highlights=highlights
    )
