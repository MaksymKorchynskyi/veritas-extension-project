import hashlib
import time
from collections import OrderedDict

from app.models.schemas import AnalysisResponse

DEFAULT_TTL_S = 3600 * 12
DEFAULT_MAX_ENTRIES = 512


class AnalysisCache:
    """Кеш результатів аналізу в пам'яті: обмежений за розміром (LRU) та часом життя запису."""

    def __init__(self, ttl_s: float = DEFAULT_TTL_S, max_entries: int = DEFAULT_MAX_ENTRIES) -> None:
        self._ttl_s = ttl_s
        self._max_entries = max_entries
        self._items: OrderedDict[str, tuple[float, AnalysisResponse]] = OrderedDict()

    @staticmethod
    def make_key(domain: str, headline: str, language: str, text: str) -> str:
        """Ключ кешу залежить від домену, заголовка, мови та повного тексту статті."""
        raw = "\x1f".join((domain, headline, language, text))
        return hashlib.sha256(raw.encode()).hexdigest()

    def get(self, key: str) -> AnalysisResponse | None:
        """Повертає збережену відповідь або None, якщо запису немає чи він застарів."""
        item = self._items.get(key)
        if item is None:
            return None
        stored_at, response = item
        if time.monotonic() - stored_at >= self._ttl_s:
            del self._items[key]
            return None
        self._items.move_to_end(key)
        return response

    def set(self, key: str, response: AnalysisResponse) -> None:
        """Зберігає відповідь, видаляючи найстаріші записи при перевищенні ліміту."""
        self._items[key] = (time.monotonic(), response)
        self._items.move_to_end(key)
        while len(self._items) > self._max_entries:
            self._items.popitem(last=False)

    def __len__(self) -> int:
        return len(self._items)
