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
LLM_CALL_TIMEOUT_S = 120.0
DEFAULT_MAX_RETRIES = 4

T = TypeVar("T", bound=BaseModel)


def ai_available() -> bool:
    """Повертає True, якщо Gemini-клієнт налаштовано (є GEMINI_API_KEY)."""
    return client is not None


def default_generation_config() -> types.GenerateContentConfig:
    """Конфігурація генерації за замовчуванням для всіх агентів."""
    return types.GenerateContentConfig(
        temperature=0.05,
        top_p=0.8,
        top_k=40,
        max_output_tokens=8192,
    )


async def run_agent(
    prompt: str,
    system_instruction: str,
    response_schema: Type[T],
    *,
    max_retries: int = DEFAULT_MAX_RETRIES,
    retry_delay: float | None = None,
    generation_config: types.GenerateContentConfig | None = None,
) -> T | None:
    """
    Універсальна обгортка для запуску Gemini-агента зі структурованим виходом.

    - Використовує `instructor` для Pydantic-валідованих відповідей.
    - Повторює до `max_retries` разів; пауза між спробами `retry_delay` секунд
      (за замовчуванням лінійно зростає: 2, 4, 6, ...).
    - Чергує основну та резервну моделі при кожній спробі.
    - Обмежує тривалість кожного виклику значенням LLM_CALL_TIMEOUT_S.
    - Логує ланцюг міркувань, якщо присутній у відповіді.
    """
    if not client:
        logger.warning("AI client not available — skipping agent call.")
        return None

    models = [MODEL_NAME, FALLBACK_MODEL_NAME]
    config = generation_config or default_generation_config()

    for attempt in range(max_retries):
        current_model = models[attempt % len(models)]
        try:
            response = await asyncio.wait_for(
                client.chat.completions.create(
                    model=current_model,
                    response_model=response_schema,
                    messages=[
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": prompt},
                    ],
                    config=config,
                ),
                timeout=LLM_CALL_TIMEOUT_S,
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
                delay = retry_delay if retry_delay is not None else (attempt + 1) * 2
                logger.log(
                    logging.WARNING if is_overload else logging.ERROR,
                    f"Agent error ({current_model}, attempt {attempt+1}/{max_retries}): {e}. "
                    f"Retrying in {delay}s with {models[(attempt+1) % len(models)]}..."
                )
                await asyncio.sleep(delay)
            else:
                logger.error(f"Agent failed after {max_retries} attempts: {e}")
                return None