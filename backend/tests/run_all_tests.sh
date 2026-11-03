#!/usr/bin/env bash
# Запускає тести та бенчмарки VERITAS з каталогу backend.
#
#   tests/run_all_tests.sh [all|unit|bench|charts]
#
# unit   - офлайн юніт-тести (pytest), ключ Gemini не потрібен
# bench  - бенчмарк на 50 статтях ISOT (потрібні запущений сервер і GEMINI_API_KEY)
# charts - графіки за останніми результатами бенчмарку
set -euo pipefail

cd "$(dirname "$0")/.."

mode="${1:-all}"

if [[ "$mode" == "all" || "$mode" == "unit" ]]; then
    echo "--- Step 1: unit tests ---"
    python -m pytest -q
fi

if [[ "$mode" == "all" || "$mode" == "bench" ]]; then
    echo "--- Step 2: API benchmark (ISOT, 50 articles) ---"
    python -m tests.benchmark_articles
fi

if [[ "$mode" == "all" || "$mode" == "charts" ]]; then
    echo "--- Step 3: charts ---"
    python -m tests.visualize_results
fi

if [[ "$mode" == "all" ]]; then
    echo "--- Step 4: manual E2E dashboard ---"
    echo "Open in a browser: file://$(pwd)/tests/test_dashboard.html"
fi

echo "Done."
