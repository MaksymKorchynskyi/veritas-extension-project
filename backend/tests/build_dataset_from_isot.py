"""
Build VERITAS benchmark dataset from ISOT Fake News Dataset.
Source: Ahmed et al. (2018) — https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset

Mapping:
  True.csv  (Reuters wire stories)              → Category A (quality journalism)
  Fake.csv  subject='politics'/'left-news'       → Category B (biased / low quality)
  Fake.csv  subject='Government News'/'News'      → Category C (manipulative / fake)
"""

import csv
import os
import random
import textwrap

DATA_DIR = os.path.expanduser(
    "~/.cache/kagglehub/datasets/clmentbisaillon/fake-and-real-news-dataset/versions/1"
)
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "benchmark_articles_isot.py")

# Reproducibility
random.seed(42)

# ── How many per category ──────────────────────────────────────────
N_A = 20   # quality journalism
N_B = 15   # biased content
N_C = 15   # manipulative / fake
# Total: 50

# ── Expected Trust-Score ranges ────────────────────────────────────
RANGES = {"A": (60, 100), "B": (25, 60), "C": (0, 30)}

# ── Fake URLs per category (domain reputation) ────────────────────
FAKE_URLS = {
    "A": "https://www.reuters.com/world/article/{id}",
    "B": "https://politicalbias-news.com/articles/{id}",
    "C": "https://conspiracy-daily.info/post/{id}",
}


def load_csv(filename: str) -> list[dict]:
    path = os.path.join(DATA_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def text_to_paragraphs(text: str, min_paras: int = 4, max_paras: int = 7) -> list[str] | None:
    """Split article text into paragraphs; skip if too short."""
    # Clean Reuters header like "WASHINGTON (Reuters) - "
    if "(Reuters)" in text[:80]:
        dash = text.find(" - ", 0, 120)
        if dash != -1:
            text = text[dash + 3:]

    # Split on double newline or period-sequences
    raw = [p.strip() for p in text.split("\n") if p.strip()]

    # If only 1 big block, split by sentences into chunks of ~2-3 sentences
    if len(raw) < min_paras:
        sentences = text.replace(". ", ".\n").split("\n")
        sentences = [s.strip() for s in sentences if len(s.strip()) > 30]
        raw = []
        chunk = []
        for s in sentences:
            chunk.append(s)
            if len(chunk) >= 2:
                raw.append(" ".join(chunk))
                chunk = []
        if chunk:
            raw.append(" ".join(chunk))

    if len(raw) < min_paras:
        return None

    # Take first max_paras paragraphs
    paras = raw[:max_paras]
    # Each paragraph should be 20-300 words
    paras = [p for p in paras if 20 <= len(p.split()) <= 300]

    if len(paras) < min_paras:
        return None

    return paras[:max_paras]


def pick_articles(rows: list[dict], n: int, category: str) -> list[dict]:
    """Pick n articles with valid paragraph structure."""
    random.shuffle(rows)
    picked = []
    for row in rows:
        if len(picked) >= n:
            break
        title = row["title"].strip()
        if not title or len(title) < 15:
            continue
        paras = text_to_paragraphs(row["text"])
        if paras is None:
            continue
        idx = len(picked) + 1
        picked.append({
            "id": f"{category}{idx}",
            "category": category,
            "expected": RANGES[category],
            "title": title,
            "url": FAKE_URLS[category].format(id=idx),
            "paragraphs": paras,
            "subject": row.get("subject", ""),
            "date": row.get("date", ""),
        })
    return picked


def generate_python(articles: list[dict]) -> str:
    """Generate benchmark_articles_isot.py content."""
    lines = [
        '"""',
        "VERITAS Benchmark Dataset (ISOT-based)",
        "========================================",
        "Source: Ahmed H., Traore I., Saad S. (2018).",
        '  "Detecting opinion spams and fake news using text classification."',
        "  Security and Privacy, 1(1), e9.",
        "",
        "Dataset: ISOT Fake News Dataset",
        "  https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset",
        "",
        f"Total articles: {len(articles)}",
        f"  Category A (quality journalism):    {sum(1 for a in articles if a['category']=='A')}",
        f"  Category B (biased / low quality):   {sum(1 for a in articles if a['category']=='B')}",
        f"  Category C (manipulative / fake):    {sum(1 for a in articles if a['category']=='C')}",
        '"""',
        "",
        "ARTICLES = [",
    ]

    for art in articles:
        lines.append("    {")
        lines.append(f'        "id": "{art["id"]}",')
        lines.append(f'        "category": "{art["category"]}",')
        lines.append(f'        "expected": {art["expected"]},')
        # Escape quotes in title
        safe_title = art["title"].replace('"', '\\"')
        lines.append(f'        "title": "{safe_title}",')
        lines.append(f'        "url": "{art["url"]}",')
        lines.append(f'        "paragraphs": [')
        for p in art["paragraphs"]:
            safe_p = p.replace("\\", "\\\\").replace('"', '\\"')
            lines.append(f'            "{safe_p}",')
        lines.append(f'        ],')
        lines.append("    },")

    lines.append("]")
    lines.append("")
    return "\n".join(lines)


def main():
    print("Loading ISOT dataset...")
    true_rows = load_csv("True.csv")
    fake_rows = load_csv("Fake.csv")

    print(f"  True.csv: {len(true_rows)} articles")
    print(f"  Fake.csv: {len(fake_rows)} articles")

    # Category A: Reuters quality journalism
    print(f"\nPicking {N_A} articles for Category A (quality journalism)...")
    cat_a = pick_articles(true_rows, N_A, "A")
    print(f"  → Got {len(cat_a)}")

    # Category B: biased content (politics / left-news — opinion-heavy, but not outright fake)
    fake_b = [r for r in fake_rows if r["subject"] in ("politics", "left-news")]
    print(f"\nPicking {N_B} articles for Category B (biased, from {len(fake_b)} candidates)...")
    cat_b = pick_articles(fake_b, N_B, "B")
    print(f"  → Got {len(cat_b)}")

    # Category C: manipulative/fake (Government News / News — conspiracy, fabricated)
    fake_c = [r for r in fake_rows if r["subject"] in ("Government News", "News", "US_News", "Middle-east")]
    print(f"\nPicking {N_C} articles for Category C (fake, from {len(fake_c)} candidates)...")
    cat_c = pick_articles(fake_c, N_C, "C")
    print(f"  → Got {len(cat_c)}")

    all_articles = cat_a + cat_b + cat_c
    print(f"\nTotal: {len(all_articles)} articles")

    # Generate Python file
    code = generate_python(all_articles)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(code)

    print(f"✅ Written to: {OUTPUT_FILE}")

    # Show sample
    print("\n── Sample articles ──")
    for cat in ["A", "B", "C"]:
        arts = [a for a in all_articles if a["category"] == cat]
        if arts:
            a = arts[0]
            print(f"\n  [{a['id']}] {a['title'][:70]}...")
            print(f"         Paragraphs: {len(a['paragraphs'])}, Subject: {a['subject']}")


if __name__ == "__main__":
    main()
