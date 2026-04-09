"""
VERITAS AI Service
Google Gemini API integration for raw data extraction

Gemini extracts COUNTS and RAW DATA, Python calculates final scores.
This follows the WMFA v2.0 algorithm specification.
Phase 4: Added analysis_summary for explainer support.
"""

import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Stable model for production
MODEL_NAME = "gemini-3-flash-preview"


def get_model():
    """Get configured Gemini model instance with JSON mode."""
    return genai.GenerativeModel(
        model_name=MODEL_NAME,
        generation_config={
            "temperature": 0.2,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 8192,  # Increased to prevent truncation
            "response_mime_type": "application/json"
        }
    )


def clean_json_response(text: str) -> str:
    """
    Clean Gemini response to ensure valid JSON.
    Handles markdown blocks and truncated responses.
    """
    if not text:
        return "{}"
    
    text = text.strip()
    
    # Remove markdown code blocks
    if text.startswith("```"):
        first_newline = text.find('\n')
        if first_newline != -1:
            text = text[first_newline + 1:]
        else:
            text = text[3:]
    
    if text.endswith("```"):
        text = text[:-3]
    
    text = text.strip('`').strip()
    
    # Fix truncated JSON - close open strings and braces
    if text and not text.endswith('}'):
        # Count open braces/brackets
        open_braces = text.count('{') - text.count('}')
        open_brackets = text.count('[') - text.count(']')
        
        # Check if we're in an unclosed string
        quote_count = text.count('"')
        if quote_count % 2 == 1:
            text += '..."'  # Close the string
        
        # Close brackets and braces
        text += ']' * open_brackets
        text += '}' * open_braces
        
        print(f"[VERITAS AI] Fixed truncated JSON (added {open_braces} braces, {open_brackets} brackets)")
    
    return text


async def extract_analysis_data(text: str, headline: str) -> dict:
    """
    Extract raw analysis data from article using Gemini.
    
    Returns counts and metrics that will be processed by Python
    to calculate final scores using WMFA v2.0 formulas.
    
    Args:
        text: Article body text
        headline: Article headline
    
    Returns:
        Dict with raw counts for each criterion plus analysis_summary
    """
    if not GEMINI_API_KEY:
        return _get_mock_data()
    
    prompt = f"""You are VERITAS, an expert news credibility analyzer. Extract specific data points for credibility assessment.

HEADLINE: {headline}

ARTICLE TEXT:
{text[:20000]}

=== CRITICAL CONTEXT RULES ===

RULE 1 - WAR CONTEXT EXCEPTION:
First, detect if the topic is the Russia-Ukraine war or military conflict.
IF YES: DO NOT count these terms as toxic or emotional: "aggressor", "occupier", "occupant", "enemy", "eliminated", "liberated", "offensive", "terrorist state", "invader", "russian aggression", "war crimes"
IF NO: Apply standard toxicity rules.
- ONLY penalize: Excessive slurs, dehumanizing labels ("scum", "filth", "pigs", "orcs"), or hyper-emotional adjectives ("satanic", "miraculous", "demonic")

RULE 2 - BE STRICT AND OBJECTIVE:
- Count only genuine issues, not stylistic choices
- News about war naturally has strong language - this is normal

=== EXTRACTION TASKS ===

1. OBJECTIVITY METRICS:
   - toxic_words_count: Genuinely toxic/manipulative words (APPLY WAR CONTEXT RULE!)
   - opinion_sentences_count: Author opinions stated as fact without evidence

2. HEADLINE ANALYSIS:
   - clickbait_triggers_count: ALL CAPS, multiple !, "SHOCK", "BREAKING", sensationalism
   - headline_mismatch_severity: 0=accurate, 1-2=slight exaggeration, 3-4=misleading, 5=completely false

3. LOGICAL ANALYSIS:
   - logical_fallacies_count: False causality, ad hominem, strawman, etc.
   - imbalance_detected: Is this controversial AND missing opposing views? (true/false)

4. FACTUAL DENSITY:
   - named_entities_count: Unique named entities (people, orgs, dates, locations, numbers)

5. SOURCES:
   - text_citations: Organizations/authorities mentioned (e.g., ["Reuters", "Pentagon", "Zelenskyy"])

6. ANALYSIS SUMMARY:
   - analysis_summary: 1-2 sentences explaining the main issues found OR praise if clean

7. HIGHLIGHTS (for webpage marking):
    - highlights: Array of problematic text segments to highlight. For each:
      - text: Exact quote from article (max 100 chars)
      - severity: "risk" for toxic/fake content, "warning" for bias/fallacies
      - reason: Short label for header (e.g., "Unverified claim", "Emotional language")
      - category: One of: "emotional_manipulation", "unverified_claim", "source_contradiction", "logical_fallacy", "clickbait"
      - explanation: MUST be 2-3 detailed sentences with clear argumentation:
        1) First sentence: STATE what exactly was detected and quote the specific problematic phrase
        2) Second sentence: EXPLAIN why this is problematic (logical reason, lack of evidence, manipulation technique used)
        3) Third sentence: PROVIDE context about how this affects reader perception
      - recommendation: Actionable advice starting with a verb (e.g., "Cross-check this claim with official government sources", "Look for the original study cited", "Consider whether opposing viewpoints are presented")
    - Include up to 5 most important issues. Empty array if article is clean.

Return this exact JSON structure:
{{"toxic_words_count": 0, "opinion_sentences_count": 0, "clickbait_triggers_count": 0, "headline_mismatch_severity": 0, "logical_fallacies_count": 0, "imbalance_detected": false, "named_entities_count": 0, "text_citations": [], "analysis_summary": "", "highlights": []}}

CRITICAL: For each highlight, you MUST provide a detailed 2-3 sentence explanation of WHY this specific text is problematic. Do NOT leave explanation empty. Example of a proper highlight:
{{"text": "Scientists claim breakthrough cure", "severity": "warning", "reason": "Unverified claim", "category": "unverified_claim", "explanation": "The phrase 'Scientists claim breakthrough cure' makes a significant medical claim without citing specific sources or studies. Such vague attribution to 'scientists' is a common technique to add false credibility. Readers should be skeptical of breakthrough claims that lack peer-reviewed evidence.", "recommendation": "Search for the original study on PubMed or Google Scholar before accepting this claim."}}"
"""

    try:
        model = get_model()
        response = model.generate_content(prompt)
        
        cleaned_text = clean_json_response(response.text)
        result = json.loads(cleaned_text)
        
        return _validate_extracted_data(result)
        
    except json.JSONDecodeError as e:
        print(f"[VERITAS AI] JSON parse error: {e}")
        print(f"[VERITAS AI] Raw response:\n{response.text[:500] if 'response' in dir() else 'No response'}")
        return _get_fallback_data()
    except Exception as e:
        print(f"[VERITAS AI] Error: {e}")
        return _get_fallback_data()


def _validate_extracted_data(data: dict) -> dict:
    """Validate and sanitize extracted data."""
    # Validate highlights with extended fields for tooltips
    raw_highlights = data.get("highlights", [])
    validated_highlights = []
    
    # Valid categories for tooltips
    valid_categories = ["emotional_manipulation", "unverified_claim", "source_contradiction", "logical_fallacy", "clickbait"]
    
    if isinstance(raw_highlights, list):
        for h in raw_highlights[:5]:  # Max 5 highlights
            if isinstance(h, dict) and "text" in h and h.get("text"):
                category = h.get("category", "unverified_claim")
                if category not in valid_categories:
                    category = "unverified_claim"
                
                validated_highlights.append({
                    "text": str(h.get("text", ""))[:200],
                    "severity": h.get("severity", "warning") if h.get("severity") in ["warning", "risk"] else "warning",
                    "reason": str(h.get("reason", "Issue detected"))[:100],
                    "category": category,
                    "explanation": str(h.get("explanation", "This content has been flagged for review."))[:500],
                    "recommendation": str(h.get("recommendation", "Verify this information with trusted sources."))[:200],
                })
    
    return {
        "toxic_words_count": max(0, int(data.get("toxic_words_count", 0))),
        "opinion_sentences_count": max(0, int(data.get("opinion_sentences_count", 0))),
        "clickbait_triggers_count": max(0, int(data.get("clickbait_triggers_count", 0))),
        "headline_mismatch_severity": max(0, min(5, int(data.get("headline_mismatch_severity", 0)))),
        "logical_fallacies_count": max(0, int(data.get("logical_fallacies_count", 0))),
        "imbalance_detected": bool(data.get("imbalance_detected", False)),
        "named_entities_count": max(0, int(data.get("named_entities_count", 0))),
        "text_citations": list(data.get("text_citations", [])),
        "analysis_summary": str(data.get("analysis_summary", "Analysis completed.")),
        "highlights": validated_highlights,
    }


def _get_mock_data() -> dict:
    """Return mock data when API key is not available."""
    return {
        "toxic_words_count": 2,
        "opinion_sentences_count": 3,
        "clickbait_triggers_count": 1,
        "headline_mismatch_severity": 1,
        "logical_fallacies_count": 1,
        "imbalance_detected": False,
        "named_entities_count": 15,
        "text_citations": ["Reuters", "NASA"],
        "analysis_summary": "Mock analysis - API key not configured.",
    "highlights": [
            {
                "text": "example problematic text",
                "severity": "warning",
                "reason": "Mock highlight",
                "category": "unverified_claim",
                "explanation": "This is mock data for testing purposes. The API key is not configured.",
                "recommendation": "Configure your Gemini API key to enable real analysis."
            }
        ],
        "_mock": True,
    }


def _get_fallback_data() -> dict:
    """Return fallback data on error."""
    return {
        "toxic_words_count": 0,
        "opinion_sentences_count": 0,
        "clickbait_triggers_count": 0,
        "headline_mismatch_severity": 0,
        "logical_fallacies_count": 0,
        "imbalance_detected": False,
        "named_entities_count": 5,
        "text_citations": [],
        "analysis_summary": "Analysis encountered an error. Using default values.",
        "highlights": [],
        "_error": True,
    }
