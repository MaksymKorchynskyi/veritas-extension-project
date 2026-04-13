"""
VERITAS Agentic Orchestration Service
Google Gemini API integration with independent Micro-Agents.
"""

import os
import json
import logging
import asyncio
from datetime import datetime
from dotenv import load_dotenv
from google import genai
from google.genai import types

from app.models.schemas import (
    ParagraphModel, 
    AnalyzedArticleData, 
    BiasExtraction, 
    LogicExtraction, 
    FactExtraction,
    GeminiHighlight,
    ValidationResult
)

logger = logging.getLogger(__name__)
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

MODEL_NAME = "gemini-2.5-flash"
FALLBACK_MODEL_NAME = "gemini-3-flash-preview"

# -----------------------------------------------------------------------------
# SYSTEM INSTRUCTIONS
# -----------------------------------------------------------------------------

BIAS_AGENT_PROMPT = """
You are VERITAS ObjectivityAndBiasAgent. Your sole focus is analyzing news articles for emotional manipulation, hidden bias, political leaning, and toxicity.
Your output MUST be a JSON matching the structured schema.

CRITICAL INSTRUCTION - CHAIN OF THOUGHT:
Before generating the final JSON values, you MUST write down your detailed reasoning process in the 'raw_thoughts' field of the JSON. Analyze the text, explain your logic, and justify why you are flagging certain things.

CRITICAL RULE - DO NOT PENALIZE QUOTES:
If emotional language, subjective assessments, or controversial claims are wrapped in quotes or clearly attributed to an interviewee/politician (e.g., 'Minister said...'), this is FACTUAL REPORTING. You must ONLY penalize the AUTHOR's own words if they are biased.

CRITICAL RULE - NOISE FILTER:
If the text contains fragments of unrelated news, advertisements, or "Read also" recommendations, COMPLETELY IGNORE them. Only analyze the paragraphs that belong to the main headline topic.

RULES:
1. toxic_words_count: Count emotional, inflammatory, or manipulative words. Exclude factual war terms (e.g., "загинули", "обстріл"). Focus on words like "ганебний", "істерика".
2. opinion_sentences_count: Count sentences where the journalist embeds subjective judgments. Exclude direct quotes.
3. imbalance_detected: True ONLY IF the article discusses a highly controversial topic but completely fails to provide the perspective of a main side.
4. highlights: Extract 0 to 3 instances of manipulation, extreme toxicity, or hidden bias. IMPORTANT: Return the exact integer ID of the paragraph (paragraph_id). 
Your 'reason' must be a concise, professional editorial note (max 2 sentences). DO NOT use direct quotes from the text, DO NOT use HTML entities like `&quot;`. Explain the journalistic flow clinically.
"""

LOGIC_AGENT_PROMPT = """
You are VERITAS LogicalAnalysisAgent. Your focus is analyzing the structural logic, argumentation, and headline relevance of a news article.
Your output MUST be a JSON matching the structured schema.

CRITICAL INSTRUCTION - CHAIN OF THOUGHT:
Before generating the final JSON values, you MUST write down your detailed reasoning process in the 'raw_thoughts' field of the JSON. Format it as text explaining your logic, step-by-step.

CRITICAL RULE - DO NOT PENALIZE QUOTES:
If emotional language, subjective assessments, or controversial claims are wrapped in quotes or clearly attributed to an interviewee/politician (e.g., 'Minister said...'), this is FACTUAL REPORTING. You must ONLY penalize the AUTHOR's own words if they are biased.

CRITICAL RULE - NOISE FILTER:
If the text contains fragments of unrelated news, advertisements, or "Read also" recommendations, COMPLETELY IGNORE them. Only analyze the paragraphs that belong to the main headline topic.

RULES:
1. clickbait_triggers_count: Count manipulative tactics in the HEADLINE ONLY. CRITICAL: Do NOT be overly pedantic or literal. In political journalism, terms like "розгром", "defeat", "collapse", or "victory" are standard rhetoric for significant numerical shifts (e.g. losing a majority of seats). Assume standard political rhetoric is acceptable.
2. headline_mismatch_severity: Score 0-5. 0 = perfect match. 5 = complete clickbait fabrication.
3. logical_fallacies_count: Count instances of logical errors (whataboutism, false dilemmas, strawman arguments).
4. analysis_summary: Provide a clinical, highly objective 2-sentence OSINT-style summary of the article's overall credibility. ⚠️ MUST be in the SAME LANGUAGE as the article.
5. highlights: Extract 0 to 3 logical fallacies, contradictory statements, or clickbait misdirections. IMPORTANT: Return the exact integer ID of the paragraph (paragraph_id).
Your 'reason' must be a concise, professional editorial note (max 2 sentences). DO NOT use direct quotes from the text, DO NOT use HTML entities like `&quot;`. Explain the journalistic flow clinically.
"""

FACT_AGENT_PROMPT = """
You are VERITAS FactExtractionAgent. Your sole focus is identifying concrete, verifiable claims, named entities, and sources of data.
Your output MUST be a JSON matching the structured schema.

CRITICAL INSTRUCTION - CHAIN OF THOUGHT:
Before generating the final JSON values, you MUST write down your detailed reasoning process in the 'raw_thoughts' field of the JSON. Explain what entities you are extracting and why.

CRITICAL RULE - DO NOT EXTRACT PREDICTIONS:
DO NOT extract predictions about the future, internal emotional states, or subjective political strategies (e.g., 'Russia will not negotiate until spring' or 'Putin wants to...'). Only extract hard, falsifiable historical or present facts.

RULES:
1. text_citations: Extract ALL named entities acting as sources of information (e.g., "Reuters", "Генштаб", "ISW"). Ignore vague attributions ("кажуть експерти").
2. named_entities_count: Count unique, verifiable real-world proper nouns (locations, organizations, full names, dates).
3. verifiable_claims: Extract hard, concrete claims that can be objectively fact-checked (e.g., quotes, dates, statistics, troop movements). Sort by importance and STRICTLY CAP AT MAXIMUM 3 CLAIMS. Prioritize highly sensational or controversial statements. Return the paragraph_id and the claim_text.
"""

VALIDATION_AGENT_PROMPT = """
You are VERITAS ValidationAgent, the Supreme Judge. Your goal is to drastically reduce False Positives.
You receive the ORIGINAL ARTICLE and a list of UNVERIFIED HIGHLIGHTS.
Your task is to:
1. Review every highlight against the text. 
2. If a highlight wrongly flags a factual military term as "toxic" or wrongly flags a true statement as "CONTRADICTED" due to weak OSINT search snippets, you MUST DROP that highlight.
3. Keep only unequivocally true, fair highlights in `approved_highlights`.
4. Generate `final_explainer`. Do NOT use template phrases like 'Сильна сторона:', 'Слабкі місця:', 'Головна проблема:', or numeric scores. Write 2-3 beautiful paragraphs of narrative editorial feedback analyzing the article's factuality, manipulations, and OSINT confirmations/contradictions. It must read like a cohesive professional journalistic review.
Output MUST be a JSON matching the structured schema.
"""

async def run_agent(prompt: str, system_instruction: str, response_schema) -> dict:
    """Wrapper to run a specific agent and enforce its schema."""
    if not GEMINI_API_KEY or not client:
        return {}

    try:
        max_retries = 2
        current_model = MODEL_NAME
        
        for attempt in range(max_retries):
            try:
                response = await client.aio.models.generate_content(
                    model=current_model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.05, 
                        top_p=0.8,
                        top_k=40,
                        max_output_tokens=8192,
                        response_mime_type="application/json",
                        response_schema=response_schema,
                    )
                )
                
                # EXTRACT AND PRINT THE CHAIN OF THOUGHT TO THE TERMINAL
                res_dict = json.loads(response.text)
                if 'raw_thoughts' in res_dict:
                    # Provide an immediate print block in the terminal running uvicorn
                    print("\n" + "="*50)
                    print(f"🤖 AI REASONING ENGINES ({current_model})")
                    print("="*50)
                    print(res_dict['raw_thoughts'])
                    print("="*50 + "\n")
                    
                return res_dict
                
            except Exception as e:
                if attempt < max_retries - 1:
                    logger.warning(f"Error with {current_model}: {e}. Retrying... (Attempt {attempt + 1}/{max_retries})")
                    if current_model == MODEL_NAME:
                        current_model = FALLBACK_MODEL_NAME
                    await asyncio.sleep(1)
                else:
                    logger.error(f"Agent failed after all retries: {e}")
                    return {}
    except Exception as e:
        logger.error(f"Agent execution error: {e}")
        return {}


async def extract_analysis_data(paragraphs: list[ParagraphModel], headline: str, url: str = "", language: str = "uk") -> AnalyzedArticleData:
    """
    Orchestrate the execution of three concurrent micro-agents and merge their outputs.
    """
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not set. Returning mock data.")
        return _get_mock_data(paragraphs)

    # Format the paragraphs explicitly teaching Gemini the IDs
    formatted_text_parts = []
    for p in paragraphs:
        formatted_text_parts.append(f"[ID: {p.id}] {p.text}")
    
    formatted_article_text = "\\n\\n".join(formatted_text_parts)

    # Повідомляємо нейромережі поточну дату, щоб вона не плутала минуле з майбутнім
    current_date = datetime.now().strftime("%Y-%m-%d")

    common_prompt = f"""
    Analyze the following news article.
    
    CRITICAL SYSTEM CONTEXT:
    TODAY'S DATE IS: {current_date}. 
    Do not flag events that happened before this date as "future" events or "typos".
    
    IMPORTANT: You MUST generate all your output text (explanations, summaries, and reasons) STRICTLY in the '{language}' language. Do NOT use any other language for your output responses, even if the article itself is in a different language.
    
    SOURCE URL:
    {url}
    
    HEADLINE:
    {headline}
    
    ARTICLE TEXT:
    {formatted_article_text}
    """
    
    # 🚀 Run all 3 agents in parallel!
    bias_task = run_agent(common_prompt, BIAS_AGENT_PROMPT, BiasExtraction)
    logic_task = run_agent(common_prompt, LOGIC_AGENT_PROMPT, LogicExtraction)
    fact_task = run_agent(common_prompt, FACT_AGENT_PROMPT, FactExtraction)
    
    bias_res, logic_res, fact_res = await asyncio.gather(bias_task, logic_task, fact_task)

    # Merge results into a single object
    combined_highlights = []
    if bias_res.get("highlights"):
        combined_highlights.extend([GeminiHighlight(**h) for h in bias_res["highlights"]])
    if logic_res.get("highlights"):
        combined_highlights.extend([GeminiHighlight(**h) for h in logic_res["highlights"]])

    # Cap at 3-5 highlights usually, but we'll include all discovered ones
    
    data = AnalyzedArticleData(
        toxic_words_count=bias_res.get("toxic_words_count", 0),
        opinion_sentences_count=bias_res.get("opinion_sentences_count", 0),
        imbalance_detected=bias_res.get("imbalance_detected", False),
        
        clickbait_triggers_count=logic_res.get("clickbait_triggers_count", 0),
        headline_mismatch_severity=logic_res.get("headline_mismatch_severity", 0),
        logical_fallacies_count=logic_res.get("logical_fallacies_count", 0),
        analysis_summary=logic_res.get("analysis_summary", "Неможливо здійснити детальний NLP аналіз через помилку з'єднання з AI сервером."),
        
        text_citations=fact_res.get("text_citations", []),
        named_entities_count=fact_res.get("named_entities_count", 5), # fallback 5
        verifiable_claims=fact_res.get("verifiable_claims", []),
        
        highlights=combined_highlights,
        raw_thoughts=""
    )

    return data


def _get_mock_data(paragraphs: list[ParagraphModel]) -> AnalyzedArticleData:
    """Return mock data when API key is not available."""
    sample_id = paragraphs[0].id if paragraphs else 0
    return AnalyzedArticleData(
        toxic_words_count=0,
        opinion_sentences_count=0,
        imbalance_detected=False,
        clickbait_triggers_count=0,
        headline_mismatch_severity=0,
        logical_fallacies_count=0,
        analysis_summary="Це тестовий аналіз. Налаштуйте API ключ Google Gemini у файлі .env.",
        text_citations=["Міноборони", "Reuters"],
        named_entities_count=12,
        verifiable_claims=[],
        highlights=[
            GeminiHighlight(
                paragraph_id=sample_id,
                severity="warning",
                category="Тестова категорія",
                reason="Тестове попередження (Mock)"
            )
        ],
        raw_thoughts="Mock thoughts..."
    )

async def run_validation_agent(
    paragraphs: list[ParagraphModel], 
    headline: str, 
    unverified_highlights: list[GeminiHighlight],
    counts_summary: str,
    language: str = "uk"
) -> ValidationResult | None:
    """Run the Supreme Judge to filter highlights and provide final explainer."""
    if not client:
        return None
        
    formatted_text_parts = [f"[ID: {p.id}] {p.text}" for p in paragraphs]
    formatted_article_text = "\\n\\n".join(formatted_text_parts)
    
    highlights_json = json.dumps([h.model_dump() for h in unverified_highlights], ensure_ascii=False)
    
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    prompt = f"""
    CRITICAL SYSTEM CONTEXT: TODAY'S DATE IS: {current_date}.
    
    IMPORTANT: You MUST generate all your output text (explanations, summaries, and reasons) STRICTLY in the '{language}' language.
    
    HEADLINE: {headline}
    
    ALGORITHM COUNTS: {counts_summary}
    
    UNVERIFIED HIGHLIGHTS:
    {highlights_json}
    
    ARTICLE TEXT:
    {formatted_article_text}
    """
    
    try:
        data = await run_agent(prompt, VALIDATION_AGENT_PROMPT, ValidationResult)
        if data:
            return ValidationResult(**data)
    except Exception as e:
        logger.error(f"ValidationAgent error: {e}")
        
    return None
