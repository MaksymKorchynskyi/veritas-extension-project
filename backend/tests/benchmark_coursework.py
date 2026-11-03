"""Бенчмарк VERITAS на куратованому датасеті курсової роботи (48 статей).

Результати зберігаються у `coursework_results.json` / `coursework_results.csv`
для дашборду. Запуск (з каталогу backend, сервер має працювати)::

    python -m tests.benchmark_coursework
"""

import asyncio
import logging
from datetime import datetime

from tests.benchmark_articles_coursework import COURSEWORK_ARTICLES
from tests.benchmark_common import (
    RULE,
    backend_is_healthy,
    configure_logging,
    log_summary,
    run_articles,
    save_results,
)

logger = logging.getLogger(__name__)


async def main() -> None:
    """Запускає бенчмарк курсового датасету та зберігає результати."""
    configure_logging()
    logger.info("\n%s", RULE)
    logger.info("  VERITAS COURSEWORK BENCHMARK - %s", datetime.now().strftime("%Y-%m-%d %H:%M"))
    logger.info("  Articles: %d (16xA + 16xB + 16xC)", len(COURSEWORK_ARTICLES))
    logger.info(RULE)

    if not await backend_is_healthy():
        return

    results = await run_articles(COURSEWORK_ARTICLES)
    log_summary("COURSEWORK BENCHMARK SUMMARY", results)

    save_results(
        results,
        timestamped_csv_prefix="coursework",
        json_name="coursework_results.json",
        latest_csv_name="coursework_results.csv",
    )

    logger.info("\n%s", RULE)
    logger.info("  Coursework benchmark complete!")
    logger.info("%s\n", RULE)


if __name__ == "__main__":
    asyncio.run(main())
