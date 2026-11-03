import pytest

from app.models.schemas import AnalysisResponse, CriteriaScore
from app.services.cache import AnalysisCache


def _response(score: float = 70.0) -> AnalysisResponse:
    return AnalysisResponse(
        trust_score=score,
        criteria=CriteriaScore(credibility=score, transparency=score, objectivity=score),
    )


def test_key_depends_on_every_part() -> None:
    base = AnalysisCache.make_key("a.com", "title", "en", "text")
    assert base == AnalysisCache.make_key("a.com", "title", "en", "text")
    for variant in (
        ("b.com", "title", "en", "text"),
        ("a.com", "other", "en", "text"),
        ("a.com", "title", "uk", "text"),
        ("a.com", "title", "en", "other text"),
    ):
        assert AnalysisCache.make_key(*variant) != base


def test_key_parts_cannot_collide_by_concatenation() -> None:
    assert AnalysisCache.make_key("ab", "c", "en", "t") != AnalysisCache.make_key(
        "a", "bc", "en", "t"
    )


def test_get_returns_stored_response_and_none_for_missing() -> None:
    cache = AnalysisCache()
    response = _response()
    cache.set("k", response)
    assert cache.get("k") is response
    assert cache.get("missing") is None


def test_entries_expire_after_ttl(monkeypatch: pytest.MonkeyPatch) -> None:
    now = [1000.0]
    monkeypatch.setattr("app.services.cache.time.monotonic", lambda: now[0])
    cache = AnalysisCache(ttl_s=60)
    cache.set("k", _response())
    now[0] += 59
    assert cache.get("k") is not None
    now[0] += 2
    assert cache.get("k") is None
    assert len(cache) == 0


def test_least_recently_used_entry_is_evicted() -> None:
    cache = AnalysisCache(max_entries=2)
    cache.set("a", _response(1))
    cache.set("b", _response(2))
    assert cache.get("a") is not None  # "a" becomes most recently used
    cache.set("c", _response(3))
    assert cache.get("b") is None
    assert cache.get("a") is not None
    assert cache.get("c") is not None
    assert len(cache) == 2
