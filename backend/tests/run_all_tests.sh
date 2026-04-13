#!/bin/bash
# =============================================================================
# VERITAS — Full Test Pipeline
# =============================================================================
# Usage:
#   chmod +x tests/run_all_tests.sh
#   ./tests/run_all_tests.sh          — Run all tests
#   ./tests/run_all_tests.sh unit     — Only unit tests
#   ./tests/run_all_tests.sh bench    — Only benchmark
#   ./tests/run_all_tests.sh charts   — Only charts
# =============================================================================

set -e

cd "$(dirname "$0")/.."
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║        🧪 VERITAS Full Test Pipeline             ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

MODE="${1:-all}"

# ─── Step 1: Unit Tests ───
if [[ "$MODE" == "all" || "$MODE" == "unit" ]]; then
    echo "━━━ Step 1: Unit Tests (scoring.py + utils.py) ━━━"
    echo ""
    python -m pytest tests/test_scoring.py tests/test_utils.py -v --tb=short -q
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Unit tests FAILED! Fix before proceeding."
        exit 1
    fi
    echo ""
    echo "✅ Unit tests passed!"
    echo ""
fi

# ─── Step 2: Benchmark ───
if [[ "$MODE" == "all" || "$MODE" == "bench" ]]; then
    echo "━━━ Step 2: API Benchmark (14 articles) ━━━"
    echo ""
    python tests/benchmark_articles.py
    echo ""
fi

# ─── Step 3: Charts ───
if [[ "$MODE" == "all" || "$MODE" == "charts" ]]; then
    echo "━━━ Step 3: Generate Charts ━━━"
    echo ""
    python tests/visualize_results.py
    echo ""
fi

# ─── Step 4: Dashboard ───
if [[ "$MODE" == "all" ]]; then
    echo "━━━ Step 4: Chrome Test Dashboard ━━━"
    echo ""
    echo "  Open this file in Chrome for manual E2E testing:"
    echo "  file://$(pwd)/tests/test_dashboard.html"
    echo ""
fi

echo "╔══════════════════════════════════════════════════╗"
echo "║           ✅ Test pipeline complete!              ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
