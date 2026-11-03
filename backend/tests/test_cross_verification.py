import time
from typing import Any

import pytest
from ddgs.exceptions import RatelimitException

from app.models.schemas import (
    CrossReferenceResult,
    DomainReputationResult,
    QueryGenerationResult,
    VerifiableClaim,
)
from app.services import cross_verification as cv

SNIPPETS = [
    {"body": "snippet one", "href": "https://first.example/a"},
    {"body": "snippet two", "href": "https://second.example/b"},
]


def _claim(paragraph_id: int = 1) -> VerifiableClaim:
    return VerifiableClaim(paragraph_id=paragraph_id, claim_text=f"claim {paragraph_id}")


def _stub_pipeline_steps(
    monkeypatch: pytest.MonkeyPatch,
    *,
    query: str = "search query",
    snippets: list[dict] | None = None,
    verdict: CrossReferenceResult | None = None,
) -> None:
    async def run_query_agent(_: str) -> str:
        return query

    async def search_duckduckgo(_: str) -> list[dict]:
        return SNIPPETS if snippets is None else snippets

    async def run_cross_agent(_: str, __: list[dict]) -> CrossReferenceResult | None:
        return verdict

    monkeypatch.setattr(cv, "run_query_agent", run_query_agent)
    monkeypatch.setattr(cv, "search_duckduckgo", search_duckduckgo)
    monkeypatch.setattr(cv, "run_cross_agent", run_cross_agent)


async def test_single_claim_without_query_is_unverified(monkeypatch: pytest.MonkeyPatch) -> None:
    _stub_pipeline_steps(monkeypatch, query="")
    assert await cv.process_single_claim(_claim()) == ("UNVERIFIED", None, None)


async def test_single_claim_without_snippets_is_unverified(monkeypatch: pytest.MonkeyPatch) -> None:
    _stub_pipeline_steps(monkeypatch, snippets=[])
    assert await cv.process_single_claim(_claim()) == ("UNVERIFIED", None, None)


async def test_single_claim_without_verdict_is_unverified(monkeypatch: pytest.MonkeyPatch) -> None:
    _stub_pipeline_steps(monkeypatch, verdict=None)
    assert await cv.process_single_claim(_claim()) == ("UNVERIFIED", None, None)


async def test_confirmed_claim_keeps_evidence_url(monkeypatch: pytest.MonkeyPatch) -> None:
    verdict = CrossReferenceResult(status="CONFIRMED", reason="matches")
    _stub_pipeline_steps(monkeypatch, verdict=verdict)
    assert await cv.process_single_claim(_claim()) == ("CONFIRMED", None, "https://first.example/a")


async def test_contradicted_claim_produces_risk_highlight(monkeypatch: pytest.MonkeyPatch) -> None:
    verdict = CrossReferenceResult(status="CONTRADICTED", reason="numbers differ")
    _stub_pipeline_steps(monkeypatch, verdict=verdict)
    status, highlight, url = await cv.process_single_claim(_claim(7))
    assert status == "CONTRADICTED"
    assert url == "https://first.example/a"
    assert highlight is not None
    assert (highlight.paragraph_id, highlight.severity, highlight.reason) == (7, "risk", "numbers differ")


async def test_unverified_verdict_drops_evidence_url(monkeypatch: pytest.MonkeyPatch) -> None:
    verdict = CrossReferenceResult(status="UNVERIFIED", reason="irrelevant")
    _stub_pipeline_steps(monkeypatch, verdict=verdict)
    assert await cv.process_single_claim(_claim()) == ("UNVERIFIED", None, None)


async def test_verify_claims_with_no_claims() -> None:
    assert await cv.verify_claims([]) == ([], 0, 0, [])


async def test_verify_claims_aggregates_statuses_and_limits_to_five(monkeypatch: pytest.MonkeyPatch) -> None:
    seen: list[int] = []
    statuses = {0: "CONFIRMED", 1: "CONTRADICTED", 2: "UNVERIFIED"}

    async def process_single_claim(claim: VerifiableClaim) -> tuple[str, Any, str | None]:
        seen.append(claim.paragraph_id)
        status = statuses.get(claim.paragraph_id, "UNVERIFIED")
        if status == "CONTRADICTED":
            highlight = cv.GeminiHighlight(
                paragraph_id=claim.paragraph_id, severity="risk", category="c", reason="r"
            )
            return status, highlight, "https://e.example"
        return status, None, None

    monkeypatch.setattr(cv, "process_single_claim", process_single_claim)
    highlights, n_conf, n_contra, details = await cv.verify_claims([_claim(i) for i in range(8)])

    assert sorted(seen) == [0, 1, 2, 3, 4]
    assert (n_conf, n_contra, len(highlights), len(details)) == (1, 1, 1, 5)
    assert details[1] == {
        "paragraph_id": 1,
        "claim_text": "claim 1",
        "status": "CONTRADICTED",
        "evidence_url": "https://e.example",
    }


class FakeDDGS:
    """Stands in for ddgs.DDGS."""

    results: list[dict] = []
    error: Exception | None = None
    timeouts: list[float] = []

    def __init__(self, timeout: float) -> None:
        FakeDDGS.timeouts.append(timeout)

    def text(self, query: str, max_results: int) -> list[dict]:
        assert max_results == cv.MAX_SEARCH_RESULTS
        if FakeDDGS.error:
            raise FakeDDGS.error
        return FakeDDGS.results


def test_duckduckgo_results_are_normalised(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(cv, "DDGS", FakeDDGS)
    FakeDDGS.error = None
    FakeDDGS.results = [{"body": "b", "href": "h", "title": "ignored"}, {"title": "no body"}, {"body": "only body"}]
    assert cv._do_duckduckgo_search("q") == [
        {"body": "b", "href": "h"},
        {"body": "only body", "href": ""},
    ]
    assert FakeDDGS.timeouts[-1] == cv.DDGS_HTTP_TIMEOUT_S


@pytest.mark.parametrize("error", [RatelimitException("slow down"), RuntimeError("boom")])
def test_duckduckgo_errors_yield_no_results(monkeypatch: pytest.MonkeyPatch, error: Exception) -> None:
    monkeypatch.setattr(cv, "DDGS", FakeDDGS)
    FakeDDGS.error = error
    assert cv._do_duckduckgo_search("q") == []


async def test_search_skips_empty_query() -> None:
    assert await cv.search_duckduckgo("") == []


async def test_search_times_out_gracefully(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(cv, "SEARCH_TIMEOUT_S", 0.01)
    monkeypatch.setattr(cv, "_do_duckduckgo_search", lambda _: time.sleep(0.2) or SNIPPETS)
    assert await cv.search_duckduckgo("q") == []


async def test_search_returns_results(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(cv, "_do_duckduckgo_search", lambda _: SNIPPETS)
    assert await cv.search_duckduckgo("q") == SNIPPETS


class AgentRecorder:
    """Replaces run_agent and records the prompts it received."""

    def __init__(self, result: Any) -> None:
        self.result = result
        self.prompts: list[str] = []
        self.kwargs: list[dict] = []

    async def __call__(self, prompt: str, system: str, schema: type, **kwargs: Any) -> Any:
        self.prompts.append(prompt)
        self.kwargs.append(kwargs)
        return self.result


async def test_query_agent_returns_query_or_empty_string(monkeypatch: pytest.MonkeyPatch) -> None:
    recorder = AgentRecorder(QueryGenerationResult(english_query="kyiv rada law"))
    monkeypatch.setattr(cv, "run_agent", recorder)
    assert await cv.run_query_agent("some claim") == "kyiv rada law"
    assert recorder.prompts == ["ORIGINAL CLAIM: some claim"]
    assert recorder.kwargs[0]["max_retries"] == cv.AGENT_MAX_RETRIES

    monkeypatch.setattr(cv, "run_agent", AgentRecorder(None))
    assert await cv.run_query_agent("some claim") == ""


async def test_cross_agent_needs_ai_and_snippets(monkeypatch: pytest.MonkeyPatch) -> None:
    recorder = AgentRecorder(CrossReferenceResult(status="CONFIRMED", reason="r"))
    monkeypatch.setattr(cv, "run_agent", recorder)
    assert await cv.run_cross_agent("claim", SNIPPETS) is None  # AI is disabled by conftest
    monkeypatch.setattr(cv, "ai_available", lambda: True)
    assert await cv.run_cross_agent("claim", []) is None
    assert recorder.prompts == []

    result = await cv.run_cross_agent("claim", SNIPPETS)
    assert result is not None
    assert recorder.prompts == ["ORIGINAL CLAIM: claim\n\nSEARCH RESULTS (SNIPPETS):\n- snippet one\n- snippet two"]


async def test_reputation_empty_domain() -> None:
    result = await cv.check_domain_reputation("")
    assert result.trust_index == 0.5


@pytest.mark.parametrize("domain", ["bbc.com", "www.bbc.com", "m.bbc.com"])
async def test_reputation_uses_local_table_including_subdomains(domain: str) -> None:
    result = await cv.check_domain_reputation(domain)
    assert result.trust_index == cv.find_local_reputation("bbc.com")["trust_index"]  # type: ignore[index]


async def test_reputation_without_ai_is_neutral() -> None:
    result = await cv.check_domain_reputation("unknown-site.example")
    assert result.trust_index == 0.5
    assert "AI offline" in result.background_summary


async def test_reputation_without_search_results_is_neutral(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(cv, "ai_available", lambda: True)

    async def no_results(_: str) -> list[dict]:
        return []

    monkeypatch.setattr(cv, "search_duckduckgo", no_results)
    result = await cv.check_domain_reputation("unknown-site.example")
    assert result.trust_index == 0.5


async def test_reputation_prompt_contains_snippet_text_only(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(cv, "ai_available", lambda: True)
    recorder = AgentRecorder(DomainReputationResult(trust_index=0.2, background_summary="doubtful"))
    monkeypatch.setattr(cv, "run_agent", recorder)

    async def results(_: str) -> list[dict]:
        return SNIPPETS

    monkeypatch.setattr(cv, "search_duckduckgo", results)
    result = await cv.check_domain_reputation("unknown-site.example")

    assert result.trust_index == 0.2
    assert recorder.prompts == [
        "TARGET DOMAIN: unknown-site.example\n\nREPUTATION SNIPPETS:\n- snippet one\n- snippet two"
    ]


async def test_reputation_agent_failure_falls_back_to_neutral(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(cv, "ai_available", lambda: True)
    monkeypatch.setattr(cv, "run_agent", AgentRecorder(None))

    async def results(_: str) -> list[dict]:
        return SNIPPETS

    monkeypatch.setattr(cv, "search_duckduckgo", results)
    result = await cv.check_domain_reputation("unknown-site.example")
    assert result.trust_index == 0.5
