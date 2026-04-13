"""
VERITAS Utils
Lightweight link extraction from pre-cleaned Readability.js HTML.

The heavy HTML scraping/cleaning is now done client-side by Readability.js.
Backend only needs BeautifulSoup for <a> tag extraction.
Phase 5: Enhanced internal link detection & URL sanitization.
"""

from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin
import logging

logger = logging.getLogger(__name__)

# Social media domains to filter out of source links
SOCIAL_DOMAINS = {
    'facebook.com', 'twitter.com', 't.co', 'x.com', 'instagram.com',
    'linkedin.com', 'youtube.com', 'tiktok.com', 'telegram.org',
    't.me', 'wa.me', 'whatsapp.com', 'viber.com', 'pinterest.com',
    't.tiktok.com', 'invite.viber.com', 'fb.watch'
}

# Social share URL patterns (usually injected by share buttons)
SOCIAL_SHARE_PATTERNS = {
    'twitter.com/intent', 'facebook.com/sharer', 'linkedin.com/share',
    'reddit.com/submit', 'pinterest.com/pin', 't.me/share'
}


def extract_links(html_content: str, article_domain: str = "", base_url: str = "") -> list[dict]:
    """
    Extract external and internal hyperlinks from pre-cleaned Readability.js HTML.
    
    Args:
        html_content: Clean article HTML from Readability.js
        article_domain: Domain of the article (to detect internal links)
        base_url: The full URL of the article (used to resolve relative links)
        
    Returns:
        List of dicts with 'url', 'text', and 'domain' keys.
        Internal links are included so `core.py` can penalize SEO spam.
    """
    if not html_content:
        return []
    
    soup = BeautifulSoup(html_content, 'html.parser')
    links = []
    seen_urls = set()
    
    # Нормалізація базового домену для порівнянь
    article_domain_clean = article_domain.lower().replace('www.', '') if article_domain else ""
    
    for anchor in soup.find_all('a', href=True):
        href = anchor.get('href', '').strip()
        text = anchor.get_text(strip=True)
        
        # 1. Skip strictly empty, anchor-only, or javascript links
        if not href or href.startswith(('#', 'javascript:', 'mailto:', 'tel:')):
            continue
            
        # 2. Resolve relative URLs (e.g., "/politics/news-123") -> "https://domain.com/..."
        # If no base_url is provided, we assume relative URLs belong to article_domain
        if not href.startswith(('http://', 'https://')):
            if base_url:
                href = urljoin(base_url, href)
            else:
                # If we don't have base_url, we still treat it as an internal link
                href = f"https://{article_domain_clean}{href if href.startswith('/') else '/' + href}"
                
        # 3. Skip exact duplicates to prevent duplicate processing
        if href in seen_urls:
            continue
            
        # 4. Parse the normalized link
        try:
            parsed = urlparse(href)
            link_domain = parsed.netloc.lower().replace('www.', '')
        except ValueError:
            # Skip completely malformed URLs
            continue
            
        # 5. Skip social media profile / share domains
        if any(social in link_domain for social in SOCIAL_DOMAINS):
            continue
            
        # 6. Skip social share action URLs
        if any(pattern in href.lower() for pattern in SOCIAL_SHARE_PATTERNS):
            continue
            
        # Увага: Ми БІЛЬШЕ НЕ пропускаємо internal_links тут!
        # Вони потрібні у core.py, щоб алгоритм міг застосувати internal_penalty (Анти-SEO).
        
        seen_urls.add(href)
        links.append({
            'url': href,
            'text': text[:200] if text else '', # Текст лінку (напр. "пише Reuters")
            'domain': link_domain,
        })
    
    return links


def count_words(text: str) -> int:
    """
    Count words in text accurately.
    """
    if not text:
        return 0
    return len(text.split())


def truncate_text(text: str, max_length: int = 10000) -> str:
    """
    Truncate text to a maximum length while preserving word boundaries.
    """
    if len(text) <= max_length:
        return text
    
    truncated = text[:max_length]
    last_space = truncated.rfind(' ')
    
    if last_space > max_length * 0.8:
        return truncated[:last_space] + '...'
    
    return truncated + '...'