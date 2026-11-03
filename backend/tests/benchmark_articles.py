"""Бенчмарк алгоритму VERITAS на датасеті ISOT Fake News (Ahmed et al., 2018).

Датасет: https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset

Категорії:
  A — якісна журналістика (Reuters)        очікувано: 60-100
  B — упереджені / низької якості          очікувано: 25-60
  C — маніпулятивні / фейкові              очікувано: 0-30

Запуск (з каталогу backend, сервер має працювати)::

    python -m tests.benchmark_articles
"""

import asyncio
import logging
import statistics
from datetime import datetime
from typing import Any

import httpx

from tests.benchmark_articles_isot import ARTICLES
from tests.benchmark_common import (
    RULE,
    Article,
    analyze_one,
    backend_is_healthy,
    configure_logging,
    log_summary,
    run_articles,
    save_results,
)

logger = logging.getLogger(__name__)

STABILITY_RUNS = 3
STABILITY_DELAY_S = 2
STABILITY_MAX_STD = 8


async def run_stability_test(
    client: httpx.AsyncClient, article: Article, runs: int = STABILITY_RUNS
) -> dict[str, Any]:
    """Аналізує одну статтю кілька разів і рахує стандартне відхилення оцінок."""
    scores: list[float] = []
    for _ in range(runs):
        result = await analyze_one(client, article)
        if result.get("status") == "OK":
            scores.append(result["trust_score"])
        await asyncio.sleep(STABILITY_DELAY_S)

    if len(scores) < 2:
        return {"id": article["id"], "runs": len(scores), "std": "N/A"}

    std = statistics.stdev(scores)
    return {
        "id": article["id"],
        "runs": len(scores),
        "scores": scores,
        "mean": round(statistics.mean(scores), 1),
        "std": round(std, 1),
        "stable": "stable" if std < STABILITY_MAX_STD else "unstable",
    }


async def main() -> None:
    """Запускає бенчмарк, тест стабільності та зберігає результати."""
    configure_logging()
    logger.info("\n%s", RULE)
    logger.info(
        "  VERITAS ALGORITHM BENCHMARK (ISOT) - %s", datetime.now().strftime("%Y-%m-%d %H:%M")
    )
    logger.info("  Articles: %d", len(ARTICLES))
    logger.info(RULE)

    if not await backend_is_healthy():
        return

    results = await run_articles(ARTICLES)
    log_summary("BENCHMARK SUMMARY", results)

    logger.info("\n%s", "-" * 65)
    logger.info("  STABILITY TEST (running %s x%d)...", ARTICLES[0]["id"], STABILITY_RUNS)
    async with httpx.AsyncClient() as client:
        stability = await run_stability_test(client, ARTICLES[0])
    if stability.get("std") != "N/A":
        logger.info("    Scores: %s", stability["scores"])
        logger.info(
            "    Mean: %s, Std Dev: %s (%s)",
            stability["mean"],
            stability["std"],
            stability["stable"],
        )
    else:
        logger.info("    Could not complete stability test")

    save_results(
        results,
        timestamped_csv_prefix="benchmark",
        json_name="latest_results.json",
        latest_csv_name="latest_results.csv",
    )

    logger.info("\n%s", RULE)
    logger.info("  Benchmark complete!")
    logger.info("%s\n", RULE)


if __name__ == "__main__":
    asyncio.run(main())
