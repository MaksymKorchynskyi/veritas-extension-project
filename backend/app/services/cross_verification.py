"""Перехресна верифікація тез через DuckDuckGo та оцінка репутації домену."""

import asyncio
import logging
from typing import Literal, TypedDict

from ddgs import DDGS
from ddgs.exceptions import RatelimitException
from google.genai import types

from app.models.schemas import (
    CrossReferenceResult,
    DomainReputationResult,
    GeminiHighlight,
    QueryGenerationResult,
    VerifiableClaim,
)
from app.services.domain_reputation import find_local_reputation
from app.services.llm.base_agent import ai_available, run_agent

logger = logging.getLogger(__name__)

SEARCH_TIMEOUT_S = 8.0
DDGS_HTTP_TIMEOUT_S = 5
MAX_SEARCH_RESULTS = 3
MAX_CLAIMS_TO_VERIFY = 5
AGENT_MAX_RETRIES = 2
AGENT_RETRY_DELAY_S = 1.0

ClaimStatus = Literal["CONFIRMED", "CONTRADICTED", "UNVERIFIED"]


class Snippet(TypedDict):
    """Сніпет результату пошуку."""

    body: str
    href: str


class ClaimDetail(TypedDict):
    """Результат верифікації однієї тези."""

    paragraph_id: int
    claim_text: str
    status: ClaimStatus
    evidence_url: str | None


QUERY_AGENT_PROMPT = """
You are the VERITAS SearchQueryGenerator. Your objective is to process a factual claim and generate a concise search query optimized for DuckDuckGo.

OPERATIONAL PROTOCOL:
- Produce a query consisting of 3-7 keywords. Do not generate full sentences or questions.
- The query MUST be in the SAME LANGUAGE as the original claim to ensure localized search results.
- Isolate the core entity, primary action, and temporal marker (e.g., date) if present.
- Strip all emotional, subjective, or narrative language. Retain strictly neutral, searchable terms.
"""

CROSS_AGENT_PROMPT = """
You are the VERITAS EvidenceCrossReferencer—a strict, objective analytical engine for fact verification.

INPUT PARAMETERS:
1. ORIGINAL CLAIM (extracted from the source article)
2. SEARCH RESULTS (snippets from external media/databases)

TASK DIRECTIVE: Conduct a comparative analysis between the search snippets and the original claim.

VERDICT PROTOCOL:
- CONFIRMED: At least one snippet explicitly corroborates the core factual elements of the claim (matching entities, dates, quantitative data).
- CONTRADICTED: At least one snippet presents empirical evidence that directly opposes or invalidates the core factual elements of the claim.
- UNVERIFIED: The snippets lack relevance, do not address the claim, or the claim is inherently unverifiable (e.g., future predictions, strategic opinions).

CRITICAL CONSTRAINTS:
- Claims involving future events, subjective emotions, or abstract strategies must universally default to UNVERIFIED.
- In cases of ambiguity between CONTRADICTED and UNVERIFIED, default to UNVERIFIED. CONTRADICTED is reserved strictly for demonstrable factual falsehoods.
- Provide a 1-2 sentence analytical 'reason' in the SAME LANGUAGE as the original claim.
- Maintain a clinical, detached professional tone. Do not utilize direct quotes or HTML entities in the rationale.
"""

REPUTATION_AGENT_PROMPT = """
You are the VERITAS DomainReputationEvaluator. Your function is to quantify a news domain's institutional trustworthiness based on external watchdog evaluations and search snippets.

SCORING MATRIX (trust_index):
- 0.8–1.0: Established global news agencies or institutions with rigorous editorial standards (e.g., AP, Reuters, BBC).
- 0.6–0.8: Reputable national media outlets demonstrating consistent fact-checking.
- 0.5: DEFAULT BASELINE. Apply when search snippets yield no explicit evidence of either reliability or bias.
- 0.3–0.5: Platforms with documented mixed reputation, sensationalism, or occasional unverified reporting.
- 0.0–0.3: Outlets with systemic bias, known disinformation campaigns, or conspiracy promotion.

CRITICAL CONSTRAINT: If the provided snippets do not explicitly categorize the publisher as biased, compromised, or unreliable, the trust_index MUST default to exactly 0.5.
Output a concise 'background_summary' detailing the institutional profile in 1-2 sentences.
"""


def _agent_config() -> types.GenerateContentConfig:
    return types.GenerateContentConfig(temperature=0.05)


async def run_query_agent(claim_text: str) -> str:
    """Генерує короткий пошуковий запит для тези; порожній рядок, якщо агент не відповів."""
    result = await run_agent(
        f"ORIGINAL CLAIM: {claim_text}",
        QUERY_AGENT_PROMPT,
        QueryGenerationResult,
        max_retries=AGENT_MAX_RETRIES,
        retry_delay=AGENT_RETRY_DELAY_S,
        generation_config=_agent_config(),
    )
    return result.english_query if result else ""


def _do_duckduckgo_search(query: str) -> list[Snippet]:
    try:
        results = DDGS(timeout=DDGS_HTTP_TIMEOUT_S).text(query, max_results=MAX_SEARCH_RESULTS)
        return [
            Snippet(body=r.get("body", ""), href=r.get("href", "")) for r in results if "body" in r
        ]
    except RatelimitException:
        logger.warning("DuckDuckGo RateLimit hit for query: %s", query)
    except Exception as exc:  # noqa: BLE001 - бібліотека пошуку кидає довільні помилки
        logger.error("DuckDuckGo error: %s", exc)
    return []


async def search_duckduckgo(query: str) -> list[Snippet]:
    """Асинхронний пошук у DuckDuckGo з обмеженням за часом; при будь-якій помилці повертає []."""
    if not query:
        return []
    try:
        return await asyncio.wait_for(
            asyncio.to_thread(_do_duckduckgo_search, query),
            timeout=SEARCH_TIMEOUT_S,
        )
    except TimeoutError:
        logger.warning("DuckDuckGo search timed out for query: %s", query)
    except Exception as exc:  # noqa: BLE001 - пошук не має ламати конвеєр
        logger.error("search_duckduckgo error: %s", exc)
    return []


def _format_snippets(snippets: list[Snippet]) -> str:
    return "\n".join(f"- {s['body']}" for s in snippets)


async def run_cross_agent(claim_text: str, snippets: list[Snippet]) -> CrossReferenceResult | None:
    """Порівнює тезу зі сніпетами пошуку й повертає вердикт; None, якщо агент недоступний."""
    if not ai_available() or not snippets:
        return None

    prompt = (
        f"ORIGINAL CLAIM: {claim_text}\n\nSEARCH RESULTS (SNIPPETS):\n{_format_snippets(snippets)}"
    )
    return await run_agent(
        prompt,
        CROSS_AGENT_PROMPT,
        CrossReferenceResult,
        max_retries=AGENT_MAX_RETRIES,
        retry_delay=AGENT_RETRY_DELAY_S,
        generation_config=_agent_config(),
    )


async def process_single_claim(
    claim: VerifiableClaim,
) -> tuple[ClaimStatus, GeminiHighlight | None, str | None]:
    """Обробляє одну тезу: генерація запиту, пошук і перехресна верифікація.

    Returns:
        Кортеж (статус, highlight для спростованої тези, URL доказу).
    """
    logger.info("[CrossVerify] Evaluating claim ID %s: %s", claim.paragraph_id, claim.claim_text)

    query = await run_query_agent(claim.claim_text)
    if not query:
        return "UNVERIFIED", None, None

    logger.info("[CrossVerify] Query generated: %s", query)

    snippets = await search_duckduckgo(query)
    if not snippets:
        return "UNVERIFIED", None, None

    verdict = await run_cross_agent(claim.claim_text, snippets)
    if not verdict:
        return "UNVERIFIED", None, None

    logger.info("[CrossVerify] Claim ID %s Verdict: %s", claim.paragraph_id, verdict.status)

    evidence_url = snippets[0]["href"]

    if verdict.status == "CONTRADICTED":
        highlight = GeminiHighlight(
            paragraph_id=claim.paragraph_id,
            severity="risk",
            category="Спростовано перехресною верифікацією",
            reason=verdict.reason,
        )
        return "CONTRADICTED", highlight, evidence_url

    if verdict.status == "CONFIRMED":
        return "CONFIRMED", None, evidence_url

    return "UNVERIFIED", None, None


async def verify_claims(
    claims: list[VerifiableClaim],
) -> tuple[list[GeminiHighlight], int, int, list[ClaimDetail]]:
    """Оркеструє паралельну перехресну верифікацію (до MAX_CLAIMS_TO_VERIFY тез).

    Returns:
        Кортеж (highlights, кількість підтверджених, кількість спростованих, деталі по тезах).
    """
    if not claims:
        return [], 0, 0, []

    target_claims = claims[:MAX_CLAIMS_TO_VERIFY]
    logger.info("[CrossVerify] Starting parallel verification for %d claims.", len(target_claims))

    results = await asyncio.gather(*(process_single_claim(c) for c in target_claims))

    highlights: list[GeminiHighlight] = []
    n_conf = 0
    n_contra = 0
    details: list[ClaimDetail] = []

    for claim, (status, highlight, evidence_url) in zip(target_claims, results, strict=True):
        if status == "CONFIRMED":
            n_conf += 1
        elif status == "CONTRADICTED":
            n_contra += 1
            if highlight:
                highlights.append(highlight)

        details.append(
            ClaimDetail(
                paragraph_id=claim.paragraph_id,
                claim_text=claim.claim_text,
                status=status,
                evidence_url=evidence_url,
            )
        )

    return highlights, n_conf, n_contra, details


async def check_domain_reputation(domain: str) -> DomainReputationResult:
    """Оцінює репутацію домену: локальна база, а для невідомих — пошук і аналіз Gemini."""
    if not domain:
        return DomainReputationResult(
            trust_index=0.5, background_summary="Оцінка неможлива (пустий домен)"
        )

    local_data = find_local_reputation(domain)
    if local_data:
        logger.info("[CrossVerify] Domain '%s' found in LOCAL_DOMAINS_REPUTATION.", domain)
        return DomainReputationResult(
            trust_index=local_data["trust_index"],
            background_summary=local_data["summary"],
        )

    if not ai_available():
        return DomainReputationResult(
            trust_index=0.5, background_summary="Оцінка неможлива (AI offline)"
        )

    query = f"{domain} bias fact-check reliability credibility"
    logger.info("[CrossVerify] Querying reputation for domain: %s", domain)

    snippets = await search_duckduckgo(query)

    if not snippets:
        logger.info("[CrossVerify] No watchdog data for %s. Defaulting to 0.5.", domain)
        return DomainReputationResult(
            trust_index=0.5,
            background_summary="Локальне або маловідоме видання. Прямих підтверджень упередженості не знайдено.",
        )

    prompt = f"TARGET DOMAIN: {domain}\n\nREPUTATION SNIPPETS:\n{_format_snippets(snippets)}"

    result = await run_agent(
        prompt,
        REPUTATION_AGENT_PROMPT,
        DomainReputationResult,
        max_retries=AGENT_MAX_RETRIES,
        retry_delay=AGENT_RETRY_DELAY_S,
        generation_config=_agent_config(),
    )
    if result is None:
        return DomainReputationResult(
            trust_index=0.5,
            background_summary="Помилка при аналізі репутації. Застосовано нейтральний рейтинг.",
        )
    return result
