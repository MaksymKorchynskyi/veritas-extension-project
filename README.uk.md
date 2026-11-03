[English](README.md) | **Українська**

<p align="center">
  <img src="docs/assets/banner.svg" alt="Veritas: гібридний AI-аналізатор достовірності новин" width="100%">
</p>

<p align="center">
  <a href="https://www.python.org/"><img alt="Python" src="https://img.shields.io/badge/python-3.11%2B-3776AB.svg"></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-yellow.svg"></a>
  <a href="https://github.com/MaksymKorchynskyi/veritas-extension-project/commits"><img alt="Last commit" src="https://img.shields.io/github/last-commit/MaksymKorchynskyi/veritas-extension-project"></a>
  <a href="https://github.com/astral-sh/ruff"><img alt="Code style: ruff" src="https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json"></a>
  <img alt="Status: in development" src="https://img.shields.io/badge/status-in%20development-orange.svg">
</p>

# Veritas

Гібридне AI-розширення для браузера, яке оцінює достовірність та об'єктивність новинної статті безпосередньо під час читання.

## Огляд

Veritas поєднує три підходи:

- **Великі мовні моделі (LLM)** для семантичної роботи: витяг фактологічних тез, підрахунок цитувань і маніпулятивних фраз.
- **Перехресну верифікацію** цих тез через зовнішні джерела, знайдені за допомогою DuckDuckGo.
- **Детерміновану модель скорингу** на основі Beta Reputation System (Jøsang & Ismail, 2002): фінальний Trust Score прозорий і відтворюється з чисел, які витягли LLM-агенти.

Розширення парсить сторінку за допомогою Readability.js, надсилає статтю на локальний бекенд FastAPI і показує результат у попапі, на самій сторінці (підсвічені абзаци) та на окремій сторінці аналітики.

## Можливості

- Аналіз статті у реальному часі, поки ви її читаєте.
- Гібридний конвеєр: LLM-агенти витягують свідчення, формули BRS перетворюють їх на бали.
- Автоматична перехресна верифікація до 5 ключових фактологічних тез.
- Репутація домену: локальна таблиця приблизно з 55 відомих медіа та пошук за допомогою LLM для невідомих доменів.
- Декомпозиція оцінки на Достовірність, Прозорість та Об'єктивність із відкритими вхідними даними формул.
- Підсвічування проблемних абзаців прямо на сторінці.
- Інтерфейс і підсумки українською та англійською мовами.
- Режим «Написати & Аналіз» для вставки довільного тексту.

## Архітектура

```
Браузерне розширення (Readability.js)
        |  POST /analyze  (url, title, paragraphs, language)
        v
Бекенд FastAPI
  1. Витяг тез (LLM)               \  виконуються паралельно
  2. Репутація домену              /
  3. Перехресна верифікація тез    (агент запитів -> DuckDuckGo -> агент вердикту)
  4. Метрики статті (LLM): цитування, маніпулятивні фрази, highlights
  5. Скоринг BRS: Достовірність, Прозорість, Об'єктивність -> Trust Score
  6. Фінальний AI-підсумок
        |
        v
Попап / підсвічування на сторінці / сторінка аналітики
```

| Компонент | Опис |
|-----------|------|
| `extension/` | Розширення Manifest V3 для Chromium-браузерів: попап, content script, фоновий воркер, сторінка аналітики. |
| `backend/` | Сервіс FastAPI, що оркеструє конвеєр аналізу. |
| `veritas-landing/` | Промо-лендінг (React + Vite). |

### Модулі бекенду

| Модуль | Роль |
|--------|------|
| `app/main.py` | Застосунок FastAPI, CORS, `/health`. |
| `app/api/endpoints.py` | `POST /analyze` з кешем у пам'яті (12 годин). |
| `app/services/pipeline.py` | Оркеструє весь аналіз. |
| `app/services/llm/base_agent.py` | Клієнт Gemini зі структурованим виводом, повторами та резервною моделлю. |
| `app/services/llm/claim_extractor.py` | Витягує до 5 верифікованих фактологічних тез. |
| `app/services/llm/article_metrics_extractor.py` | Рахує цитування й маніпулятивні фрази, формує highlights. |
| `app/services/cross_verification.py` | Генерація пошукових запитів, пошук у DuckDuckGo, вердикти по тезах, перевірка домену. |
| `app/services/domain_reputation.py` | Локальна таблиця репутації доменів. |
| `app/services/scoring.py` | Формули BRS та агрегація Trust Score. |
| `app/models/schemas.py` | Pydantic-схеми запитів, відповідей і агентів. |

### Структура репозиторію

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
│   ├── tests/              # бенчмарк-скрипти та дашборд
│   └── requirements.txt
├── extension/
├── veritas-landing/
├── docs/assets/banner.svg
├── LICENSE
├── README.md
└── README.uk.md
```

## Встановлення

### Вимоги

- Python 3.11 або новіший
- Браузер на основі Chromium (Chrome, Edge, Brave, Opera)
- API-ключ Gemini з [Google AI Studio](https://aistudio.google.com/apikey)
- Node.js, лише якщо ви хочете запустити лендінг

### 1. Клонування репозиторію

```bash
git clone https://github.com/MaksymKorchynskyi/veritas-extension-project.git
cd veritas-extension-project
```

### 2. Налаштування бекенду

```bash
cd backend
python -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows
pip install -r requirements.txt
```

### 3. Налаштування API-ключа

Створіть файл `backend/.env`:

```env
GEMINI_API_KEY=ваш_api_ключ_gemini
```

Без ключа сервер усе одно запускається, але AI-агенти вимкнені, а аналіз повертає нейтральні результати.

### 4. Запуск сервера

```bash
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Перевірка роботи: `http://127.0.0.1:8000/health`

### 5. Завантаження розширення

1. Відкрийте `chrome://extensions/` (або `edge://extensions/`).
2. Увімкніть **Режим розробника**.
3. Натисніть **Завантажити розпаковане** і оберіть папку `extension/`.
4. Закріпіть розширення на панелі браузера.

## Використання

### У браузері

1. Переконайтеся, що бекенд запущено.
2. Відкрийте новинну статтю.
3. Натисніть іконку Veritas і кнопку аналізу.
4. Зачекайте 5–15 секунд. Попап покаже Trust Score (0–100), три критерії, підсвічені абзаци та AI-підсумок.
5. Відкрийте сторінку аналітики з попапу, щоб побачити вхідні дані формул, витягнуті тези та результати перехресної верифікації.

### Через API

```bash
curl -X POST http://127.0.0.1:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/news/article",
    "title": "Заголовок статті",
    "html_content": "<p>Перший абзац статті ...</p>",
    "paragraphs": [
      {"id": 1, "text": "Перший абзац статті, достатньо довгий для аналізу ..."},
      {"id": 2, "text": "Другий абзац ..."}
    ],
    "language": "uk"
  }'
```

Відповідь містить `trust_score`, `criteria` (`credibility`, `transparency`, `objectivity`), `explainer`, `highlights`, `scoring_inputs` та `extracted_claims`. Текст статті має містити щонайменше 50 символів, а заголовок не може бути порожнім.

## Конфігурація

| Параметр | Де | За замовчуванням |
|----------|----|------------------|
| `GEMINI_API_KEY` | `backend/.env` | немає (AI-агенти вимкнені) |
| Основна модель | `MODEL_NAME` у `app/services/llm/base_agent.py` | `gemini-2.5-flash` |
| Резервна модель | `FALLBACK_MODEL_NAME` у тому ж файлі | `gemini-3-flash-preview` |
| TTL кешу відповідей | `CACHE_TTL` у `app/api/endpoints.py` | 12 годин |
| URL бекенду для розширення | `BASE_URL` у `extension/background.js` (перевірка здоров'я в `popup.js` також жорстко задана) | `http://127.0.0.1:8000` |

## Модель скорингу

Кожен критерій — очікуване значення Beta Reputation System:

```
E(p) = (r + W * a) / (r + s + W)
```

| Символ | Значення |
|--------|----------|
| `r` | Позитивні свідчення (підтверджені тези, цитування) |
| `s` | Негативні свідчення (спростовані тези, маніпулятивні фрази, неперевірені тези) |
| `W` | Вага апріорної інформації, за замовчуванням 2 |
| `a` | Базова ставка (репутація домену для Достовірності) |

```
Trust Score = 0.5 * Достовірність + 0.3 * Прозорість + 0.2 * Об'єктивність
```

Коли Достовірність нижча за 50, результат множиться на коефіцієнт `0.5 + Достовірність / 100`. Реалізація: `backend/app/services/scoring.py`.

## Тестування та бенчмарки

Репозиторій містить бенчмарк-скрипти, а не юніт-тести. Вони надсилають куровані набори статей (надійні, змішані, фейкові) на запущений бекенд і зберігають результати в `backend/tests/results/`, яка не відстежується git. Скрипти викликають Gemini API, тож потрібні дійсний ключ і доступна квота.

```bash
cd backend
python tests/benchmark_articles.py
python tests/visualize_results.py
```

Числа бенчмарків у цьому README не публікуються. Щоб відтворити їх, запустіть скрипти.

## Дорожня карта

- Офлайн юніт-тести для модуля скорингу та утиліт.
- Зафіксовані версії залежностей і workflow безперервної інтеграції.
- Конфігурація лінтера та форматера (`pyproject.toml`).
- Постійний кеш відповідей з обмеженим розміром.
- Налаштовуваний CORS і таймаути для викликів LLM.

## Внесок

Issues та pull requests вітаються. Для більших змін спершу відкрийте issue для обговорення. Тримайте зміни сфокусованими, дотримуйтесь PEP 8 і не додавайте у репозиторій API-ключі чи файли `.env`.

## Ліцензія

Розповсюджується за ліцензією [MIT](LICENSE).

## Джерело

Jøsang, A. and Ismail, R. (2002). "The Beta Reputation System." Proceedings of the 15th Bled Electronic Commerce Conference, pp. 324-337.
