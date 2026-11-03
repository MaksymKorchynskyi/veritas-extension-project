import pytest

from app.services.scoring import (
    aggregate_trust_score,
    calculate_credibility,
    calculate_objectivity,
    calculate_transparency,
)


def test_credibility_without_evidence_equals_domain_trust() -> None:
    assert calculate_credibility(0, 0, domain_trust=0.5) == pytest.approx(50.0)
    assert calculate_credibility(0, 0, domain_trust=0.9) == pytest.approx(90.0)


def test_credibility_quality_article_and_propaganda_match_documented_values() -> None:
    quality = calculate_credibility(0, 0, 0.5, citations_count=5, emotional_words_count=0)
    propaganda = calculate_credibility(0, 0, 0.5, citations_count=0, emotional_words_count=6)
    assert quality == pytest.approx(66.67, abs=0.01)
    assert propaganda == pytest.approx(26.32, abs=0.01)


def test_credibility_evidence_weights() -> None:
    # r = 1 + 0.2 * 5 = 2, s = 1 + 0.3 * 2 + 0.4 * 3 = 2.8, a = 0.5
    score = calculate_credibility(1, 1, 0.5, citations_count=5, emotional_words_count=2, n_unverified=3)
    assert score == pytest.approx((2 + 1) / (2 + 2.8 + 2) * 100)


def test_credibility_unverified_claims_lower_the_score() -> None:
    assert calculate_credibility(2, 0, 0.5, n_unverified=3) < calculate_credibility(2, 0, 0.5)


def test_transparency_prior_and_citations() -> None:
    assert calculate_transparency(0) == pytest.approx(30.0)
    assert calculate_transparency(3) == pytest.approx((3 + 0.6) / 5 * 100)


def test_objectivity_uses_minimum_window_of_eight_observations() -> None:
    assert calculate_objectivity(0, 100) == pytest.approx((8 + 1) / (8 + 2) * 100)
    assert calculate_objectivity(4, 100) == pytest.approx((4 + 1) / (8 + 2) * 100)


def test_objectivity_window_scales_with_length_and_caps_negative_evidence() -> None:
    # 2000 words -> K = 40; 100 manipulative phrases are capped at K.
    assert calculate_objectivity(100, 2000) == pytest.approx(1 / 42 * 100)


@pytest.mark.parametrize("value", [0.0, 25.0, 50.0, 100.0])
def test_scores_are_within_bounds(value: float) -> None:
    for score in (
        calculate_credibility(int(value), int(value), value / 100, int(value), int(value), int(value)),
        calculate_transparency(int(value)),
        calculate_objectivity(int(value), int(value) * 10),
        aggregate_trust_score(value, value, value),
    ):
        assert 0.0 <= score <= 100.0


def test_aggregate_uses_documented_weights_without_discount() -> None:
    assert aggregate_trust_score(80, 60, 40) == pytest.approx(0.5 * 80 + 0.3 * 60 + 0.2 * 40)


def test_aggregate_applies_discount_below_fifty_credibility() -> None:
    raw = 0.5 * 40 + 0.3 * 100 + 0.2 * 100
    assert aggregate_trust_score(40, 100, 100) == pytest.approx(round(raw * (0.5 + 0.4), 1))


def test_aggregate_discount_starts_exactly_below_fifty() -> None:
    assert aggregate_trust_score(50, 50, 50) == 50.0
    assert aggregate_trust_score(49.9, 50, 50) < 50.0
