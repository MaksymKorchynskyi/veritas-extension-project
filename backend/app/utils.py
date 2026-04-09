"""
VERITAS Utils
Text cleaning and HTML processing utilities
"""

from bs4 import BeautifulSoup
import re


def clean_html(html: str) -> str:
    """
    Clean HTML content by removing navigation, scripts, and other non-article elements.
    
    Args:
        html: Raw HTML string from the article page
        
    Returns:
        Cleaned text content
    """
    soup = BeautifulSoup(html, 'lxml')
    
    # CRITICAL: Remove unwanted elements as per TECH_STACK.md
    unwanted_tags = [
        'nav', 'footer', 'script', 'style', 'aside', 'header',
        'noscript', 'iframe', 'form', 'button', 'input'
    ]
    
    for tag in unwanted_tags:
        for element in soup.find_all(tag):
            element.decompose()
    
    # Remove elements by common class names (ads, navigation, etc.)
    unwanted_classes = [
        'advertisement', 'ad', 'ads', 'sidebar', 'navigation',
        'menu', 'comments', 'related', 'social', 'share'
    ]
    
    for class_name in unwanted_classes:
        for element in soup.find_all(class_=re.compile(class_name, re.I)):
            element.decompose()
    
    # Extract text from remaining content
    text = soup.get_text(separator='\n', strip=True)
    
    # Clean up multiple newlines and spaces
    text = re.sub(r'\n\s*\n', '\n\n', text)
    text = re.sub(r' +', ' ', text)
    
    return text.strip()


def extract_links(html: str) -> list[dict]:
    """
    Extract all hyperlinks from the HTML content.
    
    Args:
        html: Raw HTML string
        
    Returns:
        List of dicts with 'url' and 'text' keys
    """
    soup = BeautifulSoup(html, 'lxml')
    links = []
    
    for anchor in soup.find_all('a', href=True):
        href = anchor.get('href', '')
        text = anchor.get_text(strip=True)
        
        # Skip empty, anchor, or javascript links
        if not href or href.startswith('#') or href.startswith('javascript:'):
            continue
            
        # Skip social media share links
        if any(social in href.lower() for social in ['twitter.com/intent', 'facebook.com/sharer', 'linkedin.com/share']):
            continue
        
        links.append({
            'url': href,
            'text': text
        })
    
    return links


def count_words(text: str) -> int:
    """
    Count words in text.
    
    Args:
        text: Text string
        
    Returns:
        Word count
    """
    if not text:
        return 0
    return len(text.split())


def truncate_text(text: str, max_length: int = 10000) -> str:
    """
    Truncate text to a maximum length while preserving word boundaries.
    
    Args:
        text: Text to truncate
        max_length: Maximum character length
        
    Returns:
        Truncated text
    """
    if len(text) <= max_length:
        return text
    
    # Find the last space before max_length
    truncated = text[:max_length]
    last_space = truncated.rfind(' ')
    
    if last_space > max_length * 0.8:  # Only use if within reasonable range
        return truncated[:last_space] + '...'
    
    return truncated + '...'
