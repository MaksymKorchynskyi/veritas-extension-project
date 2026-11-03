"""Будує бенчмарк-датасет VERITAS з ISOT Fake News Dataset.

Джерело: Ahmed et al. (2018) — https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset

Відповідність категорій::

    True.csv  (Reuters)                              -> A (якісна журналістика)
    Fake.csv  subject = politics / left-news          -> B (упереджені / низької якості)
    Fake.csv  subject = Government News / News / ...  -> C (маніпулятивні / фейкові)

Запуск (з каталогу backend)::

    python -m tests.build_dataset_from_isot
"""

import csv
import logging
import random
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

DATA_DIR = Path(
    "~/.cache/kagglehub/datasets/clmentbisaillon/fake-and-real-news-dataset/versions/1"
).expanduser()
OUTPUT_FILE = Path(__file__).parent / "benchmark_articles_isot.py"

SEED = 42  # відтворюваність вибірки

N_A = 20  # якісна журналістика
N_B = 15  # упереджений контент
N_C = 15  # маніпулятивні / фейкові

# Очікувані діапазони Trust Score
RANGES = {"A": (60, 100), "B": (25, 60), "C": (0, 30)}

# Вигадані URL за категоріями (впливають на репутацію домену)
FAKE_URLS = {
    "A": "https://www.reuters.com/world/article/{id}",
    "B": "https://politicalbias-news.com/articles/{id}",
    "C": "https://conspiracy-daily.info/post/{id}",
}

MIN_TITLE_CHARS = 15
MIN_PARAGRAPH_WORDS = 20
MAX_PARAGRAPH_WORDS = 300
MIN_SENTENCE_CHARS = 30
SENTENCES_PER_CHUNK = 2

Row = dict[str, str]
Article = dict[str, Any]


def load_csv(filename: str) -> list[Row]:
    """Читає CSV-файл датасету ISOT."""
    with (DATA_DIR / filename).open(encoding="utf-8") as f:
        return list(csv.DictReader(f))


def text_to_paragraphs(text: str, min_paras: int = 4, max_paras: int = 7) -> list[str] | None:
    """Ділить текст статті на абзаци; повертає None, якщо стаття закоротка."""
    # Прибираємо заголовок Reuters на кшталт "WASHINGTON (Reuters) - "
    if "(Reuters)" in text[:80]:
        dash = text.find(" - ", 0, 120)
        if dash != -1:
            text = text[dash + 3 :]

    raw = [p.strip() for p in text.split("\n") if p.strip()]

    # Якщо лише один великий блок — ділимо за реченнями на фрагменти по 2-3 речення
    if len(raw) < min_paras:
        sentences = [
            s.strip()
            for s in text.replace(". ", ".\n").split("\n")
            if len(s.strip()) > MIN_SENTENCE_CHARS
        ]
        raw = []
        chunk: list[str] = []
        for sentence in sentences:
            chunk.append(sentence)
            if len(chunk) >= SENTENCES_PER_CHUNK:
                raw.append(" ".join(chunk))
                chunk = []
        if chunk:
            raw.append(" ".join(chunk))

    if len(raw) < min_paras:
        return None

    paras = [
        p for p in raw[:max_paras] if MIN_PARAGRAPH_WORDS <= len(p.split()) <= MAX_PARAGRAPH_WORDS
    ]
    if len(paras) < min_paras:
        return None

    return paras[:max_paras]


def pick_articles(rows: list[Row], n: int, category: str, rng: random.Random) -> list[Article]:
    """Обирає `n` статей із коректною структурою абзаців."""
    rng.shuffle(rows)
    picked: list[Article] = []
    for row in rows:
        if len(picked) >= n:
            break
        title = row["title"].strip()
        if len(title) < MIN_TITLE_CHARS:
            continue
        paras = text_to_paragraphs(row["text"])
        if paras is None:
            continue
        idx = len(picked) + 1
        picked.append(
            {
                "id": f"{category}{idx}",
                "category": category,
                "expected": RANGES[category],
                "title": title,
                "url": FAKE_URLS[category].format(id=idx),
                "paragraphs": paras,
                "subject": row.get("subject", ""),
                "date": row.get("date", ""),
            }
        )
    return picked


def generate_python(articles: list[Article]) -> str:
    """Генерує вміст `benchmark_articles_isot.py`."""
    counts = {cat: sum(1 for a in articles if a["category"] == cat) for cat in "ABC"}
    lines = [
        '"""VERITAS Benchmark Dataset (ISOT-based).',
        "",
        "Source: Ahmed H., Traore I., Saad S. (2018).",
        '  "Detecting opinion spams and fake news using text classification."',
        "  Security and Privacy, 1(1), e9.",
        "",
        "Dataset: ISOT Fake News Dataset",
        "  https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset",
        "",
        f"Total articles: {len(articles)}",
        f"  Category A (quality journalism):    {counts['A']}",
        f"  Category B (biased / low quality):   {counts['B']}",
        f"  Category C (manipulative / fake):    {counts['C']}",
        '"""',
        "",
        "from typing import Any",
        "",
        "ARTICLES: list[dict[str, Any]] = [",
    ]

    for art in articles:
        safe_title = art["title"].replace('"', '\\"')
        lines += [
            "    {",
            f'        "id": "{art["id"]}",',
            f'        "category": "{art["category"]}",',
            f'        "expected": {art["expected"]},',
            f'        "title": "{safe_title}",',
            f'        "url": "{art["url"]}",',
            '        "paragraphs": [',
        ]
        for paragraph in art["paragraphs"]:
            safe_p = paragraph.replace("\\", "\\\\").replace('"', '\\"')
            lines.append(f'            "{safe_p}",')
        lines += ["        ],", "    },"]

    lines += ["]", ""]
    return "\n".join(lines)


def main() -> None:
    """Збирає вибірку з ISOT та записує `benchmark_articles_isot.py`."""
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    rng = random.Random(SEED)  # noqa: S311 - відтворювана вибірка, не криптографія

    logger.info("Loading ISOT dataset...")
    true_rows = load_csv("True.csv")
    fake_rows = load_csv("Fake.csv")
    logger.info("  True.csv: %d articles", len(true_rows))
    logger.info("  Fake.csv: %d articles", len(fake_rows))

    logger.info("\nPicking %d articles for Category A (quality journalism)...", N_A)
    cat_a = pick_articles(true_rows, N_A, "A", rng)
    logger.info("  -> Got %d", len(cat_a))

    # B: упереджений контент (politics / left-news — багато суджень, але не відверті фейки)
    fake_b = [r for r in fake_rows if r["subject"] in ("politics", "left-news")]
    logger.info(
        "\nPicking %d articles for Category B (biased, from %d candidates)...", N_B, len(fake_b)
    )
    cat_b = pick_articles(fake_b, N_B, "B", rng)
    logger.info("  -> Got %d", len(cat_b))

    # C: маніпулятивні / фейкові (змови, вигадані новини)
    fake_c = [
        r
        for r in fake_rows
        if r["subject"] in ("Government News", "News", "US_News", "Middle-east")
    ]
    logger.info(
        "\nPicking %d articles for Category C (fake, from %d candidates)...", N_C, len(fake_c)
    )
    cat_c = pick_articles(fake_c, N_C, "C", rng)
    logger.info("  -> Got %d", len(cat_c))

    all_articles = cat_a + cat_b + cat_c
    logger.info("\nTotal: %d articles", len(all_articles))

    OUTPUT_FILE.write_text(generate_python(all_articles), encoding="utf-8")
    logger.info("Written to: %s", OUTPUT_FILE)

    logger.info("\n-- Sample articles --")
    for cat in "ABC":
        sample = next((a for a in all_articles if a["category"] == cat), None)
        if sample:
            logger.info("\n  [%s] %s...", sample["id"], sample["title"][:70])
            logger.info(
                "         Paragraphs: %d, Subject: %s", len(sample["paragraphs"]), sample["subject"]
            )


if __name__ == "__main__":
    main()
