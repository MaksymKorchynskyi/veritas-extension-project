"""
VERITAS Core Analysis Engine
WMFA v2.0 (Weighted Multi-Factor Analysis) Algorithm Implementation

All scoring functions are pure Python - no AI guessing.
Gemini provides raw data counts, Python calculates exact scores.
"""

from typing import Optional
from urllib.parse import urlparse

# Trusted domains that get bonus weighting for source verification
TRUSTED_DOMAINS = {
    # Government & Official
    ".gov", ".gov.ua", ".mil", ".edu",
    # Major Wire Services
    "reuters.com", "apnews.com", "afp.com",
    # Established News Organizations
    "bbc.com", "bbc.co.uk", "npr.org", "pbs.org",
    # Ukrainian Official Sources
    "president.gov.ua", "rada.gov.ua", "mfa.gov.ua",
    "mon.gov.ua", "ukrinform.ua",
    # Research & Academic
    "nature.com", "science.org", "arxiv.org",
}


def get_domain(url: str) -> str:
    """Extract domain from URL."""
    try:
        parsed = urlparse(url)
        return parsed.netloc.lower().replace("www.", "")
    except Exception:
        return ""


def is_trusted_domain(domain: str) -> bool:
    """Check if domain is in trusted sources list."""
    for trusted in TRUSTED_DOMAINS:
        if trusted in domain:
            return True
    return False


# =============================================================================
# CRITERION 1: Source Verification (35% weight)
# =============================================================================

# Citation keywords that indicate source references in text
CITATION_KEYWORDS = [
    "according to", "citing", "reported by", "stated by",
    "as per", "per the", "sources say", "officials said",
    "confirmed by", "announced by", "said in a statement"
]


def calculate_source_score(
    article_domain: str,
    links: list[dict],
    text_citations: list[str],
    article_text: str = ""
) -> float:
    """
    Calculate source verification score with Phase 4 enhancements.
    
    Weighting (from MY-ALGORITHM.md):
    - Internal links (same domain): W = 0.2 (Anti-SEO)
    - Trusted sources (.gov, .edu, reuters, bbc): W = 1.2
    - Standard external links: W = 1.0
    
    Fallback: If no links, search text for citation keywords.
    
    Args:
        article_domain: Domain of the article being analyzed
        links: List of extracted links with their domains
        text_citations: List of text mentions of sources from AI
        article_text: Full article text for keyword search fallback
    
    Returns:
        Score 0-100
    """
    # Phase 4: Multi-tier fallback when no links
    if not links:
        # Tier 1: Check AI-extracted text citations
        if text_citations and len(text_citations) > 0:
            # More citations = higher score (max 70)
            citation_bonus = min(70.0, 40.0 + len(text_citations) * 10)
            return citation_bonus
        
        # Tier 2: Search article text for citation keywords
        if article_text:
            text_lower = article_text.lower()
            keyword_count = sum(1 for kw in CITATION_KEYWORDS if kw in text_lower)
            if keyword_count > 0:
                # Found citation language = 50 base + 5 per keyword (max 70)
                return min(70.0, 50.0 + keyword_count * 5)
        
        # No sources found at all
        return 0.0
    
    # Count link types with anti-gaming measures
    internal_count = 0
    external_trusted_score = 0.0
    external_standard_score = 0.0
    
    for link in links:
        link_domain = link.get("domain", "")
        link_status = link.get("status", 0.5)  # 1.0=supports, 0.5=neutral, -1.0=contradicts
        
        if link_domain == article_domain:
            # Internal links = ZERO credit (anti-gaming)
            internal_count += 1
            continue  # Skip scoring entirely
        elif is_trusted_domain(link_domain):
            # Trusted sources - Authority bonus
            external_trusted_score += link_status * 1.5
        else:
            # Standard external links
            external_standard_score += link_status * 1.0
    
    # Penalty for excessive internal links (gaming attempt detection)
    internal_penalty = max(0, (internal_count - 3) * 5) if internal_count > 3 else 0
    
    # Calculate final score from external links only
    raw_score = (external_trusted_score + external_standard_score) * 25
    final_score = raw_score - internal_penalty
    
    return max(0.0, min(100.0, final_score))


# =============================================================================
# CRITERION 2: Objectivity (20% weight)
# =============================================================================

def calculate_objectivity_score(
    toxic_count: int,
    opinion_count: int
) -> float:
    """
    Calculate objectivity score based on toxic words and opinions.
    
    Formula: Score = 100 - (ToxicCount × 2) - (OpinionCount × 5)
    
    Note: War terminology (aggressor, enemy, etc.) should NOT be counted
    as toxic - this filtering happens in the Gemini prompt.
    
    Args:
        toxic_count: Number of truly toxic/manipulative words
        opinion_count: Number of unsupported opinion sentences
    
    Returns:
        Score 0-100
    """
    score = 100.0 - (toxic_count * 2) - (opinion_count * 5)
    return max(0.0, min(100.0, score))


# =============================================================================
# CRITERION 3: Headline Relevance (15% weight)
# =============================================================================

# Clickbait keywords to detect (English + Ukrainian)
CLICKBAIT_KEYWORDS = [
    # English
    "shock", "shocking", "urgent", "breaking", "sensational",
    "you won't believe", "mind-blowing", "unbelievable",
    # Ukrainian
    "терміново", "шок", "сенсація", "неймовірно", "ви не повірите",
    "блискавка", "увага", "екстрено"
]


def calculate_headline_score(
    clickbait_triggers: int,
    mismatch_severity: int,
    headline: str = ""
) -> float:
    """
    Calculate headline relevance score with Python-side clickbait detection.
    
    Formula: Score = 100 - (ClickbaitTriggers × 10) - (MismatchSeverity × 20)
    
    Python checks:
    - CAPSLOCK: If >40% uppercase characters -> +1 trigger
    - Keywords: If contains SHOCK/URGENT/ТЕРМІНОВО -> +1 trigger
    
    Args:
        clickbait_triggers: Count from AI analysis
        mismatch_severity: How much headline doesn't match content (0-5)
        headline: The actual headline text for Python-side checks
    
    Returns:
        Score 0-100
    """
    total_triggers = clickbait_triggers
    
    if headline:
        # CAPSLOCK Check: >40% uppercase = clickbait
        alpha_chars = [c for c in headline if c.isalpha()]
        if alpha_chars:
            upper_ratio = sum(1 for c in alpha_chars if c.isupper()) / len(alpha_chars)
            if upper_ratio > 0.4:
                total_triggers += 1
        
        # Keyword Check
        headline_lower = headline.lower()
        for keyword in CLICKBAIT_KEYWORDS:
            if keyword in headline_lower:
                total_triggers += 1
                break  # Only add 1 for all keywords combined
    
    # Apply formula from MY-ALGORITHM.md
    score = 100.0 - (total_triggers * 10) - (mismatch_severity * 20)
    return max(0.0, min(100.0, score))


# =============================================================================
# CRITERION 4: Factual Density (15% weight)
# =============================================================================

def calculate_density_score(
    text: str,
    entity_count: int
) -> float:
    """
    Calculate factual density score with calibrated curve.
    
    Gentler scoring to account for AI entity summarization:
    - If entity_count >= 15: High score (80-100)
    - If density_ratio >= 0.02: High score (80-100)
    - Minimum floor of 30 unless text is empty
    
    Args:
        text: The article text
        entity_count: Number of named entities (people, orgs, dates, etc.)
    
    Returns:
        Score 0-100
    """
    words = text.split()
    word_count = len(words)
    
    if word_count == 0:
        return 0.0
    
    density_ratio = entity_count / word_count
    
    # Calibrated scoring with multiple paths to high scores
    
    # Path 1: High absolute entity count (regardless of article length)
    if entity_count >= 20:
        return 100.0
    elif entity_count >= 15:
        return 90.0
    elif entity_count >= 10:
        return 80.0
    
    # Path 2: Good density ratio
    if density_ratio >= 0.03:
        return 100.0
    elif density_ratio >= 0.02:
        return 85.0
    elif density_ratio >= 0.015:
        return 70.0
    elif density_ratio >= 0.01:
        return 55.0
    
    # Path 3: Some entities present
    if entity_count >= 5:
        return 50.0
    elif entity_count >= 3:
        return 40.0
    elif entity_count >= 1:
        return 35.0
    
    # Minimum floor (unless truly no entities)
    return 30.0


# =============================================================================
# CRITERION 5: Logical Consistency (15% weight)
# =============================================================================

def calculate_logic_score(
    fallacy_count: int,
    imbalance_detected: bool
) -> float:
    """
    Calculate logical consistency score.
    
    Formula: Score = 100 - (FallacyCount × 15) - (Imbalance × 10)
    
    Args:
        fallacy_count: Number of logical fallacies detected
        imbalance_detected: Whether controversial topic lacks opposing view
    
    Returns:
        Score 0-100
    """
    imbalance_penalty = 10 if imbalance_detected else 0
    score = 100.0 - (fallacy_count * 15) - imbalance_penalty
    return max(0.0, min(100.0, score))


# =============================================================================
# FINAL AGGREGATION
# =============================================================================

# Weights as defined in WMFA v2.0
WEIGHTS = {
    "source_verification": 0.35,
    "objectivity": 0.20,
    "headline_relevance": 0.15,
    "factual_density": 0.15,
    "logical_consistency": 0.15,
}


def aggregate_trust_score(
    source_score: float,
    objectivity_score: float,
    headline_score: float,
    density_score: float,
    logic_score: float
) -> float:
    """
    Calculate final Trust Score using weighted average.
    
    Formula:
    FinalScore = (Source × 0.35) + (Obj × 0.20) + (Head × 0.15) + 
                 (Dens × 0.15) + (Log × 0.15)
    
    Args:
        source_score: Source verification score (0-100)
        objectivity_score: Objectivity score (0-100)
        headline_score: Headline relevance score (0-100)
        density_score: Factual density score (0-100)
        logic_score: Logical consistency score (0-100)
    
    Returns:
        Weighted trust score 0-100
    """
    final = (
        source_score * WEIGHTS["source_verification"] +
        objectivity_score * WEIGHTS["objectivity"] +
        headline_score * WEIGHTS["headline_relevance"] +
        density_score * WEIGHTS["factual_density"] +
        logic_score * WEIGHTS["logical_consistency"]
    )
    
    return round(max(0.0, min(100.0, final)), 2)


def generate_explainer(
    trust_score: float,
    source_score: float,
    objectivity_score: float,
    headline_score: float,
    density_score: float,
    logic_score: float
) -> str:
    """Generate human-readable explanation of the analysis."""
    
    # Find weakest criterion
    scores = {
        "source verification": source_score,
        "objectivity": objectivity_score,
        "headline accuracy": headline_score,
        "factual density": density_score,
        "logical consistency": logic_score,
    }
    
    weakest = min(scores, key=scores.get)
    strongest = max(scores, key=scores.get)
    
    # Determine overall rating
    if trust_score >= 80:
        rating = "highly credible"
    elif trust_score >= 60:
        rating = "generally reliable"
    elif trust_score >= 40:
        rating = "somewhat questionable"
    else:
        rating = "low credibility"
    
    # Generate explanation
    if trust_score >= 70:
        return f"This article is {rating}. Strong {strongest} ({scores[strongest]:.0f}). " \
               f"Minor concern: {weakest} ({scores[weakest]:.0f})."
    else:
        return f"This article shows {rating}. Main issue: {weakest} ({scores[weakest]:.0f}). " \
               f"Strength: {strongest} ({scores[strongest]:.0f})."
