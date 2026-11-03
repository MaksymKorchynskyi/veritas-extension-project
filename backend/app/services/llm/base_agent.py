"""Gemini-клієнт та універсальний запуск LLM-агентів зі структурованим виходом."""

import asyncio
import logging
import os
from functools import cache
from typing import TypeVar

import instructor
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel

logger = logging.getLogger(__name__)

MODEL_NAME = "gemini-2.5-flash"
FALLBACK_MODEL_NAME = "gemini-3-flash-preview"
LLM_CALL_TIMEOUT_S = 120.0
DEFAULT_MAX_RETRIES = 4
MAX_LOGGED_THOUGHTS_CHARS = 1500

T = TypeVar("T", bound=BaseModel)


@cache
def get_client() -> instructor.AsyncInstructor | None:
    """Створює (один раз) асинхронний клієнт Gemini або повертає None без GEMINI_API_KEY."""
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.warning("GEMINI_API_KEY not set — AI agents will be disabled.")
        return None
    return instructor.from_genai(
        genai.Client(api_key=api_key),
        mode=instructor.Mode.GENAI_STRUCTURED_OUTPUTS,
        use_async=True,
    )


def ai_available() -> bool:
    """Повертає True, якщо Gemini-клієнт налаштовано (є GEMINI_API_KEY)."""
    return get_client() is not None


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
    response_schema: type[T],
    *,
    max_retries: int = DEFAULT_MAX_RETRIES,
    retry_delay: float | None = None,
    generation_config: types.GenerateContentConfig | None = None,
) -> T | None:
    """Універсальна обгортка для запуску Gemini-агента зі структурованим виходом.

    - Використовує `instructor` для Pydantic-валідованих відповідей.
    - Повторює до `max_retries` разів; пауза між спробами `retry_delay` секунд
      (за замовчуванням лінійно зростає: 2, 4, 6, ...).
    - Чергує основну та резервну моделі при кожній спробі.
    - Обмежує тривалість кожного виклику значенням LLM_CALL_TIMEOUT_S.
    - Логує ланцюг міркувань, якщо присутній у відповіді.

    Returns:
        Валідована відповідь або None, якщо клієнт недоступний чи всі спроби невдалі.
    """
    client = get_client()
    if client is None:
        logger.warning("AI client not available — skipping agent call.")
        return None

    models = (MODEL_NAME, FALLBACK_MODEL_NAME)
    config = generation_config or default_generation_config()

    for attempt in range(max_retries):
        current_model = models[attempt % len(models)]
        try:
            response: T = await asyncio.wait_for(
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
        except Exception as exc:  # noqa: BLE001 - будь-яка помилка провайдера означає повтор
            if attempt == max_retries - 1:
                logger.error("Agent failed after %d attempts: %s", max_retries, exc)
                return None

            delay = retry_delay if retry_delay is not None else (attempt + 1) * 2
            err_str = str(exc)
            is_overload = (
                "503" in err_str or "UNAVAILABLE" in err_str or "overloaded" in err_str.lower()
            )
            logger.log(
                logging.WARNING if is_overload else logging.ERROR,
                "Agent error (%s, attempt %d/%d): %s. Retrying in %ss with %s...",
                current_model,
                attempt + 1,
                max_retries,
                exc,
                delay,
                models[(attempt + 1) % len(models)],
            )
            await asyncio.sleep(delay)
        else:
            _log_chain_of_thought(response, current_model)
            return response

    return None


def _log_chain_of_thought(response: BaseModel, model: str) -> None:
    """Логує `raw_thoughts` відповіді (якщо є), обрізаючи до MAX_LOGGED_THOUGHTS_CHARS."""
    thoughts = getattr(response, "raw_thoughts", None)
    if thoughts:
        bar = "=" * 60
        logger.info(
            "\n%s\n[%s] Chain of Thought:\n%s\n%s\n%s",
            bar,
            model,
            bar,
            thoughts[:MAX_LOGGED_THOUGHTS_CHARS],
            bar,
        )
