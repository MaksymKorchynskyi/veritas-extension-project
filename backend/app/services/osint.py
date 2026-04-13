"""
VERITAS OSINT Search RAG 
DuckDuckGo Cross-Lingual Search & Fact Verification
"""

import logging
import asyncio
import json
from typing import List

from duckduckgo_search import DDGS
from duckduckgo_search.exceptions import DuckDuckGoSearchException
from google.genai import types

from app.models.schemas import VerifiableClaim, GeminiHighlight, QueryGenerationResult, CrossReferenceResult, DomainReputationResult
from app.services.agents import client, MODEL_NAME, FALLBACK_MODEL_NAME

logger = logging.getLogger(__name__)

QUERY_AGENT_PROMPT = """
You are VERITAS QueryGeneratorAgent. Your task is to take a local factual claim (often in Ukrainian/Russian) and translate it into a highly effective English search engine query.
The objective is to search global Western media (Reuters, AP, NYT) to verify if the claim is true or false.
Output MUST be a JSON matching the structured schema.
Make the query short (3-7 words), keyword-rich, and neutral. DO NOT formulate questions. Use keywords.
"""

CROSS_AGENT_PROMPT = """
You are VERITAS CrossReferenceAgent, an elite fact-checker.
You will be provided with:
1. ORIGINAL CLAIM (extracted from an article).
2. SEARCH RESULTS (snippets from global media).

Evaluate the snippets strictly against the claim.
Does the global media CONFIRM the original claim, CONTRADICT the original claim, or is it UNVERIFIED (snippets are irrelevant or don't mention it)?
IMPORTANT: If the original claim is a prediction about the future, an unverifiable internal emotional state, or a theoretical strategy (e.g. 'He will not negotiate' or 'They plan to...'), you MUST return UNVERIFIED. 
If the original claim is a blatant lie or manipulated exaggeration compared to the global consensus, return CONTRADICTED.
Output MUST be a JSON matching the structured schema. 
Your 'reason' must be a concise, professional editorial note (max 2 sentences) in the SAME LANGUAGE as the original claim. DO NOT use direct quotes from the text, DO NOT use HTML entities like `&quot;`. Explain the journalistic flow clinically.
"""

REPUTATION_AGENT_PROMPT = """
You are VERITAS ReputationAgent. You analyze search snippets about a particular news domain to estimate its global trustworthiness.
Based on the provided search snippets, evaluate the domain's credibility.
Output MUST be a JSON matching the structured schema.

CRITICAL RULE:
If the provided search snippets do not explicitly label the publisher as biased, unreliable, or a propagator of fake news, you must default the trust_index to exactly 0.5.
If the snippets confirm the publisher is a highly established, reliable global news source (e.g. AP, Reuters), give a high index (0.8 - 1.0).
If it is known for propaganda, conspiracy, or extreme bias, give a low index (0.0 - 0.3).
Provide a clinical `background_summary` of the source describing it in a few words.
"""

async def run_query_agent(claim_text: str) -> str:
    if not client:
        return ""
    try:
        response = await client.aio.models.generate_content(
            model=MODEL_NAME,
            contents=f"ORIGINAL CLAIM: {claim_text}",
            config=types.GenerateContentConfig(
                system_instruction=QUERY_AGENT_PROMPT,
                temperature=0.05,
                response_mime_type="application/json",
                response_schema=QueryGenerationResult,
            )
        )
        data = json.loads(response.text)
        return data.get("english_query", "")
    except Exception as e:
        logger.error(f"QueryGenerator error: {e}")
        return ""

def _do_ddgs_search(query: str) -> List[str]:
    try:
        with DDGS() as ddgs:
            results = ddgs.text(query, max_results=3, backend="auto")
            return [res.get("body", "") for res in results if "body" in res]
    except Exception as e:
        logger.error(f"DDGS error: {e}")
        return []

async def search_duckduckgo(query: str) -> List[str]:
    if not query:
        return []
    loop = asyncio.get_event_loop()
    try:
        # Wrap the synchronous DDGS call in a thread pool with a timeout
        snippets = await asyncio.wait_for(
            loop.run_in_executor(None, _do_ddgs_search, query),
            timeout=8.0
        )
        return snippets
    except asyncio.TimeoutError:
        logger.warning(f"DDGS search timed out for query: {query}")
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
        response = await client.aio.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=CROSS_AGENT_PROMPT,
                temperature=0.05,
                response_mime_type="application/json",
                response_schema=CrossReferenceResult,
            )
        )
        data = json.loads(response.text)
        return CrossReferenceResult(**data)
    except Exception as e:
        logger.error(f"CrossReference error: {e}")
        return None

async def process_single_claim(claim: VerifiableClaim) -> GeminiHighlight | None:
    """Process a single verifiable claim end-to-end to see if it is contradicted."""
    logger.info(f"[OSINT] Evaluating claim ID {claim.paragraph_id}: {claim.claim_text}")
    
    # 1. Translate & Generate Query
    query = await run_query_agent(claim.claim_text)
    if not query:
        return None
        
    logger.info(f"[OSINT] Query generated: {query}")
    
    # 2. Search DDGS
    snippets = await search_duckduckgo(query)
    if not snippets:
        return None
        
    # 3. Cross Reference
    verdict = await run_cross_agent(claim.claim_text, snippets)
    if not verdict:
        return None
        
    logger.info(f"[OSINT] Claim ID {claim.paragraph_id} Verdict: {verdict.status}")
    
    # 4. Act on CONTRADICTED
    if verdict.status == "CONTRADICTED":
        return GeminiHighlight(
            paragraph_id=claim.paragraph_id,
            severity="risk",
            category="Спростовано OSINT",
            reason=verdict.reason
        )
        
    return None

async def verify_claims_osint(claims: List[VerifiableClaim]) -> List[GeminiHighlight]:
    """Orchestrates parallel OSINT RAG over maximum top 3 claims."""
    if not claims:
        return []
        
    # Strictly enforce Top 3 cap (though FactExtractionAgent should already cap it)
    target_claims = claims[:3]
    logger.info(f"[OSINT] Starting parallel verification for {len(target_claims)} claims.")
    
    tasks = [process_single_claim(c) for c in target_claims]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Filter out exceptions and Nones
    highlights = []
    for r in results:
        if isinstance(r, GeminiHighlight):
            highlights.append(r)
            
    return highlights

async def check_domain_reputation(domain: str) -> DomainReputationResult:
    """Uses DDGS and Gemini to check media watchdog statements about a given domain."""
    if not domain or not client:
        return DomainReputationResult(trust_index=0.5, background_summary="Оцінка неможлива (AI offline або пустий домен)")
    
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
        response = await client.aio.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=REPUTATION_AGENT_PROMPT,
                temperature=0.05,
                response_mime_type="application/json",
                response_schema=DomainReputationResult,
            )
        )
        data = json.loads(response.text)
        return DomainReputationResult(**data)
    except Exception as e:
        logger.error(f"ReputationAgent error for {domain}: {e}")
        return DomainReputationResult(trust_index=0.5, background_summary="Помилка при аналізі репутації. Застосовано нейтральний рейтинг.")
