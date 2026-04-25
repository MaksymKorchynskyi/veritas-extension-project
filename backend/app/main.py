from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router
from app.services.ml.ml_models import ml_service
import logging

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up VERITAS API...")
    ml_service.initialize()
    yield
    logger.info("Shutting down VERITAS API...")

app = FastAPI(
    title="VERITAS API",
    description="News Credibility Analyzer - Hybrid AI Pipeline",
    version="2.0.0",
    lifespan=lifespan
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
    return {"status": "ok", "version": "2.0.0", "algorithm": "Hybrid AI Pipeline", "phase": "Enterprise"}

# Register router
app.include_router(api_router)