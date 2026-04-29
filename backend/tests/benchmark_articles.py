"""
VERITAS Algorithm Benchmark
============================
Automated test runner that sends real article data through the API
and validates against expected quality categories.

Usage:  python tests/benchmark_articles.py
Requires: backend running at http://127.0.0.1:8000
"""

import asyncio
import json
import time
import csv
import statistics
from pathlib import Path
from datetime import datetime

try:
    import httpx
except ImportError:
    print("❌ httpx not installed. Run: pip install httpx")
    exit(1)

API_URL = "http://127.0.0.1:8000/analyze"
RESULTS_DIR = Path(__file__).parent / "results"
RESULTS_DIR.mkdir(exist_ok=True)


# =============================================================================
# TEST DATASET — 12 REAL ARTICLES
# =============================================================================
# Три категорії:
#   A — Якісні (авторитетні джерела, факти, цитати)    → очікуваний Trust Score: 55–95
#   B — Середня якість (bias, мало джерел, емоції)     → очікуваний Trust Score: 25–65
#   C — Маніпулятивні / фейкові (пропаганда, фейки)   → очікуваний Trust Score: 0–40
# =============================================================================

ARTICLES = [
    # ─────────────────────────────────────────────────────────────
    # КАТЕГОРІЯ A: Якісні статті (авторитетні джерела)
    # ─────────────────────────────────────────────────────────────
    {
        "id": "A1",
        "category": "A",
        "expected": (55, 95),
        "title": "Зеленський підписав закон про посилення захисту прав на землю",
        "url": "https://www.pravda.com.ua/news/2025/01/10/7441234/",
        "paragraphs": [
            "Президент України Володимир Зеленський підписав закон, що посилює захист прав власників земельних ділянок, нерухомість на яких була зруйнована внаслідок бойових дій.",
            "Про це повідомляє пресслужба Верховної Ради України з посиланням на офіційну публікацію в «Голосі України».",
            "Відповідно до закону, власники зруйнованих будинків зможуть повернути або отримати у власність земельні ділянки за спрощеною процедурою. Закон набуває чинності через 30 днів з моменту публікації.",
            "Голова парламентського комітету з питань аграрної політики Олександр Гайду зазначив: «Цей закон є важливим кроком для відновлення справедливості щодо постраждалих громадян».",
            "За даними Міністерства аграрної політики, понад 120 тисяч земельних ділянок потребують перереєстрації у зв'язку з руйнуваннями.",
            "Світовий банк підтримав ініціативу, зазначивши, що захист майнових прав є ключовим елементом післявоєнного відновлення.",
        ],
    },
    {
        "id": "A2",
        "category": "A",
        "expected": (55, 95),
        "title": "ЄС ухвалив 20-й пакет санкцій проти Росії з акцентом на криптоактиви",
        "url": "https://www.bbc.com/ukrainian/articles/c5y6r2k1d78o",
        "paragraphs": [
            "Європейський Союз затвердив 20-й пакет економічних санкцій проти Російської Федерації, що вперше масштабно охоплює криптоактиви.",
            "Рішення було ухвалене Радою ЄС у Брюсселі у квітні 2026 року за підтримки всіх 27 країн-членів.",
            "За повідомленням Європейської Комісії, новий пакет включає тотальну заборону на надання криптовалютних послуг для осіб та компаній з РФ.",
            "Верховний представник ЄС Жозеп Боррель зазначив: «Ці заходи спрямовані на закриття лазівок для обходу існуючих санкцій через цифрові валюти».",
            "Аналітики White & Case відзначають, що до санкційних списків додано понад 2600 осіб та організацій з початку повномасштабного вторгнення.",
            "Міністерство закордонних справ РФ засудило рішення, назвавши його «деструктивним для глобальної фінансової стабільності».",
        ],
    },
    {
        "id": "A3",
        "category": "A",
        "expected": (55, 95),
        "title": "НБУ знизив облікову ставку: що це означає для економіки",
        "url": "https://www.liga.net/ua/economics/news/nbu-rate-decision-2025",
        "paragraphs": [
            "Національний банк України ухвалив рішення знизити облікову ставку, повідомляє офіційний сайт регулятора.",
            "Голова НБУ Андрій Пишний під час пресбрифінгу зазначив, що рішення обумовлене уповільненням інфляції.",
            "За даними Державної служби статистики, індекс споживчих цін у березні 2025 року знизився до 6.8% у річному вимірі.",
            "Аналітики Dragon Capital прогнозують подальше пом'якшення монетарної політики за умови збереження макроекономічної стабільності.",
            "Міністерство фінансів підтримало рішення НБУ, зазначивши, що це сприятиме здешевленню кредитування для бізнесу та населення.",
            "Forbes Ukraine зазначає, що курс гривні залишається стабільним після оголошення рішення регулятора.",
        ],
    },
    {
        "id": "A4",
        "category": "A",
        "expected": (55, 95),
        "title": "Ukraine receives new EU loan package worth 90 billion euros",
        "url": "https://www.reuters.com/world/europe/eu-approves-ukraine-aid-package-2026/",
        "paragraphs": [
            "The European Union approved a major 90-billion-euro loan package for Ukraine following months of political negotiations.",
            "European Commission President Ursula von der Leyen announced the decision at a press conference in Brussels on Monday.",
            "The package includes funds for energy infrastructure reconstruction, military support, and humanitarian assistance, according to an official EU statement.",
            "NATO Secretary General Mark Rutte welcomed the decision, calling it 'a clear demonstration of European unity in support of Ukraine'.",
            "The International Monetary Fund noted that the funding is critical for maintaining Ukraine's macroeconomic stability during wartime.",
            "Poland's Prime Minister Donald Tusk emphasized that the loan reflects the EU's long-term commitment to Ukraine's sovereignty and territorial integrity.",
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # КАТЕГОРІЯ B: Середня якість (bias, клікбейт, мало джерел)
    # ─────────────────────────────────────────────────────────────
    {
        "id": "B1",
        "category": "B",
        "expected": (25, 65),
        "title": "Рада може ухвалити скандальний законопроєкт: наслідки будуть жахливі",
        "url": "https://politeka.net/ua/politics/rada-skandal-2025",
        "paragraphs": [
            "Уже наступного тижня Верховна Рада може розглянути вкрай неоднозначний законопроєкт, який загрожує масовими протестами.",
            "На думку автора, ця ініціатива є прямим наслідком лобістських зусиль великих корпорацій, які контролюють владу.",
            "Один з нардепів від опозиції, який побажав залишитися анонімним, назвав законопроєкт «катастрофою для малого бізнесу».",
            "Деякі експерти вважають, що прийняття цього закону призведе до різкого зростання безробіття.",
            "Водночас прихильники законопроєкту зазначають, що він сприятиме модернізації окремих галузей промисловості.",
        ],
    },
    {
        "id": "B2",
        "category": "B",
        "expected": (25, 65),
        "title": "Чому ціни на бензин знову злетять у космос — пояснення експерта",
        "url": "https://autocentre.ua/news/fuel-prices-2025",
        "paragraphs": [
            "Після тимчасового зниження ціни на бензин знову повзуть угору, і це вже нікого не дивує.",
            "Я вважаю, що головна причина — це жадібність нафтотрейдерів, які використовують будь-яку можливість для збагачення.",
            "За інформацією з неназваних джерел, маржа на АЗС зараз складає рекордні суми за весь час спостережень.",
            "АМКУ до цих пір не провів жодного ефективного розслідування щодо картельної змови на паливному ринку.",
            "Можна прогнозувати, що до літа ціна за літр А-95 перевищить 70 гривень, якщо влада не вживе рішучих заходів.",
        ],
    },
    {
        "id": "B3",
        "category": "B",
        "expected": (25, 65),
        "title": "Сенсація: нова українська соцмережа може знищити Instagram",
        "url": "https://ain.ua/2025/03/15/nova-socmerezha-ukraina/",
        "paragraphs": [
            "Українські розробники створили нову соціальну мережу, яка, за їхніми словами, здатна повністю витіснити Instagram з ринку.",
            "Неймовірний стартап вже залучив мільйони доларів інвестицій від невідомих інвесторів.",
            "Особливістю платформи є використання штучного інтелекту, що робить її абсолютно унікальною.",
            "Скептики заявляють, що конкурувати з Meta неможливо, але засновник переконаний у своїй геніальності.",
            "Вже мільйони людей чекають на запуск цієї революційної платформи.",
        ],
    },
    {
        "id": "B4",
        "category": "B",
        "expected": (25, 65),
        "title": "Лікарі приховують правду: цей продукт лікує все!",
        "url": "https://healthinfo.ua/articles/sensational-cure-2025",
        "paragraphs": [
            "Сенсаційне відкриття у світі медицини перевернуло все, що ми знали про здоров'я.",
            "Відомі лікарі роками приховували цей простий метод лікування від широкої громадськості.",
            "Один анонімний нутриціолог розповів нам всю шокуючу правду про фармацевтичну індустрію.",
            "Люди, які вживають цей продукт, повідомляють про неймовірні результати вже через тиждень.",
            "Фармацевтичні компанії панікують і намагаються заблокувати цю інформацію в інтернеті.",
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # КАТЕГОРІЯ C: Маніпулятивні / фейкові (пропаганда, дезінформація)
    # ─────────────────────────────────────────────────────────────
    {
        "id": "C1",
        "category": "C",
        "expected": (0, 40),
        "title": "ЄС скасовує готівку: всіх примусово переведуть на цифрові гроші з чипами",
        "url": "https://eu-insider-news.com/world/economy/eu-bans-cash-2024",
        "paragraphs": [
            "Європарламент на закритому засіданні ухвалив скандальну директиву про повну заборону готівки на території всього ЄС.",
            "За нашими ексклюзивними даними, кожного громадянина змусять імплантувати спеціальний мікрочип для контролю всіх фінансових операцій.",
            "Експерти попереджають про тотальний цифровий концтабір, який знищить свободу кожного європейця.",
            "Мільйони людей вийшли на масові протести, але продажні ЗМІ повністю замовчують ці події.",
            "Єдиний шлях до порятунку — негайна відмова від банківських карток та перехід на бартер.",
        ],
    },
    {
        "id": "C2",
        "category": "C",
        "expected": (0, 40),
        "title": "США таємно припинили всю допомогу Україні: Конгрес ухвалив секретний указ",
        "url": "https://truth-news-today.info/usa-ukraine-betrayal",
        "paragraphs": [
            "Стало відомо, що Конгрес США на секретному засіданні ухвалив рішення про повне припинення будь-якої допомоги Україні.",
            "Американські генерали визнали повний і ганебний провал своєї стратегії підтримки Києва.",
            "Наші джерела у Пентагоні підтверджують, що всі поставки озброєння зупинені ще два місяці тому.",
            "Наївні українці продовжують вірити у казки про «західну підтримку», хоча вся ця допомога — лише корупційна схема.",
            "Європа також готується до повного зняття санкцій з Росії протягом найближчих тижнів.",
        ],
    },
    {
        "id": "C3",
        "category": "C",
        "expected": (0, 40),
        "title": "Польща офіційно вимагає повернути Львів: армія стягується до кордону",
        "url": "https://slavic-truth.info/poland-demands-lviv-2025",
        "paragraphs": [
            "Президент Польщі на терміновому засіданні Сейму висунув ультиматум Україні з вимогою негайно передати Львівську область.",
            "Польська армія вже концентрує танкові дивізії безпосередньо на кордоні з Україною.",
            "Західні політики відкрито підтримують розчленування української держави та розділ її територій.",
            "Зрадники у вищому керівництві України вже ведуть таємні переговори про капітуляцію.",
            "Єдиний порятунок для нашого народу — негайний союз зі Сходом проти підступного Заходу.",
        ],
    },
    {
        "id": "C4",
        "category": "C",
        "expected": (0, 40),
        "title": "Секретні біолабораторії НАТО створили вірус для знищення слов'ян",
        "url": "https://anti-nato-truth.net/biolabs-virus-2025",
        "paragraphs": [
            "Незалежні журналісти знайшли беззаперечні докази створення смертоносного вірусу у лабораторіях НАТО під Харковом.",
            "Цей жахливий вірус спеціально створений для знищення певних етнічних груп слов'янських народів.",
            "Пентагон категорично відмовляється коментувати ці шокуючі факти, що лише підтверджує їхню провину.",
            "Всі вакцини, які нав'язують населенню, насправді є частиною масштабної програми геноциду.",
            "Прокидайтеся, люди! Ваші діти та онуки у смертельній небезпеці від цього глобального заговору!",
        ],
    },
]


# =============================================================================
# BENCHMARK ENGINE
# =============================================================================

async def analyze_one(client: httpx.AsyncClient, article: dict) -> dict:
    """Send one article to the API and return structured result."""
    paragraphs = [{"id": i + 1, "text": p} for i, p in enumerate(article["paragraphs"])]
    html = " ".join(f"<p>{p}</p>" for p in article["paragraphs"])

    payload = {
        "url": article["url"],
        "title": article["title"],
        "html_content": html,
        "paragraphs": paragraphs,
        "language": "uk",
    }

    start = time.time()
    try:
        resp = await client.post(API_URL, json=payload, timeout=120.0)
        elapsed = round(time.time() - start, 2)

        if resp.status_code != 200:
            return {
                "id": article["id"], "category": article["category"],
                "status": "HTTP_ERROR", "http_code": resp.status_code,
                "error": resp.text[:200], "elapsed_s": elapsed,
            }

        data = resp.json()
        lo, hi = article["expected"]
        trust = data["trust_score"]
        in_range = lo <= trust <= hi

        return {
            "id": article["id"],
            "category": article["category"],
            "title": article["title"],
            "expected_range": f"{lo}–{hi}",
            "trust_score": trust,
            "in_range": "✅" if in_range else "❌",
            "credibility": data["criteria"]["credibility"],
            "transparency": data["criteria"]["transparency"],
            "objectivity": data["criteria"]["objectivity"],
            "highlights": len(data.get("highlights", [])),
            "explainer": data.get("explainer", "")[:150],
            "elapsed_s": elapsed,
            "status": "OK",
            "full_response": data,
        }
    except httpx.ConnectError:
        return {"id": article["id"], "status": "CONNECTION_ERROR",
                "error": "Cannot connect to backend. Is uvicorn running?"}
    except Exception as e:
        return {"id": article["id"], "status": "EXCEPTION",
                "error": str(e)[:200], "elapsed_s": round(time.time() - start, 2)}


async def run_stability_test(client: httpx.AsyncClient, article: dict, n: int = 3) -> dict:
    """Run same article N times, measure standard deviation."""
    scores = []
    for i in range(n):
        result = await analyze_one(client, article)
        if result.get("status") == "OK":
            scores.append(result["trust_score"])
        await asyncio.sleep(2)

    if len(scores) < 2:
        return {"id": article["id"], "runs": len(scores), "std": "N/A"}

    return {
        "id": article["id"],
        "runs": len(scores),
        "scores": scores,
        "mean": round(statistics.mean(scores), 1),
        "std": round(statistics.stdev(scores), 1),
        "stable": "✅" if statistics.stdev(scores) < 8 else "❌",
    }


async def main():
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")

    print()
    print("=" * 65)
    print(f"  🧪 VERITAS ALGORITHM BENCHMARK — {timestamp}")
    print(f"  Articles: {len(ARTICLES)}")
    print("=" * 65)

    # ─── Health Check ───
    async with httpx.AsyncClient() as client:
        try:
            health = await client.get("http://127.0.0.1:8000/health", timeout=5.0)
            if health.status_code != 200:
                print("\n  ❌ Backend not healthy. Start with: uvicorn app.main:app --reload")
                return
            print(f"  ✅ Backend online: {health.json()}")
        except httpx.ConnectError:
            print("\n  ❌ Cannot connect to http://127.0.0.1:8000")
            print("     Start backend: cd backend && uvicorn app.main:app --reload")
            return

    # ─── Run Benchmark ───
    results = []
    async with httpx.AsyncClient() as client:
        for article in ARTICLES:
            tag = f"[{article['id']}|{article['category']}]"
            title_preview = article["title"][:45]
            print(f"\n  {tag} {title_preview}...")

            result = await analyze_one(client, article)
            results.append(result)

            if result["status"] == "OK":
                ts = result["trust_score"]
                rng = result["expected_range"]
                ok = result["in_range"]
                t = result["elapsed_s"]
                res = result
                print(f"         Score: {ts} (expected {rng}) {ok}  [{t}s]")
                print(f"         Cred:{res['credibility']:.1f} Trans:{res['transparency']:.1f} Obj:{res['objectivity']:.1f} "
                      f"Highlights:{result['highlights']}")
            else:
                print(f"         ❌ {result.get('error', 'Unknown')[:80]}")

            await asyncio.sleep(3)  # Rate limiting

    # ─── Summary ───
    ok_results = [r for r in results if r.get("status") == "OK"]
    errors = len(results) - len(ok_results)
    correct = sum(1 for r in ok_results if r.get("in_range") == "✅")

    cat_scores = {}
    for r in ok_results:
        cat = r["category"]
        cat_scores.setdefault(cat, []).append(r["trust_score"])

    print("\n" + "=" * 65)
    print("  📊 BENCHMARK SUMMARY")
    print("=" * 65)
    print(f"  Total articles:     {len(results)}")
    print(f"  Successful:         {len(ok_results)}")
    print(f"  Errors:             {errors}")
    print(f"  In expected range:  {correct}/{len(ok_results)} "
          f"({correct / max(1, len(ok_results)) * 100:.0f}%)")

    if ok_results:
        times = [r["elapsed_s"] for r in ok_results]
        print(f"  Avg response time:  {statistics.mean(times):.1f}s "
              f"(min={min(times):.1f}s, max={max(times):.1f}s)")

    for cat in sorted(cat_scores):
        s = cat_scores[cat]
        label = {"A": "Якісні", "B": "Середні", "C": "Маніпулятивні"}.get(cat, cat)
        print(f"  Category {cat} ({label}):  "
              f"avg={statistics.mean(s):.1f}, "
              f"min={min(s):.0f}, max={max(s):.0f}")

    if "A" in cat_scores and "C" in cat_scores:
        gap = statistics.mean(cat_scores["A"]) - statistics.mean(cat_scores["C"])
        print(f"  Separation A vs C:  {gap:.1f} points {'✅' if gap > 25 else '⚠️'}")

    # ─── Stability Test (on article A1) ───
    print("\n" + "-" * 65)
    print("  🔄 STABILITY TEST (running A1 x3)...")
    async with httpx.AsyncClient() as client:
        stab = await run_stability_test(client, ARTICLES[0], n=3)
        if stab.get("std") != "N/A":
            print(f"    Scores: {stab['scores']}")
            print(f"    Mean: {stab['mean']}, Std Dev: {stab['std']} {stab['stable']}")
        else:
            print(f"    Could not complete stability test")

    # ─── Save CSV ───
    csv_path = RESULTS_DIR / f"benchmark_{datetime.now().strftime('%Y%m%d_%H%M')}.csv"
    csv_fields = ["id", "category", "title", "expected_range", "trust_score",
                  "in_range", "credibility", "transparency", "objectivity",
                  "highlights", "elapsed_s", "status"]
    if ok_results:
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=csv_fields, extrasaction='ignore')
            writer.writeheader()
            writer.writerows(ok_results)
        print(f"\n  💾 Results saved: {csv_path}")

    # Also save latest as JSON for frontend consumption
    latest_json_path = RESULTS_DIR / "latest_results.json"
    json_results = []
    for r in ok_results:
        entry = {k: v for k, v in r.items() if k != "full_response"}
        entry["full_response"] = r.get("full_response", {})
        json_results.append(entry)

    with open(latest_json_path, "w", encoding="utf-8") as f:
        json.dump(json_results, f, ensure_ascii=False, indent=2)
    print(f"  💾 JSON saved: {latest_json_path}")

    # Save latest CSV too
    latest_path = RESULTS_DIR / "latest_results.csv"
    if ok_results:
        with open(latest_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=csv_fields, extrasaction='ignore')
            writer.writeheader()
            writer.writerows(ok_results)

    print("\n" + "=" * 65)
    print("  ✅ Benchmark complete!")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
