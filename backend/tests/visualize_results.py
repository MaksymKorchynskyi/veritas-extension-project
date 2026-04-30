
import csv
import sys
from pathlib import Path

try:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import numpy as np
except ImportError:
    print("❌ Install dependencies: pip install matplotlib numpy")
    sys.exit(1)

RESULTS_DIR = Path(__file__).parent / "results"
CSV_PATH = RESULTS_DIR / "latest_results.csv"

COLORS = {
    "A": "#33691E",
    "B": "#C58940",
    "C": "#8D2D24",
    "D": "#795548",
}
BG_COLOR = "#EFE9E1"
TEXT_COLOR = "#3E2723"


def load_results():
    if not CSV_PATH.exists():
        print(f"❌ No results found at {CSV_PATH}")
        print("   Run benchmark first: python tests/benchmark_articles.py")
        sys.exit(1)

    with open(CSV_PATH, "r", encoding="utf-8") as f:
        data = list(csv.DictReader(f))
    print(f"  Loaded {len(data)} results from {CSV_PATH}")
    return data


def chart_trust_by_category(results):
    """Bar chart: average Trust Score per category."""
    categories = {}
    for r in results:
        cat = r["category"]
        categories.setdefault(cat, []).append(float(r["trust_score"]))

    cats_sorted = sorted(categories.keys())
    labels_map = {"A": "A: Якісні", "B": "B: Середні", "C": "C: Маніпулятивні", "D": "D: Edge Cases"}
    labels = [labels_map.get(c, c) for c in cats_sorted]
    means = [np.mean(categories[c]) for c in cats_sorted]
    stds = [np.std(categories[c]) if len(categories[c]) > 1 else 0 for c in cats_sorted]
    colors = [COLORS.get(c, "#795548") for c in cats_sorted]

    fig, ax = plt.subplots(figsize=(9, 5))
    fig.patch.set_facecolor(BG_COLOR)
    ax.set_facecolor(BG_COLOR)

    bars = ax.bar(labels, means, yerr=stds, capsize=8, color=colors, alpha=0.9,
                  edgecolor=TEXT_COLOR, linewidth=0.5)

    for bar, mean in zip(bars, means):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 2.5,
                f"{mean:.1f}", ha="center", fontweight="bold", fontsize=13, color=TEXT_COLOR)

    ax.set_ylabel("Trust Score (0–100)", fontsize=12, color=TEXT_COLOR)
    ax.set_title("VERITAS WMFA: Середній Trust Score за категоріями", fontsize=14,
                 fontweight="bold", color=TEXT_COLOR, pad=15)
    ax.set_ylim(0, 110)
    ax.tick_params(colors=TEXT_COLOR)

    ax.axhline(y=70, color="#33691E", linestyle="--", alpha=0.4, linewidth=1)
    ax.axhline(y=40, color="#8D2D24", linestyle="--", alpha=0.4, linewidth=1)
    ax.text(len(labels) - 0.5, 72, "High Trust (70)", fontsize=8, color="#33691E", alpha=0.7)
    ax.text(len(labels) - 0.5, 42, "Low Trust (40)", fontsize=8, color="#8D2D24", alpha=0.7)

    plt.tight_layout()
    out = RESULTS_DIR / "chart_trust_by_category.png"
    plt.savefig(out, dpi=200, facecolor=BG_COLOR)
    plt.close()
    print(f"  ✅ Saved: {out}")


def chart_radar(results):
    """Radar chart comparing criteria across A vs C categories."""
    criteria_keys = ["credibility", "transparency", "objectivity"]

    criteria_labels = ["Точність (Acc)", "Джерела (Auth)", "Об'єктивність (Obj)"]

    fig, ax = plt.subplots(figsize=(7, 7), subplot_kw=dict(polar=True))
    fig.patch.set_facecolor(BG_COLOR)
    ax.set_facecolor(BG_COLOR)

    angles = np.linspace(0, 2 * np.pi, len(criteria_keys), endpoint=False).tolist()
    angles += angles[:1]

    for cat, color, label in [("A", "#33691E", "Якісні (A)"), ("C", "#8D2D24", "Маніпулятивні (C)")]:
        cat_results = [r for r in results if r["category"] == cat]
        if not cat_results:
            continue

        values = []
        for key in criteria_keys:
            vals = [float(r[key]) for r in cat_results]
            values.append(np.mean(vals))
        values += values[:1]

        ax.plot(angles, values, "o-", linewidth=2.5, label=label, color=color, markersize=6)
        ax.fill(angles, values, alpha=0.12, color=color)

    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(criteria_labels, fontsize=11, color=TEXT_COLOR)
    ax.set_ylim(0, 100)
    ax.set_title("Radar: порівняння критеріїв A vs C", fontsize=14,
                 fontweight="bold", color=TEXT_COLOR, pad=20)
    ax.legend(loc="upper right", bbox_to_anchor=(1.3, 1.1), fontsize=11)

    plt.tight_layout()
    out = RESULTS_DIR / "chart_radar.png"
    plt.savefig(out, dpi=200, facecolor=BG_COLOR, bbox_inches="tight")
    plt.close()
    print(f"  ✅ Saved: {out}")


def chart_scatter(results):
    """Scatter plot: all Trust Scores by article ID with category coloring."""
    fig, ax = plt.subplots(figsize=(12, 5))
    fig.patch.set_facecolor(BG_COLOR)
    ax.set_facecolor(BG_COLOR)

    for i, r in enumerate(results):
        cat = r["category"]
        color = COLORS.get(cat, "#795548")
        ax.scatter(r["id"], float(r["trust_score"]), color=color, s=120, zorder=3,
                   edgecolors=TEXT_COLOR, linewidths=0.5)
        ax.annotate(f'{float(r["trust_score"]):.0f}', (r["id"], float(r["trust_score"])),
                    textcoords="offset points", xytext=(0, 10), ha="center",
                    fontsize=9, fontweight="bold", color=TEXT_COLOR)

    ax.axhline(y=70, color="#33691E", linestyle="--", alpha=0.5, linewidth=1, label="High (70)")
    ax.axhline(y=40, color="#8D2D24", linestyle="--", alpha=0.5, linewidth=1, label="Low (40)")

    import matplotlib.patches as mpatches
    legend_items = [mpatches.Patch(color=COLORS[c], label=f'{c}: {l}')
                    for c, l in [("A", "Якісні"), ("B", "Середні"), ("C", "Маніпулятивні"), ("D", "Edge Cases")]
                    if c in COLORS]
    ax.legend(handles=legend_items, loc="upper right", fontsize=10)

    ax.set_ylabel("Trust Score", fontsize=12, color=TEXT_COLOR)
    ax.set_xlabel("Article ID", fontsize=12, color=TEXT_COLOR)
    ax.set_title("VERITAS: розподіл Trust Score по датасету", fontsize=14,
                 fontweight="bold", color=TEXT_COLOR, pad=15)
    ax.set_ylim(-5, 110)
    ax.tick_params(colors=TEXT_COLOR)
    plt.xticks(rotation=45)

    plt.tight_layout()
    out = RESULTS_DIR / "chart_distribution.png"
    plt.savefig(out, dpi=200, facecolor=BG_COLOR)
    plt.close()
    print(f"  ✅ Saved: {out}")


def chart_criteria_heatmap(results):
    """Heatmap of all criteria for each article — great for coursework."""
    criteria_keys = ["credibility", "transparency", "objectivity"]

    criteria_labels = ["Acc", "Auth", "Obj"]

    ids = [r["id"] for r in results]
    data = []
    for r in results:
        row = [float(r[k]) for k in criteria_keys]
        data.append(row)
    data = np.array(data)

    fig, ax = plt.subplots(figsize=(8, max(4, len(results) * 0.45)))
    fig.patch.set_facecolor(BG_COLOR)

    from matplotlib.colors import LinearSegmentedColormap
    cmap = LinearSegmentedColormap.from_list("veritas",
        ["#8D2D24", "#C58940", "#C5B358", "#7CB342", "#33691E"])

    im = ax.imshow(data, aspect="auto", cmap=cmap, vmin=0, vmax=100)

    ax.set_xticks(range(len(criteria_labels)))
    ax.set_xticklabels(criteria_labels, fontsize=11, color=TEXT_COLOR)
    ax.set_yticks(range(len(ids)))
    ax.set_yticklabels(ids, fontsize=10, color=TEXT_COLOR)

    for i in range(len(ids)):
        for j in range(len(criteria_keys)):
            val = data[i, j]
            text_c = "white" if val < 40 else TEXT_COLOR
            ax.text(j, i, f"{val:.0f}", ha="center", va="center",
                    fontsize=9, fontweight="bold", color=text_c)

    ax.set_title("Heatmap: критерії по кожній статті", fontsize=13,
                 fontweight="bold", color=TEXT_COLOR, pad=10)
    plt.colorbar(im, ax=ax, label="Score (0–100)", shrink=0.8)
    plt.tight_layout()

    out = RESULTS_DIR / "chart_heatmap.png"
    plt.savefig(out, dpi=200, facecolor=BG_COLOR)
    plt.close()
    print(f"  ✅ Saved: {out}")


if __name__ == "__main__":
    print("\n" + "=" * 50)
    print("  📊 VERITAS Results Visualizer")
    print("=" * 50)

    results = load_results()

    chart_trust_by_category(results)
    chart_radar(results)
    chart_scatter(results)
    chart_criteria_heatmap(results)

    print("\n  🎉 All charts saved to:", RESULTS_DIR)
    print("=" * 50 + "\n")
