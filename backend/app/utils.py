"""Допоміжні функції."""

import logging
from urllib.parse import urlparse

logger = logging.getLogger(__name__)


def get_domain(url: str) -> str:
    """Витягує чисте ім'я домену з URL.

    Повертає хост у нижньому регістрі без порту, облікових даних та префікса `www.`.
    Для некоректного URL повертає порожній рядок.
    """
    try:
        domain = urlparse(url).hostname or ""
    except ValueError as exc:
        logger.error("Error parsing domain from %s: %s", url, exc)
        return ""
    return domain.removeprefix("www.")
