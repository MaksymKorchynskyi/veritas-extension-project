"""
VERITAS Unit Tests — Scoring Engine (scoring.py)
=================================================
Tests for all deterministic scoring functions in the Fuzzy Inference System.
These are pure functions with no AI/network dependencies.

Run: python -m pytest tests/test_scoring.py -v
"""

import pytest
import math
from app.services.scoring import (
    calculate_source_score,
    calculate_objectivity_score,
    calculate_headline_score,
    calculate_density_score,
    calculate_logic_score,
    aggregate_trust_score,
    is_trusted_domain,
    get_domain,
    generate_explainer,
    WEIGHTS,
    fuzzy_zmf,
    fuzzy_smf,
    fuzzy_gaussmf
)


# =============================================================================
# HELPER: ensure score is always in valid range
# =============================================================================

def assert_valid_score(score: float, label: str = "Score"):
    """All individual scores should be finite numbers in [0, 100]."""
    assert isinstance(score, (int, float)), f"{label} is not a number: {type(score)}"
    assert math.isfinite(score), f"{label} is not finite: {score}"
    assert 0.0 <= score <= 100.0, f"{label} is out of bounds: {score}"


# =============================================================================
# 1. DOMAIN / TRUSTED DOMAIN UTILITIES
# =============================================================================

class TestDomainUtilities:
    """Tests for get_domain() and is_trusted_domain()."""

    def test_get_domain_basic(self):
        assert get_domain("https://www.reuters.com/article/123") == "reuters.com"

    def test_get_domain_ukraine(self):
        assert get_domain("https://pravda.com.ua/news/2026/04/1") == "pravda.com.ua"

    def test_get_domain_with_www(self):
        assert get_domain("https://www.bbc.com/news/test") == "bbc.com"

    def test_get_domain_no_protocol(self):
        """URLs without protocol should not crash."""
        result = get_domain("not-a-url")
        assert isinstance(result, str)

    def test_get_domain_empty(self):
        assert get_domain("") == ""

    def test_trusted_reuters(self):
        assert is_trusted_domain("reuters.com") is True

    def test_trusted_pravda(self):
        assert is_trusted_domain("pravda.com.ua") is True

    def test_trusted_gov_ua(self):
        assert is_trusted_domain("president.gov.ua") is True

    def test_not_trusted_random(self):
        assert is_trusted_domain("random-blog.xyz") is False

    def test_not_trusted_empty(self):
        assert is_trusted_domain("") is False


# =============================================================================
# 2. FUZZY LOGIC MEMBERSHIP FUNCTIONS
# =============================================================================

class TestFuzzyLogicFunctions:
    """Tests for the three core membership functions (zmf, smf, gaussmf)."""

    def test_zmf_at_boundaries(self):
        assert fuzzy_zmf(0, 1, 6) == 1.0
        assert fuzzy_zmf(1, 1, 6) == 1.0
        assert fuzzy_zmf(6, 1, 6) == 0.0
        assert fuzzy_zmf(10, 1, 6) == 0.0

    def test_zmf_midpoint(self):
        mid = fuzzy_zmf(3.5, 1, 6)
        assert 0.4 < mid < 0.6, "Midpoint should be near 0.5"

    def test_smf_at_boundaries(self):
        assert fuzzy_smf(0, 2, 20) == 0.0
        assert fuzzy_smf(2, 2, 20) == 0.0
        assert fuzzy_smf(20, 2, 20) == 1.0
        assert fuzzy_smf(30, 2, 20) == 1.0

    def test_gaussmf_peak_and_decay(self):
        assert fuzzy_gaussmf(0, 1.2, 0) == 1.0
        assert fuzzy_gaussmf(10, 1.2, 0) < 0.01


# =============================================================================
# 3. SOURCE VERIFICATION (30% weight)
# =============================================================================

class TestSourceVerification:
    """Tests for calculate_source_score()."""

    def test_no_data_unknown_domain(self):
        """Unknown domain, no data → base score with domain skepticism penalty."""
        score = calculate_source_score("unknown.com", [], [], "")
        assert_valid_score(score, "source_score(empty)")
        # -0.5 penalty → max(0, -0.5)=0 → smf(0, -1, 2) ≈ 22%
        assert score < 30, f"Unknown domain with no data should be low, got {score}"

    def test_trusted_domain_fallback(self):
        """Trusted domain without reputation_index → gets +1.0 bonus."""
        score_trusted = calculate_source_score("reuters.com", [], [], "")
        score_unknown = calculate_source_score("unknown.xyz", [], [], "")
        assert score_trusted > score_unknown, "Trusted domain should score higher"

    def test_single_trusted_link(self):
        """One link to Reuters → boosts score."""
        links = [{"domain": "reuters.com", "url": "https://reuters.com/article/1"}]
        score = calculate_source_score("example.com", links, [], "")
        assert_valid_score(score)
        assert score > 15

    def test_multiple_trusted_links(self):
        """Links to Reuters + BBC → μ_links=1.0, boosts score."""
        links = [
            {"domain": "reuters.com", "url": "https://reuters.com/1"},
            {"domain": "bbc.com", "url": "https://bbc.com/1"},
        ]
        score = calculate_source_score("example.com", links, [], "")
        assert score > 30  # 0.30*1.0 + 0.35*0 + 0.35*0.1 = 0.335 → 33.5

    def test_authoritative_citation(self):
        """Text citation with 'Reuters' → strong boost."""
        score = calculate_source_score("example.com", [], ["Reuters"], "")
        assert score > 15

    def test_reputation_bonus(self):
        """High reputation_index adds points."""
        base = calculate_source_score("x.com", [], ["Reuters"], "", reputation_index=0.5)
        boosted = calculate_source_score("x.com", [], ["Reuters"], "", reputation_index=0.9)
        assert boosted > base

    def test_reputation_penalty(self):
        """Low reputation_index subtracts points."""
        base = calculate_source_score("x.com", [], ["Reuters"], "", reputation_index=0.5)
        penalized = calculate_source_score("x.com", [], ["Reuters"], "", reputation_index=0.1)
        assert penalized < base

    def test_domain_skepticism(self):
        """Unknown domain gets -0.5 penalty vs neutral."""
        # Unknown domain with 1 authoritative citation: 1.0 - 0.5 = 0.5 trusted_points
        score_unknown = calculate_source_score("unknown.xyz", [], ["Reuters"], "")
        # Trusted domain with 1 authoritative citation: 1.0 + 1.0 = 2.0 trusted_points
        score_trusted = calculate_source_score("reuters.com", [], ["Reuters"], "")
        assert score_trusted > score_unknown


# =============================================================================
# 4. OBJECTIVITY (20% weight) — NORMALIZED
# =============================================================================

class TestObjectivity:
    """Tests for calculate_objectivity_score() with word-count normalization."""

    def test_perfect_objectivity(self):
        """Zero toxic words, zero opinions → 100."""
        score = calculate_objectivity_score(0, 0, 500)
        assert score == pytest.approx(100.0, abs=0.01)

    def test_heavy_toxicity_short(self):
        """15 toxic+opinion markers in 100 words → x=15/100*100=15 → zmf(15,3,15)=0."""
        score = calculate_objectivity_score(10, 10, 100)
        assert score == 0.0

    def test_same_count_long_article_less_penalized(self):
        """5 toxic words in 500-word article vs 100-word article."""
        short = calculate_objectivity_score(5, 0, 100)  # x = 5*100/100 = 5
        long = calculate_objectivity_score(5, 0, 500)   # x = 5*100/500 = 1
        assert long > short, f"Long article should be penalized less: {long} vs {short}"

    def test_opinion_weight_lower(self):
        """Opinions weighted at 0.5x toxic words."""
        # Use 100-word article so counts are high enough to differentiate
        toxic_only = calculate_objectivity_score(6, 0, 100)   # x = 6
        opinion_only = calculate_objectivity_score(0, 6, 100)  # x = 3 (0.5 weight)
        assert opinion_only > toxic_only

    def test_moderate_opinion_in_short_article(self):
        """B2-like: 3 toxic + 4 opinions in 100 words → should still have some score."""
        score = calculate_objectivity_score(3, 4, 100)
        # x = (3 + 2) * 100/100 = 5, zmf(5, 3, 15) ≈ 0.86
        assert score > 50, f"Moderate opinion density should not collapse, got {score}"


# =============================================================================
# 5. HEADLINE RELEVANCE (20% weight)
# =============================================================================

class TestHeadlineRelevance:
    """Tests for calculate_headline_score()."""

    def test_perfect_headline(self):
        """No clickbait, no mismatch → 100."""
        score = calculate_headline_score(0, 0, "Нормальний заголовок про подію")
        assert score == pytest.approx(100.0, abs=0.1)

    def test_high_mismatch_severity(self):
        """Mismatch severity 5 → 0 score."""
        score = calculate_headline_score(0, 5, "")
        assert score == 0.0

    def test_capslock_detection(self):
        """All-caps headline → extra clickbait trigger."""
        normal = calculate_headline_score(0, 0, "Normal headline about politics")
        caps = calculate_headline_score(0, 0, "THIS IS ALL CAPS HEADLINE NOW")
        assert caps < normal

    def test_clickbait_keyword_uk(self):
        """Ukrainian clickbait keyword 'терміново' → penalty."""
        clean = calculate_headline_score(0, 0, "Рада ухвалила законопроєкт")
        clickbait = calculate_headline_score(0, 0, "ТЕРМІНОВО! Шокуюча правда")
        assert clickbait < clean

    def test_skandalny_keyword(self):
        """'скандальн' keyword → penalty (catches C1-like fakes)."""
        clean = calculate_headline_score(0, 0, "ЄС ухвалив директиву")
        skandal = calculate_headline_score(0, 0, "ЄС ухвалив скандальну директиву")
        assert skandal < clean

    def test_score_never_negative(self):
        """Even extreme clickbait → score clamped at 0."""
        score = calculate_headline_score(20, 5, "ШОК ШОК ШОК ТЕРМІНОВО")
        assert score >= 0


# =============================================================================
# 6. FACTUAL DENSITY (10% weight) — NORMALIZED
# =============================================================================

class TestFactualDensity:
    """Tests for calculate_density_score() with word-count normalization."""

    def test_zero_entities(self):
        """No named entities → 0 score."""
        score = calculate_density_score("text", 0, 500)
        assert score == 0.0

    def test_high_density_short_article(self):
        """10 entities in 100 words = 10 per 100w → above b=8 → 100."""
        score = calculate_density_score("text", 10, 100)
        assert score == 100.0

    def test_same_entities_long_vs_short(self):
        """10 entities in 100 words vs 10 entities in 500 words."""
        short = calculate_density_score("text", 10, 100)  # 10 per 100w
        long = calculate_density_score("text", 10, 500)   # 2 per 100w
        assert short > long, "Short article with same entities has higher density"

    def test_moderate_density(self):
        """5 entities in 100 words → mid score."""
        score = calculate_density_score("text", 5, 100)  # 5 per 100w
        assert 0.0 < score < 100.0

    def test_density_increases_monotonically(self):
        """More entities (same word count) → higher or equal score."""
        scores = [calculate_density_score("text", n, 200) for n in range(0, 20, 4)]
        for i in range(1, len(scores)):
            assert scores[i] >= scores[i - 1]


# =============================================================================
# 7. LOGICAL CONSISTENCY (20% weight)
# =============================================================================

class TestLogicalConsistency:
    """Tests for calculate_logic_score()."""

    def test_no_fallacies(self):
        """Zero fallacies, no imbalance → 100."""
        score = calculate_logic_score(0, False)
        assert score == pytest.approx(100.0, abs=0.01)

    def test_one_fallacy(self):
        """One fallacy → gaussmf(1, 1.2, 0) ≈ 70.6."""
        score = calculate_logic_score(1, False)
        expected = math.exp(-1 / (2 * 1.44)) * 100.0
        assert score == pytest.approx(expected, abs=0.1)

    def test_imbalance_penalty(self):
        """Imbalance detected → T-norm with zmf reduces score."""
        without = calculate_logic_score(1, False)
        with_imbalance = calculate_logic_score(1, True)
        # zmf(1, 0, 3) ≈ 0.778 via T-norm, not hardcoded 0.8
        assert with_imbalance < without
        assert with_imbalance > without * 0.7  # not too harsh

    def test_many_fallacies(self):
        """Many fallacies → near zero score."""
        score = calculate_logic_score(5, True)
        assert score < 1.0


# =============================================================================
# 8. AGGREGATION (Final Trust Score)
# =============================================================================

class TestAggregation:
    """Tests for aggregate_trust_score()."""

    def test_all_perfect(self):
        """All criteria = 100 → Trust Score = 100."""
        res = aggregate_trust_score(100, 100, 100, 100, 100)
        assert res["trust_score"] == pytest.approx(100.0, abs=0.1)

    def test_all_zero(self):
        """All criteria = 0 → Trust Score = 0."""
        res = aggregate_trust_score(0, 0, 0, 0, 0)
        assert res["trust_score"] == pytest.approx(0.0, abs=0.1)

    def test_weighted_average(self):
        """Known values → verify weighted calculation."""
        # 80*0.30 + 60*0.20 + 90*0.20 + 70*0.10 + 85*0.20 = 24+12+18+7+17=78
        res = aggregate_trust_score(80, 60, 90, 70, 85)
        assert res["trust_score"] == pytest.approx(78.0, abs=0.1)

    def test_contradiction_veto(self):
        """has_contradiction=True → OSINT Veto caps at 15.0."""
        contradicted = aggregate_trust_score(80, 80, 80, 80, 80, has_contradiction=True)
        assert contradicted["trust_score"] == 15.0

    def test_low_reputation_penalty(self):
        """Low reputation_index (0.1) → score reduced via fuzzy modifier."""
        normal = aggregate_trust_score(80, 80, 80, 80, 80)
        penalized = aggregate_trust_score(80, 80, 80, 80, 80, reputation_index=0.1)
        assert penalized["trust_score"] < normal["trust_score"]

    def test_weights_sum_to_one(self):
        """Critical: all weights must sum to exactly 1.0."""
        total = sum(WEIGHTS.values())
        assert total == pytest.approx(1.0, abs=0.001)

    def test_source_verification_dominant(self):
        """Source verification has 30% weight → most influential."""
        high_src = aggregate_trust_score(100, 50, 50, 50, 50)
        high_obj = aggregate_trust_score(50, 100, 50, 50, 50)
        assert high_src["trust_score"] > high_obj["trust_score"]


# =============================================================================
# 9. EXPLAINER GENERATION
# =============================================================================

class TestExplainer:
    """Tests for generate_explainer()."""

    def test_high_score_uk(self):
        text = generate_explainer(85, 90, 80, 85, 80, 90, language="uk")
        assert "висок" in text.lower()

    def test_contradiction_override(self):
        text = generate_explainer(30, 80, 80, 80, 80, 80, has_contradiction=True, language="uk")
        assert "osint" in text.lower() or "радикально" in text.lower()

    def test_returns_string(self):
        text = generate_explainer(50, 50, 50, 50, 50, 50)
        assert isinstance(text, str) and len(text) > 10


# =============================================================================
# 10. INTEGRATION-LIKE TESTS (full pipeline scoring)
# =============================================================================

class TestScoringPipeline:
    """End-to-end scoring scenarios simulating realistic article profiles."""

    def test_high_quality_article_profile(self):
        """Profile: Reuters-quality article → Trust Score > 70."""
        source = calculate_source_score(
            "reuters.com",
            [{"domain": "apnews.com"}, {"domain": "bbc.com"}],
            ["Reuters", "AP"],
            reputation_index=0.9
        )
        objectivity = calculate_objectivity_score(0, 1, 800)
        headline = calculate_headline_score(0, 0, "Ukraine signs new reform law")
        density = calculate_density_score("text", 25, 800)
        logic = calculate_logic_score(0, False)

        res = aggregate_trust_score(source, objectivity, headline, density, logic)
        assert res["trust_score"] > 70

    def test_fake_news_profile(self):
        """Profile: Clickbait fake news → Trust Score < 40."""
        source = calculate_source_score(
            "fake-news.xyz", [], [], "",
            reputation_index=0.1
        )
        objectivity = calculate_objectivity_score(8, 5, 200)
        headline = calculate_headline_score(3, 4, "ШОК!!! ТЕРМІНОВО! ВЛАДА БРЕШЕ!")
        density = calculate_density_score("text", 2, 200)
        logic = calculate_logic_score(3, True)

        res = aggregate_trust_score(
            source, objectivity, headline, density, logic,
            has_contradiction=True, reputation_index=0.1
        )
        assert res["trust_score"] < 40

    def test_separation_between_quality_and_fake(self):
        """The gap between high-quality and fake news should be > 30 points."""
        src_good = calculate_source_score("bbc.com", [{"domain": "reuters.com"}], ["BBC"], "", 0.9)
        res_good = aggregate_trust_score(
            src_good,
            calculate_objectivity_score(0, 0, 500),
            calculate_headline_score(0, 0, "Normal headline"),
            calculate_density_score("t", 20, 500),
            calculate_logic_score(0, False)
        )

        src_fake = calculate_source_score("fake.xyz", [], [], "", 0.1)
        res_fake = aggregate_trust_score(
            src_fake,
            calculate_objectivity_score(10, 5, 200),
            calculate_headline_score(3, 4, "ШОКУЮЧЕ! ТЕРМІНОВО!"),
            calculate_density_score("t", 1, 200),
            calculate_logic_score(3, True),
            has_contradiction=True, reputation_index=0.1
        )

        gap = res_good["trust_score"] - res_fake["trust_score"]
        assert gap > 30, f"Gap between good and fake should be > 30, got {gap}"
