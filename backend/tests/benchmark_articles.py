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
# TEST DATASET
# =============================================================================
# Кожна стаття має:
#   id          — Унікальний ID (A1, B1, C1...)
#   category    — "A" (якісна), "B" (середня), "C" (маніпулятивна), "D" (edge case)
#   expected    — (min, max) очікуваний діапазон Trust Score
#   title       — Заголовок статті
#   url         — URL (для Source Verification та Domain Reputation)
#   paragraphs  — Текст статті, розбитий на параграфи
# =============================================================================

ARTICLES = [
    # -----------------------------------------------------------------
    # КАТЕГОРІЯ A: Якісні статті (очікуваний Trust Score: 65–100)
    # -----------------------------------------------------------------
    {
        "id": "A1",
        "category": "A",
        "expected": (60, 100),
        "title": "Зеленський підписав закон про мобілізацію після ухвалення Радою",
        "url": "https://www.pravda.com.ua/news/2026/04/12/7455123/",
        "paragraphs": [
            "Президент України Володимир Зеленський підписав закон про мобілізацію, ухвалений Верховною Радою 11 квітня 2026 року.",
            "Про це повідомляє прес-служба Офісу Президента України.",
            "За словами радника глави держави Михайла Подоляка, закон передбачає оновлення правил призову для громадян віком від 25 років. Він також включає положення про ротацію підрозділів після 18 місяців служби.",
            "Генеральний штаб ЗСУ раніше повідомляв про критичну необхідність ротації особового складу на передовій, зокрема на Донецькому напрямку.",
            "За даними Reuters, західні партнери, зокрема США та Великобританія, підтримали ініціативу як необхідний крок для зміцнення обороноздатності.",
            "Міністр оборони Рустем Умєров зазначив, що нові правила дозволять ефективніше планувати кадрове забезпечення Збройних Сил. Міноборони планує впровадити електронний реєстр протягом 60 днів.",
        ],
    },
    {
        "id": "A2",
        "category": "A",
        "expected": (60, 100),
        "title": "ЄС затвердив 15-й пакет санкцій проти Росії",
        "url": "https://www.bbc.com/ukrainian/news-2026-04-eu-sanctions",
        "paragraphs": [
            "Європейський Союз офіційно затвердив 15-й пакет економічних санкцій проти Російської Федерації.",
            "Рішення було ухвалене одноголосно 27 країнами-членами на засіданні Ради ЄС у Брюсселі 10 квітня 2026 року.",
            "Новий пакет включає обмеження у сфері енергетики: повну заборону на імпорт російського скрапленого газу (LNG) та додаткові обмеження на постачання нафтопродуктів.",
            "За даними Європейської Комісії, санкції також охоплюють 50 нових фізичних осіб та 30 юридичних осіб, включаючи компанії, причетні до обходу попередніх обмежень.",
            "Верховний представник ЄС Жозеп Боррель заявив: 'Ці обмеження спрямовані на подальше скорочення доходів Росії від торгівлі енергоносіями'.",
            "Міністерство закордонних справ РФ очікувано засудило рішення, назвавши його 'деструктивним для глобальної енергетичної безпеки'.",
        ],
    },
    {
        "id": "A3",
        "category": "A",
        "expected": (60, 100),
        "title": "ISW: Україна закріпилася на нових позиціях під Бахмутом",
        "url": "https://www.ukrinform.ua/rubric-ato/3800001-isw-analysis.html",
        "paragraphs": [
            "Аналітики Інституту вивчення війни (ISW) підтверджують, що Сили оборони України закріпилися на щойно зайнятих позиціях на захід від Бахмута.",
            "У вечірньому звіті від 11 квітня ISW зазначає, що українські підрозділи просунулися на 1.5-2 км протягом останнього тижня.",
            "Генеральний штаб ЗСУ повідомив про відбиття 84 атак на Донецькому напрямку за минулу добу. Найінтенсивніші бої точилися поблизу Часового Яру.",
            "Речник Східного угруповання полковник Андрій Наєв зазначив, що противник зазнав значних втрат у живій силі та техніці.",
            "За підтвердженням координатора стратегічних комунікацій Ради національної безпеки США Джона Кірбі, ситуація на Донецькому напрямку стабілізувалася.",
        ],
    },
    {
        "id": "A4",
        "category": "A",
        "expected": (60, 100),
        "title": "Нацбанк знизив облікову ставку до 12%: що це означає",
        "url": "https://www.liga.net/ua/economics/news/nbu-rate-2026",
        "paragraphs": [
            "Національний банк України на засіданні 11 квітня 2026 року ухвалив рішення знизити облікову ставку з 13% до 12% річних.",
            "Про це повідомила голова НБУ Андрій Пишний під час брифінгу.",
            "За даними регулятора, рішення зумовлене уповільненням інфляції до 6.2% у березні 2026 року порівняно з 8.1% у грудні 2025 року.",
            "Міністерство фінансів підтримало рішення, зазначивши, що зниження ставки сприятиме здешевленню кредитів для бізнесу.",
            "Аналітики Dragon Capital прогнозують, що ставка може бути знижена до 10% до кінця 2026 року за умови збереження поточного тренду на дезінфляцію.",
            "Forbes Ukraine зазначає, що курс гривні залишається стабільним на рівні 41.2 грн/дол після оголошення рішення НБУ.",
        ],
    },

    # -----------------------------------------------------------------
    # КАТЕГОРІЯ B: Середня якість (очікуваний Trust Score: 35–74)
    # -----------------------------------------------------------------
    {
        "id": "B1",
        "category": "B",
        "expected": (30, 75),
        "title": "Рада може ухвалити скандальний законопроєкт вже наступного тижня",
        "url": "https://regional-news.com.ua/politics/rada-scandal-2026",
        "paragraphs": [
            "Уже наступного тижня Верховна Рада може розглянути вкрай неоднозначний законопроєкт, який викликав бурхливу реакцію суспільства.",
            "На думку автора, ця ініціатива є прямим наслідком лобістських зусиль великих корпорацій.",
            "Один з нардепів від опозиції, який побажав залишитися анонімним, назвав законопроєкт 'катастрофою для малого бізнесу'.",
            "Деякі експерти вважають, що прийняття цього закону призведе до зростання безробіття на 15-20%.",
            "Водночас прихильники законопроєкту зазначають, що він сприятиме модернізації окремих галузей промисловості.",
        ],
    },
    {
        "id": "B2",
        "category": "B",
        "expected": (30, 75),
        "title": "Чому ціни на бензин знову зростуть — пояснення експерта",
        "url": "https://blog-economics.ua/oil-prices-2026",
        "paragraphs": [
            "Після тимчасового зниження ціни на бензин знову повзуть угору, і це нікого не дивує.",
            "Я вважаю, що головна причина — це жадібність нафтотрейдерів, які використовують будь-яку можливість для збагачення.",
            "За інформацією з неназваних джерел, маржа на АЗС зараз складає рекордні 8,5 гривень на літрі.",
            "Слід зазначити, що АМКУ до цих пір не провів жодного ефективного розслідування щодо картельної змови на паливному ринку.",
            "Можна прогнозувати, що до літа ціна за літр А-95 перевищить 60 гривень, якщо влада не вживе рішучих заходів.",
        ],
    },
    {
        "id": "B3",
        "category": "B",
        "expected": (30, 75),
        "title": "Нова соціальна мережа з України може потіснити Instagram",
        "url": "https://tech-ua-blog.com/new-social/",
        "paragraphs": [
            "Українські розробники створили нову соціальну мережу, яка, за їхніми словами, може стати серйозним конкурентом Instagram.",
            "Стартап, заснований колишніми інженерами Grammarly, вже залучив 5 мільйонів доларів інвестицій від венчурного фонду та ангельських інвесторів.",
            "Особливістю платформи є використання штучного інтелекту для модерації контенту та боротьби з дезінформацією.",
            "Однак скептики зазначають, що конкурувати з Meta буде вкрай складно, враховуючи мережевий ефект і мільярдну аудиторію Instagram.",
            "На думку засновника проєкту, ніша для нової платформи існує саме серед аудиторії, стурбованої приватністю даних.",
        ],
    },

    # -----------------------------------------------------------------
    # КАТЕГОРІЯ C: Маніпулятивні / фейкові (очікуваний Trust Score: 0–45)
    # -----------------------------------------------------------------
    {
        "id": "C1",
        "category": "C",
        "expected": (0, 45),
        "title": "ШОК! ВЛАДА ПРИХОВУЄ ПРАВДУ — МОБІЛІЗАЦІЮ СКАСОВАНО!",
        "url": "https://fake-news-ua.xyz/shock/mobilization/",
        "paragraphs": [
            "Покидьки з влади знову зрадили народ! Ганебне рішення, яке доведе, що ця ганебна істерика ні до чого доброго не призведе.",
            "Мобілізацію нібито скасували, але нікому не повідомили — влада замовчує цю злочинну таємницю від людей.",
            "Деякі експерти вважають, що мобілізація — це злочин проти людства і порушення конституційних прав.",
            "Жодне авторитетне джерело не підтвердило цю інформацію, але ми впевнені, що це стовідсоткова правда.",
            "ПІДПИСУЙТЕСЬ на наш телеграм для більше шокуючих новин, яких ви не побачите у продажних ЗМІ!",
        ],
    },
    {
        "id": "C2",
        "category": "C",
        "expected": (0, 45),
        "title": "ТЕРМІНОВО! ВИ НЕ ПОВІРИТЕ, ЩО ВІДКРИЛИ ВЧЕНІ!",
        "url": "https://clickbait-extreme.com/scientists/",
        "paragraphs": [
            "Вчені зробили неймовірне відкриття, яке перевернуло уявлення всього наукового світу і шокувало абсолютно всіх!",
            "Хоча конкретні деталі тримаються в таємниці, наші таємні інсайдери повідомили, що це стосується лікування від усіх хвороб.",
            "Фармацевтичні корпорації панічно намагаються приховати цю інформацію, бо вона знищить їхній мільярдний бізнес.",
            "Перешліть це повідомлення 10 друзям, і ви дізнаєтеся ексклюзивні деталі. Ті, хто проігнорує — пошкодують!",
        ],
    },
    {
        "id": "C3",
        "category": "C",
        "expected": (0, 45),
        "title": "Захід зраджує Україну: підготовка до капітуляції вже йде",
        "url": "https://propaganda-source.info/west-betrayal/",
        "paragraphs": [
            "Західні покровителі України готують ганебну здачу своїх зобов'язань, це стає дедалі очевиднішим.",
            "Жоден з нібито 'союзників' насправді не зацікавлений у перемозі України — вони лише використовують конфлікт для збагачення своїх військово-промислових комплексів.",
            "Так званий 'безпековий пакет' від США — це лише жалюгідна подачка, яка не змінить ситуацію на полі бою.",
            "Наївні українці досі вірять у казки про 'євроінтеграцію' та 'підтримку НАТО', хоча всі розумні люди давно зрозуміли правду.",
            "Єдиний шлях для України — негайні переговори. Будь-яка інша позиція — це шлях до національної катастрофи.",
        ],
    },

    # -----------------------------------------------------------------
    # КАТЕГОРІЯ D: Edge Cases
    # -----------------------------------------------------------------
    {
        "id": "D1",
        "category": "D",
        "expected": (20, 100),
        "title": "Коротка новина: обстріл Харкова",
        "url": "https://suspilne.media/news/short-kharkiv",
        "paragraphs": [
            "Внаслідок ракетного обстрілу Харкова пошкоджені житлові будинки. За попередніми даними ДСНС, постраждали 3 особи.",
        ],
    },
    {
        "id": "D2",
        "category": "D",
        "expected": (50, 100),
        "title": "Parliament passes new defense spending bill amid ongoing conflict",
        "url": "https://reuters.com/world/europe/ukraine-defense-spending-2026",
        "paragraphs": [
            "Ukraine's parliament on Friday passed a sweeping defense spending bill allocating an additional $12 billion to military needs for 2026.",
            "The legislation, approved with 285 votes in favor, increases total defense expenditure to approximately 26% of GDP.",
            "Defense Minister Rustem Umerov called the move 'essential for sustaining Ukraine's defensive capabilities through a protracted conflict.'",
            "NATO Secretary General Mark Rutte welcomed the decision, stating it 'demonstrates Ukraine's commitment to its own defense.'",
            "The bill includes provisions for domestic weapons production, with a focus on drone and electronic warfare systems, according to the Ministry of Defense.",
            "Analysts at the International Institute for Strategic Studies (IISS) noted that Ukraine's per-capita defense spending now exceeds that of most NATO members.",
        ],
    },
    {
        "id": "D3",
        "category": "D",
        "expected": (10, 100),
        "title": "Заголовок з клікбейтом але нормальний вміст стрічки є збалансованим",
        "url": "https://news-site.ua/interesting-article",
        "paragraphs": [
            "Незважаючи на клікбейтний заголовок, стаття містить збалансовану інформацію з посиланнями на офіційні джерела.",
            "За даними Державної служби статистики, рівень безробіття в Україні у I кварталі 2026 року склав 14.2%.",
            "Міністр соціальної політики зазначив, що програми перекваліфікації вже охопили понад 50 тисяч ветеранів.",
            "Експерти Київської школи економіки прогнозують поступове відновлення ринку праці у другій половині року.",
        ],
    },
    {
        "id": "D4",
        "category": "D",
        "expected": (0, 100),
        "title": "ОГОЛОШЕННЯ: РОЗПРОДАЖ ДО 90%! ТІЛЬКИ СЬОГОДНІ!",
        "url": "https://shop-best-prices.com/mega-sale",
        "paragraphs": [
            "Найбільший розпродаж року! Знижки до 90% на всі товари! Купуйте зараз, поки не розібрали!",
            "Тільки сьогодні — безкоштовна доставка по всій Україні.",
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
            "expected_range": f"{lo}–{hi}",
            "trust_score": trust,
            "in_range": "✅" if in_range else "❌",
            "source_verification": data["criteria"]["source_verification"],
            "objectivity": data["criteria"]["objectivity"],
            "headline_relevance": data["criteria"]["headline_relevance"],
            "factual_density": data["criteria"]["factual_density"],
            "logical_consistency": data["criteria"]["logical_consistency"],
            "highlights": len(data.get("highlights", [])),
            "explainer": data.get("explainer", "")[:150],
            "elapsed_s": elapsed,
            "status": "OK",
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
                print(f"         Score: {ts} (expected {rng}) {ok}  [{t}s]")
                print(f"         Src:{result['source_verification']} Obj:{result['objectivity']} "
                      f"Head:{result['headline_relevance']} Dens:{result['factual_density']} "
                      f"Logic:{result['logical_consistency']} Highlights:{result['highlights']}")
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
        label = {"A": "Якісні", "B": "Середні", "C": "Маніпулятивні", "D": "Edge Cases"}.get(cat, cat)
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
    if ok_results:
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=ok_results[0].keys())
            writer.writeheader()
            writer.writerows(ok_results)
        print(f"\n  💾 Results saved: {csv_path}")

    # Also save latest for charting
    latest_path = RESULTS_DIR / "latest_results.csv"
    if ok_results:
        with open(latest_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=ok_results[0].keys())
            writer.writeheader()
            writer.writerows(ok_results)

    print("\n" + "=" * 65)
    print("  ✅ Benchmark complete!")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
