"""
VERITAS Core Analysis Engine
WMFA v5.1 (Weighted Multi-Factor Analysis) Algorithm Implementation

All scoring functions are pure Python - no AI guessing.
Gemini provides raw data counts, Python calculates exact scores.
"""

from typing import Optional
from urllib.parse import urlparse
import math

AUTHORITATIVE_ENTITIES = {
    "reuters", "ap", "ap news", "nyt", "bloomberg", "bbc", 
    "washington post", "isw", "генштаб", "мін", "міністерств"
}

# 🛡️ РОЗШИРЕНИЙ СПИСОК ДОВІРЕНИХ ДОМЕНІВ (Світ + Україна)
TRUSTED_DOMAINS = {
    # Урядові та офіційні
    ".gov", ".gov.ua", ".mil", "mil.gov.ua", ".edu",
    "president.gov.ua", "rada.gov.ua", "mfa.gov.ua", "mon.gov.ua", "armyinform.com.ua",
    
    # Світові агенції та гіганти
    "reuters.com", "apnews.com", "afp.com", "bloomberg.com", 
    "bbc.com", "bbc.co.uk", "npr.org", "pbs.org", "dw.com",
    "wsj.com", "ft.com", "nytimes.com", "washingtonpost.com",
    
    # "Білий список" якісних українських медіа (ІМІ)
    "pravda.com.ua", "eurointegration.com.ua", "nv.ua", "liga.net",
    "suspilne.media", "radiosvoboda.org", "zn.ua", "ukrinform.ua",
    "hromadske.ua", "lb.ua", "texty.org.ua", "delo.ua", "forbes.ua",
    "babel.ua", "mind.ua"
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

# Ключові слова для резервного пошуку джерел у тексті
CITATION_KEYWORDS = [
    # English
    "according to", "citing", "reported by", "stated by",
    "as per", "per the", "sources say", "officials said",
    "confirmed by", "announced by", "said in a statement",
    # Ukrainian
    "за словами", "повідомляє", "за даними", "як зазначає",
    "передає", "інформує", "заявив", "розповів", "зазначається",
    "наголосив", "джерела", "прес-служба", "у відомстві", "за інформацією"
]


def calculate_source_score(
    article_domain: str,
    links: list[dict],
    text_citations: list[str],
    article_text: str = "",
    reputation_index: Optional[float] = None
) -> float:
    """
    Calculate source verification score incorporating dynamic OSINT Reputation agent over static strings.
    """
    score = 0.0
    
    # 1. ОЦІНКА ГІПЕРПОСИЛАНЬ
    link_score = 0.0
    internal_links_count = 0
    
    for link in links:
        domain = link.get("domain", "")
        # Ігноруємо лінки на саму себе (анти-SEO спам)
        if not domain or domain == article_domain or domain.endswith(f".{article_domain}"):
            internal_links_count += 1
            continue
            
        if is_trusted_domain(domain):
            link_score += 25.0  # Великий бонус за посилання на трастові сайти
        else:
            link_score += 10.0  # Стандартний бонус за будь-яке зовнішнє джерело
            
    link_score = min(50.0, link_score)
    
    # 2. ОЦІНКА ТЕКСТОВИХ ДЖЕРЕЛ
    citation_score = 0.0
    if text_citations:
        for citation in text_citations:
            citation_lower = citation.lower()
            if any(auth in citation_lower for auth in AUTHORITATIVE_ENTITIES):
                citation_score += 30.0
            else:
                citation_score += 10.0
    else:
        text_lower = article_text.lower()
        keyword_count = sum(1 for kw in CITATION_KEYWORDS if kw in text_lower)
        citation_score += min(30.0, keyword_count * 10.0)
        
    score = min(100.0, link_score + citation_score)
    
    # OSINT РЕПУТАЦІЙНИЙ БОНУС АБО ШТРАФ (+25 до -25 балів)
    # Якщо OSINT надав нам репутацію, ми шкалюємо від -15 (для 0.0) до +15 (для 1.0)
    # Базово 0.5 дає 0 додаткових балів.
    if reputation_index is not None:
        # Scale: 0.0 -> -15 points, 0.5 -> 0 points, 1.0 -> +15 points
        rep_modifier = (reputation_index - 0.5) * 30.0
        score += rep_modifier
    elif is_trusted_domain(article_domain):
        score += 10.0 # Fallback 
        
    # ШТРАФ ЗА SEO-НАКРУТКУ
    if internal_links_count > 5:
        seo_penalty = min(20.0, (internal_links_count - 5) * 2.0)
        score -= seo_penalty
        
    return max(0.0, min(100.0, score))


# =============================================================================
# CRITERION 2: Objectivity (20% weight)
# =============================================================================

def calculate_objectivity_score(
    toxic_count: int,
    opinion_count: int,
    word_count: int
) -> float:
    """
    Calculate objectivity score based on toxic words and opinions.
    """
    # Remove size penalty. 5 toxic words in a 2000-word article is negligible.
    density = (toxic_count + 0.5 * opinion_count) / max(50, word_count)
    score = 100 * math.exp(-15.0 * density)
    return max(0.0, min(100.0, score))


# =============================================================================
# CRITERION 3: Headline Relevance (15% weight)
# =============================================================================

# Розширений словник клікбейту
CLICKBAIT_KEYWORDS = [
    # English
    "shock", "shocking", "urgent", "breaking", "sensational",
    "you won't believe", "mind-blowing", "unbelievable", "secret",
    # Ukrainian
    "терміново", "шок", "сенсація", "неймовірно", "ви не повірите",
    "блискавка", "увага", "екстрено", "важливо", "жах", "істерика",
    "паніка", "злили", "таємниця", "офіційно"
]


def calculate_headline_score(
    clickbait_triggers: int,
    mismatch_severity: int,
    headline: str = ""
) -> float:
    """
    Calculate headline relevance score with Python-side clickbait detection.
    """
    total_triggers = clickbait_triggers
    
    if headline:
        # CAPSLOCK Check: Якщо >30% заголовку написано ВЕЛИКИМИ літерами = клікбейт
        alpha_chars = [c for c in headline if c.isalpha()]
        if alpha_chars:
            upper_ratio = sum(1 for c in alpha_chars if c.isupper()) / len(alpha_chars)
            if upper_ratio > 0.3:
                total_triggers += 1
        
        # Keyword Check
        headline_lower = headline.lower()
        for keyword in CLICKBAIT_KEYWORDS:
            if keyword in headline_lower:
                total_triggers += 1
                break
    
    # Same geometric progression
    score = 100 * (0.75 ** mismatch_severity)
    # Minor flat penalty for clickbait triggers if any
    score -= (total_triggers * 5)
    return max(0.0, min(100.0, score))


# =============================================================================
# CRITERION 4: Factual Density (15% weight)
# =============================================================================

def calculate_density_score(
    text: str,
    entity_count: int,
    word_count: int
) -> float:
    """
    Calculate factual density score. Smooth, realistic curve.
    """
    if word_count == 0:
        return 0.0
        
    d = entity_count / max(50, word_count)
    # 5 is baseline. Approaches 100 asymptoticaly.
    score = 5.0 + 95.0 * (d / (d + 0.02))
    return max(0.0, min(100.0, score))


# =============================================================================
# CRITERION 5: Logical Consistency (15% weight)
# =============================================================================

def calculate_logic_score(
    fallacy_count: int,
    imbalance_detected: bool
) -> float:
    """
    Calculate logical consistency score.
    """
    # 0.80 multiplier per fallacy. Diminishing damage.
    score = 100 * (0.80 ** fallacy_count)
    if imbalance_detected:
        score *= 0.8  # Further 20% reduction
    return max(0.0, min(100.0, score))


# =============================================================================
# FINAL AGGREGATION
# =============================================================================

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
    logic_score: float,
    has_contradiction: bool = False,
    reputation_index: float | None = None
) -> float:
    """Calculate final Trust Score using WMFA v5.1 weighted average with OSINT Critical Penalties and Harmonic Drag."""
    final = (
        source_score * WEIGHTS["source_verification"] +
        objectivity_score * WEIGHTS["objectivity"] +
        headline_score * WEIGHTS["headline_relevance"] +
        density_score * WEIGHTS["factual_density"] +
        logic_score * WEIGHTS["logical_consistency"]
    )
    
    # 1. Critical Penalty: Do we have a PROVEN fake fact?
    if has_contradiction:
        final -= 40.0
        
    # 2. Harmonic Drag: Penalize if any single criterion is exceptionally weak
    min_score = min(source_score, objectivity_score, headline_score, density_score, logic_score)
    if min_score < 25.0:
        drag = (25.0 - min_score) * 0.15 # Max drag = 3.75 pts
        final -= drag
        
    return round(max(0.0, min(100.0, final)), 2)


def generate_explainer(
    trust_score: float,
    source_score: float,
    objectivity_score: float,
    headline_score: float,
    density_score: float,
    logic_score: float,
    has_contradiction: bool = False,
    reputation_index: float | None = None,
    language: str = "uk"
) -> str:
    """Generate human-readable explanation of the analysis with OSINT modifiers and localization."""
    
    if language == "en":
        scores = {
            "Source Verification": source_score,
            "Objectivity": objectivity_score,
            "Headline Relevance": headline_score,
            "Factual Density": density_score,
            "Logical Consistency": logic_score,
        }
        
        weakest = min(scores, key=scores.get)
        strongest = max(scores, key=scores.get)
        
        if trust_score >= 80:
            rating = "has high credibility"
        elif trust_score >= 60:
            rating = "is generally reliable but needs attention"
        elif trust_score >= 40:
            rating = "contains questionable elements"
        else:
            rating = "has low credibility and signs of manipulation"
            
        base_text = f"This article {rating}."
        
        if has_contradiction:
            base_text = "⚠️ The overall rating was RADICALLY REDUCED due to the discovery of claims directly contradicted by independent OSINT search."
        elif reputation_index is not None and reputation_index < 0.4:
            base_text = "⚠️ The score was significantly reduced due to extremely low trust levels recorded for this publisher by international organizations."
        
        if trust_score >= 70:
            return f"{base_text} Strength: {strongest} ({scores[strongest]:.0f}/100). Area for improvement: {weakest} ({scores[weakest]:.0f}/100)."
        else:
            return f"{base_text} Main issue: {weakest} ({scores[weakest]:.0f}/100). Meanwhile, {strongest} is at {scores[strongest]:.0f}/100."
    
    else:
        # Default back to Ukrainian
        scores = {
            "Перевірка джерел": source_score,
            "Об'єктивність": objectivity_score,
            "Релевантність заголовку": headline_score,
            "Фактологічна насиченість": density_score,
            "Логічна послідовність": logic_score,
        }
        
        weakest = min(scores, key=scores.get)
        strongest = max(scores, key=scores.get)
        
        if trust_score >= 80:
            rating = "має високу достовірність"
        elif trust_score >= 60:
            rating = "загалом надійна, але потребує уваги"
        elif trust_score >= 40:
            rating = "містить сумнівні елементи"
        else:
            rating = "має низьку достовірність та ознаки маніпуляцій"
            
        base_text = f"Ця стаття {rating}."
        
        if has_contradiction:
            base_text = "⚠️ Загальний рейтинг статті РАДИКАЛЬНО ЗНИЖЕНО через виявлення заяв, що були прямо спростовані незалежним OSINT-пошуком."
        elif reputation_index is not None and reputation_index < 0.4:
            base_text = "⚠️ Оцінку було суттєво зменшено через вкрай низький рівень довіри міжнародних організацій до даного видання."
        
        if trust_score >= 70:
            return f"{base_text} Сильна сторона: {strongest} ({scores[strongest]:.0f}/100). Зона для покращення: {weakest} ({scores[weakest]:.0f}/100)."
        else:
            return f"{base_text} Головна проблема: {weakest} ({scores[weakest]:.0f}/100). При цьому {strongest} на рівні {scores[strongest]:.0f}/100."