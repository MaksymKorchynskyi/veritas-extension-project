"""
VERITAS Coursework Benchmark Runner
=====================================
Runs 48 curated articles through the VERITAS API and saves results
to coursework_results.json / coursework_results.csv for the dashboard.
"""

import asyncio
import json
import time
import csv
import statistics
from pathlib import Path
from datetime import datetime

try:
    import httpx
except ImportError:
    print("❌ httpx not installed. Run: pip install httpx")
    exit(1)

from tests.benchmark_articles_coursework import COURSEWORK_ARTICLES

API_URL = "http://127.0.0.1:8000/analyze"
RESULTS_DIR = Path(__file__).parent / "results"
RESULTS_DIR.mkdir(exist_ok=True)


async def analyze_one(client: httpx.AsyncClient, article: dict) -> dict:
    """Send one article to the API and return structured result."""
    paragraphs = [{"id": i + 1, "text": p} for i, p in enumerate(article["paragraphs"])]
    html = " ".join(f"<p>{p}</p>" for p in article["paragraphs"])

    payload = {
        "url": article["url"],
        "title": article["title"],
        "html_content": html,
        "paragraphs": paragraphs,
        "language": "en",
    }

    start = time.time()
    try:
        resp = await client.post(API_URL, json=payload, timeout=120.0)
        elapsed = round(time.time() - start, 2)

        if resp.status_code != 200:
            return {
                "id": article["id"], "category": article["category"],
                "status": "HTTP_ERROR", "http_code": resp.status_code,
                "error": resp.text[:200], "elapsed_s": elapsed,
            }

        data = resp.json()
        lo, hi = article["expected"]
        trust = data["trust_score"]
        in_range = lo <= trust <= hi

        return {
            "id": article["id"],
            "category": article["category"],
            "title": article["title"],
            "expected_range": f"{lo}–{hi}",
            "trust_score": trust,
            "in_range": "✅" if in_range else "❌",
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
        return {"id": article["id"], "status": "CONNECTION_ERROR",
                "error": "Cannot connect to backend. Is uvicorn running?"}
    except Exception as e:
        return {"id": article["id"], "status": "EXCEPTION",
                "error": str(e)[:200], "elapsed_s": round(time.time() - start, 2)}


async def main():
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")

    print()
    print("=" * 65)
    print(f"  🎓 VERITAS COURSEWORK BENCHMARK — {timestamp}")
    print(f"  Articles: {len(COURSEWORK_ARTICLES)} (16×A + 16×B + 16×C)")
    print("=" * 65)

    async with httpx.AsyncClient() as client:
        try:
            health = await client.get("http://127.0.0.1:8000/health", timeout=5.0)
            if health.status_code != 200:
                print("\n  ❌ Backend not healthy. Start with: uvicorn app.main:app --reload")
                return
            print(f"  ✅ Backend online: {health.json()}")
        except httpx.ConnectError:
            print("\n  ❌ Cannot connect to http://127.0.0.1:8000")
            print("     Start backend: cd backend && uvicorn app.main:app --reload")
            return

    results = []
    async with httpx.AsyncClient() as client:
        for article in COURSEWORK_ARTICLES:
            tag = f"[{article['id']}|{article['category']}]"
            title_preview = article["title"][:45]
            print(f"\n  {tag} {title_preview}...")

            result = await analyze_one(client, article)
            results.append(result)

            if result["status"] == "OK":
                ts = result["trust_score"]
                rng = result["expected_range"]
                ok = result["in_range"]
                t = result["elapsed_s"]
                print(f"         Score: {ts} (expected {rng}) {ok}  [{t}s]")
                print(f"         Cred:{result['credibility']:.1f} Trans:{result['transparency']:.1f} Obj:{result['objectivity']:.1f} "
                      f"Highlights:{result['highlights']}")
            else:
                print(f"         ❌ {result.get('error', 'Unknown')[:80]}")

            await asyncio.sleep(3)  # Rate limiting

    ok_results = [r for r in results if r.get("status") == "OK"]
    errors = len(results) - len(ok_results)
    correct = sum(1 for r in ok_results if r.get("in_range") == "✅")

    cat_scores = {}
    for r in ok_results:
        cat = r["category"]
        cat_scores.setdefault(cat, []).append(r["trust_score"])

    print("\n" + "=" * 65)
    print("  📊 COURSEWORK BENCHMARK SUMMARY")
    print("=" * 65)
    print(f"  Total articles:     {len(results)}")
    print(f"  Successful:         {len(ok_results)}")
    print(f"  Errors:             {errors}")
    print(f"  In expected range:  {correct}/{len(ok_results)} "
          f"({correct / max(1, len(ok_results)) * 100:.0f}%)")

    if ok_results:
        times = [r["elapsed_s"] for r in ok_results]
        print(f"  Avg response time:  {statistics.mean(times):.1f}s "
              f"(min={min(times):.1f}s, max={max(times):.1f}s)")

    for cat in sorted(cat_scores):
        s = cat_scores[cat]
        label = {"A": "Quality", "B": "Biased", "C": "Fake/Manipulative"}.get(cat, cat)
        print(f"  Category {cat} ({label}):  "
              f"avg={statistics.mean(s):.1f}, "
              f"min={min(s):.0f}, max={max(s):.0f}")

    if "A" in cat_scores and "C" in cat_scores:
        gap = statistics.mean(cat_scores["A"]) - statistics.mean(cat_scores["C"])
        print(f"  Separation A vs C:  {gap:.1f} points {'✅' if gap > 25 else '⚠️'}")

    # ── Classification metrics ──────────────────────────────────────
    if ok_results:
        THRESHOLD = 40
        tp = sum(1 for r in ok_results if r["category"] in ("B", "C") and r["trust_score"] < THRESHOLD)
        fp = sum(1 for r in ok_results if r["category"] == "A" and r["trust_score"] < THRESHOLD)
        tn = sum(1 for r in ok_results if r["category"] == "A" and r["trust_score"] >= THRESHOLD)
        fn = sum(1 for r in ok_results if r["category"] in ("B", "C") and r["trust_score"] >= THRESHOLD)

        precision = tp / max(1, tp + fp)
        recall = tp / max(1, tp + fn)
        f1 = 2 * precision * recall / max(0.001, precision + recall)
        accuracy = (tp + tn) / max(1, len(ok_results))

        print(f"\n  ── Classification Metrics (threshold={THRESHOLD}) ──")
        print(f"  TP={tp}  FP={fp}  TN={tn}  FN={fn}")
        print(f"  Precision:  {precision:.3f}")
        print(f"  Recall:     {recall:.3f}")
        print(f"  F1 Score:   {f1:.3f}")
        print(f"  Accuracy:   {accuracy:.3f}")

    # ── Save results ────────────────────────────────────────────────
    csv_path = RESULTS_DIR / f"coursework_{datetime.now().strftime('%Y%m%d_%H%M')}.csv"
    csv_fields = ["id", "category", "title", "expected_range", "trust_score",
                  "in_range", "credibility", "transparency", "objectivity",
                  "highlights", "elapsed_s", "status"]
    if ok_results:
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=csv_fields, extrasaction='ignore')
            writer.writeheader()
            writer.writerows(ok_results)
        print(f"\n  💾 CSV saved: {csv_path}")

    json_path = RESULTS_DIR / "coursework_results.json"
    json_results = []
    for r in ok_results:
        entry = {k: v for k, v in r.items() if k != "full_response"}
        entry["full_response"] = r.get("full_response", {})
        json_results.append(entry)

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(json_results, f, ensure_ascii=False, indent=2)
    print(f"  💾 JSON saved: {json_path}")

    latest_csv = RESULTS_DIR / "coursework_results.csv"
    if ok_results:
        with open(latest_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=csv_fields, extrasaction='ignore')
            writer.writeheader()
            writer.writerows(ok_results)

    print("\n" + "=" * 65)
    print("  ✅ Coursework benchmark complete!")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
