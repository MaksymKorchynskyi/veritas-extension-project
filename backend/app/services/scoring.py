"""
Mathematical Scoring Module for VERITAS
========================================
All formulas are derived from a single source:

    Jøsang, A. & Ismail, R. (2002).
    "The Beta Reputation System."
    Proceedings of the 15th Bled Electronic Commerce Conference, pp. 324-337.

Core BRS formula used throughout (Eq. 3 in the paper):

    E(p) = (r + W · a) / (r + s + W)

Where:
    r  — positive evidence count (weighted)
    s  — negative evidence count (weighted)
    W  — prior weight (default 2, uninformative Bayesian prior)
    a  — base rate (prior probability, domain-specific)

Evidence Weighting (BRS Section 4 — Combining Evidence):
    - OSINT confirmation/contradiction: weight 1.0 (direct verification)
    - Named citation in article text:    weight 0.5 (indirect positive evidence)
    - Emotional/manipulative phrase:     weight 0.3 (indirect negative evidence)
"""


def _brs_expected(r: float, s: float, a: float = 0.5, W: float = 2.0) -> float:
    """
    Jøsang's Beta Reputation System — Expected Belief.

    E(p) = (r + W * a) / (r + s + W)

    With W=2 and a=0.5, this is equivalent to the Bayesian expected value
    of a Beta(α, β) distribution: E = α / (α + β), where α=r+1, β=s+1.
    """
    return (r + W * a) / (r + s + W)


def calculate_credibility(
    n_conf: int,
    n_contra: int,
    domain_trust: float = 0.5,
    citations_count: int = 0,
    emotional_words_count: int = 0,
    n_unverified: int = 0,
) -> float:
    """
    Credibility via BRS with multi-source evidence fusion.

    Evidence sources (weighted per BRS Section 4):
        r = n_conf * 1.0  +  citations_count * 0.2
        s = n_contra * 1.0  +  emotional_words_count * 0.3 + n_unverified * 0.4
        a = domain_trust (base rate from domain reputation)

    This ensures credibility is responsive even when OSINT is unavailable:
    - Quality article (5 citations, 0 emotional): credibility ≈ 65%
    - Propaganda (0 citations, 6 emotional):       credibility ≈ 26%
    - Unverified specific claims (n_unverified):   reduces credibility slightly per claim

    Reference: Jøsang & Ismail 2002, Eq. 3 + Section 4
    """
    # Primary evidence: OSINT (weight 1.0 per observation)
    r = float(n_conf)
    s = float(n_contra)

    # Secondary evidence: citations as weak positive (0.2 each)
    r += citations_count * 0.2

    # Secondary evidence: emotional language as weak negative (0.3 each)
    s += emotional_words_count * 0.3

    # Secondary evidence: unverified specific claims as weak negative (0.4 each)
    s += n_unverified * 0.4

    score = _brs_expected(r=r, s=s, a=domain_trust) * 100.0
    return max(0.0, min(100.0, score))


def calculate_transparency(citations_count: int) -> float:
    """
    Transparency via BRS with conservative prior.

    Each named source / citation is positive evidence (r).
    No counter-evidence (s=0).
    Base rate a=0.3 — an article must *prove* its transparency
    through citations; absence of citations yields a low score.

    Reference: Jøsang & Ismail 2002, Eq. 3
    """
    score = _brs_expected(r=citations_count, s=0, a=0.3) * 100.0
    return max(0.0, min(100.0, score))


def calculate_objectivity(emotional_words_count: int, total_words: int) -> float:
    """
    Objectivity via BRS with dynamic observation-window model.

    The Agent evaluates the article and counts manipulative phrases.
    We model this as K independent observations, where K scales with article length
    (1 observation per 50 words, minimum 8).
    Each emotional word is negative evidence (s), the remaining
    slots are positive evidence (r = K - s).

    a = 0.5 (uninformative prior)

    Reference: Jøsang & Ismail 2002, Eq. 3
    """
    K = max(8, total_words // 50)  # dynamic observation window
    s = min(emotional_words_count, K)
    r = K - s
    score = _brs_expected(r=r, s=s, a=0.5) * 100.0
    return max(0.0, min(100.0, score))


def aggregate_trust_score(credibility: float, transparency: float, objectivity: float) -> float:
    """
    Final Trust Score via Simple Additive Weighting (SAW).

    Weights: Credibility 50%, Transparency 30%, Objectivity 20%.

    When credibility < 50 (below the uninformative prior), evidence
    is net-negative. A soft BRS-inspired discount models Jøsang's
    trust transitivity: if the factual basis is weak, the other
    metrics carry less overall meaning.

    Reference: Jøsang & Ismail 2002, Section 5 (Trust Transitivity)
    """
    trust = 0.50 * credibility + 0.30 * transparency + 0.20 * objectivity

    # Soft discount when net evidence is negative (credibility below prior)
    if credibility < 50.0:
        discount = 0.5 + (credibility / 100.0)
        trust *= discount

    return max(0.0, min(100.0, round(trust, 1)))
