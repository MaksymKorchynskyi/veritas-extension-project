"""
VERITAS Unit Tests — Utilities (utils.py)
==========================================
Tests for link extraction, word counting, and text utilities.

Run: python -m pytest tests/test_utils.py -v
"""

import pytest
from app.utils import extract_links, count_words, truncate_text


# =============================================================================
# LINK EXTRACTION
# =============================================================================

class TestExtractLinks:
    """Tests for extract_links()."""

    def test_empty_html(self):
        """Empty HTML → empty list."""
        assert extract_links("") == []
        assert extract_links(None) == []

    def test_single_external_link(self):
        """One external <a> tag → extracted."""
        html = '<p>Text <a href="https://reuters.com/news/1">Reuters</a></p>'
        links = extract_links(html, "example.com")
        assert len(links) == 1
        assert links[0]["domain"] == "reuters.com"
        assert links[0]["text"] == "Reuters"

    def test_internal_links_included(self):
        """Internal links should be included (needed for Anti-SEO scoring)."""
        html = '<a href="https://example.com/page1">Link 1</a><a href="https://example.com/page2">Link 2</a>'
        links = extract_links(html, "example.com")
        assert len(links) == 2

    def test_javascript_links_filtered(self):
        """javascript: links should be filtered out."""
        html = '<a href="javascript:void(0)">Click</a>'
        links = extract_links(html, "example.com")
        assert len(links) == 0

    def test_anchor_links_filtered(self):
        """#anchor links should be filtered out."""
        html = '<a href="#section1">Section 1</a>'
        links = extract_links(html, "example.com")
        assert len(links) == 0

    def test_mailto_filtered(self):
        """mailto: links should be filtered out."""
        html = '<a href="mailto:test@test.com">Email</a>'
        links = extract_links(html, "example.com")
        assert len(links) == 0

    def test_social_media_filtered(self):
        """Social media links should be filtered out."""
        html = '''
        <a href="https://twitter.com/user">Twitter</a>
        <a href="https://facebook.com/share?url=x">Share</a>
        <a href="https://t.me/channel">Telegram</a>
        '''
        links = extract_links(html, "example.com")
        assert len(links) == 0, f"Social links should be filtered, got {links}"

    def test_duplicate_links_filtered(self):
        """Same URL twice → only counted once."""
        html = '''
        <a href="https://reuters.com/1">Link</a>
        <a href="https://reuters.com/1">Same Link</a>
        '''
        links = extract_links(html, "example.com")
        assert len(links) == 1

    def test_relative_links_resolved(self):
        """Relative URLs should be resolved to absolute."""
        html = '<a href="/politics/article-1">Article</a>'
        links = extract_links(html, "pravda.com.ua")
        assert len(links) == 1
        assert "pravda.com.ua" in links[0]["url"]

    def test_text_truncation(self):
        """Link text should be truncated at 200 chars."""
        long_text = "A" * 500
        html = f'<a href="https://example.org/1">{long_text}</a>'
        links = extract_links(html, "test.com")
        assert len(links) == 1
        assert len(links[0]["text"]) <= 200

    def test_multiple_mixed_links(self):
        """Mix of external, internal, social → correct filtering."""
        html = '''
        <a href="https://reuters.com/article">Reuters</a>
        <a href="https://example.com/page">Internal</a>
        <a href="https://facebook.com/share">FB</a>
        <a href="https://bbc.com/news">BBC</a>
        <a href="#top">Anchor</a>
        '''
        links = extract_links(html, "example.com")
        domains = [l["domain"] for l in links]
        assert "reuters.com" in domains
        assert "bbc.com" in domains
        assert "facebook.com" not in domains


# =============================================================================
# WORD COUNTING
# =============================================================================

class TestCountWords:
    def test_empty(self):
        assert count_words("") == 0
        assert count_words(None) == 0

    def test_simple(self):
        assert count_words("one two three") == 3

    def test_extra_whitespace(self):
        assert count_words("  one   two   three  ") == 3

    def test_unicode(self):
        """Ukrainian text should count words correctly."""
        assert count_words("Україна є незалежна держава") == 4


# =============================================================================
# TEXT TRUNCATION
# =============================================================================

class TestTruncateText:
    def test_short_text(self):
        """Short text returned as-is."""
        text = "Short text"
        assert truncate_text(text, 100) == text

    def test_long_text(self):
        """Long text gets truncated."""
        text = "word " * 5000
        result = truncate_text(text, 100)
        assert len(result) <= 103  # 100 + '...'

    def test_truncation_at_word_boundary(self):
        """Truncation should prefer word boundaries."""
        text = "Hello world this is a test of word boundary truncation abilities"
        result = truncate_text(text, 30)
        assert "..." in result, "Truncated text should contain '...'"
        assert len(result) <= 35, "Truncated result should be reasonable length"
