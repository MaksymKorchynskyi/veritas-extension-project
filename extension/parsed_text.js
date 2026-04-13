/**
 * VERITAS — Parsed Text & Test Dashboard
 * Handles tab switching, parsed text display, and benchmark test runner.
 * Extracted from inline script for Manifest V3 CSP compliance.
 */

// ═══════════════════════════════════════════════════════════════
// TAB SWITCHING
// ═══════════════════════════════════════════════════════════════
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// Check URL params — if ?tab=tests, switch to tests tab
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('tab') === 'tests') {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector('[data-tab="tests"]').classList.add('active');
  document.getElementById('tab-tests').classList.add('active');
}

// ═══════════════════════════════════════════════════════════════
// TAB 1: PARSED TEXT
// ═══════════════════════════════════════════════════════════════
(async () => {
  const tabId = urlParams.get('tabId');
  const titleEl = document.getElementById('pt-title');
  const urlEl = document.getElementById('pt-url');
  const statusEl = document.getElementById('pt-status');
  const contentEl = document.getElementById('pt-content');
  const statsBar = document.getElementById('pt-stats');

  if (!tabId) {
    titleEl.textContent = 'No tab selected';
    titleEl.classList.remove('pulse');
    contentEl.innerHTML = '<div class="error-box"><div style="font-size:2rem">📄</div><h3>No Tab ID</h3><p>Open this page from the VERITAS popup by clicking the document icon.</p></div>';
    return;
  }

  try {
    const data = await chrome.storage.local.get(`state_${tabId}`);
    const state = data[`state_${tabId}`];
    if (!state || (!state.extractedParagraphs && !state.extractedText)) {
      titleEl.textContent = 'No data available';
      titleEl.classList.remove('pulse');
      contentEl.innerHTML = '<div class="error-box"><div style="font-size:2rem">⚠️</div><h3>No Analysis Data</h3><p>Run an analysis first by clicking "Analyze This Article" in the popup.</p></div>';
      return;
    }

    const hostname = state.url ? new URL(state.url).hostname.replace('www.','') : 'Unknown';
    titleEl.textContent = hostname + ' — Article';
    titleEl.classList.remove('pulse');
    urlEl.innerHTML = `<a href="${state.url}" target="_blank">${state.url}</a>`;
    const sc = state.status === 'done' ? 'ok' : state.status === 'error' ? 'err' : 'warn';
    statusEl.innerHTML = `<span class="badge badge-${sc}">${(state.status||'unknown').toUpperCase()}</span>`;

    let fullText = '';
    if (state.extractedParagraphs?.length) {
      let h = '<div class="card">';
      state.extractedParagraphs.forEach(p => {
        h += `<div class="para"><span class="para-id">#${p.id}</span><p class="para-text">${esc(p.text)}</p></div>`;
        fullText += p.text + ' ';
      });
      h += '</div>';
      contentEl.innerHTML = h;
      document.getElementById('pt-paras').textContent = state.extractedParagraphs.length;
    } else {
      fullText = state.extractedText;
      contentEl.innerHTML = `<div class="card"><div class="raw-text">${esc(state.extractedText)}</div></div>`;
      document.getElementById('pt-paras').textContent = state.extractedText.split('\n\n').filter(p=>p.trim()).length;
    }
    document.getElementById('pt-words').textContent = fullText.trim().split(/\s+/).filter(w=>w).length.toLocaleString();
    document.getElementById('pt-chars').textContent = fullText.length.toLocaleString();
    statsBar.style.display = 'flex';
  } catch(e) {
    titleEl.textContent = 'Error'; titleEl.classList.remove('pulse');
    contentEl.innerHTML = `<div class="error-box"><div style="font-size:2rem">❌</div><h3>Load Failed</h3><p>${esc(e.message)}</p></div>`;
  }
})();

function esc(t){ const d=document.createElement('div'); d.textContent=t; return d.innerHTML; }

// ═══════════════════════════════════════════════════════════════
// TAB 2: TEST DASHBOARD — Real Articles Dataset
// ═══════════════════════════════════════════════════════════════
const API = 'http://127.0.0.1:8000/analyze';

const ARTICLES = [
  // ─── A: High Quality ───
  {
    id:"A1", cat:"A", expect:[60,100],
    title:"Зеленський підписав закон про посилення відповідальності за порушення військового обліку",
    url:"https://www.pravda.com.ua/news/2025/04/03/7455000/",
    paragraphs:[
      "Президент України Володимир Зеленський підписав закон №12121 про посилення адміністративної та кримінальної відповідальності за порушення законодавства у сфері військового обліку.",
      "Про це повідомляє прес-служба Верховної Ради України із посиланням на офіційний портал ВРУ.",
      "Закон був ухвалений Верховною Радою 3 квітня 2025 року голосами 264 народних депутатів.",
      "Згідно з документом, штрафи за неявку до ТЦК зростають з 3400 грн до 25 500 грн. За повторне порушення передбачається кримінальна відповідальність.",
      "Міністерство оборони України підтримало законопроєкт, зазначивши, що він є необхідним кроком для забезпечення належного рівня мобілізації.",
      "Правозахисні організації, зокрема Amnesty International Ukraine, висловили занепокоєння щодо пропорційності покарань та закликали до забезпечення права на оскарження.",
    ]
  },
  {
    id:"A2", cat:"A", expect:[60,100],
    title:"EU approves new €50 billion aid package for Ukraine",
    url:"https://www.reuters.com/world/europe/eu-aid-ukraine-2025/",
    paragraphs:[
      "The European Union formally approved a landmark €50 billion aid package for Ukraine on Thursday, marking one of the largest financial commitments by the bloc since the start of the conflict.",
      "The package, agreed upon by all 27 member states, includes €33 billion in loans and €17 billion in grants to be disbursed over four years from 2024 to 2027.",
      "European Commission President Ursula von der Leyen stated: 'This facility will provide stable and predictable financial support that Ukraine needs to maintain essential services and begin reconstruction.'",
      "Hungarian Prime Minister Viktor Orban had previously blocked the measure but agreed after negotiations secured additional review mechanisms.",
      "Ukrainian President Volodymyr Zelensky praised the decision, calling it 'a signal of unwavering European solidarity.'",
      "According to the International Monetary Fund, Ukraine's GDP contracted by 29.1% in 2022 but showed recovery signs with 5.3% growth in 2023.",
    ]
  },
  {
    id:"A3", cat:"A", expect:[60,100],
    title:"Нацбанк зберіг облікову ставку на рівні 13% — роз'яснення регулятора",
    url:"https://www.liga.net/ua/economics/news/nbu-rate-decision-2025",
    paragraphs:[
      "Правління Національного банку України на засіданні 24 квітня 2025 року ухвалило рішення зберегти облікову ставку на рівні 13% річних.",
      "Як зазначається у прес-релізі НБУ, рішення зумовлене збереженням інфляційних ризиків на тлі невизначеності щодо безпекової ситуації.",
      "Інфляція у березні 2025 року склала 5.8% у річному вимірі, що відповідає прогнозній траєкторії регулятора.",
      "Голова НБУ Андрій Пишний зазначив на брифінгу: 'Ми продовжуємо цикл пом'якшення монетарної політики, проте темпи залежатимуть від макроекономічних умов'.",
      "Аналітики Dragon Capital прогнозують зниження ставки до 12% у другій половині 2025 року.",
      "Курс гривні на міжбанківському ринку залишився стабільним на рівні 41.35 грн за долар після оголошення рішення.",
    ]
  },
  {
    id:"A4", cat:"A", expect:[60,100],
    title:"ISW: Росія перекидає додаткові підрозділи на Покровський напрямок",
    url:"https://www.ukrinform.ua/rubric-ato/isw-pokrovsk-2025.html",
    paragraphs:[
      "Аналітики Інституту вивчення війни (ISW) повідомляють, що командування російських збройних сил перекидає додаткові батальйони на Покровський напрямок.",
      "У щоденному звіті ISW від 2 квітня зазначається, що Росія зосередила до 40 000 особового складу на ділянці між Покровськом та Селидовим.",
      "Генеральний штаб ЗСУ за минулу добу зафіксував 87 бойових зіткнень на Донецькому напрямку, з яких 34 — на Покровському відтинку.",
      "Речник Східного оперативного угруповання полковник Дмитро Ліхогляд повідомив, що втрати противника за минулий тиждень склали понад 3 200 особового складу.",
      "Координатор стратегічних комунікацій Ради національної безпеки США Джон Кірбі підтвердив, що ситуація на Покровському напрямку залишається 'найбільш напруженою' серед усіх ділянок фронту.",
    ]
  },

  // ─── B: Medium Quality ───
  {
    id:"B1", cat:"B", expect:[30,75],
    title:"Рада може ухвалити скандальний законопроєкт вже наступного тижня",
    url:"https://regional-news.com.ua/politics/rada-scandal-2025",
    paragraphs:[
      "Уже наступного тижня Верховна Рада може розглянути вкрай неоднозначний законопроєкт, який викликав бурхливу реакцію суспільства.",
      "На думку автора цієї статті, ця ініціатива є прямим наслідком лобістських зусиль великих корпорацій, які прагнуть монополізувати ринок.",
      "Один з нардепів від опозиції, який побажав залишитися анонімним, назвав законопроєкт 'справжньою катастрофою для малого та середнього бізнесу в Україні'.",
      "Деякі експерти вважають, що прийняття цього закону може призвести до зростання безробіття на 15-20% протягом першого року.",
      "Водночас прихильники законопроєкту зазначають, що він сприятиме модернізації окремих галузей промисловості та залученню іноземних інвестицій.",
    ]
  },
  {
    id:"B2", cat:"B", expect:[30,75],
    title:"Чому ціни на пальне знову зростуть — аналіз для простих людей",
    url:"https://blog-economics.ua/oil-prices-analysis-2025",
    paragraphs:[
      "Після тимчасового зниження ціни на бензин та дизельне паливо знову повзуть угору. Це, мабуть, нікого вже не дивує.",
      "На мою думку, головна причина — це непомірна жадібність нафтотрейдерів, які використовують будь-яку нагоду для збагачення за рахунок простих громадян.",
      "За інформацією з неназваних джерел у паливному секторі, маржа на АЗС зараз складає рекордні 8.5 гривень на кожному літрі палива.",
      "Слід зазначити, що Антимонопольний комітет до цих пір не провів жодного ефективного розслідування щодо картельної змови на паливному ринку.",
      "Я прогнозую, що до літа середня ціна за літр А-95 перевищить 60 гривень, якщо влада нарешті не вживе рішучих та жорстких заходів.",
    ]
  },
  {
    id:"B3", cat:"B", expect:[30,75],
    title:"Як український стартап став конкурентом Notion — думка засновника",
    url:"https://tech-blog-ua.com/startup-notion-competitor/",
    paragraphs:[
      "Український стартап з Львова створив інструмент для управління проєктами, який, за словами засновників, може скласти реальну конкуренцію Notion та Trello.",
      "Команда з 12 інженерів, колишніх працівників SoftServe та Grammarly, залучила 3 мільйони доларів seed-інвестицій від фонду Horizon Capital.",
      "Головна перевага продукту — використання ШІ для автоматичної пріоритизації завдань. Однак деталі алгоритму засновники не розкривають.",
      "Скептики зазначають, що конкурувати на глобальному ринку з продуктами рівня Notion вкрай складно без маркетингового бюджету від 50 мільйонів доларів.",
      "На суб'єктивну думку засновника, унікальна ніша існує серед компаній, які працюють у сфері defence tech та потребують захищеного рішення.",
    ]
  },

  // ─── C: Manipulative / Fake ───
  {
    id:"C1", cat:"C", expect:[0,45],
    title:"ШОК! ВЛАДА ПРИХОВУЄ ПРАВДУ! МОБІЛІЗАЦІЮ ТАЄМНО СКАСУВАЛИ!",
    url:"https://fake-news-ua.xyz/shock-mobilization-cancelled/",
    paragraphs:[
      "Покидьки з влади знову зрадили народ! Це ганебне рішення доведе всьому світу, що ця огидна істерика ні до чого доброго не призведе!",
      "Мобілізацію нібито офіційно скасували, але владні безчестивці замовчують цю злочинну таємницю від простих людей!",
      "Деякі експерти вважають, що мобілізація — це справжній злочин проти людства та грубе порушення всіх конституційних прав та свобод громадян.",
      "Жодне авторитетне джерело не підтвердило цю інформацію, але ми абсолютно впевнені, що це стовідсоткова правда, яку приховує корумпована влада.",
      "ПІДПИСУЙТЕСЬ НА НАШ ТЕЛЕГРАМ КАНАЛ для ексклюзивних шокуючих новин, яких ви НІКОЛИ не побачите у продажних та підконтрольних ЗМІ!",
    ]
  },
  {
    id:"C2", cat:"C", expect:[0,45],
    title:"ТЕРМІНОВО!!! ВИ НЕ ПОВІРИТЕ ЩО ВІДКРИЛИ ВЧЕНІ!!!",
    url:"https://clickbait-extreme.com/scientists-discovery/",
    paragraphs:[
      "Вчені зробили геніальне відкриття, яке перевернуло уявлення всього наукового світу та шокувало буквально кожного!",
      "Хоча конкретні деталі тримаються в суворій таємниці, наші ексклюзивні інсайдери повідомили, що це стосується методу лікування від усіх відомих хвороб.",
      "Підлі фармацевтичні гіганти панічно намагаються приховати цю руйнівну для їхнього бізнесу інформацію, бо вона знищить мільярдні доходи Big Pharma!",
      "Перешліть це повідомлення мінімум 10 друзям і ви першими отримаєте доступ до ексклюзивних деталей. Хто проігнорує — гірко про це пошкодує!",
    ]
  },
  {
    id:"C3", cat:"C", expect:[0,45],
    title:"Захід цинічно зраджує Україну — таємна підготовка до капітуляції",
    url:"https://propaganda-analysis.info/west-betrayal-ukraine/",
    paragraphs:[
      "Західні покровителі України готують ганебну здачу всіх своїх зобов'язань. Це стає дедалі очевиднішим для кожної мислячої людини.",
      "Жоден з так званих 'союзників' насправді не зацікавлений у перемозі України. Вони лише цинічно використовують конфлікт для безсоромного збагачення військово-промислових комплексів своїх країн.",
      "Так званий 'безпековий пакет' від США — це лише жалюгідна подачка, яка нічого принципово не змінить на полі бою. Це знає кожен експерт.",
      "Наївні та довірливі українці досі вірять у казки про 'євроінтеграцію' та 'членство в НАТО', хоча всі розумні люди давно зрозуміли гірку правду.",
      "Єдиний можливий шлях для України — це негайні мирні переговори без будь-яких попередніх умов. Будь-яка інша позиція — це прямий шлях до національної катастрофи.",
    ]
  },
];

// ─── Render Articles ───
function renderArticles() {
  const c = document.getElementById('testArticlesContainer');
  const cats = {
    A: { label:"Якісні статті (авторитетні джерела)", desc:"Очікуваний: 60–100" },
    B: { label:"Середня якість (bias / мало джерел)", desc:"Очікуваний: 30–75" },
    C: { label:"Маніпулятивні / фейкові", desc:"Очікуваний: 0–45" },
  };
  let html = '', curCat = '';
  for (const a of ARTICLES) {
    if (a.cat !== curCat) {
      curCat = a.cat;
      const ci = cats[curCat];
      html += '<div class="cat-header"><span class="cat-badge" style="background:var(--' + (curCat==='A'?'green':curCat==='B'?'yellow':'red') + ')">' + curCat + '</span><h3>' + ci.label + '</h3><span class="cat-desc">' + ci.desc + '</span></div>';
    }
    const wordCount = a.paragraphs.join(' ').split(/\s+/).length;
    html += '<div class="test-article" id="row-' + a.id + '">' +
      '<div class="ta-id">' + a.id + '</div>' +
      '<div class="ta-info">' +
        '<div class="ta-title" title="' + esc(a.title) + '">' + esc(a.title) + '</div>' +
        '<div class="ta-meta">' + a.paragraphs.length + ' paragraphs · ' + wordCount + ' words</div>' +
        '<span class="ta-expect ta-expect-' + a.cat.toLowerCase() + '">Очікуваний: ' + a.expect[0] + '–' + a.expect[1] + '</span>' +
      '</div>' +
      '<div class="ta-result" id="res-' + a.id + '"><span class="ta-status" style="color:var(--text-sec)">Pending</span></div>' +
    '</div>';
  }
  c.innerHTML = html;
}
renderArticles();

// Bind buttons (no inline onclick in MV3)
document.getElementById('runAllBtn').addEventListener('click', runAllTests);
document.getElementById('exportBtn').addEventListener('click', exportCSV);

// ─── Run All Tests ───
let testResults = [];

async function runAllTests() {
  const btn = document.getElementById('runAllBtn');
  btn.disabled = true;
  btn.textContent = '⏳ Running...';
  testResults = [];

  document.getElementById('progressWrap').style.display = 'block';
  document.getElementById('summarySection').style.display = 'none';

  // Reset all rows
  ARTICLES.forEach(a => {
    const row = document.getElementById('row-' + a.id);
    row.className = 'test-article';
    document.getElementById('res-' + a.id).innerHTML = '<span class="ta-status" style="color:var(--text-sec)">Waiting...</span>';
  });

  for (let i = 0; i < ARTICLES.length; i++) {
    const a = ARTICLES[i];
    const row = document.getElementById('row-' + a.id);
    const resEl = document.getElementById('res-' + a.id);
    row.className = 'test-article running';
    resEl.innerHTML = '<span class="ta-status color-yellow">Analyzing...</span>';

    // Update progress
    document.getElementById('progressFill').style.width = ((i) / ARTICLES.length * 100) + '%';
    document.getElementById('progressText').textContent = (i + 1) + ' / ' + ARTICLES.length + ' — ' + a.id;

    const paragraphs = a.paragraphs.map((p, idx) => ({ id: idx + 1, text: p }));
    const html_content = a.paragraphs.map(p => '<p>' + p + '</p>').join('');
    const payload = { url: a.url, title: a.title, html_content: html_content, paragraphs: paragraphs, language: 'uk' };

    const start = performance.now();
    try {
      const resp = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const elapsed = ((performance.now() - start) / 1000).toFixed(1);

      if (!resp.ok) {
        row.className = 'test-article failed';
        resEl.innerHTML = '<span class="ta-status color-red">HTTP ' + resp.status + '</span><div class="ta-time">' + elapsed + 's</div>';
        testResults.push({ id: a.id, cat: a.cat, status: 'error', elapsed: elapsed });
        continue;
      }

      const data = await resp.json();
      const score = data.trust_score;
      const lo = a.expect[0], hi = a.expect[1];
      const pass = score >= lo && score <= hi;

      row.className = 'test-article ' + (pass ? 'passed' : 'failed');
      const scoreColor = score >= 70 ? 'green' : score >= 40 ? 'yellow' : 'red';
      resEl.innerHTML =
        '<div class="ta-score color-' + scoreColor + '">' + score + '</div>' +
        '<div class="ta-time">' + elapsed + 's · ' + (pass ? '✅' : '❌') + '</div>';

      testResults.push({
        id: a.id, cat: a.cat, title: a.title, score: score, expected: lo + '-' + hi,
        pass: pass, elapsed: elapsed,
        src: data.criteria.source_verification,
        obj: data.criteria.objectivity,
        head: data.criteria.headline_relevance,
        dens: data.criteria.factual_density,
        logic: data.criteria.logical_consistency,
        highlights: (data.highlights || []).length,
      });

    } catch(e) {
      row.className = 'test-article failed';
      resEl.innerHTML = '<span class="ta-status color-red">Error</span><div class="ta-time">' + e.message.substring(0,30) + '</div>';
      testResults.push({ id: a.id, cat: a.cat, status: 'exception', error: e.message });
    }

    // Small delay to avoid overwhelming the backend
    await new Promise(r => setTimeout(r, 1500));
  }

  document.getElementById('progressFill').style.width = '100%';
  document.getElementById('progressText').textContent = 'Done — ' + ARTICLES.length + ' / ' + ARTICLES.length;
  btn.disabled = false;
  btn.textContent = '▶ Run All Tests';

  showSummary();
}

function showSummary() {
  const ok = testResults.filter(r => r.score !== undefined);
  if (!ok.length) return;

  const correct = ok.filter(r => r.pass).length;
  const accuracy = ((correct / ok.length) * 100).toFixed(0);

  const catA = ok.filter(r => r.cat === 'A').map(r => r.score);
  const catC = ok.filter(r => r.cat === 'C').map(r => r.score);
  const avgA = catA.length ? catA.reduce((a, b) => a + b, 0) / catA.length : 0;
  const avgC = catC.length ? catC.reduce((a, b) => a + b, 0) / catC.length : 0;
  const gap = (avgA - avgC).toFixed(0);

  const avgTime = (ok.reduce((a, r) => a + parseFloat(r.elapsed), 0) / ok.length).toFixed(1);

  document.getElementById('sumAccuracy').textContent = accuracy + '%';
  document.getElementById('sumAccuracy').className = 'summary-val ' + (parseInt(accuracy) >= 80 ? 'color-green' : 'color-red');
  document.getElementById('sumSeparation').textContent = gap + ' pts';
  document.getElementById('sumAvgTime').textContent = avgTime + 's';
  document.getElementById('sumTotal').textContent = correct + '/' + ok.length;
  document.getElementById('summarySection').style.display = 'block';
}

function exportCSV() {
  if (!testResults.length) { alert('Run tests first!'); return; }
  let csv = 'ID,Category,Title,Score,Expected,Pass,Elapsed_s,Source,Objectivity,Headline,Density,Logic,Highlights\n';
  for (const r of testResults) {
    if (r.score === undefined) continue;
    csv += r.id + ',' + r.cat + ',"' + r.title + '",' + r.score + ',' + r.expected + ',' + (r.pass?'YES':'NO') + ',' + r.elapsed + ',' + r.src + ',' + r.obj + ',' + r.head + ',' + r.dens + ',' + r.logic + ',' + r.highlights + '\n';
  }
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'veritas_test_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
}
