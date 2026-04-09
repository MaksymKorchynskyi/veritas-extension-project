"""
VERITAS Pydantic Models
API Request/Response schemas based on WMFA v2.0 algorithm
Phase 5: Added highlights for text marking on webpage
"""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class AnalysisRequest(BaseModel):
    """Request model for article analysis."""
    url: str = Field(..., description="URL of the article being analyzed")
    text: str = Field(..., description="Full text content of the article")
    headline: str = Field(..., description="Article headline/title")


class CriteriaScore(BaseModel):
    """Individual scores for each analysis criterion."""
    source_verification: float = Field(
        ..., 
        ge=0, 
        le=100, 
        description="Source verification score (35% weight)"
    )
    objectivity: float = Field(
        ..., 
        ge=0, 
        le=100, 
        description="Objectivity score (20% weight)"
    )
    headline_relevance: float = Field(
        ..., 
        ge=0, 
        le=100, 
        description="Headline relevance score (15% weight)"
    )
    factual_density: float = Field(
        ..., 
        ge=0, 
        le=100, 
        description="Factual density score (15% weight)"
    )
    logical_consistency: float = Field(
        ..., 
        ge=0, 
        le=100, 
        description="Logical consistency score (15% weight)"
    )


class Highlight(BaseModel):
    """Text highlight for marking issues on webpage."""
    text: str = Field(..., description="Exact text to highlight on the page")
    severity: Literal["warning", "risk"] = Field(
        ..., 
        description="warning=Yellow (bias/fallacies), risk=Red (toxic/fake)"
    )
    reason: str = Field(default="", description="Short reason for highlighting")


class AnalysisResponse(BaseModel):
    """Response model with aggregated trust score and criteria breakdown."""
    trust_score: float = Field(
        ..., 
        ge=0, 
        le=100, 
        description="Final weighted trust score"
    )
    criteria: CriteriaScore = Field(
        ..., 
        description="Individual criterion scores"
    )
    explainer: str = Field(
        default="", 
        description="Human-readable explanation of the analysis"
    )
    highlights: List[Highlight] = Field(
        default=[], 
        description="List of text segments to highlight on the page"
    )
