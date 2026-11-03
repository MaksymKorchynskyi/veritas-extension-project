"""Спільна логіка бенчмарків VERITAS: запити до API, підсумки та збереження результатів."""

import asyncio
import csv
import json
import logging
import statistics
import time
from collections.abc import Sequence
from datetime import datetime
from pathlib import Path
from typing import Any

import httpx

logger = logging.getLogger(__name__)

API_URL = "http://127.0.0.1:8000/analyze"
HEALTH_URL = "http://127.0.0.1:8000/health"
RESULTS_DIR = Path(__file__).parent / "results"

REQUEST_TIMEOUT_S = 120.0
HEALTH_TIMEOUT_S = 5.0
DELAY_BETWEEN_REQUESTS_S = 3
CLASSIFICATION_THRESHOLD = 40
SEPARATION_TARGET = 25
RULE = "=" * 65

# Ці маркери записуються у файли результатів, а test_dashboard.html порівнює з ними значення.
IN_RANGE_MARK = "✅"
OUT_OF_RANGE_MARK = "❌"

CSV_FIELDS = [
    "id",
    "category",
    "title",
    "expected_range",
    "trust_score",
    "in_range",
    "credibility",
    "transparency",
    "objectivity",
    "highlights",
    "elapsed_s",
    "status",
]
CATEGORY_LABELS = {"A": "Quality", "B": "Biased", "C": "Fake/Manipulative"}

Article = dict[str, Any]
Result = dict[str, Any]


def configure_logging() -> None:
    """Налаштовує вивід бенчмарків: лише текст повідомлень, без службових префіксів."""
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    logging.getLogger("httpx").setLevel(logging.WARNING)


async def analyze_one(client: httpx.AsyncClient, article: Article) -> Result:
    """Надсилає одну статтю на API та повертає структурований результат."""
    paragraphs = [{"id": i + 1, "text": p} for i, p in enumerate(article["paragraphs"])]
    payload = {
        "url": article["url"],
        "title": article["title"],
        "html_content": " ".join(f"<p>{p}</p>" for p in article["paragraphs"]),
        "paragraphs": paragraphs,
        "language": "en",
    }

    start = time.time()
    try:
        resp = await client.post(API_URL, json=payload, timeout=REQUEST_TIMEOUT_S)
        elapsed = round(time.time() - start, 2)

        if resp.status_code != 200:
            return {
                "id": article["id"],
                "category": article["category"],
                "status": "HTTP_ERROR",
                "http_code": resp.status_code,
                "error": resp.text[:200],
                "elapsed_s": elapsed,
            }

        data = resp.json()
        low, high = article["expected"]
        trust = data["trust_score"]

        return {
            "id": article["id"],
            "category": article["category"],
            "title": article["title"],
            "expected_range": f"{low}–{high}",
            "trust_score": trust,
            "in_range": IN_RANGE_MARK if low <= trust <= high else OUT_OF_RANGE_MARK,
            "credibility": data["criteria"]["credibility"],
            "transparency": data["criteria"]["transparency"],
            "objectivity": data["criteria"]["objectivity"],
            "highlights": len(data.get("highlights", [])),
            "explainer": data.get("explainer", "")[:150],
            "elapsed_s": elapsed,
            "status": "OK",
            "full_response": data,
        }
    except httpx.ConnectError:
        return {
            "id": article["id"],
            "status": "CONNECTION_ERROR",
            "error": "Cannot connect to backend. Is uvicorn running?",
        }
    except Exception as exc:  # noqa: BLE001 - бенчмарк має пережити збій окремої статті
        return {
            "id": article["id"],
            "status": "EXCEPTION",
            "error": str(exc)[:200],
            "elapsed_s": round(time.time() - start, 2),
        }


async def backend_is_healthy() -> bool:
    """Перевіряє, чи відповідає бекенд на /health, і логує підказку, якщо ні."""
    async with httpx.AsyncClient() as client:
        try:
            health = await client.get(HEALTH_URL, timeout=HEALTH_TIMEOUT_S)
        except httpx.ConnectError:
            logger.error("\n  Cannot connect to http://127.0.0.1:8000")
            logger.error("     Start backend: cd backend && uvicorn app.main:app --reload")
            return False
    if health.status_code != 200:
        logger.error("\n  Backend not healthy. Start with: uvicorn app.main:app --reload")
        return False
    logger.info("  Backend online: %s", health.json())
    return True


async def run_articles(articles: Sequence[Article]) -> list[Result]:
    """Послідовно аналізує статті (з паузою між запитами) та логує результат кожної."""
    results: list[Result] = []
    async with httpx.AsyncClient() as client:
        for article in articles:
            logger.info(
                "\n  [%s|%s] %s...", article["id"], article["category"], article["title"][:45]
            )

            result = await analyze_one(client, article)
            results.append(result)

            if result["status"] == "OK":
                verdict = "in range" if result["in_range"] == IN_RANGE_MARK else "OUT OF RANGE"
                logger.info(
                    "         Score: %s (expected %s) %s  [%ss]",
                    result["trust_score"],
                    result["expected_range"],
                    verdict,
                    result["elapsed_s"],
                )
                logger.info(
                    "         Cred:%.1f Trans:%.1f Obj:%.1f Highlights:%s",
                    result["credibility"],
                    result["transparency"],
                    result["objectivity"],
                    result["highlights"],
                )
            else:
                logger.info("         ERROR: %s", result.get("error", "Unknown")[:80])

            await asyncio.sleep(DELAY_BETWEEN_REQUESTS_S)
    return results


def ok_only(results: Sequence[Result]) -> list[Result]:
    """Повертає лише успішні результати."""
    return [r for r in results if r.get("status") == "OK"]


def log_summary(title: str, results: Sequence[Result]) -> None:
    """Логує підсумок: кількість, влучання в діапазон, час відповіді та середнє по категоріях."""
    ok_results = ok_only(results)
    correct = sum(1 for r in ok_results if r.get("in_range") == IN_RANGE_MARK)

    cat_scores: dict[str, list[float]] = {}
    for r in ok_results:
        cat_scores.setdefault(r["category"], []).append(r["trust_score"])

    logger.info("\n%s", RULE)
    logger.info("  %s", title)
    logger.info(RULE)
    logger.info("  Total articles:     %d", len(results))
    logger.info("  Successful:         %d", len(ok_results))
    logger.info("  Errors:             %d", len(results) - len(ok_results))
    logger.info(
        "  In expected range:  %d/%d (%.0f%%)",
        correct,
        len(ok_results),
        correct / max(1, len(ok_results)) * 100,
    )

    if ok_results:
        times = [r["elapsed_s"] for r in ok_results]
        logger.info(
            "  Avg response time:  %.1fs (min=%.1fs, max=%.1fs)",
            statistics.mean(times),
            min(times),
            max(times),
        )

    for cat in sorted(cat_scores):
        scores = cat_scores[cat]
        logger.info(
            "  Category %s (%s):  avg=%.1f, min=%.0f, max=%.0f",
            cat,
            CATEGORY_LABELS.get(cat, cat),
            statistics.mean(scores),
            min(scores),
            max(scores),
        )

    if "A" in cat_scores and "C" in cat_scores:
        gap = statistics.mean(cat_scores["A"]) - statistics.mean(cat_scores["C"])
        logger.info(
            "  Separation A vs C:  %.1f points (%s)",
            gap,
            "good" if gap > SEPARATION_TARGET else "weak",
        )

    if ok_results:
        _log_classification_metrics(ok_results)


def _log_classification_metrics(ok_results: Sequence[Result]) -> None:
    """Рахує precision/recall/F1: категорії B та C вважаються «ненадійними»."""
    threshold = CLASSIFICATION_THRESHOLD
    unreliable = ("B", "C")
    tp = sum(1 for r in ok_results if r["category"] in unreliable and r["trust_score"] < threshold)
    fp = sum(1 for r in ok_results if r["category"] == "A" and r["trust_score"] < threshold)
    tn = sum(1 for r in ok_results if r["category"] == "A" and r["trust_score"] >= threshold)
    fn = sum(1 for r in ok_results if r["category"] in unreliable and r["trust_score"] >= threshold)

    precision = tp / max(1, tp + fp)
    recall = tp / max(1, tp + fn)
    f1 = 2 * precision * recall / max(0.001, precision + recall)
    accuracy = (tp + tn) / max(1, len(ok_results))

    logger.info("\n  -- Classification Metrics (threshold=%d) --", threshold)
    logger.info("  TP=%d  FP=%d  TN=%d  FN=%d", tp, fp, tn, fn)
    logger.info("  Precision:  %.3f", precision)
    logger.info("  Recall:     %.3f", recall)
    logger.info("  F1 Score:   %.3f", f1)
    logger.info("  Accuracy:   %.3f", accuracy)


def save_results(
    results: Sequence[Result],
    *,
    timestamped_csv_prefix: str,
    json_name: str,
    latest_csv_name: str,
) -> None:
    """Зберігає успішні результати у CSV (з міткою часу та «останній») і JSON.

    JSON записується завжди (навіть порожній); CSV лише за наявності успішних результатів.
    """
    RESULTS_DIR.mkdir(exist_ok=True)
    ok_results = ok_only(results)

    if ok_results:
        stamp = datetime.now().strftime("%Y%m%d_%H%M")
        csv_path = RESULTS_DIR / f"{timestamped_csv_prefix}_{stamp}.csv"
        _write_csv(csv_path, ok_results)
        logger.info("\n  CSV saved: %s", csv_path)

    json_path = RESULTS_DIR / json_name
    entries = [{**r, "full_response": r.get("full_response", {})} for r in ok_results]
    json_path.write_text(json.dumps(entries, ensure_ascii=False, indent=2), encoding="utf-8")
    logger.info("  JSON saved: %s", json_path)

    if ok_results:
        _write_csv(RESULTS_DIR / latest_csv_name, ok_results)


def _write_csv(path: Path, rows: Sequence[Result]) -> None:
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
