"""
ML Models Service
Handles local HuggingFace pipelines for NLP tasks (Propaganda, Toxicity, Clickbait).
"""

import asyncio
import logging
from transformers import pipeline

logger = logging.getLogger(__name__)

class HuggingFaceService:
    """
    Service for loading and running local HuggingFace pipelines.
    Models are loaded globally upon instantiation to save RAM and avoid reloading.
    """
    
    def __init__(self):
        self.toxicity_pipe = None
        self._is_initialized = False
        
    def initialize(self):
        if self._is_initialized:
            return
            
        logger.info("Initializing HuggingFace pipelines. This may take a moment...")
        try:
            # Toxicity Analysis
            self.toxicity_pipe = pipeline(
                "text-classification", 
                model="unitary/toxic-bert",
                truncation=True,
                max_length=512
            )
            
            self._is_initialized = True
            logger.info("Successfully loaded Toxicity pipeline.")
        except Exception as e:
            logger.error(f"Failed to load HuggingFace pipelines: {e}")
            self.toxicity_pipe = None

    def _analyze_sync(self, text_uk: str) -> dict:
        """Synchronous method to run the pipelines."""
        if not text_uk or not text_uk.strip():
            return {
                "toxicity_model": {"label": "UNKNOWN", "confidence": 0.0}
            }

        # If models failed to load, return safe defaults
        if not self.toxicity_pipe:
            logger.warning("Pipelines are not loaded. Returning default scores.")
            return {
                "toxicity_model": {"label": "UNKNOWN", "confidence": 0.0}
            }

        try:
            # 1. Toxicity
            toxicity_res = self.toxicity_pipe(text_uk)[0]

            return {
                "toxicity_model": {
                    "label": toxicity_res['label'].upper(),
                    "confidence": round(toxicity_res['score'], 4)
                }
            }
        except Exception as e:
            logger.error(f"Error during ML analysis: {e}")
            return {
                "error": "ML pipeline failed, fallback to neutral metrics."
            }

# Instantiate globally to load models into RAM once upon module import
ml_service = HuggingFaceService()

async def analyze_text_ml(text_uk: str) -> dict:
    """
    Asynchronously analyzes original text (e.g. Ukrainian) using local HuggingFace models.
    Wraps the synchronous pipeline execution in asyncio.to_thread to avoid blocking Event Loop.
    """
    return await asyncio.to_thread(ml_service._analyze_sync, text_uk)
