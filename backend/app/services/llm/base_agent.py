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
    client = instructor.from_genai(
        _base_client,
        mode=instructor.Mode.GENAI_STRUCTURED_OUTPUTS,
        use_async=True,
    )
else:
    client = None
    logger.warning("GEMINI_API_KEY not set — AI agents will be disabled.")

MODEL_NAME = "gemini-2.5-flash"
FALLBACK_MODEL_NAME = "gemini-3-flash-preview"

T = TypeVar("T", bound=BaseModel)


async def run_agent(prompt: str, system_instruction: str, response_schema: Type[T]) -> T | None:
    """
    Універсальна обгортка для запуску Gemini-агента зі структурованим виходом.

    - Використовує `instructor` для Pydantic-валідованих відповідей.
    - Повторює до 4 разів з експоненційним відступом.
    - Чергує основну та резервну моделі при кожній спробі.
    - Логує ланцюг міркувань, якщо присутній у відповіді.
    """
    if not client:
        logger.warning("AI client not available — skipping agent call.")
        return None

    max_retries = 4
    models = [MODEL_NAME, FALLBACK_MODEL_NAME]

    for attempt in range(max_retries):
        current_model = models[attempt % len(models)]
        try:
            response = await client.chat.completions.create(
                model=current_model,
                response_model=response_schema,
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt},
                ],
                config=types.GenerateContentConfig(
                    temperature=0.05,
                    top_p=0.8,
                    top_k=40,
                    max_output_tokens=8192,
                ),
            )

            if hasattr(response, "raw_thoughts") and response.raw_thoughts:
                logger.info(
                    f"\n{'='*60}\n"
                    f"[{current_model}] Chain of Thought:\n"
                    f"{'='*60}\n"
                    f"{response.raw_thoughts[:1500]}\n"
                    f"{'='*60}"
                )

            return response

        except Exception as e:
            err_str = str(e)
            is_overload = "503" in err_str or "UNAVAILABLE" in err_str or "overloaded" in err_str.lower()
            
            if attempt < max_retries - 1:
                delay = (attempt + 1) * 2  # 2s, 4s, 6s
                level = "warning" if is_overload else "error"
                logger.log(
                    logging.WARNING if is_overload else logging.ERROR,
                    f"Agent error ({current_model}, attempt {attempt+1}/{max_retries}): {e}. "
                    f"Retrying in {delay}s with {models[(attempt+1) % len(models)]}..."
                )
                await asyncio.sleep(delay)
            else:
                logger.error(f"Agent failed after {max_retries} attempts: {e}")
                return None