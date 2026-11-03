import logging
from urllib.parse import urlparse

logger = logging.getLogger(__name__)


def get_domain(url: str) -> str:
    """Витягує чисте ім'я домену з URL (нижній регістр, без порту, облікових даних та `www.`)."""
    try:
        domain = urlparse(url).hostname or ""
    except ValueError as e:
        logger.error(f"Error parsing domain from {url}: {e}")
        return ""
    if domain.startswith("www."):
        domain = domain[4:]
    return domain
