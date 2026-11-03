**English** | [Українська](README.uk.md)

<p align="center">
  <img src="docs/assets/banner.svg" alt="Veritas: hybrid AI news credibility analyzer" width="100%">
</p>

<p align="center">
  <a href="https://www.python.org/"><img alt="Python" src="https://img.shields.io/badge/python-3.11%2B-3776AB.svg"></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-yellow.svg"></a>
  <a href="https://github.com/MaksymKorchynskyi/veritas-extension-project/commits"><img alt="Last commit" src="https://img.shields.io/github/last-commit/MaksymKorchynskyi/veritas-extension-project"></a>
  <a href="https://github.com/astral-sh/ruff"><img alt="Code style: ruff" src="https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json"></a>
  <img alt="Status: in development" src="https://img.shields.io/badge/status-in%20development-orange.svg">
</p>

# Veritas

A hybrid AI browser extension that estimates the credibility and objectivity of a news article while you read it.

## Overview

Veritas combines three ideas:

- **Large language models (LLMs)** for semantic work: extracting factual claims, counting citations and manipulative phrases.
- **Cross-verification** of those claims against external sources found through DuckDuckGo.
- **A deterministic scoring model** based on the Beta Reputation System (Jøsang & Ismail, 2002), so the final Trust Score is transparent and reproducible from the numbers the LLM agents extracted.

The extension parses the page with Readability.js, sends the article to a local FastAPI backend, and shows the result in a popup, on the page itself (highlighted paragraphs) and on a dedicated analytics page.

## Features

- Real-time analysis of the article you are reading.
- Hybrid pipeline: LLM agents extract evidence, BRS formulas turn it into scores.
- Automatic cross-verification of up to 5 key factual claims.
- Domain reputation: a local table of about 55 known outlets, with an LLM-assisted lookup for unknown domains.
- Score decomposition into Credibility, Transparency and Objectivity, with the formula inputs exposed.
- In-page highlighting of problematic paragraphs.
- Ukrainian and English interface and summaries.
- "Write and analyze" mode for pasting arbitrary text.

## Architecture

```
Browser extension (Readability.js)
        |  POST /analyze  (url, title, paragraphs, language)
        v
FastAPI backend
  1. Claim extraction (LLM)        \  run in parallel
  2. Domain reputation             /
  3. Cross-verification of claims  (query agent -> DuckDuckGo -> verdict agent)
  4. Article metrics (LLM): citations, manipulative phrases, highlights
  5. BRS scoring: Credibility, Transparency, Objectivity -> Trust Score
  6. Final AI summary
        |
        v
Popup / in-page highlights / analytics page
```

| Component | Description |
|-----------|-------------|
| `extension/` | Manifest V3 extension for Chromium browsers: popup, content script, background worker, analytics page. |
| `backend/` | FastAPI service that orchestrates the analysis pipeline. |
| `veritas-landing/` | Promotional landing page (React + Vite). |

### Backend modules

| Module | Role |
|--------|------|
| `app/main.py` | FastAPI application, CORS, `/health`. |
| `app/api/endpoints.py` | `POST /analyze` with an in-memory cache (12 hours). |
| `app/services/pipeline.py` | Orchestrates the whole analysis. |
| `app/services/llm/base_agent.py` | Gemini client with structured outputs, retries and model fallback. |
| `app/services/llm/claim_extractor.py` | Extracts up to 5 verifiable factual claims. |
| `app/services/llm/article_metrics_extractor.py` | Counts citations and manipulative phrases, produces highlights. |
| `app/services/cross_verification.py` | Search query generation, DuckDuckGo search, claim verdicts, domain lookup. |
| `app/services/domain_reputation.py` | Local domain reputation table. |
| `app/services/scoring.py` | BRS formulas and Trust Score aggregation. |
| `app/models/schemas.py` | Pydantic request, response and agent schemas. |

### Repository layout

```
.
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   │   └── llm/
│   │   ├── utils.py
│   │   └── main.py
│   ├── tests/              # benchmark scripts and dashboard
│   └── requirements.txt
├── extension/
├── veritas-landing/
├── docs/assets/banner.svg
├── LICENSE
├── README.md
└── README.uk.md
```

## Installation

### Requirements

- Python 3.11 or newer
- A Chromium-based browser (Chrome, Edge, Brave, Opera)
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
- Node.js, only if you want to run the landing page

### 1. Clone the repository

```bash
git clone https://github.com/MaksymKorchynskyi/veritas-extension-project.git
cd veritas-extension-project
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows
pip install -r requirements.txt
```

### 3. Configure the API key

Create `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Without a key the server still starts, but the AI agents are disabled and the analysis returns neutral results.

### 4. Run the server

```bash
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Check that it is running: `http://127.0.0.1:8000/health`

### 5. Load the extension

1. Open `chrome://extensions/` (or `edge://extensions/`).
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `extension/` folder.
4. Pin the extension to the toolbar.

## Usage

### In the browser

1. Make sure the backend is running.
2. Open a news article.
3. Click the Veritas icon and press the analyze button.
4. Wait 5 to 15 seconds. The popup shows the Trust Score (0 to 100), the three criteria, highlighted paragraphs and an AI summary.
5. Open the analytics page from the popup to see the formula inputs, extracted claims and cross-verification results.

### Through the API

```bash
curl -X POST http://127.0.0.1:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/news/article",
    "title": "Example headline",
    "html_content": "<p>First paragraph of the article ...</p>",
    "paragraphs": [
      {"id": 1, "text": "First paragraph of the article, long enough to analyze ..."},
      {"id": 2, "text": "Second paragraph ..."}
    ],
    "language": "en"
  }'
```

The response contains `trust_score`, `criteria` (`credibility`, `transparency`, `objectivity`), `explainer`, `highlights`, `scoring_inputs` and `extracted_claims`. The article text must be at least 50 characters long and the title must not be empty.

## Configuration

| Setting | Where | Default |
|---------|-------|---------|
| `GEMINI_API_KEY` | `backend/.env` | none (AI agents disabled) |
| Primary model | `MODEL_NAME` in `app/services/llm/base_agent.py` | `gemini-2.5-flash` |
| Fallback model | `FALLBACK_MODEL_NAME` in the same file | `gemini-3-flash-preview` |
| Response cache TTL | `CACHE_TTL` in `app/api/endpoints.py` | 12 hours |
| Backend URL used by the extension | `BASE_URL` in `extension/background.js` (the health check in `popup.js` is hardcoded too) | `http://127.0.0.1:8000` |

## Scoring model

Each criterion is an expected value of the Beta Reputation System:

```
E(p) = (r + W * a) / (r + s + W)
```

| Symbol | Meaning |
|--------|---------|
| `r` | Positive evidence (confirmed claims, citations) |
| `s` | Negative evidence (contradicted claims, manipulative phrases, unverified claims) |
| `W` | Weight of the prior, 2 by default |
| `a` | Base rate (the domain reputation for Credibility) |

```
Trust Score = 0.5 * Credibility + 0.3 * Transparency + 0.2 * Objectivity
```

When Credibility is below 50, the result is multiplied by a discount of `0.5 + Credibility / 100`. The implementation is in `backend/app/services/scoring.py`.

## Testing and benchmarks

The repository ships benchmark scripts rather than unit tests. They send curated article sets (reliable, mixed, fake) to a running backend and write results to `backend/tests/results/`, which is not tracked by git. They call the Gemini API, so a valid key and available quota are required.

```bash
cd backend
python tests/benchmark_articles.py
python tests/visualize_results.py
```

Benchmark numbers are not published in this README. Run the scripts to reproduce them.

## Roadmap

- Offline unit tests for the scoring module and utilities.
- Pinned dependencies and a continuous integration workflow.
- Linting and formatting configuration (`pyproject.toml`).
- A persistent, bounded response cache.
- Configurable CORS and request timeouts for LLM calls.

## Contributing

Issues and pull requests are welcome. For larger changes, please open an issue first to discuss the idea. Keep changes focused, follow PEP 8, and do not commit API keys or `.env` files.

## License

Released under the [MIT License](LICENSE).

## Reference

Jøsang, A. and Ismail, R. (2002). "The Beta Reputation System." Proceedings of the 15th Bled Electronic Commerce Conference, pp. 324-337.
