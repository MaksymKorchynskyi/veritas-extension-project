"""Маршрут аналізу статті."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request

from app.models.schemas import AnalysisRequest, AnalysisResponse
from app.services.cache import AnalysisCache
from app.services.pipeline import process_article
from app.utils import get_domain

router = APIRouter()

MIN_TEXT_CHARS = 50
MAX_TEXT_CHARS = 200_000


def get_cache(request: Request) -> AnalysisCache:
    """FastAPI-залежність: кеш аналізу, створений разом із застосунком."""
    cache: AnalysisCache = request.app.state.analysis_cache
    return cache


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_article(
    request: AnalysisRequest,
    cache: Annotated[AnalysisCache, Depends(get_cache)],
) -> AnalysisResponse:
    """Аналіз достовірності статті через гібридний AI-конвеєр VERITAS."""
    headline = request.title.strip()

    if not request.paragraphs:
        raise HTTPException(status_code=400, detail="Article text too short (no paragraphs found)")

    full_text = " ".join(p.text for p in request.paragraphs)

    if len(full_text) < MIN_TEXT_CHARS:
        raise HTTPException(
            status_code=400, detail="Article text too short (minimum 50 characters)"
        )

    if len(full_text) > MAX_TEXT_CHARS:
        raise HTTPException(
            status_code=400, detail="Article text too long (maximum 200000 characters)"
        )

    if not headline:
        raise HTTPException(status_code=400, detail="Headline is required")

    article_domain = get_domain(request.url)

    cache_key = cache.make_key(article_domain, headline, request.language, full_text)
    cached_response = cache.get(cache_key)
    if cached_response is not None:
        return cached_response

    response = await process_article(request)

    # Деградовані відповіді (без scoring_inputs) не кешуємо, щоб наступний запит повторив аналіз.
    if response.scoring_inputs is not None:
        cache.set(cache_key, response)

    return response
