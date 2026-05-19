import hashlib
import time
from typing import Dict, Tuple
from fastapi import APIRouter, HTTPException

from app.models.schemas import AnalysisRequest, AnalysisResponse
from app.services.pipeline import process_article
from app.utils import get_domain

router = APIRouter()

_analysis_cache: Dict[str, Tuple[float, AnalysisResponse]] = {}
CACHE_TTL = 3600 * 12  # 12 hours

@router.post("/analyze", response_model=AnalysisResponse) 
async def analyze_article(request: AnalysisRequest):
    """
    Аналіз достовірності статті через гібридний AI-конвеєр VERITAS.
    """
    headline = request.title.strip()
    
    if not request.paragraphs:
        raise HTTPException(status_code=400, detail="Article text too short (no paragraphs found)")
        
    full_text = " ".join([p.text for p in request.paragraphs])
    
    if len(full_text) < 50:
        raise HTTPException(status_code=400, detail="Article text too short (minimum 50 characters)")
    
    if not headline:
        raise HTTPException(status_code=400, detail="Headline is required")
        
    article_domain = get_domain(request.url)
        
    cache_key = hashlib.sha256(f"{article_domain}_{headline}_{request.language}".encode()).hexdigest()
    if cache_key in _analysis_cache:
        cached_time, cached_response = _analysis_cache[cache_key]
        if time.time() - cached_time < CACHE_TTL:
            return cached_response
    
    response = await process_article(request)
    
    _analysis_cache[cache_key] = (time.time(), response)
    
    return response