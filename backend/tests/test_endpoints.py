from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from app.api import endpoints
from app.main import create_app
from app.models.schemas import AnalysisRequest, AnalysisResponse, CriteriaScore, ScoringInputs

PAYLOAD = {
    "url": "https://www.example.com/news/1",
    "title": "A headline",
    "html_content": "<p>x</p>",
    "paragraphs": [{"id": 1, "text": "A paragraph that is comfortably longer than fifty characters."}],
    "language": "en",
}


def _response(*, degraded: bool = False) -> AnalysisResponse:
    return AnalysisResponse(
        trust_score=50 if degraded else 72,
        criteria=CriteriaScore(credibility=50, transparency=50, objectivity=50),
        scoring_inputs=None if degraded else ScoringInputs(),
    )


class PipelineStub:
    """Replaces process_article and records how often it ran."""

    def __init__(self) -> None:
        self.calls = 0
        self.degraded = False

    async def __call__(self, request: AnalysisRequest) -> AnalysisResponse:
        self.calls += 1
        return _response(degraded=self.degraded)


@pytest.fixture
def pipeline(monkeypatch: pytest.MonkeyPatch) -> PipelineStub:
    stub = PipelineStub()
    monkeypatch.setattr(endpoints, "process_article", stub)
    return stub


@pytest.fixture
def client() -> Iterator[TestClient]:
    with TestClient(create_app()) as test_client:
        yield test_client


def test_health(client: TestClient) -> None:
    body = client.get("/health").json()
    assert body["status"] == "ok"
    assert body["version"] == "2.0.0"


def test_analyze_returns_pipeline_result(client: TestClient, pipeline: PipelineStub) -> None:
    response = client.post("/analyze", json=PAYLOAD)
    assert response.status_code == 200
    assert response.json()["trust_score"] == 72
    assert pipeline.calls == 1


@pytest.mark.parametrize(
    ("change", "message"),
    [
        ({"paragraphs": []}, "no paragraphs"),
        ({"paragraphs": [{"id": 1, "text": "too short"}]}, "minimum 50 characters"),
        ({"title": "   "}, "Headline is required"),
        ({"paragraphs": [{"id": i, "text": "x" * 100_000} for i in (1, 2)]}, "too long"),
    ],
)
def test_invalid_input_is_rejected_with_400(
    client: TestClient, pipeline: PipelineStub, change: dict, message: str
) -> None:
    response = client.post("/analyze", json={**PAYLOAD, **change})
    assert response.status_code == 400
    assert message in response.json()["detail"]
    assert pipeline.calls == 0


def test_oversized_fields_fail_validation(client: TestClient, pipeline: PipelineStub) -> None:
    too_many = [{"id": i, "text": "x" * 60} for i in range(2001)]
    assert client.post("/analyze", json={**PAYLOAD, "paragraphs": too_many}).status_code == 422
    assert client.post("/analyze", json={**PAYLOAD, "url": "u" * 2049}).status_code == 422
    assert pipeline.calls == 0


def test_identical_request_is_served_from_cache(client: TestClient, pipeline: PipelineStub) -> None:
    client.post("/analyze", json=PAYLOAD)
    client.post("/analyze", json=PAYLOAD)
    assert pipeline.calls == 1


def test_different_text_with_same_title_is_not_a_cache_hit(client: TestClient, pipeline: PipelineStub) -> None:
    other = {**PAYLOAD, "paragraphs": [{"id": 1, "text": "Completely different article body, also long enough to pass."}]}
    client.post("/analyze", json=PAYLOAD)
    client.post("/analyze", json=other)
    assert pipeline.calls == 2


def test_degraded_results_are_not_cached(client: TestClient, pipeline: PipelineStub) -> None:
    pipeline.degraded = True
    client.post("/analyze", json=PAYLOAD)
    pipeline.degraded = False
    client.post("/analyze", json=PAYLOAD)
    client.post("/analyze", json=PAYLOAD)
    assert pipeline.calls == 2  # the degraded one was retried, the healthy one was cached


@pytest.mark.parametrize(
    "origin",
    ["chrome-extension://abcdefghijklmnopabcdefghijklmnop", "http://localhost:3000", "http://127.0.0.1:8000"],
)
def test_cors_allows_extension_and_localhost(client: TestClient, origin: str) -> None:
    response = client.get("/health", headers={"Origin": origin})
    assert response.headers["access-control-allow-origin"] == origin
    assert "access-control-allow-credentials" not in response.headers


@pytest.mark.parametrize("origin", ["https://evil.example", "http://localhost.evil.example", "null"])
def test_cors_rejects_other_origins(client: TestClient, origin: str) -> None:
    response = client.get("/health", headers={"Origin": origin})
    assert "access-control-allow-origin" not in response.headers


def test_cors_preflight_for_extension(client: TestClient) -> None:
    response = client.options(
        "/analyze",
        headers={
            "Origin": "chrome-extension://abcdefghijklmnopabcdefghijklmnop",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert response.status_code == 200
    assert "POST" in response.headers["access-control-allow-methods"]


def test_cors_origin_regex_can_be_overridden(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("VERITAS_CORS_ORIGIN_REGEX", r"^https://app\.example$")
    with TestClient(create_app()) as test_client:
        allowed = test_client.get("/health", headers={"Origin": "https://app.example"})
        denied = test_client.get("/health", headers={"Origin": "http://localhost:3000"})
    assert allowed.headers["access-control-allow-origin"] == "https://app.example"
    assert "access-control-allow-origin" not in denied.headers
