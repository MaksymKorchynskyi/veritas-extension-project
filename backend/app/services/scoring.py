"""
VERITAS Core Analysis Engine
WMFA v5.1 Algorithm -> Refactored to Fuzzy Inference System (FIS)

All scoring functions use standard Fuzzy Logic Membership Functions:
- Z-shaped curve for negative attributes (Toxicity, Clickbait)
- S-shaped curve for positive attributes (Factual Density, Trusted Sources)
- Gaussian curve for logical fallacies
"""

from typing import Optional
from urllib.parse import urlparse
import math

AUTHORITATIVE_ENTITIES = {
    # Світові та англомовні організації
    "reuters", "ap", "associated press", "nyt", "new york times", 
    "bloomberg", "bbc", "washington post", "wsj", "wall street journal", 
    "ft", "financial times", "the guardian", "economist",
    "isw", "amnesty international", "human rights watch", "un", "united nations", 
    "who", "world health organization", "nato", "pentagon", "white house", "osce",
    "bellingcat", "cia", "fbi", "interpol", "imf", "world bank", "світовий банк", "мвф",
    
    # Регіональні та українські офіційні установи
    "генштаб", "мін", "міністерств", "офіс президента", "оп", "гур", "сбу", 
    "нацполіція", "дбс", "дбр", "набу", "сап", "кабмін", "уряд", "верховна рада", 
    "парламент", "оон", "вооз", "нато", "обсє", "єс", "європарламент",
    "нбу", "нацбанк", "national bank", "цвк", "рнбо"
}

# 🛡️ РОЗШИРЕНИЙ СПИСОК ДОВІРЕНИХ ДОМЕНІВ (Світ + Україна)
TRUSTED_DOMAINS = {
    # Урядові та офіційні (універсальні)
    ".gov", ".gov.ua", ".mil", ".mil.gov.ua", ".edu", ".int", "europa.eu",
    "president.gov.ua", "rada.gov.ua", "mfa.gov.ua", "mon.gov.ua", "armyinform.com.ua",
    "spravdi.gov.ua", "nsdc.gov.ua", "nbu.gov.ua", "court.gov.ua", 
    "defense.gov", "state.gov", "nato.int", "who.int", "un.org",
    
    # Наукові ресурси
    "nature.com", "sciencemag.org", "nasa.gov", "esa.int", "cern.ch", 
    "ieee.org", "mit.edu", "stanford.edu", "harvard.edu", "ox.ac.uk", "cam.ac.uk",
    
    # Світові агенції та елітні медіа
    "reuters.com", "apnews.com", "afp.com", "bloomberg.com", 
    "bbc.com", "bbc.co.uk", "npr.org", "pbs.org", "dw.com",
    "wsj.com", "ft.com", "nytimes.com", "washingtonpost.com",
    "theguardian.com", "economist.com", "theatlantic.com", 
    "politico.com", "politico.eu", "foreignpolicy.com", "foreignaffairs.com",
    "aljazeera.com", "cnn.com", "nbcnews.com", "cbsnews.com", "abcnews.go.com", 
    "time.com", "spiegel.de", "lemonde.fr", "elpais.com", "bellingcat.com",
    "forbes.com", "businessinsider.com", "cnbc.com", "snopes.com", "politifact.com",
    
    # Якісні українські медіа (White List)
    "pravda.com.ua", "eurointegration.com.ua", "nv.ua", "liga.net",
    "suspilne.media", "radiosvoboda.org", "zn.ua", "ukrinform.ua",
    "hromadske.ua", "lb.ua", "texty.org.ua", "delo.ua", "forbes.ua",
    "babel.ua", "mind.ua", "slidstvo.info", "bbc.com/ukrainian",
    "rubryka.com", "hromadske.radio", "zaxid.net", "novynarnia.com",
    "epravda.com.ua", "tyzhden.ua", "thebabel.com.ua", "detector.media", "imi.org.ua"
}

# ⚠️ СІРИЙ СПИСОК ДОМЕНІВ (Соцмережі, блоги, агрегатори)
GRAY_DOMAINS = {
    # Соцмережі та UGC
    "t.me", "tiktok.com", "x.com", "twitter.com", "facebook.com", 
    "instagram.com", "youtube.com", "reddit.com", "pinterest.com", 
    "linkedin.com", "discord.gg", "snapchat.com", "threads.net", "quora.com",
    
    # Блоги та публікатори
    "medium.com", "wordpress.com", "blogspot.com", "tumblr.com", 
    "wixsite.com", "weebly.com", "substack.com", "livejournal.com",
    "telegra.ph", "github.io", "notion.site", "ghost.io",
    
    # Файлообмінники та неперевірені вікі
    "pastebin.com", "imgur.com", "wikia.com", "fandom.com"
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

def is_gray_domain(domain: str) -> bool:
    """Check if domain is in the gray list (social media, blogs)."""
    for gray in GRAY_DOMAINS:
        if gray in domain:
            return True
    return False


# =============================================================================
#  FUZZY MEMBERSHIP FUNCTIONS — MATLAB Fuzzy Logic Toolbox
#  Exact formulas from official documentation:
#    zmf:     https://www.mathworks.com/help/fuzzy/zmf.html
#    smf:     https://www.mathworks.com/help/fuzzy/smf.html
#    gaussmf: https://www.mathworks.com/help/fuzzy/gaussmf.html
#    trimf:   https://www.mathworks.com/help/fuzzy/trimf.html
# =============================================================================

def fuzzy_zmf(x: float, a: float, b: float) -> float:
    """
    Z-shaped membership function (spline-based).
    Source: MATLAB Fuzzy Logic Toolbox — zmf

    Formula:
        f(x; a, b) =
            1,                          if x ≤ a
            1 − 2·((x−a)/(b−a))²,      if a ≤ x ≤ (a+b)/2
            2·((x−b)/(b−a))²,           if (a+b)/2 ≤ x ≤ b
            0,                          if x ≥ b

    Parameter a defines the shoulder (μ=1), b defines the foot (μ=0).
    """
    if x <= a:
        return 1.0
    if x >= b:
        return 0.0
    mid = (a + b) / 2.0
    if x <= mid:
        return 1.0 - 2.0 * ((x - a) / (b - a)) ** 2
    return 2.0 * ((b - x) / (b - a)) ** 2


def fuzzy_smf(x: float, a: float, b: float) -> float:
    """
    S-shaped membership function (spline-based).
    Source: MATLAB Fuzzy Logic Toolbox — smf

    Formula:
        f(x; a, b) =
            0,                          if x ≤ a
            2·((x−a)/(b−a))²,           if a ≤ x ≤ (a+b)/2
            1 − 2·((x−b)/(b−a))²,      if (a+b)/2 ≤ x ≤ b
            1,                          if x ≥ b

    Parameter a defines the foot (μ=0), b defines the shoulder (μ=1).
    """
    if x <= a:
        return 0.0
    if x >= b:
        return 1.0
    mid = (a + b) / 2.0
    if x <= mid:
        return 2.0 * ((x - a) / (b - a)) ** 2
    return 1.0 - 2.0 * ((b - x) / (b - a)) ** 2


def fuzzy_gaussmf(x: float, sigma: float, c: float) -> float:
    """
    Gaussian membership function.
    Source: MATLAB Fuzzy Logic Toolbox — gaussmf

    Formula:
        f(x; σ, c) = exp(−(x−c)² / (2·σ²))

    Parameter σ (sigma) is the standard deviation, c is the mean (peak).
    """
    return math.exp(-((x - c) ** 2) / (2.0 * sigma ** 2))


def fuzzy_trimf(x: float, a: float, b: float, c: float) -> float:
    """
    Triangular membership function.
    Source: MATLAB Fuzzy Logic Toolbox — trimf

    Formula:
        f(x; a, b, c) = max(min((x−a)/(b−a), (c−x)/(c−b)), 0)

    Parameters a and c define the feet (μ=0), b defines the peak (μ=1).
    """
    if x <= a or x >= c:
        return 0.0
    if a < x <= b:
        return (x - a) / (b - a) if b != a else 1.0
    # b < x < c
    return (c - x) / (c - b) if c != b else 1.0


# =============================================================================
#  FUZZY OPERATORS (Klir & Yuan, 1995, Ch. 3)
# =============================================================================

def fuzzy_t_norm(a: float, b: float) -> float:
    """
    Algebraic product T-norm: T(a, b) = a · b
    Standard fuzzy AND operation.
    """
    return a * b


def fuzzy_complement(mu: float) -> float:
    """
    Standard fuzzy complement: μ̄ = 1 − μ
    Standard fuzzy NOT operation.
    """
    return 1.0 - mu


def sugeno_two_rule(mu_1: float, z_1: float, mu_2: float, z_2: float) -> float:
    """
    Sugeno defuzzification with two rules (Sugeno, 1985).
    Output = (μ₁·z₁ + μ₂·z₂) / (μ₁ + μ₂)
    """
    denom = mu_1 + mu_2
    if denom == 0:
        return 0.0
    return (mu_1 * z_1 + mu_2 * z_2) / denom


# =============================================================================
#  CRITERION 1: Source Verification  (Weight: 0.30)
#  Uses three fuzzified sub-variables combined via Sugeno weighted average.
# =============================================================================

CITATION_KEYWORDS = [
    "according to", "citing", "reported by", "stated by",
    "as per", "per the", "sources say", "officials said",
    "confirmed by", "announced by", "said in a statement",
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
    Source verification via three fuzzified sub-variables
    combined with Sugeno weighted average.

    Sub-variables (all use smf — S-shaped MF):
      μ_links     = smf(trusted_link_count;  a=0, b=2)
      μ_citations = smf(citation_quality;    a=0, b=2)
      μ_domain    = smf(reputation_index;    a=0.2, b=0.8)

    Score = (w₁·μ_links + w₂·μ_citations + w₃·μ_domain) · 100
    """
    # ── Feature extraction (preprocessing, not fuzzy) ──
    trusted_link_count = 0
    for link in links:
        domain = link.get("domain", "")
        if not domain or domain == article_domain or domain.endswith(f".{article_domain}"):
            continue
        if is_trusted_domain(domain):
            trusted_link_count += 1

    auth_citation_count = 0
    any_citation_count = 0
    if text_citations:
        for citation in text_citations:
            if any(auth in citation.lower() for auth in AUTHORITATIVE_ENTITIES):
                auth_citation_count += 1
            else:
                any_citation_count += 1
    else:
        text_lower = article_text.lower()
        keyword_hits = sum(1 for kw in CITATION_KEYWORDS if kw in text_lower)
        any_citation_count = min(3, keyword_hits)

    # ── Fuzzification of sub-variables (MATLAB Fuzzy Logic Toolbox) ──
    # μ_links: S-curve (smf), 0 trusted links → 0, ≥2 → 1.0
    mu_links = fuzzy_smf(float(trusted_link_count), a=0.0, b=2.0)

    # μ_citations: S-curve (smf) over combined citation quality
    citation_input = auth_citation_count + 0.3 * any_citation_count
    mu_citations = fuzzy_smf(citation_input, a=0.0, b=2.0)

    # μ_domain: domain trust membership
    #   - Known reputation → smf over reputation_index
    #   - White-list      → full membership (1.0)
    #   - Gray-list        → trimf(0.5; 0, 0.5, 1) = partial membership
    #   - Unknown          → trimf(0.5; 0, 0.35, 0.7) = moderate membership
    if reputation_index is not None:
        mu_domain = fuzzy_smf(reputation_index, a=0.2, b=0.8)
    elif is_trusted_domain(article_domain):
        mu_domain = 1.0
    elif is_gray_domain(article_domain):
        mu_domain = fuzzy_trimf(0.5, a=0.0, b=0.5, c=1.0)   # = 1.0 (peak)
    else:
        mu_domain = fuzzy_trimf(0.5, a=0.0, b=0.35, c=0.7)   # ≈ 0.57

    # ── Sugeno weighted average of sub-criteria ──
    w_links, w_cit, w_dom = 0.30, 0.40, 0.30
    source_score = (w_links * mu_links + w_cit * mu_citations + w_dom * mu_domain) * 100.0
    return source_score


# =============================================================================
# CRITERION 2: Objectivity (20% weight)
# =============================================================================

def calculate_objectivity_score(
    toxic_count: int,
    opinion_count: int,
    word_count: int
) -> float:
    """
    Calculate objectivity score using Z-shaped fuzzy logic.
    
    Linguistic variable: normalized subjective marker density
    (markers per 100 words). Normalization ensures that a long
    article with a few opinions is treated more leniently than
    a short text saturated with subjective language.
    
    Reference: Klir & Yuan (1995), Ch. 12 — "Defining the
    Universe of Discourse for linguistic variables."
    """
    raw_x = toxic_count + 0.5 * opinion_count
    
    # Нормалізація: щільність суб'єктивних маркерів на 100 слів
    effective_wc = max(100, word_count)
    x = raw_x * (100.0 / effective_wc)
    
    # Fuzzification using Z-curve (a=3.0, b=15.0)
    # До 3 маркерів/100 слів = 100%, 15/100 слів = 0%
    fuzzy_value = fuzzy_zmf(x, a=3.0, b=15.0)
    return fuzzy_value * 100.0


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
    "паніка", "злили", "таємниця", "офіційно", "скандальн"
]


def calculate_headline_score(
    clickbait_triggers: int,
    mismatch_severity: int,
    headline: str = ""
) -> float:
    """
    Calculate headline relevance score using Z-shaped fuzzy logic.
    """
    total_triggers = clickbait_triggers
    
    if headline:
        # CAPSLOCK Check
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
                
    x = mismatch_severity + total_triggers
    
    # Fuzzification using Z-curve (0 triggers = 100%, 5 triggers = 0%)
    fuzzy_value = fuzzy_zmf(float(x), a=0.0, b=5.0)
    return fuzzy_value * 100.0


# =============================================================================
# CRITERION 4: Factual Density (15% weight)
# =============================================================================

def calculate_density_score(
    text: str,
    entity_count: int,
    word_count: int
) -> float:
    """
    Calculate factual density score using S-shaped fuzzy logic.
    
    Linguistic variable: normalized entity density
    (named entities per 100 words). Normalization prevents long
    fake articles from inflating their score by simply having
    more text with scattered names and dates.
    
    Reference: Klir & Yuan (1995), Ch. 12 — normalization of
    the Universe of Discourse.
    """
    effective_wc = max(50, word_count)
    # Нормалізована щільність: сутності на 100 слів
    density_per_100 = (entity_count / effective_wc) * 100.0
    
    # Fuzzification using S-curve (a=1.0, b=8.0)
    # 8 сутностей на 100 слів = повна фактологічна насиченість
    fuzzy_value = fuzzy_smf(density_per_100, a=1.0, b=8.0)
    return fuzzy_value * 100.0


# =============================================================================
#  CRITERION 5: Logical Consistency  (Weight: 0.20)
#  Uses gaussmf + zmf combined with T-norm (algebraic product).
# =============================================================================

def calculate_logic_score(
    fallacy_count: int,
    imbalance_detected: bool
) -> float:
    """
    Logical consistency score via Gaussian MF + Z-shaped MF,
    combined using algebraic product T-norm.

    μ_fallacy  = gaussmf(fallacy_count; σ=1.2, c=0)
    μ_balance  = zmf(imbalance;         a=0,   b=3)
    Score = T_product(μ_fallacy, μ_balance) · 100

    When imbalance=0 → zmf(0,0,3) = 1.0   (повна збалансованість)
    When imbalance=1 → zmf(1,0,3) ≈ 0.78  (часткова незбалансованість)
    """
    mu_fallacy = fuzzy_gaussmf(float(fallacy_count), sigma=1.2, c=0.0)
    mu_balance = fuzzy_zmf(float(imbalance_detected), a=0.0, b=3.0)

    # T-norm: algebraic product T(a,b) = a·b
    mu_logic = fuzzy_t_norm(mu_fallacy, mu_balance)
    return mu_logic * 100.0


# =============================================================================
#  DEFUZZIFICATION — Sugeno Weighted Average (Sugeno, 1985)
#  All rules use standard fuzzy operations only.
# =============================================================================

WEIGHTS = {
    "source_verification": 0.30,
    "objectivity": 0.20,
    "headline_relevance": 0.20,
    "factual_density": 0.10,
    "logical_consistency": 0.20,
}


def aggregate_trust_score(
    source_score: float,
    objectivity_score: float,
    headline_score: float,
    density_score: float,
    logic_score: float,
    has_contradiction: bool = False,
    reputation_index: Optional[float] = None
) -> dict:
    """
    Final Trust Score via Sugeno-style defuzzification.
    Every rule uses standard fuzzy operations only.

    Rule 1 (base):  Sugeno weighted average of 5 criteria.
    Rule 2 (veto):  IF contradiction THEN trust = min(raw, 15)
        Implemented via sugeno_two_rule with:
        μ_credible = zmf(contradiction, 0, 1)
        μ_veto     = complement(μ_credible) = 1 − μ_credible
    Rule 3 (reputation): IF reputation LOW THEN trust REDUCED
        Implemented via sugeno_two_rule with:
        μ_rep_high = smf(reputation, 0, 0.5)
        μ_rep_low  = complement(μ_rep_high)
    """
    # ── Rule 1: Sugeno Weighted Average ──
    raw = (
        source_score * WEIGHTS["source_verification"]
        + objectivity_score * WEIGHTS["objectivity"]
        + headline_score * WEIGHTS["headline_relevance"]
        + density_score * WEIGHTS["factual_density"]
        + logic_score * WEIGHTS["logical_consistency"]
    )

    # ── Rule 2: OSINT Veto (Sugeno two-rule defuzzification) ──
    # μ_credible = zmf(contradiction, 0, 1) → 1.0 if no contradiction, 0.0 if yes
    mu_credible = fuzzy_zmf(float(has_contradiction), a=0.0, b=1.0)
    mu_veto = fuzzy_complement(mu_credible)
    z_credible = raw
    z_veto = min(raw, 15.0)
    final = sugeno_two_rule(mu_credible, z_credible, mu_veto, z_veto)

    # Cap sub-scores when veto fires (for display consistency)
    if has_contradiction:
        source_score = min(source_score, 50.0)
        objectivity_score = min(objectivity_score, 60.0)
        headline_score = min(headline_score, 60.0)
        density_score = min(density_score, 45.0)
        logic_score = min(logic_score, 50.0)

    # ── Rule 3: Reputation Modifier (Sugeno two-rule defuzzification) ──
    # μ_rep_high = smf(reputation, 0, 0.5) → 1.0 if reputation ≥ 0.5
    # μ_rep_low  = complement(μ_rep_high)  → 1.0 if reputation = 0
    if reputation_index is not None and reputation_index < 0.5:
        mu_rep_high = fuzzy_smf(reputation_index, a=0.0, b=0.5)
        mu_rep_low = fuzzy_complement(mu_rep_high)
        z_high = final               # Rule: IF rep HIGH → keep score
        z_low = final * 0.5           # Rule: IF rep LOW  → halve score
        final = sugeno_two_rule(mu_rep_high, z_high, mu_rep_low, z_low)

    return {
        "trust_score": round(max(0.0, min(100.0, final)), 2),
        "source_score": source_score,
        "objectivity_score": objectivity_score,
        "headline_score": headline_score,
        "density_score": density_score,
        "logic_score": logic_score
    }


def generate_explainer(
    trust_score: float,
    source_score: float,
    objectivity_score: float,
    headline_score: float,
    density_score: float,
    logic_score: float,
    has_contradiction: bool = False,
    reputation_index: Optional[float] = None,
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