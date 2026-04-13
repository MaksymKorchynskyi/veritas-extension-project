"""
VERITAS Pydantic Models
API Request/Response schemas & Gemini Structured Output Models
"""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field

# ---------------------------------------------------------
# GEMINI STRUCTURED OUTPUT MODELS (MICRO-AGENTS)
# ---------------------------------------------------------

class QueryGenerationResult(BaseModel):
    """Output for QueryGeneratorAgent"""
    english_query: str = Field(..., description="Short exact English query for DuckDuckGo (e.g., 'Volodymyr Zelensky announces new tax law 2024')")

class CrossReferenceResult(BaseModel):
    """Output for CrossReferenceAgent"""
    status: Literal["CONFIRMED", "CONTRADICTED", "UNVERIFIED"] = Field(..., description="Verdict based stringently on the retrieved search snippets vs the original claim.")
    reason: str = Field(..., description="Short explanation for the verdict, written in the language of the original target article.")

class DomainReputationResult(BaseModel):
    """Output for ReputationAgent"""
    trust_index: float = Field(..., description="0.0 to 1.0 trust index for the domain publisher")
    background_summary: str = Field(..., description="Short explanation of the domain's reputation")

class GeminiHighlight(BaseModel):
    """A specific highlight identified by Gemini AI"""
    paragraph_id: int = Field(..., description="The ID of the exact paragraph being highlighted (e.g. 5)")
    severity: Literal["warning", "risk"] = Field(
        ..., 
        description="warning=Yellow (bias, unverified claims, logical fallacies), risk=Red (toxic language, blatant manipulation, fake news)"
    )
    category: str = Field(..., description="Short problem type label (2-4 words, in article's language) e.g., 'Неперевірене твердження'")
    reason: str = Field(..., description="Explanation for the highlight (in article's language). A detailed 1-2 sentence explanation of WHY this specific text was flagged.")

class ValidationResult(BaseModel):
    """Output for the final Verification Agent (Supreme Judge)"""
    approved_highlights: List[GeminiHighlight] = Field(default_factory=list, description="The validated, strictly approved list of highlights with zero false positives.")
    final_explainer: str = Field(..., description="A cohesive 2-4 sentence summary of the article's reliability written in the article's original language.")

class VerifiableClaim(BaseModel):
    """A specific verifiable claim extracted by the FactExtractionAgent"""
    paragraph_id: int = Field(..., description="The ID of the paragraph where the claim is located")
    claim_text: str = Field(..., description="The exact factual claim (e.g., specific dates, statistics, quotes, or actions)")

class BiasExtraction(BaseModel):
    """Output for ObjectivityAndBiasAgent"""
    toxic_words_count: int = Field(default=0, description="Count of emotional, inflammatory, derogatory words")
    opinion_sentences_count: int = Field(default=0, description="Count of sentences where the journalist embeds subjective judgments")
    imbalance_detected: bool = Field(default=False, description="True ONLY IF the article discusses a highly controversial topic without giving perspective of a main side")
    highlights: List[GeminiHighlight] = Field(default_factory=list, description="Extract 0 to 3 EXACT locations indicating bias or toxicity")
    raw_thoughts: Optional[str] = Field(default=None, description="The reasoning process")

class LogicExtraction(BaseModel):
    """Output for LogicalAnalysisAgent"""
    clickbait_triggers_count: int = Field(default=0, description="Count of clickbait manipulative tactics in the HEADLINE ONLY")
    headline_mismatch_severity: int = Field(default=0, description="Score 0-5 of how much headline misleads. 5=fabrication")
    logical_fallacies_count: int = Field(default=0, description="Count of logical errors like whataboutism, false dilemmas")
    analysis_summary: str = Field(default="", description="A clinical, highly objective 2-sentence OSINT-style summary of the article's overall credibility. Same language as article.")
    highlights: List[GeminiHighlight] = Field(default_factory=list, description="Extract 0 to 3 EXACT locations indicating logical fallacies or blatant clickbait mismatch")
    raw_thoughts: Optional[str] = Field(default=None, description="The reasoning process")

class FactExtraction(BaseModel):
    """Output for FactExtractionAgent"""
    text_citations: List[str] = Field(default_factory=list, description="Array of named entities acting as sources, data, or quotes")
    named_entities_count: int = Field(default=0, description="Count of unique, verifiable real-world proper nouns")
    verifiable_claims: List[VerifiableClaim] = Field(default_factory=list, description="List of hard, concrete facts and claims extracted from the article")
    raw_thoughts: Optional[str] = Field(default=None, description="The reasoning process")

class AnalyzedArticleData(BaseModel):
    """Aggregated output from all agents"""
    toxic_words_count: int = 0
    opinion_sentences_count: int = 0
    imbalance_detected: bool = False
    clickbait_triggers_count: int = 0
    headline_mismatch_severity: int = 0
    logical_fallacies_count: int = 0
    analysis_summary: str = ""
    text_citations: List[str] = Field(default_factory=list)
    named_entities_count: int = 0
    verifiable_claims: List[VerifiableClaim] = Field(default_factory=list)
    highlights: List[GeminiHighlight] = Field(default_factory=list)


# ---------------------------------------------------------
# API MODELS
# ---------------------------------------------------------

class ParagraphModel(BaseModel):
    """Paragraph content extracted client-side."""
    id: int = Field(..., description="Unique index of the paragraph")
    text: str = Field(..., description="Text content of the paragraph")

class AnalysisRequest(BaseModel):
    """Request model for article analysis (Client-Side Parsing via Readability.js)."""
    url: str = Field(..., description="URL of the article being analyzed")
    title: str = Field(..., description="Article title extracted by Readability.js")
    html_content: str = Field(..., description="Clean article HTML from Readability.js (used for link extraction)")
    paragraphs: List[ParagraphModel] = Field(..., description="Array of paragraphs parsed from the article with unique IDs")
    language: str = Field(default="uk", description="Target language to respond in (e.g., 'uk' or 'en')")

class CriteriaScore(BaseModel):
    """Individual scores for each analysis criterion."""
    source_verification: float = Field(..., ge=0, le=100, description="Source verification score (35% weight)")
    objectivity: float = Field(..., ge=0, le=100, description="Objectivity score (20% weight)")
    headline_relevance: float = Field(..., ge=0, le=100, description="Headline relevance score (15% weight)")
    factual_density: float = Field(..., ge=0, le=100, description="Factual density score (15% weight)")
    logical_consistency: float = Field(..., ge=0, le=100, description="Logical consistency score (15% weight)")

class Highlight(BaseModel):
    """Text highlight for marking problematic issues on the webpage."""
    paragraph_id: int = Field(..., description="ID of the paragraph to highlight")
    severity: Literal["warning", "risk"] = Field(..., description="Severity of the issue")
    category: str = Field(default="", description="Short label")
    reason: str = Field(default="", description="Detailed explanation")

class AnalysisResponse(BaseModel):
    """Response model with aggregated trust score and criteria breakdown."""
    trust_score: float = Field(..., ge=0, le=100, description="Final weighted trust score")
    criteria: CriteriaScore = Field(..., description="Individual criterion scores")
    explainer: str = Field(default="", description="Human-readable explanation of the analysis")
    highlights: List[Highlight] = Field(default=[], description="List of problematic text segments to highlight on the page")

