import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints import router as api_router
from app.services.cache import AnalysisCache

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%H:%M:%S"
)

logger = logging.getLogger(__name__)

API_VERSION = "2.0.0"

# Розширення браузера та локальні сторінки. Змінюється через змінну VERITAS_CORS_ORIGIN_REGEX.
DEFAULT_CORS_ORIGIN_REGEX = (
    r"^(chrome-extension|moz-extension)://[^/]+$"
    r"|^https?://(localhost|127\.0\.0\.1)(:\d+)?$"
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up VERITAS API...")
    yield
    logger.info("Shutting down VERITAS API...")


def create_app() -> FastAPI:
    """Створює застосунок FastAPI з CORS, кешем аналізу та маршрутами."""
    application = FastAPI(
        title="VERITAS API",
        description="Аналізатор достовірності новин — гібридний AI-конвеєр",
        version=API_VERSION,
        lifespan=lifespan
    )
    application.state.analysis_cache = AnalysisCache()

    application.add_middleware(
        CORSMiddleware,
        allow_origin_regex=os.getenv("VERITAS_CORS_ORIGIN_REGEX", DEFAULT_CORS_ORIGIN_REGEX),
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    @application.get("/health")
    async def health_check() -> dict[str, str]:
        """Ендпоінт перевірки стану сервера."""
        return {"status": "ok", "version": API_VERSION, "algorithm": "Hybrid AI Pipeline", "phase": "Enterprise"}

    application.include_router(api_router)
    return application


app = create_app()
