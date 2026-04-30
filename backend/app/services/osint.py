"""
VERITAS OSINT Search RAG
Google Custom Search & Fact Verification
"""

import os
import logging
import asyncio
import json
from typing import List

try:
    from ddgs import DDGS
    from ddgs.exceptions import RatelimitException
except ImportError:
    from duckduckgo_search import DDGS
    from duckduckgo_search.exceptions import RatelimitException
from google.genai import types

from app.models.schemas import VerifiableClaim, GeminiHighlight, QueryGenerationResult, CrossReferenceResult, DomainReputationResult
from app.services.llm.base_agent import client, MODEL_NAME, FALLBACK_MODEL_NAME

logger = logging.getLogger(__name__)

LOCAL_DOMAINS_REPUTATION = {
    "pravda.com.ua": {"trust_index": 0.9, "summary": "Надійне українське видання (Українська правда)."},
    "truha.ua": {"trust_index": 0.2, "summary": "Telegram-канал/агрегатор з низькою репутацією (Труха). Часто публікує неперевірені дані."},
    "tsn.ua": {"trust_index": 0.7, "summary": "Популярне українське медіа (ТСН), інколи використовує клікбейт."},
    "suspilne.media": {"trust_index": 0.95, "summary": "Суспільне мовлення України. Високий стандарт журналістики."},
    "unian.ua": {"trust_index": 0.6, "summary": "Українське інформаційне агентство (УНІАН). Часто публікує емоційні заголовки."},
    "nv.ua": {"trust_index": 0.85, "summary": "Надійне українське видання (New Voice)."},
    "bbc.com": {"trust_index": 0.95, "summary": "Глобальне авторитетне медіа (BBC). Високий стандарт фактчекінгу."},
    "ukrinform.ua": {"trust_index": 0.9, "summary": "Державне інформаційне агентство України. Висока достовірність офіційних даних."},
    "liga.net": {"trust_index": 0.9, "summary": "Одне з найякісніших ділових та суспільно-політичних видань України."},
    "reuters.com": {"trust_index": 0.95, "summary": "Провідне світове новинне агентство з бездоганною репутацією."}
}

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

async def run_query_agent(claim_text: str) -> str:
    if not client:
        return ""
    try:
        max_retries = 2
        current_model = MODEL_NAME
        for attempt in range(max_retries):
            try:
                response = await client.chat.completions.create(
                    model=current_model,
                    response_model=QueryGenerationResult,
                    messages=[
                        {"role": "system", "content": QUERY_AGENT_PROMPT},
                        {"role": "user", "content": f"ORIGINAL CLAIM: {claim_text}"}
                    ],
                    config=types.GenerateContentConfig(temperature=0.05)
                )
                return response.english_query
            except Exception as e:
                if attempt < max_retries - 1:
                    logger.warning(f"QueryGenerator error with {current_model}: {e}. Retrying...")
                    if current_model == MODEL_NAME:
                        current_model = FALLBACK_MODEL_NAME
                    await asyncio.sleep(1)
                else:
                    logger.error(f"QueryGenerator failed: {e}")
                    return ""
    except Exception as e:
        logger.error(f"QueryGenerator fatal error: {e}")
        return ""

def _do_duckduckgo_search(query: str) -> List[str]:
    try:
        results = DDGS().text(query, max_results=3)
        snippets = [r.get('body', '') for r in results if 'body' in r]
        return snippets
    except RatelimitException:
        logger.warning(f"DuckDuckGo RateLimit hit for query: {query}")
        return []
    except Exception as e:
        logger.error(f"DuckDuckGo error: {e}")
        return []

async def search_duckduckgo(query: str) -> List[str]:
    if not query:
        return []
    try:
        snippets = await asyncio.wait_for(
            asyncio.to_thread(_do_duckduckgo_search, query),
            timeout=8.0
        )
        return snippets
    except asyncio.TimeoutError:
        logger.warning(f"DuckDuckGo search timed out for query: {query}")
        return []
    except Exception as e:
        logger.error(f"search_duckduckgo error: {e}")
        return []

async def run_cross_agent(claim_text: str, snippets: List[str]) -> CrossReferenceResult | None:
    if not client or not snippets:
        return None

    snippets_text = "\n".join([f"- {s}" for s in snippets])
    prompt = f"ORIGINAL CLAIM: {claim_text}\n\nSEARCH RESULTS (SNIPPETS):\n{snippets_text}"

    try:
        max_retries = 2
        current_model = MODEL_NAME
        for attempt in range(max_retries):
            try:
                response = await client.chat.completions.create(
                    model=current_model,
                    response_model=CrossReferenceResult,
                    messages=[
                        {"role": "system", "content": CROSS_AGENT_PROMPT},
                        {"role": "user", "content": prompt}
                    ],
                    config=types.GenerateContentConfig(temperature=0.05)
                )
                return response
            except Exception as e:
                if attempt < max_retries - 1:
                    logger.warning(f"CrossReference error with {current_model}: {e}. Retrying...")
                    if current_model == MODEL_NAME:
                        current_model = FALLBACK_MODEL_NAME
                    await asyncio.sleep(1)
                else:
                    logger.error(f"CrossReference failed: {e}")
                    return None
    except Exception as e:
        logger.error(f"CrossReference fatal error: {e}")
        return None

async def process_single_claim(claim: VerifiableClaim) -> tuple[str, GeminiHighlight | None]:
    """Process a single verifiable claim end-to-end to see if it is contradicted or confirmed."""
    logger.info(f"[OSINT] Evaluating claim ID {claim.paragraph_id}: {claim.claim_text}")

    query = await run_query_agent(claim.claim_text)
    if not query:
        return "UNVERIFIED", None

    logger.info(f"[OSINT] Query generated: {query}")

    snippets = await search_duckduckgo(query)
    if not snippets:
        return "UNVERIFIED", None

    verdict = await run_cross_agent(claim.claim_text, snippets)
    if not verdict:
        return "UNVERIFIED", None

    logger.info(f"[OSINT] Claim ID {claim.paragraph_id} Verdict: {verdict.status}")

    if verdict.status == "CONTRADICTED":
        hl = GeminiHighlight(
            paragraph_id=claim.paragraph_id,
            severity="risk",
            category="Спростовано OSINT",
            reason=verdict.reason
        )
        return "CONTRADICTED", hl

    if verdict.status == "CONFIRMED":
        return "CONFIRMED", None

    return "UNVERIFIED", None

async def verify_claims_osint(claims: List[VerifiableClaim]) -> tuple[List[GeminiHighlight], int, int]:
    """Orchestrates parallel OSINT RAG over maximum top 3 claims.
    Returns: (highlights, n_conf, n_contra)
    """
    if not claims:
        return [], 0, 0

    target_claims = claims[:5]
    logger.info(f"[OSINT] Starting parallel verification for {len(target_claims)} claims.")

    tasks = [process_single_claim(c) for c in target_claims]
    results = await asyncio.gather(*tasks)

    highlights = []
    n_conf = 0
    n_contra = 0

    for status, hl in results:
        if status == "CONFIRMED":
            n_conf += 1
        elif status == "CONTRADICTED":
            n_contra += 1
            if hl:
                highlights.append(hl)

    return highlights, n_conf, n_contra

async def check_domain_reputation(domain: str) -> DomainReputationResult:
    """Uses LOCAL_DOMAINS_REPUTATION first, then Google Custom Search + Gemini to check media watchdog statements."""
    if not domain:
        return DomainReputationResult(trust_index=0.5, background_summary="Оцінка неможлива (пустий домен)")

    domain_lower = domain.lower().replace("www.", "")
    if domain_lower in LOCAL_DOMAINS_REPUTATION:
        logger.info(f"[OSINT] Domain '{domain_lower}' found in LOCAL_DOMAINS_REPUTATION.")
        local_data = LOCAL_DOMAINS_REPUTATION[domain_lower]
        return DomainReputationResult(
            trust_index=local_data["trust_index"],
            background_summary=local_data["summary"]
        )

    if not client:
        return DomainReputationResult(trust_index=0.5, background_summary="Оцінка неможлива (AI offline)")

    query = f"{domain} bias fact-check reliability credibility"
    logger.info(f"[OSINT] Querying reputation for domain: {domain}")

    snippets = await search_duckduckgo(query)

    if not snippets:
        logger.info(f"[OSINT] No watchdog data for {domain}. Defaulting to 0.5.")
        return DomainReputationResult(
            trust_index=0.5,
            background_summary="Локальне або маловідоме видання. Прямих підтверджень упередженості не знайдено."
        )

    snippets_text = "\n".join([f"- {s}" for s in snippets])
    prompt = f"TARGET DOMAIN: {domain}\n\nREPUTATION SNIPPETS:\n{snippets_text}"

    try:
        max_retries = 2
        current_model = MODEL_NAME
        for attempt in range(max_retries):
            try:
                response = await client.chat.completions.create(
                    model=current_model,
                    response_model=DomainReputationResult,
                    messages=[
                        {"role": "system", "content": REPUTATION_AGENT_PROMPT},
                        {"role": "user", "content": prompt}
                    ],
                    config=types.GenerateContentConfig(temperature=0.05)
                )
                return response
            except Exception as e:
                if attempt < max_retries - 1:
                    logger.warning(f"ReputationAgent error with {current_model} for {domain}: {e}. Retrying...")
                    if current_model == MODEL_NAME:
                        current_model = FALLBACK_MODEL_NAME
                    await asyncio.sleep(1)
                else:
                    logger.error(f"ReputationAgent failed for {domain}: {e}")
                    return DomainReputationResult(trust_index=0.5, background_summary="Помилка при аналізі репутації. Застосовано нейтральний рейтинг.")
    except Exception as e:
        logger.error(f"ReputationAgent fatal error for {domain}: {e}")
        return DomainReputationResult(trust_index=0.5, background_summary="Помилка при аналізі репутації. Застосовано нейтральний рейтинг.")
