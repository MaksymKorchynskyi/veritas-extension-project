**English** | [Українська](README.uk.md)

<p align="center">
  <img src="docs/assets/banner.svg" alt="Veritas: hybrid AI news credibility analyzer" width="100%">
</p>

<p align="center">
  <a href="https://www.python.org/"><img alt="Python" src="https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white"></a>
  <a href="https://fastapi.tiangolo.com/"><img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-async-009688?logo=fastapi&logoColor=white"></a>
  <a href="https://docs.pydantic.dev/"><img alt="Pydantic" src="https://img.shields.io/badge/Pydantic-v2-E92063?logo=pydantic&logoColor=white"></a>
  <a href="https://ai.google.dev/"><img alt="Google Gemini" src="https://img.shields.io/badge/Google%20Gemini-LLM-8E75B2?logo=googlegemini&logoColor=white"></a>
  <a href="https://python.useinstructor.com/"><img alt="Instructor" src="https://img.shields.io/badge/Instructor-structured%20outputs-1F2937"></a>
  <a href="https://pypi.org/project/ddgs/"><img alt="DuckDuckGo search" src="https://img.shields.io/badge/DuckDuckGo-cross--verification-DE5833?logo=duckduckgo&logoColor=white"></a>
  <a href="https://developer.chrome.com/docs/extensions/mv3/intro/"><img alt="Chrome Extension MV3" src="https://img.shields.io/badge/Chrome%20Extension-MV3-4285F4?logo=googlechrome&logoColor=white"></a>
  <a href="https://github.com/astral-sh/ruff"><img alt="Code style: ruff" src="https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json"></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-yellow.svg"></a>
</p>

# Veritas

A browser extension that estimates the credibility and objectivity of a news article while you read it. LLM agents extract claims, citations and manipulative phrases, the claims are cross-verified through DuckDuckGo, and a deterministic Beta Reputation System model (Jøsang & Ismail, 2002) turns that evidence into a transparent Trust Score.

**Features:** real-time analysis, cross-verification of up to 5 claims, domain reputation (54 known outlets plus an LLM lookup), Credibility / Transparency / Objectivity breakdown with visible formula inputs, in-page highlights, Ukrainian and English UI, and a "write and analyze" mode for pasted text.

## Engineering highlights

- **Hybrid design:** LLMs only extract evidence (claims, citations, manipulative phrases); every score is computed by a deterministic, unit-testable BRS model, so results are explainable and reproducible.
- **Async pipeline:** FastAPI + `asyncio.gather` run independent agents in parallel; claim verification fans out one task per claim.
- **Typed LLM I/O:** Gemini responses are parsed through `instructor` into Pydantic v2 models, so malformed output fails validation instead of leaking into scoring.
- **Resilience:** retries with backoff, primary/fallback model switching, search timeouts and graceful degradation to neutral scores when an agent or the search fails.
- **Cross-verification:** each claim goes through query generation, a DuckDuckGo search and an evidence-based verdict (confirmed, contradicted, unverified).
- **Evaluation harness:** benchmark scripts run curated article sets (including the ISOT Fake News dataset) through the API and produce charts and a test dashboard.
- **Full stack:** Manifest V3 extension (Readability.js, content script, service worker), Python backend and a React + Vite landing page.

## Architecture

```mermaid
flowchart LR
    A["Extension<br/>Readability.js"] -->|"POST /analyze"| B["FastAPI<br/>endpoints.py"]
    B --> C["pipeline.py"]
    C --> D["Claim extractor<br/>(LLM)"]
    C --> E["Domain reputation<br/>(local table + LLM)"]
    D --> F["Cross-verification<br/>query agent, DuckDuckGo, verdict agent"]
    F --> G["Article metrics<br/>(LLM)"]
    E --> H["BRS scoring<br/>scoring.py"]
    G --> H
    H --> I["AI summary"]
    I -->|"Trust Score, criteria, highlights"| A
```

The claim extractor and the domain lookup run in parallel. Everything the LLM returns is a count or a label; the scores themselves come only from the formulas in `scoring.py`.

## How an analysis works

1. **Parse.** The content script turns the page into id-indexed paragraphs with Readability.js. The service worker sends them to `POST /analyze` together with the UI language.
2. **Validate and cache.** The backend rejects an empty headline or fewer than 50 characters of text, then checks an in-memory cache (key: domain + headline + language, TTL 12 hours).
3. **Gather evidence in parallel.**
   - The claim extractor returns up to 5 verifiable claims (figures, dates, concrete events) with their paragraph IDs. Predictions, opinions and intentions are excluded by the prompt.
   - Domain reputation comes from the local table of 54 outlets. For unknown domains the backend searches DuckDuckGo for watchdog evaluations and asks the LLM to rate them; with no evidence the value stays at the neutral 0.5.
4. **Cross-verify each claim** (claims run concurrently). A query agent produces a 3 to 7 keyword search query, DuckDuckGo returns the top 3 snippets (8 s timeout), and a cross-reference agent answers CONFIRMED, CONTRADICTED or UNVERIFIED. Ambiguous cases default to UNVERIFIED. A contradicted claim becomes a `risk` highlight; confirmed and contradicted claims keep an evidence URL.
5. **Extract article metrics.** A metrics agent receives the article and the contradicted claims and returns the citation count, the manipulative-phrase count (with the exact snippets) and paragraph highlights. Direct quotes, wartime terminology and neutral attribution ("reports", "according to") are not counted.
6. **Score** with the BRS formulas (see below).
7. **Summarize.** A summary agent writes 3 to 5 sentences in the requested language from the final numbers. If the metrics agent fails completely, the API returns a neutral 50 / 50 / 50 result instead of an error.

## Project structure

```
backend/
├── app/
│   ├── main.py                       # FastAPI app, CORS, /health
│   ├── api/endpoints.py              # POST /analyze + in-memory cache
│   ├── models/schemas.py             # Pydantic request/response/agent schemas
│   ├── services/
│   │   ├── pipeline.py               # orchestrates the analysis
│   │   ├── cross_verification.py     # search queries, DuckDuckGo, claim verdicts
│   │   ├── domain_reputation.py      # local domain reputation table
│   │   ├── scoring.py                # BRS formulas and Trust Score
│   │   └── llm/
│   │       ├── base_agent.py         # Gemini client, retries, model fallback
│   │       ├── claim_extractor.py    # up to 5 verifiable claims
│   │       └── article_metrics_extractor.py  # citations, manipulative phrases
│   └── utils.py
├── tests/                            # benchmark scripts and test dashboard
└── requirements.txt

extension/                            # Manifest V3, Chromium browsers
├── manifest.json
├── background.js                     # service worker, talks to the backend
├── content.js + Readability.js       # article parsing and in-page highlights
├── popup.html / popup.js             # popup UI
├── parsed_text.html / parsed_text.js # full analytics page
├── styles.css
└── icons/

veritas-landing/                      # promo site (React + Vite)
docs/assets/banner.svg
```

## Browser extension

- `content.js` with `Readability.js` extracts the article and draws the in-page highlights.
- `background.js` injects the content script when needed, calls the backend, keeps results per tab in `chrome.storage.local` and stores the language and highlight settings.
- `popup.html` / `popup.js` show the Trust Score ring, the three criteria, the summary and the re-analyze controls.
- `parsed_text.html` / `parsed_text.js` is the analytics page: formula inputs, extracted claims and evidence links.

## Quick start

Requirements: Python 3.11+, a Chromium-based browser, and a [Gemini API key](https://aistudio.google.com/apikey).

```bash
git clone https://github.com/MaksymKorchynskyi/veritas-extension-project.git
cd veritas-extension-project/backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
echo "GEMINI_API_KEY=your_key" > .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Check `http://127.0.0.1:8000/health`, then load the extension: open `chrome://extensions/`, enable **Developer mode**, click **Load unpacked** and select the `extension/` folder.

Open a news article, click the Veritas icon and press analyze. The result takes 5 to 15 seconds. Without an API key the server still starts, but the AI agents are disabled and the analysis returns neutral results.

### API

`GET /health` returns the service status; interactive docs are available at `/docs`.

`POST /analyze` request:

| Field | Type | Notes |
|-------|------|-------|
| `url` | string | used to derive the domain |
| `title` | string | must not be empty |
| `html_content` | string | cleaned article HTML |
| `paragraphs` | `[{id, text}]` | at least 50 characters in total |
| `language` | `"uk"` or `"en"` | language of the summary, default `uk` |

```bash
curl -X POST http://127.0.0.1:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/news", "title": "Headline",
       "html_content": "<p>...</p>",
       "paragraphs": [{"id": 1, "text": "Article paragraph, at least 50 characters in total ..."}],
       "language": "en"}'
```

Response:

| Field | Description |
|-------|-------------|
| `trust_score` | 0 to 100 |
| `criteria` | `credibility`, `transparency`, `objectivity` (0 to 100 each) |
| `explainer` | short AI summary |
| `highlights` | `[{paragraph_id, severity: "warning" or "risk", category, reason}]` |
| `scoring_inputs` | counts and matched phrases that fed the formulas |
| `extracted_claims` | `[{paragraph_id, claim_text, status, evidence_url}]` |

Invalid input returns HTTP 400.

## Configuration

| Setting | Where | Default |
|---------|-------|---------|
| `GEMINI_API_KEY` | `backend/.env` | none (agents disabled) |
| Models | `MODEL_NAME`, `FALLBACK_MODEL_NAME` in `app/services/llm/base_agent.py` | `gemini-2.5-flash`, `gemini-3-flash-preview` |
| Cache TTL | `CACHE_TTL` in `app/api/endpoints.py` | 12 hours |
| Backend URL | `BASE_URL` in `extension/background.js` | `http://127.0.0.1:8000` |

## Scoring model

Each criterion is a Beta Reputation System expectation, `E(p) = (r + W * a) / (r + s + W)`, with prior weight `W = 2`:

| Criterion | Positive evidence `r` | Negative evidence `s` | Base rate `a` |
|-----------|----------------------|-----------------------|---------------|
| Credibility | confirmed claims + 0.2 x citations | contradicted claims + 0.3 x manipulative phrases + 0.4 x unverified claims | domain reputation |
| Transparency | citations | none | 0.3 (an article has to earn it) |
| Objectivity | K - s | min(manipulative phrases, K), where K = max(8, words / 50) | 0.5 |

```
Trust Score = 0.5 * Credibility + 0.3 * Transparency + 0.2 * Objectivity
```

If Credibility is below 50, the result is multiplied by `0.5 + Credibility / 100`. The implementation is in `backend/app/services/scoring.py`.

## Benchmarks

`backend/tests/` contains benchmark scripts, not unit tests. They send curated article sets to a running backend and write results to `backend/tests/results/` (not tracked by git). They call the Gemini API, so a key and quota are required. No benchmark numbers are published here; run the scripts to reproduce them.

```bash
cd backend && python tests/benchmark_articles.py && python tests/visualize_results.py
```

## Limitations

- Verdicts rest on three search snippets, not on full source pages. They are a signal to check further, not a fact-check.
- Quality depends on DuckDuckGo results and Gemini. A search timeout or rate limit yields UNVERIFIED, which lowers Credibility.
- The local domain table covers 54 outlets; other domains rely on a search plus an LLM judgement or the neutral default.
- The backend is designed to run locally. The cache lives in process memory and is lost on restart.
- Scores estimate credibility signals; they do not decide what is true.

## Roadmap

- Offline unit tests for scoring and utilities.
- Pinned dependencies, linting configuration (`pyproject.toml`) and CI.
- A persistent, bounded response cache.
- Configurable CORS and timeouts for LLM calls.

## Contributing

Issues and pull requests are welcome. For larger changes, open an issue first. Keep changes focused, follow PEP 8, and never commit API keys or `.env` files.

## License

[MIT](LICENSE). Scoring model: Jøsang, A. and Ismail, R. (2002), "The Beta Reputation System", 15th Bled Electronic Commerce Conference.
