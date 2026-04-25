"""
Base Agent module for Gemini API interaction.
"""

import os
import logging
import asyncio
from typing import TypeVar, Type
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel
import instructor

logger = logging.getLogger(__name__)
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
_base_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

if _base_client:
    client = instructor.from_genai(_base_client, mode=instructor.Mode.GENAI_STRUCTURED_OUTPUTS, use_async=True)
else:
    client = None

MODEL_NAME = "gemini-2.5-flash"
FALLBACK_MODEL_NAME = "gemini-3-flash-preview"

T = TypeVar('T', bound=BaseModel)

async def run_agent(prompt: str, system_instruction: str, response_schema: Type[T]) -> T | None:
    """Wrapper to run a specific agent and enforce its schema."""
    if not client:
        return None

    try:
        max_retries = 2
        current_model = MODEL_NAME
        
        for attempt in range(max_retries):
            try:
                response = await client.chat.completions.create(
                    model=current_model,
                    response_model=response_schema,
                    messages=[
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": prompt}
                    ],
                    config=types.GenerateContentConfig(
                        temperature=0.05, 
                        top_p=0.8,
                        top_k=40,
                        max_output_tokens=8192,
                    )
                )
                
                # EXTRACT AND PRINT THE CHAIN OF THOUGHT TO THE TERMINAL
                if hasattr(response, 'raw_thoughts') and response.raw_thoughts:
                    print("\n" + "="*50)
                    print(f"🤖 AI REASONING ENGINES ({current_model})")
                    print("="*50)
                    print(response.raw_thoughts)
                    print("="*50 + "\n")
                    
                return response
                
            except Exception as e:
                if attempt < max_retries - 1:
                    logger.warning(f"Error with {current_model}: {e}. Retrying... (Attempt {attempt + 1}/{max_retries})")
                    if current_model == MODEL_NAME:
                        current_model = FALLBACK_MODEL_NAME
                    await asyncio.sleep(1)
                else:
                    logger.error(f"Agent failed after all retries: {e}")
                    return None
    except Exception as e:
        logger.error(f"Agent execution error: {e}")
        return None
