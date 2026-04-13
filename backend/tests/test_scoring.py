"""
VERITAS Unit Tests — Scoring Engine (scoring.py)
=================================================
Tests for all deterministic scoring functions in the WMFA algorithm.
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
)


# =============================================================================
# HELPER: ensure score is always in valid range
# =============================================================================

def assert_valid_score(score: float, label: str = "Score"):
    """All individual scores should be finite numbers."""
    assert isinstance(score, (int, float)), f"{label} is not a number: {type(score)}"
    assert math.isfinite(score), f"{label} is not finite: {score}"


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

    def test_trusted_edu(self):
        assert is_trusted_domain("stanford.edu") is True

    def test_not_trusted_random(self):
        assert is_trusted_domain("random-blog.xyz") is False

    def test_not_trusted_empty(self):
        assert is_trusted_domain("") is False

    def test_trusted_bbc(self):
        assert is_trusted_domain("bbc.com") is True

    def test_trusted_nv_ua(self):
        assert is_trusted_domain("nv.ua") is True

    def test_trusted_suspilne(self):
        assert is_trusted_domain("suspilne.media") is True


# =============================================================================
# 2. SOURCE VERIFICATION (35% weight)
# =============================================================================

class TestSourceVerification:
    """Tests for calculate_source_score()."""

    def test_no_data_at_all(self):
        """No links, no citations, no text → low score."""
        score = calculate_source_score("unknown.com", [], [], "")
        assert_valid_score(score, "source_score(empty)")
        assert score <= 15, f"Expected very low score for zero data, got {score}"

    def test_single_trusted_link(self):
        """One link to Reuters → decent score."""
        links = [{"domain": "reuters.com", "url": "https://reuters.com/article/1"}]
        score = calculate_source_score("example.com", links, [], "")
        assert score >= 20, f"Trusted link should boost score, got {score}"

    def test_multiple_trusted_links(self):
        """Links to Reuters + BBC → high link score."""
        links = [
            {"domain": "reuters.com", "url": "https://reuters.com/1"},
            {"domain": "bbc.com", "url": "https://bbc.com/1"},
        ]
        score = calculate_source_score("example.com", links, [], "")
        assert score >= 40, f"Multiple trusted links should give high score, got {score}"

    def test_link_score_cap(self):
        """Even 10 trusted links shouldn't explode the link component beyond cap."""
        links = [{"domain": "reuters.com", "url": f"https://reuters.com/{i}"} for i in range(10)]
        score = calculate_source_score("example.com", links, [], "")
        assert_valid_score(score, "source_score(10 trusted links)")

    def test_internal_links_are_ignored_for_link_score(self):
        """Links to same domain → counted as internal, no link score boost."""
        links = [{"domain": "example.com", "url": f"https://example.com/page-{i}"} for i in range(5)]
        score = calculate_source_score("example.com", links, [], "")
        # Only internal links → link_score should be 0
        assert score <= 15, f"Internal links should not boost score, got {score}"

    def test_seo_spam_penalty(self):
        """More than 5 internal links → penalty applied."""
        links = [{"domain": "spam.com", "url": f"https://spam.com/{i}"} for i in range(10)]
        score_10_internal = calculate_source_score("spam.com", links, [], "")
        links_3 = [{"domain": "spam.com", "url": f"https://spam.com/{i}"} for i in range(3)]
        score_3_internal = calculate_source_score("spam.com", links_3, [], "")
        assert score_10_internal <= score_3_internal, "10 internal links should be penalized vs 3"

    def test_authoritative_citation(self):
        """Text citation with 'Reuters' → high citation score."""
        score = calculate_source_score("example.com", [], ["Reuters", "AP News"], "")
        assert score >= 50, f"Reuters + AP citations should give high score, got {score}"

    def test_normal_citation(self):
        """Non-authoritative text citation → some score."""
        score = calculate_source_score("example.com", [], ["Олексій Петров"], "")
        assert score >= 5, f"Any citation should give some score, got {score}"

    def test_text_fallback_keywords(self):
        """No links, no citations, but article text has 'за словами' → moderate score."""
        article = "За словами міністра, ситуація контрольована. Як повідомляє Генштаб, операція продовжується."
        score = calculate_source_score("example.com", [], [], article_text=article)
        assert score >= 10, f"Text keyword fallback should provide some score, got {score}"

    def test_reputation_bonus(self):
        """High reputation_index → adds points."""
        base = calculate_source_score("x.com", [], ["Reuters"], "", reputation_index=0.5)
        boosted = calculate_source_score("x.com", [], ["Reuters"], "", reputation_index=0.9)
        assert boosted > base, f"Good reputation should boost: {boosted} vs {base}"

    def test_reputation_penalty(self):
        """Low reputation_index → subtracts points."""
        base = calculate_source_score("x.com", [], ["Reuters"], "", reputation_index=0.5)
        penalized = calculate_source_score("x.com", [], ["Reuters"], "", reputation_index=0.1)
        assert penalized < base, f"Bad reputation should penalize: {penalized} vs {base}"

    def test_reputation_neutral(self):
        """reputation_index=0.5 → no modifier (0 points)."""
        score = calculate_source_score("x.com", [], ["Reuters"], "", reputation_index=0.5)
        assert_valid_score(score)

    def test_trusted_domain_fallback(self):
        """If no reputation_index but domain is trusted → fallback bonus."""
        score_trusted = calculate_source_score("reuters.com", [], ["Test"], "")
        score_unknown = calculate_source_score("unknown.xyz", [], ["Test"], "")
        assert score_trusted >= score_unknown, "Trusted domain should have fallback bonus"


# =============================================================================
# 3. OBJECTIVITY (20% weight)
# =============================================================================

class TestObjectivity:
    """Tests for calculate_objectivity_score()."""

    def test_perfect_objectivity(self):
        """Zero toxic words, zero opinions → 100."""
        score = calculate_objectivity_score(0, 0, 500)
        assert score == pytest.approx(100.0, abs=0.01)

    def test_heavy_toxicity(self):
        """10 toxic words in short article → very low score."""
        score = calculate_objectivity_score(10, 5, 100)
        assert score < 30, f"Heavy toxicity should penalize hard, got {score}"

    def test_mild_toxicity(self):
        """1 toxic word in long article → barely noticeable."""
        score = calculate_objectivity_score(1, 0, 2000)
        assert score > 90, f"1 toxic word in 2000 words should barely penalize, got {score}"

    def test_length_normalization(self):
        """Same toxic count in short vs long article → short penalized more."""
        short = calculate_objectivity_score(5, 2, 200)
        long = calculate_objectivity_score(5, 2, 2000)
        assert long > short, f"Long article should be less penalized: long={long} vs short={short}"

    def test_opinion_weight_lower(self):
        """Opinions weighted at 0.5x toxic → less damaging."""
        toxic_only = calculate_objectivity_score(4, 0, 500)
        opinion_only = calculate_objectivity_score(0, 4, 500)
        assert opinion_only > toxic_only, "Opinions should be less damaging than toxic words"

    def test_zero_word_count(self):
        """word_count=0 should not cause ZeroDivisionError."""
        score = calculate_objectivity_score(1, 1, 0)
        assert_valid_score(score, "objectivity(0 words)")
        assert score >= 0

    def test_extreme_toxicity(self):
        """Extreme case: 100 toxic words in 50-word text."""
        score = calculate_objectivity_score(100, 50, 50)
        assert score >= 0, "Score must never be negative"
        assert score < 5, "Extreme toxicity should crush the score"

    def test_exponential_decay_shape(self):
        """Score should decrease with each additional toxic word, but diminishingly."""
        s0 = calculate_objectivity_score(0, 0, 500)
        s1 = calculate_objectivity_score(2, 0, 500)
        s2 = calculate_objectivity_score(4, 0, 500)
        s3 = calculate_objectivity_score(6, 0, 500)
        # Each step should decrease, but the damage rate should slow down
        d1 = s0 - s1
        d2 = s1 - s2
        d3 = s2 - s3
        assert d1 > 0 and d2 > 0 and d3 > 0, "Score should always decrease"
        assert d1 >= d2 >= d3, f"Diminishing returns expected: {d1}, {d2}, {d3}"

    def test_score_never_negative(self):
        score = calculate_objectivity_score(9999, 9999, 50)
        assert score >= 0


# =============================================================================
# 4. HEADLINE RELEVANCE (15% weight)
# =============================================================================

class TestHeadlineRelevance:
    """Tests for calculate_headline_score()."""

    def test_perfect_headline(self):
        """No clickbait, no mismatch → 100."""
        score = calculate_headline_score(0, 0, "Нормальний заголовок про подію")
        assert score == pytest.approx(100.0, abs=0.1)

    def test_high_mismatch_severity(self):
        """Mismatch severity 5 (fabrication) → very low score."""
        score = calculate_headline_score(0, 5, "")
        assert score < 30, f"Severity=5 should give very low score, got {score}"

    def test_mismatch_geometric_decay(self):
        """Each severity level reduces by 0.75x."""
        s0 = calculate_headline_score(0, 0, "")
        s1 = calculate_headline_score(0, 1, "")
        s2 = calculate_headline_score(0, 2, "")
        assert s1 == pytest.approx(75.0, abs=0.1)    # 100 * 0.75^1
        assert s2 == pytest.approx(56.25, abs=0.1)   # 100 * 0.75^2

    def test_capslock_detection(self):
        """All-caps headline → extra clickbait trigger."""
        normal = calculate_headline_score(0, 0, "Normal headline about politics")
        caps = calculate_headline_score(0, 0, "THIS IS ALL CAPS HEADLINE NOW")
        assert caps < normal, f"CAPSLOCK should be penalized: caps={caps} vs normal={normal}"

    def test_partial_caps_below_threshold(self):
        """Less than 30% caps → no extra penalty."""
        score = calculate_headline_score(0, 0, "Зеленський підписав ВАЖЛИВИЙ закон")
        assert score >= 95, f"Minor caps should not trigger penalty, got {score}"

    def test_clickbait_keyword_uk(self):
        """Ukrainian clickbait keyword 'терміново' → penalty."""
        clean = calculate_headline_score(0, 0, "Рада ухвалила законопроєкт")
        clickbait = calculate_headline_score(0, 0, "ТЕРМІНОВО! Шокуюча правда")
        assert clickbait < clean, "Clickbait keywords should be penalized"

    def test_clickbait_keyword_en(self):
        """English clickbait keyword 'shocking' → penalty."""
        clean = calculate_headline_score(0, 0, "Parliament passes new law")
        clickbait = calculate_headline_score(0, 0, "SHOCKING news about the parliament")
        assert clickbait < clean, "English clickbait should be penalized too"

    def test_ai_triggers_plus_python_triggers(self):
        """Clickbait triggers from AI + Python-detected → cumulative penalty."""
        ai_only = calculate_headline_score(2, 0, "Normal headline")
        both = calculate_headline_score(2, 0, "ШОК! ТЕРМІНОВО!")
        assert both < ai_only, "Python triggers should add on top of AI triggers"

    def test_score_never_negative(self):
        """Even extreme clickbait → score clamped at 0."""
        score = calculate_headline_score(20, 5, "ШОК ШОК ШОК ТЕРМІНОВО ЖАХЛИВО")
        assert score >= 0, f"Score should never go below 0, got {score}"


# =============================================================================
# 5. FACTUAL DENSITY (15% weight)
# =============================================================================

class TestFactualDensity:
    """Tests for calculate_density_score()."""

    def test_zero_entities(self):
        """No named entities → minimum baseline score (20)."""
        score = calculate_density_score("some article text here", 0, 500)
        assert score == pytest.approx(20.0, abs=1.0), f"Zero entities → 20 baseline, got {score}"

    def test_zero_words(self):
        """word_count=0 → 0 score (empty document)."""
        score = calculate_density_score("", 0, 0)
        assert score == 0.0

    def test_rich_article(self):
        """Many entities per word → high score."""
        score = calculate_density_score("text", 50, 500)
        assert score > 85, f"High entity density should score well, got {score}"

    def test_asymptotic_ceiling(self):
        """Score approaches but never exceeds 100."""
        score = calculate_density_score("text", 10000, 100)
        assert score <= 100.0, f"Score must not exceed 100, got {score}"
        assert score > 95, f"Very high density should be near 100, got {score}"

    def test_minimum_baseline(self):
        """Even very low density still gives ~20 baseline."""
        score = calculate_density_score("text", 1, 10000)
        assert score >= 20, f"Baseline should be at least 20, got {score}"

    def test_moderate_density(self):
        """Moderate entity count → middle-range score."""
        score = calculate_density_score("text", 10, 500)
        assert 20 < score < 90, f"Moderate density should give mid score, got {score}"

    def test_density_increases_monotonically(self):
        """More entities (same word count) → higher or equal score."""
        scores = [calculate_density_score("text", n, 500) for n in range(0, 100, 10)]
        for i in range(1, len(scores)):
            assert scores[i] >= scores[i - 1], f"Score should be monotonically increasing"

    def test_michaelis_menten_shape(self):
        """Score increases fast initially, then plateaus."""
        s5 = calculate_density_score("text", 5, 500)
        s10 = calculate_density_score("text", 10, 500)
        s50 = calculate_density_score("text", 50, 500)
        s100 = calculate_density_score("text", 100, 500)
        gain_first = s10 - s5
        gain_last = s100 - s50
        assert gain_first > gain_last, "Diminishing returns expected in asymptotic curve"


# =============================================================================
# 6. LOGICAL CONSISTENCY (15% weight)
# =============================================================================

class TestLogicalConsistency:
    """Tests for calculate_logic_score()."""

    def test_no_fallacies(self):
        """Zero fallacies, no imbalance → 100."""
        score = calculate_logic_score(0, False)
        assert score == pytest.approx(100.0, abs=0.01)

    def test_one_fallacy(self):
        """One fallacy → 80 (100 * 0.80^1)."""
        score = calculate_logic_score(1, False)
        assert score == pytest.approx(80.0, abs=0.01)

    def test_two_fallacies(self):
        """Two fallacies → 64 (100 * 0.80^2)."""
        score = calculate_logic_score(2, False)
        assert score == pytest.approx(64.0, abs=0.01)

    def test_imbalance_penalty(self):
        """Imbalance detected → additional 20% reduction."""
        without = calculate_logic_score(1, False)
        with_imbalance = calculate_logic_score(1, True)
        assert with_imbalance == pytest.approx(without * 0.8, abs=0.01)

    def test_diminishing_damage(self):
        """Each additional fallacy does less absolute damage."""
        d1 = calculate_logic_score(0, False) - calculate_logic_score(1, False)
        d2 = calculate_logic_score(1, False) - calculate_logic_score(2, False)
        d3 = calculate_logic_score(2, False) - calculate_logic_score(3, False)
        assert d1 > d2 > d3, f"Diminishing returns expected: {d1}, {d2}, {d3}"

    def test_many_fallacies(self):
        """Many fallacies → low but positive score."""
        score = calculate_logic_score(10, True)
        assert score > 0, "Score should always be positive"
        assert score < 15, f"10 fallacies + imbalance should be very low, got {score}"

    def test_score_never_negative(self):
        """Even extreme values → score stays positive."""
        score = calculate_logic_score(100, True)
        assert score >= 0


# =============================================================================
# 7. AGGREGATION (Final Trust Score)
# =============================================================================

class TestAggregation:
    """Tests for aggregate_trust_score()."""

    def test_all_perfect(self):
        """All criteria = 100 → Trust Score = 100."""
        score = aggregate_trust_score(100, 100, 100, 100, 100)
        assert score == pytest.approx(100.0, abs=0.1)

    def test_all_zero(self):
        """All criteria = 0 → Trust Score = 0."""
        score = aggregate_trust_score(0, 0, 0, 0, 0)
        assert score == pytest.approx(0.0, abs=0.1)

    def test_weighted_average(self):
        """Known values → verify weighted calculation."""
        # 80*0.35 + 60*0.20 + 90*0.15 + 70*0.15 + 85*0.15 = 28 + 12 + 13.5 + 10.5 + 12.75 = 76.75
        score = aggregate_trust_score(80, 60, 90, 70, 85)
        assert score == pytest.approx(76.75, abs=0.1)

    def test_contradiction_penalty(self):
        """has_contradiction=True → severe -40 penalty."""
        normal = aggregate_trust_score(80, 80, 80, 80, 80)
        contradicted = aggregate_trust_score(80, 80, 80, 80, 80, has_contradiction=True)
        assert contradicted == pytest.approx(normal - 40.0, abs=0.1)

    def test_reputation_penalty(self):
        """Low reputation (<0.4) → 30% reduction."""
        normal = aggregate_trust_score(80, 80, 80, 80, 80)
        penalized = aggregate_trust_score(80, 80, 80, 80, 80, reputation_index=0.2)
        assert penalized == pytest.approx(normal * 0.7, abs=0.1)

    def test_score_clamped_at_zero(self):
        """Contradiction on already low scores → clamp at 0, not negative."""
        score = aggregate_trust_score(10, 10, 10, 10, 10, has_contradiction=True)
        assert score >= 0.0, f"Score must never be negative, got {score}"

    def test_score_clamped_at_hundred(self):
        """Score never exceeds 100."""
        score = aggregate_trust_score(100, 100, 100, 100, 100)
        assert score <= 100.0

    def test_weights_sum_to_one(self):
        """Critical: all weights must sum to exactly 1.0."""
        total = sum(WEIGHTS.values())
        assert total == pytest.approx(1.0, abs=0.001), f"Weights sum to {total}, expected 1.0"

    def test_source_verification_dominant(self):
        """Source verification has 35% weight → most influential."""
        high_src = aggregate_trust_score(100, 50, 50, 50, 50)
        high_obj = aggregate_trust_score(50, 100, 50, 50, 50)
        difference = high_src - high_obj
        assert difference > 0, "Source (35%) should matter more than objectivity (20%)"
        assert difference == pytest.approx(50 * (0.35 - 0.20), abs=0.1)


# =============================================================================
# 8. EXPLAINER GENERATION
# =============================================================================

class TestExplainer:
    """Tests for generate_explainer()."""

    def test_high_score_uk(self):
        """High trust score → positive Ukrainian message."""
        text = generate_explainer(85, 90, 80, 85, 80, 90, language="uk")
        assert "висок" in text.lower(), f"Should mention high quality: {text}"

    def test_low_score_uk(self):
        """Low trust score → warning Ukrainian message."""
        text = generate_explainer(30, 20, 30, 40, 30, 25, language="uk")
        assert "низьк" in text.lower() or "проблем" in text.lower(), f"Should warn about issues: {text}"

    def test_high_score_en(self):
        """High trust score → positive English message."""
        text = generate_explainer(85, 90, 80, 85, 80, 90, language="en")
        assert "high" in text.lower() or "credib" in text.lower(), f"English high trust: {text}"

    def test_low_score_en(self):
        """Low trust score → warning English message."""
        text = generate_explainer(30, 20, 30, 40, 30, 25, language="en")
        assert "low" in text.lower() or "question" in text.lower(), f"English low trust: {text}"

    def test_contradiction_override(self):
        """Contradiction flag → special warning message."""
        text = generate_explainer(30, 80, 80, 80, 80, 80, has_contradiction=True, language="uk")
        assert "osint" in text.lower() or "спростован" in text.lower() or "радикально" in text.lower()

    def test_reputation_override(self):
        """Low reputation → special warning message."""
        text = generate_explainer(40, 80, 80, 80, 80, 80, reputation_index=0.2, language="uk")
        assert "довір" in text.lower() or "зменшен" in text.lower()

    def test_returns_string(self):
        """Explainer should always return a non-empty string."""
        text = generate_explainer(50, 50, 50, 50, 50, 50)
        assert isinstance(text, str)
        assert len(text) > 10


# =============================================================================
# 9. INTEGRATION-LIKE TESTS (full pipeline scoring)
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

        trust = aggregate_trust_score(source, objectivity, headline, density, logic)
        assert trust > 70, f"High quality profile should score > 70, got {trust}"

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

        trust = aggregate_trust_score(
            source, objectivity, headline, density, logic,
            has_contradiction=True, reputation_index=0.1
        )
        assert trust < 40, f"Fake news profile should score < 40, got {trust}"

    def test_separation_between_quality_and_fake(self):
        """The gap between high-quality and fake news should be > 30 points."""
        # High quality
        src_good = calculate_source_score("bbc.com", [{"domain": "reuters.com"}], ["BBC"], "", 0.9)
        trust_good = aggregate_trust_score(
            src_good,
            calculate_objectivity_score(0, 0, 500),
            calculate_headline_score(0, 0, "Normal headline"),
            calculate_density_score("t", 20, 500),
            calculate_logic_score(0, False)
        )

        # Fake
        src_fake = calculate_source_score("fake.xyz", [], [], "", 0.1)
        trust_fake = aggregate_trust_score(
            src_fake,
            calculate_objectivity_score(10, 5, 200),
            calculate_headline_score(3, 4, "ШОКУЮЧЕ! ТЕРМІНОВО!"),
            calculate_density_score("t", 1, 200),
            calculate_logic_score(3, True),
            has_contradiction=True, reputation_index=0.1
        )

        gap = trust_good - trust_fake
        assert gap > 30, f"Gap between good and fake should be > 30, got {gap}"
