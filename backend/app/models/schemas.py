"""
VERITAS Pydantic Models
========================
API Request/Response schemas & Gemini Structured Output models.
"""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


# ─────────────────────────────────────────────────────────────
# GEMINI STRUCTURED OUTPUT MODELS (Agent responses)
# ─────────────────────────────────────────────────────────────

class VerifiableClaim(BaseModel):
    """A factual claim extracted by FactExtractionAgent."""
    paragraph_id: int = Field(..., description="The ID of the paragraph where the claim is located")
    claim_text: str = Field(..., description="The exact factual claim (dates, statistics, quotes, actions)")


class FactExtraction(BaseModel):
    """Output for FactualClaimExtractor."""
    verifiable_claims: List[VerifiableClaim] = Field(
        default_factory=list,
        description="Max 5 hard, concrete claims extracted from the article",
    )
    raw_thoughts: Optional[str] = Field(default=None, description="Chain-of-thought reasoning")


class GeminiHighlight(BaseModel):
    """A problematic text segment identified by an AI agent."""
    paragraph_id: int = Field(..., description="The exact paragraph ID (from [ID: X] markers)")
    severity: Literal["warning", "risk"] = Field(
        ...,
        description="warning=bias/unverified, risk=manipulation/fake",
    )
    category: str = Field(..., description="Short label in article's language (2-4 words)")
    reason: str = Field(..., description="1-2 sentence explanation in article's language")


class JudgeEvaluation(BaseModel):
    """Output for ArticleMetricsExtractor — feeds into BRS scoring formulas."""
    citations_count: int = Field(..., ge=0, description="Number of verifiable named citations")
    emotional_words_count: int = Field(..., ge=0, description="Number of manipulative/emotional phrases")
    found_citations: List[str] = Field(
        default_factory=list,
        description="Exact text snippets of each identified citation (e.g. 'Minister X stated...')",
    )
    found_emotional_words: List[str] = Field(
        default_factory=list,
        description="Exact manipulative/emotional words or phrases found",
    )
    highlights: List[GeminiHighlight] = Field(
        default_factory=list,
        description="0-3 problematic text segments",
    )
    explainer: str = Field(..., description="2-4 sentence editorial summary in target language")
    raw_thoughts: Optional[str] = Field(default=None, description="Chain-of-thought reasoning")


class QueryGenerationResult(BaseModel):
    """Output for SearchQueryGenerator."""
    english_query: str = Field(..., description="Short search query (3-7 keywords in the claim's language)")


class CrossReferenceResult(BaseModel):
    """Output for OSINT CrossReferenceAgent."""
    status: Literal["CONFIRMED", "CONTRADICTED", "UNVERIFIED"] = Field(
        ..., description="Verdict based on search snippets vs original claim"
    )
    reason: str = Field(..., description="Short explanation in the language of the original article")


class DomainReputationResult(BaseModel):
    """Output for OSINT ReputationAgent."""
    trust_index: float = Field(..., description="0.0 to 1.0 trust index for the domain")
    background_summary: str = Field(..., description="Short description of the domain's reputation")


# ─────────────────────────────────────────────────────────────
# API MODELS (Client ↔ Server)
# ─────────────────────────────────────────────────────────────

class ParagraphModel(BaseModel):
    """Single paragraph extracted client-side by Readability.js."""
    id: int = Field(..., description="Unique index of the paragraph")
    text: str = Field(..., description="Text content of the paragraph")


class AnalysisRequest(BaseModel):
    """Request model — article data parsed client-side."""
    url: str = Field(..., description="URL of the article")
    title: str = Field(..., description="Article title from Readability.js")
    html_content: str = Field(..., description="Clean article HTML (for link extraction)")
    paragraphs: List[ParagraphModel] = Field(..., description="Indexed paragraphs")
    language: str = Field(default="uk", description="Target response language (uk/en)")


class CriteriaScore(BaseModel):
    """Individual BRS-derived scores for each analysis criterion."""
    credibility: float = Field(..., ge=0, le=100, description="OSINT-based credibility (BRS)")
    transparency: float = Field(..., ge=0, le=100, description="Citation-based transparency (BRS)")
    objectivity: float = Field(..., ge=0, le=100, description="Emotional analysis objectivity (BRS)")


class ScoringInputs(BaseModel):
    """Raw numerical inputs used in the BRS scoring formulas.
    Returned to the frontend for formula visualization."""
    n_confirmed: int = Field(default=0, description="OSINT-confirmed claims count")
    n_contradicted: int = Field(default=0, description="OSINT-contradicted claims count")
    n_unverified: int = Field(default=0, description="OSINT-unverified claims count")
    domain_trust: float = Field(default=0.5, description="Domain reputation base rate (0.0-1.0)")
    citations_count: int = Field(default=0, description="Named citations found by ArticleMetricsExtractor")
    emotional_words_count: int = Field(default=0, description="Manipulative phrases found by ArticleMetricsExtractor")
    total_words: int = Field(default=0, description="Total word count of article text")
    found_citations: List[str] = Field(default_factory=list, description="Exact citation text snippets")
    found_emotional_words: List[str] = Field(default_factory=list, description="Exact emotional/manipulative phrases")


class ExtractedClaimResult(BaseModel):
    """A single claim extracted and verified through the pipeline."""
    paragraph_id: int = Field(..., description="Source paragraph ID")
    claim_text: str = Field(..., description="The extracted factual claim")
    status: str = Field(default="UNVERIFIED", description="CONFIRMED / CONTRADICTED / UNVERIFIED")


class Highlight(BaseModel):
    """API-level highlight for marking issues on the webpage."""
    paragraph_id: int = Field(..., description="ID of the paragraph to highlight")
    severity: Literal["warning", "risk"] = Field(..., description="Severity level")
    category: str = Field(default="", description="Short label")
    reason: str = Field(default="", description="Detailed explanation")


class AnalysisResponse(BaseModel):
    """Final API response with trust score and breakdown."""
    trust_score: float = Field(..., ge=0, le=100, description="Final BRS-weighted trust score")
    criteria: CriteriaScore = Field(..., description="Individual criterion scores")
    explainer: str = Field(default="", description="Human-readable analysis summary")
    highlights: List[Highlight] = Field(default_factory=list, description="Problematic text segments")
    scoring_inputs: Optional[ScoringInputs] = Field(default=None, description="Raw inputs used in BRS formulas")
    extracted_claims: List[ExtractedClaimResult] = Field(default_factory=list, description="Claims extracted and verified")
    ml_metrics: dict = Field(default_factory=dict, description="Reserved for future ML metrics")
