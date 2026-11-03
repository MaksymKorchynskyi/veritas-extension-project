"""Візуалізація результатів бенчмарку VERITAS: графіки з `results/latest_results.csv`.

Запуск (з каталогу backend)::

    python -m tests.visualize_results
"""

import csv
import logging
import sys
from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # неінтерактивний бекенд: графіки лише зберігаються у файли

import matplotlib.patches as mpatches
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import LinearSegmentedColormap

logger = logging.getLogger(__name__)

RESULTS_DIR = Path(__file__).parent / "results"
CSV_PATH = RESULTS_DIR / "latest_results.csv"

COLORS = {
    "A": "#33691E",  # Forest Green
    "B": "#C58940",  # Caramel
    "C": "#8D2D24",  # Burnt Cherry
    "D": "#795548",  # Cocoa
}
DEFAULT_COLOR = "#795548"
BG_COLOR = "#EFE9E1"
TEXT_COLOR = "#3E2723"
HIGH_TRUST = 70
LOW_TRUST = 40
CRITERIA_KEYS = ["credibility", "transparency", "objectivity"]
CATEGORY_NAMES = {"A": "Якісні", "B": "Середні", "C": "Маніпулятивні", "D": "Edge Cases"}

Row = dict[str, str]


def load_results() -> list[Row]:
    """Читає результати бенчмарку; завершує програму, якщо файлу немає."""
    if not CSV_PATH.exists():
        logger.error("No results found at %s", CSV_PATH)
        logger.error("   Run benchmark first: python -m tests.benchmark_articles")
        sys.exit(1)

    with CSV_PATH.open(encoding="utf-8") as f:
        data = list(csv.DictReader(f))
    logger.info("  Loaded %d results from %s", len(data), CSV_PATH)
    return data


def _save(fig_path: Path, bbox_inches: str | None = None) -> None:
    plt.savefig(fig_path, dpi=200, facecolor=BG_COLOR, bbox_inches=bbox_inches)
    plt.close()
    logger.info("  Saved: %s", fig_path)


def chart_trust_by_category(results: list[Row]) -> None:
    """Стовпчикова діаграма: середній Trust Score за категоріями."""
    categories: dict[str, list[float]] = {}
    for r in results:
        categories.setdefault(r["category"], []).append(float(r["trust_score"]))

    cats_sorted = sorted(categories)
    labels_map = {c: f"{c}: {name}" for c, name in CATEGORY_NAMES.items()}
    labels = [labels_map.get(c, c) for c in cats_sorted]
    means = [np.mean(categories[c]) for c in cats_sorted]
    stds = [np.std(categories[c]) if len(categories[c]) > 1 else 0 for c in cats_sorted]
    colors = [COLORS.get(c, DEFAULT_COLOR) for c in cats_sorted]

    fig, ax = plt.subplots(figsize=(9, 5))
    fig.patch.set_facecolor(BG_COLOR)
    ax.set_facecolor(BG_COLOR)

    bars = ax.bar(
        labels,
        means,
        yerr=stds,
        capsize=8,
        color=colors,
        alpha=0.9,
        edgecolor=TEXT_COLOR,
        linewidth=0.5,
    )

    for bar, mean in zip(bars, means, strict=True):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 2.5,
            f"{mean:.1f}",
            ha="center",
            fontweight="bold",
            fontsize=13,
            color=TEXT_COLOR,
        )

    ax.set_ylabel("Trust Score (0–100)", fontsize=12, color=TEXT_COLOR)
    ax.set_title(
        "VERITAS WMFA: Середній Trust Score за категоріями",
        fontsize=14,
        fontweight="bold",
        color=TEXT_COLOR,
        pad=15,
    )
    ax.set_ylim(0, 110)
    ax.tick_params(colors=TEXT_COLOR)

    ax.axhline(y=HIGH_TRUST, color=COLORS["A"], linestyle="--", alpha=0.4, linewidth=1)
    ax.axhline(y=LOW_TRUST, color=COLORS["C"], linestyle="--", alpha=0.4, linewidth=1)
    ax.text(len(labels) - 0.5, 72, "High Trust (70)", fontsize=8, color=COLORS["A"], alpha=0.7)
    ax.text(len(labels) - 0.5, 42, "Low Trust (40)", fontsize=8, color=COLORS["C"], alpha=0.7)

    plt.tight_layout()
    _save(RESULTS_DIR / "chart_trust_by_category.png")


def chart_radar(results: list[Row]) -> None:
    """Радарна діаграма: порівняння критеріїв категорій A та C."""
    criteria_labels = ["Точність (Acc)", "Джерела (Auth)", "Об'єктивність (Obj)"]

    fig, ax = plt.subplots(figsize=(7, 7), subplot_kw={"polar": True})
    fig.patch.set_facecolor(BG_COLOR)
    ax.set_facecolor(BG_COLOR)

    angles = np.linspace(0, 2 * np.pi, len(CRITERIA_KEYS), endpoint=False).tolist()
    angles += angles[:1]

    for cat, color, label in [
        ("A", COLORS["A"], "Якісні (A)"),
        ("C", COLORS["C"], "Маніпулятивні (C)"),
    ]:
        cat_results = [r for r in results if r["category"] == cat]
        if not cat_results:
            continue

        values = [float(np.mean([float(r[key]) for r in cat_results])) for key in CRITERIA_KEYS]
        values += values[:1]

        ax.plot(angles, values, "o-", linewidth=2.5, label=label, color=color, markersize=6)
        ax.fill(angles, values, alpha=0.12, color=color)

    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(criteria_labels, fontsize=11, color=TEXT_COLOR)
    ax.set_ylim(0, 100)
    ax.set_title(
        "Radar: порівняння критеріїв A vs C",
        fontsize=14,
        fontweight="bold",
        color=TEXT_COLOR,
        pad=20,
    )
    ax.legend(loc="upper right", bbox_to_anchor=(1.3, 1.1), fontsize=11)

    plt.tight_layout()
    _save(RESULTS_DIR / "chart_radar.png", bbox_inches="tight")


def chart_scatter(results: list[Row]) -> None:
    """Точкова діаграма: Trust Score кожної статті з розфарбуванням за категорією."""
    fig, ax = plt.subplots(figsize=(12, 5))
    fig.patch.set_facecolor(BG_COLOR)
    ax.set_facecolor(BG_COLOR)

    for r in results:
        color = COLORS.get(r["category"], DEFAULT_COLOR)
        score = float(r["trust_score"])
        ax.scatter(
            r["id"], score, color=color, s=120, zorder=3, edgecolors=TEXT_COLOR, linewidths=0.5
        )
        ax.annotate(
            f"{score:.0f}",
            (r["id"], score),
            textcoords="offset points",
            xytext=(0, 10),
            ha="center",
            fontsize=9,
            fontweight="bold",
            color=TEXT_COLOR,
        )

    ax.axhline(
        y=HIGH_TRUST, color=COLORS["A"], linestyle="--", alpha=0.5, linewidth=1, label="High (70)"
    )
    ax.axhline(
        y=LOW_TRUST, color=COLORS["C"], linestyle="--", alpha=0.5, linewidth=1, label="Low (40)"
    )

    legend_items = [
        mpatches.Patch(color=COLORS[c], label=f"{c}: {name}") for c, name in CATEGORY_NAMES.items()
    ]
    ax.legend(handles=legend_items, loc="upper right", fontsize=10)

    ax.set_ylabel("Trust Score", fontsize=12, color=TEXT_COLOR)
    ax.set_xlabel("Article ID", fontsize=12, color=TEXT_COLOR)
    ax.set_title(
        "VERITAS: розподіл Trust Score по датасету",
        fontsize=14,
        fontweight="bold",
        color=TEXT_COLOR,
        pad=15,
    )
    ax.set_ylim(-5, 110)
    ax.tick_params(colors=TEXT_COLOR)
    plt.xticks(rotation=45)

    plt.tight_layout()
    _save(RESULTS_DIR / "chart_distribution.png")


def chart_criteria_heatmap(results: list[Row]) -> None:
    """Теплова карта критеріїв для кожної статті."""
    criteria_labels = ["Acc", "Auth", "Obj"]

    ids = [r["id"] for r in results]
    data = np.array([[float(r[k]) for k in CRITERIA_KEYS] for r in results])

    fig, ax = plt.subplots(figsize=(8, max(4, len(results) * 0.45)))
    fig.patch.set_facecolor(BG_COLOR)

    cmap = LinearSegmentedColormap.from_list(
        "veritas", ["#8D2D24", "#C58940", "#C5B358", "#7CB342", "#33691E"]
    )
    image = ax.imshow(data, aspect="auto", cmap=cmap, vmin=0, vmax=100)

    ax.set_xticks(range(len(criteria_labels)))
    ax.set_xticklabels(criteria_labels, fontsize=11, color=TEXT_COLOR)
    ax.set_yticks(range(len(ids)))
    ax.set_yticklabels(ids, fontsize=10, color=TEXT_COLOR)

    for i in range(len(ids)):
        for j in range(len(CRITERIA_KEYS)):
            value = data[i, j]
            ax.text(
                j,
                i,
                f"{value:.0f}",
                ha="center",
                va="center",
                fontsize=9,
                fontweight="bold",
                color="white" if value < LOW_TRUST else TEXT_COLOR,
            )

    ax.set_title(
        "Heatmap: критерії по кожній статті",
        fontsize=13,
        fontweight="bold",
        color=TEXT_COLOR,
        pad=10,
    )
    plt.colorbar(image, ax=ax, label="Score (0–100)", shrink=0.8)
    plt.tight_layout()

    _save(RESULTS_DIR / "chart_heatmap.png")


def main() -> None:
    """Будує всі графіки за останніми результатами бенчмарку."""
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    logger.info("\n%s\n  VERITAS Results Visualizer\n%s", "=" * 50, "=" * 50)

    results = load_results()

    chart_trust_by_category(results)
    chart_radar(results)
    chart_scatter(results)
    chart_criteria_heatmap(results)

    logger.info("\n  All charts saved to: %s\n%s\n", RESULTS_DIR, "=" * 50)


if __name__ == "__main__":
    main()
