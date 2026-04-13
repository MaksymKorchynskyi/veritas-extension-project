from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router

app = FastAPI(
    title="VERITAS API",
    description="News Credibility Analyzer - WMFA v2.0 Algorithm with Clean Architecture",
    version="1.0.0"
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
    return {"status": "ok", "version": "1.0.0", "algorithm": "WMFA v2.0", "phase": "Enterprise"}

# Register router
app.include_router(api_router)