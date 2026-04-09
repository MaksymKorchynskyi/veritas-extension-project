# 🏗 Technical Architecture & Stack Specification

Цей документ визначає технічний стек, архітектурні патерни та флоу розробки для системи аналізу медіа-контенту. Система спроєктована за принципом **"Local First, Cloud Ready"**.

---

## 🏛 1. Архітектурний Огляд (High-Level Architecture)

Система побудована за **Сервіс-Орієнтованою Архітектурою (SOA)** з використанням паттерну **Client-Server**.

* **Client:** Браузерне розширення (Chrome Extension) відповідає за збір даних, UI та відображення результатів.
* **Server:** REST API (Python) відповідає за бізнес-логіку, оркестрацію AI-запитів, скрапінг та математичні розрахунки.
* **Communication:** Асинхронний обмін даними у форматі JSON через HTTP/HTTPS.

---

## 🛠 2. Технічний Стек (Tech Stack)

### 🔹 Client Side (Frontend)

* **Core:** Chrome Extension Manifest V3.
* **Language:** JavaScript (ES6+), Vanilla (No Frameworks).
* **Styling:** CSS3 (CSS Variables, Flexbox/Grid), BEM naming convention.
* **Key APIs:**
* `chrome.scripting` & `chrome.tabs` — для ін'єкції скриптів.
* `chrome.runtime` — для обміну повідомленнями.
* `chrome.storage.local` — для кешування результатів (TTL: 24h).


* **UX Requirement:** Popup must handle **'Loading States'** gracefully, showing distinct steps (e.g., "Analyzing text...", "Verifying sources...") to keep the user engaged during the 5-15s wait.

### 🔹 Server Side (Backend)

* **Runtime:** Python 3.11+.
* **Framework:** **FastAPI**.
* **Server:** **Uvicorn** (ASGI Implementation).
* **Networking (Scraping):**
* **Httpx** — асинхронний HTTP-клієнт.
* **Critical Requirement:** Must be configured with **Real Browser Headers** (User-Agent) to avoid `403 Forbidden` errors from news sites. Use `fake-useragent` library or hardcoded headers.
* **Timeout:** Set strict timeouts (e.g., `timeout=15.0`) to prevent hanging processes.


* **Parsing:**
* **BeautifulSoup4** (`bs4`) + **lxml**.
* **Cleaning Rule:** Explicitly remove `<nav>`, `<footer>`, `<script>`, `<style>`, and `<aside>` tags to prevent analyzing menu items/ads as part of the article text.


* **Data Validation:** **Pydantic v2**.
* **Utils:** `python-dotenv`, `tenacity` (retry logic).

### 🔹 AI Layer

* **Provider:** Google Gemini API.
* **SDK:** `google-generativeai`.
* **Configuration:**
* All API calls **MUST** use `response_mime_type='application/json'` to ensure the output is strictly parseable JSON.


* **Models:**
* `gemini-3-flash-preview`: For high-speed tasks (NER, Headline check).
* `gemini-2.5-pro`: For complex reasoning (Source Verification).



---

## 🔄 3. Розробка та Середовища (Development Lifecycle)

Проєкт має два чітких режими роботи. Код повинен підтримувати перемикання через конфігурацію.

### 💻 Environment A: Local Development (Current Stage)

* **Host:** `localhost` (127.0.0.1).
* **Port:** `8000`.
* **Run Command:** `uvicorn main:app --reload`.
* **Extension Config:** `API_BASE_URL = "http://localhost:8000"`.
* **Secrets:** `.env` file (Local only).

### ☁️ Environment B: Cloud Production (Target Stage)

* **Host:** Render.com / Railway / AWS.
* **Containerization:** **Docker** (`python:3.11-slim`).
* **Security:** CORS allowed only for `chrome-extension://<EXTENSION_ID>`.
* **Extension Config:** `API_BASE_URL = "https://api.your-domain.com"`.

---

## 📂 4. Структура Проєкту (File Structure)

```text
/project-root
├── /backend                 # Server-side code
│   ├── /app
│   │   ├── __init__.py
│   │   ├── main.py          # Entry point (FastAPI app)
│   │   ├── api.py           # Routes definition
│   │   ├── core.py          # WMFA v2.0 Algorithm logic
│   │   ├── ai_service.py    # Interactions with Gemini API
│   │   ├── scraper.py       # Async extraction with User-Agent
│   │   ├── models.py        # Pydantic schemas
│   │   └── utils.py         # Text cleaning (BS4)
│   ├── .env                 # Secrets
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile           # Instructions for Cloud deployment
│
├── /extension               # Client-side code
│   ├── manifest.json        # V3 Configuration
│   ├── background.js        # Service Worker
│   ├── content.js           # DOM parser
│   ├── popup.html           # UI Structure
│   ├── popup.js             # UI Logic
│   ├── styles.css           # Styling
│   └── /icons               # png assets
│
└── README.md

```

---

## ⚙️ 5. Деталі Реалізації (Implementation Details)

### 5.1. Backend Logic (WMFA v2.0 Implementation)

Бекенд виконує оркестрацію процесів.

1. **Endpoint:** `POST /analyze`.
2. **Parallel Execution:**
* Task 1: AI Analysis (Style, Headline, Logic).
* Task 2: Source Verification (Extract Links -> Filter Anti-SEO -> Async Scrape with User-Agent -> AI Verify).


3. **Entity Counting Rule:**
* For Factual Density: Do **not** ask AI to return a number. Ask AI to return a JSON **list** of entities found, then calculate `len(list)` in Python. This prevents AI math hallucinations.


4. **Math & Clamping:**
* Apply weighted formulas in `core.py`.
* **Critical Constraint:** Implement **Score Clamping**. Use `max(0, calculated_score)` for all subtractions to ensure no score ever goes below zero.


5. **Response:** Return aggregated JSON with `trust_score`.

### 5.2. Frontend Logic

1. **Config Switch:**
```javascript
const IS_DEV = true; // Change to false for Production
const BASE_URL = IS_DEV ? "http://127.0.0.1:8000" : "https://api.production.com";

```


2. **Error Handling:** Handle connection errors gracefully (e.g., if Local Server is not running).