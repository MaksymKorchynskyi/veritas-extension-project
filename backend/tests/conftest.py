"""Shared fixtures. Every test runs with the Gemini client disabled, so nothing hits the network."""

from collections.abc import Iterator

import pytest

from app.models.schemas import AnalysisRequest, ParagraphModel
from app.services.llm import base_agent


@pytest.fixture(autouse=True)
def _no_ai(monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    """Disable the real Gemini client regardless of the developer's .env file."""
    monkeypatch.setattr(base_agent, "client", None)
    yield


@pytest.fixture
def article_request() -> AnalysisRequest:
    """A small, valid analysis request."""
    return AnalysisRequest(
        url="https://www.example-news.com/a/1",
        title="Headline",
        html_content="<p>x</p>",
        language="en",
        paragraphs=[
            ParagraphModel(id=1, text="First paragraph has seven words here ok."),
            ParagraphModel(id=2, text="Second one is shorter."),
            ParagraphModel(id=3, text="Third paragraph with a few more words to count."),
        ],
    )
