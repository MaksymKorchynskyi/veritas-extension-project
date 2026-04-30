from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)

def get_domain(url: str) -> str:
    """Extracts the clean domain name from a URL."""
    try:
        domain = urlparse(url).netloc
        if domain.startswith("www."):
            domain = domain[4:]
        return domain
    except Exception as e:
        logger.error(f"Error parsing domain from {url}: {e}")
        return ""