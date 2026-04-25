"""
Unit Tests for the Hybrid AI Pipeline.
Mocks HuggingFace ML models and Gemini Agents to test the orchestration flow in process_article.
"""

import pytest
from unittest.mock import patch, AsyncMock
from app.models.schemas import (
    AnalysisRequest, 
    ParagraphModel,
    AnalysisResponse,
    FinalVerdictSchema,
    CriteriaScore
)
from app.services.pipeline import process_article

@pytest.fixture
def sample_request():
    return AnalysisRequest(
        url="https://example.com/news/123",
        title="Test Headline",
        html_content="<html><body><p>Test</p></body></html>",
        paragraphs=[
            ParagraphModel(id=1, text="First paragraph about something important."),
            ParagraphModel(id=2, text="Second paragraph with more details.")
        ],
        language="uk"
    )

@pytest.fixture
def mock_ml_metrics():
    return {
        "fake_news_prob": 0.15,
        "sentiment": "NEUTRAL",
        "clickbait_prob": 0.05
    }

@pytest.fixture
def mock_verdict():
    return FinalVerdictSchema(
        trust_score=85.0,
        criteria=CriteriaScore(
            source_verification=80,
            objectivity=90,
            headline_relevance=85,
            factual_density=80,
            logical_consistency=90
        ),
        explainer="Ця стаття є високоякісною та надійною.",
        raw_thoughts="Everything looks good."
    )

@pytest.mark.asyncio
@patch("app.services.pipeline.translate_to_english_async", new_callable=AsyncMock)
@patch("app.services.pipeline.analyze_text_ml", new_callable=AsyncMock)
@patch("app.services.pipeline.run_bias_agent", new_callable=AsyncMock)
@patch("app.services.pipeline.run_logic_agent", new_callable=AsyncMock)
@patch("app.services.pipeline.run_fact_agent", new_callable=AsyncMock)
@patch("app.services.pipeline.check_domain_reputation", new_callable=AsyncMock)
@patch("app.services.pipeline.verify_claims_osint", new_callable=AsyncMock)
@patch("app.services.pipeline.run_judge_agent", new_callable=AsyncMock)
async def test_process_article(
    mock_run_judge_agent,
    mock_verify_claims_osint,
    mock_check_domain_reputation,
    mock_run_fact_agent,
    mock_run_logic_agent,
    mock_run_bias_agent,
    mock_analyze_text_ml,
    mock_translate,
    sample_request,
    mock_ml_metrics,
    mock_verdict
):
    # Setup Mocks
    mock_translate.return_value = "English text"
    mock_analyze_text_ml.return_value = mock_ml_metrics
    
    mock_run_bias_agent.return_value = {"highlights": [{"paragraph_id": 1, "severity": "warning", "category": "Bias", "reason": "Test"}]}
    mock_run_logic_agent.return_value = {"highlights": []}
    mock_run_fact_agent.return_value = {"verifiable_claims": [{"paragraph_id": 2, "claim_text": "Fact"}]}
    
    class MockReputation:
        def model_dump(self):
            return {"trust_index": 0.8, "background_summary": "Good"}
    mock_check_domain_reputation.return_value = MockReputation()
    
    class MockOsintHighlight:
        def model_dump(self):
            return {"paragraph_id": 2, "severity": "risk", "category": "OSINT", "reason": "Fake"}
        @property
        def paragraph_id(self): return 2
        @property
        def severity(self): return "risk"
        @property
        def category(self): return "OSINT"
        @property
        def reason(self): return "Fake"
        
    mock_verify_claims_osint.return_value = [MockOsintHighlight()]
    
    mock_run_judge_agent.return_value = mock_verdict

    # Execute
    response = await process_article(sample_request)

    # Assertions
    assert isinstance(response, AnalysisResponse)
    assert response.trust_score == 85.0
    assert response.explainer == "Ця стаття є високоякісною та надійною."
    assert response.ml_metrics == mock_ml_metrics
    
    # Check that highlights from both agents and OSINT are collected
    assert len(response.highlights) == 2
    
    # Check that Judge agent was called
    mock_run_judge_agent.assert_called_once()
    judge_kwargs = mock_run_judge_agent.call_args.kwargs
    assert judge_kwargs["ml_metrics"] == mock_ml_metrics
    assert len(judge_kwargs["agent_highlights"]) == 2 # 1 bias + 1 osint
    assert judge_kwargs["language"] == "uk"
