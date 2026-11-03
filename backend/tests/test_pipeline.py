from typing import Any

import pytest
from pydantic import BaseModel

from app.models.schemas import (
    AnalysisRequest,
    DomainReputationResult,
    FactExtraction,
    GeminiHighlight,
    JudgeEvaluation,
    VerifiableClaim,
)
from app.services import pipeline
from app.services.cross_verification import ClaimDetail
from app.services.scoring import (
    aggregate_trust_score,
    calculate_credibility,
    calculate_objectivity,
    calculate_transparency,
)

DETAILS: list[ClaimDetail] = [
    {
        "paragraph_id": 1,
        "claim_text": "claim 1",
        "status": "CONFIRMED",
        "evidence_url": "https://e.org/1",
    },
    {
        "paragraph_id": 2,
        "claim_text": "claim 2",
        "status": "CONTRADICTED",
        "evidence_url": "https://e.org/2",
    },
    {"paragraph_id": 3, "claim_text": "claim 3", "status": "UNVERIFIED", "evidence_url": None},
]
CV_HIGHLIGHT = GeminiHighlight(paragraph_id=2, severity="risk", category="cat", reason="reason")
JUDGE = JudgeEvaluation(
    citations_count=4,
    emotional_words_count=2,
    found_citations=["a", "b", "c", "d"],
    found_emotional_words=["x", "y"],
    highlights=[GeminiHighlight(paragraph_id=3, severity="warning", category="w", reason="r")],
    explainer="judge explainer",
)


class Summary(BaseModel):
    summary: str


class Stubs:
    """Collects what the pipeline sent to its collaborators."""

    def __init__(self) -> None:
        self.judge_inputs: dict[str, Any] = {}
        self.summary_prompt = ""


def install(
    monkeypatch: pytest.MonkeyPatch,
    *,
    facts: FactExtraction | Exception | None = None,
    reputation: DomainReputationResult | Exception | None = None,
    verification: tuple[list[GeminiHighlight], int, int, list[ClaimDetail]] | None = None,
    judge: JudgeEvaluation | None = JUDGE,
    summary: Summary | Exception | None = None,
) -> Stubs:
    stubs = Stubs()
    claims = [VerifiableClaim(paragraph_id=i, claim_text=f"claim {i}") for i in (1, 2, 3)]
    facts = FactExtraction(verifiable_claims=claims) if facts is None else facts
    reputation = (
        DomainReputationResult(trust_index=0.9, background_summary="good")
        if reputation is None
        else reputation
    )
    verification = ([CV_HIGHLIGHT], 1, 1, DETAILS) if verification is None else verification

    async def extract_factual_claims(_: str) -> FactExtraction:
        if isinstance(facts, Exception):
            raise facts
        return facts

    async def check_domain_reputation(_: str) -> DomainReputationResult:
        if isinstance(reputation, Exception):
            raise reputation
        return reputation

    async def verify_claims(
        _: list[VerifiableClaim],
    ) -> tuple[list[GeminiHighlight], int, int, list[ClaimDetail]]:
        return verification

    async def extract_article_metrics(
        article_text: str, cv_results: dict[str, list[dict[str, str]]], language: str
    ) -> JudgeEvaluation | None:
        stubs.judge_inputs = {"text": article_text, "cv_results": cv_results, "language": language}
        return judge

    async def run_agent(prompt: str, *_: Any, **__: Any) -> Summary | None:
        stubs.summary_prompt = prompt
        if isinstance(summary, Exception):
            raise summary
        return summary

    monkeypatch.setattr(pipeline, "extract_factual_claims", extract_factual_claims)
    monkeypatch.setattr(pipeline, "check_domain_reputation", check_domain_reputation)
    monkeypatch.setattr(pipeline, "verify_claims", verify_claims)
    monkeypatch.setattr(pipeline, "extract_article_metrics", extract_article_metrics)
    monkeypatch.setattr(pipeline, "run_agent", run_agent)
    return stubs


async def test_full_flow_scores_and_response(
    monkeypatch: pytest.MonkeyPatch, article_request: AnalysisRequest
) -> None:
    stubs = install(monkeypatch, summary=Summary(summary="final summary"))
    result = await pipeline.process_article(article_request)

    credibility = calculate_credibility(1, 1, 0.9, 4, 2, 1)
    transparency = calculate_transparency(4)
    objectivity = calculate_objectivity(2, 20)
    assert result.criteria.credibility == round(credibility, 1)
    assert result.criteria.transparency == round(transparency, 1)
    assert result.criteria.objectivity == round(objectivity, 1)
    assert result.trust_score == aggregate_trust_score(credibility, transparency, objectivity)
    assert result.explainer == "final summary"

    assert [(h.paragraph_id, h.severity) for h in result.highlights] == [
        (2, "risk"),
        (3, "warning"),
    ]
    assert [(c.paragraph_id, c.status, c.evidence_url) for c in result.extracted_claims] == [
        (1, "CONFIRMED", "https://e.org/1"),
        (2, "CONTRADICTED", "https://e.org/2"),
        (3, "UNVERIFIED", None),
    ]

    inputs = result.scoring_inputs
    assert inputs is not None
    assert (inputs.n_confirmed, inputs.n_contradicted, inputs.n_unverified) == (1, 1, 1)
    assert (inputs.domain_trust, inputs.citations_count, inputs.emotional_words_count) == (
        0.9,
        4,
        2,
    )
    assert inputs.found_citations == ["a", "b", "c", "d"]

    assert stubs.judge_inputs["language"] == "en"
    assert stubs.judge_inputs["cv_results"] == {
        "verified_claims": [{"snippet": "Paragraph 2 claim contradicted: reason"}]
    }
    assert "[ID: 1] First paragraph" in stubs.judge_inputs["text"]
    assert "You must write your response ENTIRELY in English." in stubs.summary_prompt


async def test_word_count_ignores_paragraph_id_markers(
    monkeypatch: pytest.MonkeyPatch, article_request: AnalysisRequest
) -> None:
    install(monkeypatch, summary=Summary(summary="s"))
    result = await pipeline.process_article(article_request)
    assert result.scoring_inputs is not None
    assert result.scoring_inputs.total_words == 7 + 4 + 9


async def test_unverified_count_is_based_on_claims_actually_checked(
    monkeypatch: pytest.MonkeyPatch, article_request: AnalysisRequest
) -> None:
    many_claims = FactExtraction(
        verifiable_claims=[VerifiableClaim(paragraph_id=1, claim_text=f"c{i}") for i in range(7)]
    )
    checked = DETAILS[:2]  # verify_claims only handles the first few claims
    install(
        monkeypatch,
        facts=many_claims,
        verification=([CV_HIGHLIGHT], 1, 1, checked),
        summary=Summary(summary="s"),
    )
    result = await pipeline.process_article(article_request)
    assert result.scoring_inputs is not None
    assert result.scoring_inputs.n_unverified == 0


async def test_failed_claim_extraction_and_reputation_use_neutral_defaults(
    monkeypatch: pytest.MonkeyPatch, article_request: AnalysisRequest
) -> None:
    install(
        monkeypatch,
        facts=RuntimeError("boom"),
        reputation=RuntimeError("boom"),
        summary=Summary(summary="s"),
    )
    result = await pipeline.process_article(article_request)
    assert result.extracted_claims == []
    assert result.scoring_inputs is not None
    assert result.scoring_inputs.domain_trust == 0.5
    assert (result.scoring_inputs.n_confirmed, result.scoring_inputs.n_unverified) == (0, 0)


@pytest.mark.parametrize("summary", [None, RuntimeError("down")])
async def test_summary_failure_falls_back_to_metrics_explainer(
    monkeypatch: pytest.MonkeyPatch,
    article_request: AnalysisRequest,
    summary: Summary | Exception | None,
) -> None:
    install(monkeypatch, summary=summary)
    result = await pipeline.process_article(article_request)
    assert result.explainer == "judge explainer"


async def test_metrics_agent_failure_returns_neutral_degraded_response(
    monkeypatch: pytest.MonkeyPatch, article_request: AnalysisRequest
) -> None:
    install(monkeypatch, judge=None)
    result = await pipeline.process_article(article_request)
    assert result.trust_score == 50
    assert (
        result.criteria.credibility,
        result.criteria.transparency,
        result.criteria.objectivity,
    ) == (50, 50, 50)
    assert result.scoring_inputs is None
    assert result.highlights == []
