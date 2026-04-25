/**
 * VERITAS — Parsed Text & Test Dashboard & Write & Analyze
 * Handles tab switching, parsed text display, i18n, and benchmark test runner.
 * Extracted from inline script for Manifest V3 CSP compliance.
 */

// ═══════════════════════════════════════════════════════════════
// i18n — TRANSLATIONS
// ═══════════════════════════════════════════════════════════════
const ptTranslations = {
  "uk": {
    "brand_sub": "Аналіз Статей",
    "back_to_article": "Назад до Статті",
    "tab_reader": "📄 Читач Статей",
    "tab_tests": "🧪 Тест Дашборд",
    "tab_write": "✍️ Написати & Аналіз",
    "stat_paragraphs": "Абзаци",
    "stat_words": "Слова",
    "stat_characters": "Символи",
    "trust_score": "Рейтинг Довіри",
    "criteria_breakdown": "Розбивка Критеріїв",
    "found_issues": "Знайдені Проблеми",
    "ai_summary": "AI Підсумок",
    "run_all_tests": "▶ Запустити Всі Тести",
    "export_csv": "💾 Експорт CSV",
    "accuracy": "Точність",
    "avg_time": "Сер. Час",
    "total": "Всього",
    "loading_article": "Завантаження статті…",
    "loading_parsed": "Завантаження тексту…",
    "no_tab_id": "Немає Tab ID",
    "no_tab_id_msg": "Відкрийте цю сторінку з попапа VERITAS натиснувши іконку документа.",
    "no_analysis_data": "Немає Даних Аналізу",
    "no_analysis_data_msg": "Спершу запустіть аналіз натиснувши \"Аналізувати Цю Статтю\" в попапі.",
    "load_failed": "Помилка Завантаження",
    "no_analysis_msg": "Дані аналізу з'являться тут після запуску аналізу.",
    // Criteria names
    "cr_source": "Перевірка Джерел",
    "cr_objectivity": "Об'єктивність",
    "cr_headline": "Релевантність Заголовка",
    "cr_density": "Фактологічна Щільність",
    "cr_logic": "Логічна Послідовність",
    // Write & Analyze
    "write_title_label": "Заголовок Статті",
    "write_title_placeholder": "Введіть заголовок статті...",
    "write_url_label": "URL Статті",
    "write_url_placeholder": "https://example.com/article",
    "write_text_label": "Текст Статті",
    "write_text_placeholder": "Вставте або напишіть текст статті тут...\nРозділяйте абзаци порожніми рядками.",
    "write_text_hint": "Розділяйте абзаци порожніми рядками. Кожен абзац буде проаналізовано окремо.",
    "write_refs_label": "Посилання",
    "write_refs_placeholder": "https://source1.com\nhttps://source2.com",
    "write_refs_hint": "По одному URL на рядок. Посилання, на які посилається ця стаття.",
    "optional": "(необов'язково)",
    "write_analyze_btn": "🔍 Аналізувати Статтю",
    "write_analyzing": "Аналізуємо вашу статтю...",
    "write_error_title": "Вкажіть заголовок статті.",
    "write_error_text": "Вкажіть текст статті.",
    "write_error_api": "Помилка аналізу",
    "hl_risk": "🔴 Ризик",
    "hl_warning": "🟡 Попередження",
    "high_risk_label": "Високий Ризик",
    "warning_label": "Попередження",
  },
  "en": {
    "brand_sub": "Article Analysis Reader",
    "back_to_article": "Back to Article",
    "tab_reader": "📄 Article Reader",
    "tab_tests": "🧪 Test Dashboard",
    "tab_write": "✍️ Write & Analyze",
    "stat_paragraphs": "Paragraphs",
    "stat_words": "Words",
    "stat_characters": "Characters",
    "trust_score": "Trust Score",
    "criteria_breakdown": "Criteria Breakdown",
    "found_issues": "Found Issues",
    "ai_summary": "AI Summary",
    "run_all_tests": "▶ Run All Tests",
    "export_csv": "💾 Export CSV",
    "accuracy": "Accuracy",
    "avg_time": "Avg Time",
    "total": "Total",
    "loading_article": "Loading article…",
    "loading_parsed": "Fetching parsed text…",
    "no_tab_id": "No Tab ID",
    "no_tab_id_msg": "Open this page from the VERITAS popup by clicking the document icon.",
    "no_analysis_data": "No Analysis Data",
    "no_analysis_data_msg": "Run an analysis first by clicking \"Analyze This Article\" in the popup.",
    "load_failed": "Load Failed",
    "no_analysis_msg": "Analysis data will appear here after running an analysis.",
    // Criteria names
    "cr_source": "Source Verification",
    "cr_objectivity": "Objectivity",
    "cr_headline": "Headline Relevance",
    "cr_density": "Factual Density",
    "cr_logic": "Logical Consistency",
    // Write & Analyze
    "write_title_label": "Article Title",
    "write_title_placeholder": "Enter article title...",
    "write_url_label": "Article URL",
    "write_url_placeholder": "https://example.com/article",
    "write_text_label": "Article Text",
    "write_text_placeholder": "Paste or write your article text here...\nSeparate paragraphs with blank lines.",
    "write_text_hint": "Separate paragraphs with blank lines. Each paragraph will be analyzed individually.",
    "write_refs_label": "Reference Links",
    "write_refs_placeholder": "https://source1.com\nhttps://source2.com",
    "write_refs_hint": "One URL per line. Links that this article references.",
    "optional": "(optional)",
    "write_analyze_btn": "🔍 Analyze Article",
    "write_analyzing": "Analyzing your article...",
    "write_error_title": "Please enter an article title.",
    "write_error_text": "Please enter article text.",
    "write_error_api": "Analysis error",
    "hl_risk": "🔴 Risk",
    "hl_warning": "🟡 Warning",
    "high_risk_label": "High Risk",
    "warning_label": "Warning",
  }
};

let ptCurrentLanguage = 'uk';

function t(key) {
  const dict = ptTranslations[ptCurrentLanguage] || ptTranslations["uk"];
  return dict[key] || ptTranslations["en"][key] || key;
}

function applyPageTranslations() {
  const dict = ptTranslations[ptCurrentLanguage] || ptTranslations["uk"];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });
  // Translate placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) el.placeholder = dict[key];
  });
}

// ═══════════════════════════════════════════════════════════════
// LANGUAGE INIT & BACK BUTTON
// ═══════════════════════════════════════════════════════════════
(async () => {
  // Load saved language
  try {
    const storage = await chrome.storage.local.get(['appLanguage']);
    if (storage.appLanguage) {
      ptCurrentLanguage = storage.appLanguage;
    }
  } catch (e) { /* Not in extension context, use default */ }

  const langSelect = document.getElementById('pageLangSelect');
  if (langSelect) {
    langSelect.value = ptCurrentLanguage;
    applyPageTranslations();
    langSelect.addEventListener('change', async (e) => {
      ptCurrentLanguage = e.target.value;
      try {
        await chrome.storage.local.set({ appLanguage: ptCurrentLanguage });
      } catch (ex) { /* ignore */ }
      applyPageTranslations();
    });
  }

  // Back to Article button
  const urlParams = new URLSearchParams(window.location.search);
  const articleUrl = urlParams.get('articleUrl') ? decodeURIComponent(urlParams.get('articleUrl')) : null;
  const backBtn = document.getElementById('backToArticleBtn');
  if (backBtn) {
    if (articleUrl) {
      backBtn.href = articleUrl;
      backBtn.addEventListener('click', (e) => {
        // Navigate current tab to article URL
        e.preventDefault();
        window.location.href = articleUrl;
      });
    } else {
      backBtn.style.display = 'none';
    }
  }
})();


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
} else if (urlParams.get('tab') === 'write') {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector('[data-tab="write"]').classList.add('active');
  document.getElementById('tab-write').classList.add('active');
}

// ═══════════════════════════════════════════════════════════════
// TAB 1: PARSED TEXT — Premium Article Reader
// ═══════════════════════════════════════════════════════════════
(async () => {
  const tabId = urlParams.get('tabId');
  const articleUrl = urlParams.get('articleUrl') ? decodeURIComponent(urlParams.get('articleUrl')) : null;

  const titleEl = document.getElementById('pt-title');
  const urlEl = document.getElementById('pt-url');
  const sourceDomainEl = document.getElementById('pt-source-domain');
  const contentEl = document.getElementById('pt-content');
  const statsBar = document.getElementById('pt-stats');
  const layoutEl = document.getElementById('pt-layout');
  const headerEl = document.getElementById('pt-header');
  const errorContainer = document.getElementById('pt-error-container');

  function showError(icon, title, message) {
    headerEl.style.display = 'none';
    layoutEl.style.display = 'none';
    errorContainer.innerHTML = `<div class="error-box"><div style="font-size:2.5rem">${icon}</div><h3>${title}</h3><p>${message}</p></div>`;
  }

  if (!tabId && !articleUrl) {
    showError('📄', t('no_tab_id'), t('no_tab_id_msg'));
    return;
  }

  // ─── Fetch Data (two sources) ───
  let state = null;
  let analysisResult = null;

  // Source 1: Tab state (active session)
  if (tabId) {
    try {
      const data = await chrome.storage.local.get(`state_${tabId}`);
      const tabState = data[`state_${tabId}`];
      if (tabState && (tabState.extractedParagraphs || tabState.extractedText)) {
        state = tabState;
        analysisResult = tabState.result || null;
        console.log('[VERITAS PT] Loaded from tab state');
      }
    } catch (e) {
      console.warn('[VERITAS PT] Tab state lookup failed:', e.message);
    }
  }

  // Source 2: URL-keyed persistent cache (fallback after reload)
  if (!state && articleUrl) {
    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { action: 'GET_CACHED_FULL', url: articleUrl },
          (resp) => resolve(resp)
        );
      });
      if (response?.found && response.extractedParagraphs) {
        state = {
          url: response.url || articleUrl,
          status: response.status || 'complete',
          extractedParagraphs: response.extractedParagraphs,
          articleTitle: response.articleTitle || ''
        };
        analysisResult = response.result || null;
        console.log('[VERITAS PT] Loaded from URL-keyed cache');
      }
    } catch (e) {
      console.warn('[VERITAS PT] URL cache lookup failed:', e.message);
    }
  }

  if (!state || (!state.extractedParagraphs && !state.extractedText)) {
    showError('⚠️', t('no_analysis_data'), t('no_analysis_data_msg'));
    return;
  }

  // ─── Render Article ───
  try {
    const effectiveUrl = state.url || articleUrl || '';
    let hostname = 'Unknown';
    try { hostname = new URL(effectiveUrl).hostname.replace('www.', ''); } catch(_) {}

    // Article title
    const articleTitle = state.articleTitle || '';
    if (articleTitle) {
      titleEl.textContent = articleTitle;
    } else {
      titleEl.textContent = hostname;
    }
    titleEl.classList.remove('pulse', 'loading-title');

    // Source link
    sourceDomainEl.textContent = hostname;
    urlEl.href = effectiveUrl;

    // Build highlight map: paragraph_id -> highlight data
    const highlightMap = {};
    const actualHighlights = [];
    if (analysisResult?.highlights?.length) {
      for (const h of analysisResult.highlights) {
        if (h.paragraph_id !== undefined && h.paragraph_id !== null) {
          highlightMap[h.paragraph_id] = h;
          actualHighlights.push(h);
        }
      }
    }

    // Render paragraphs
    let fullText = '';
    if (state.extractedParagraphs?.length) {
      let h = '';
      state.extractedParagraphs.forEach((p, idx) => {
        const hl = highlightMap[p.id];
        const hlClass = hl ? (hl.severity === 'risk' ? 'hl-risk' : 'hl-warning') : '';
        const tooltipId = `tooltip-${p.id}`;

        h += `<div class="para ${hlClass}" data-para-id="${p.id}">`;
        h += `<span class="para-id">#${p.id}</span>`;
        h += `<p class="para-text">${esc(p.text)}</p>`;

        if (hl) {
          const sevLabel = hl.severity === 'risk' ? t('hl_risk') : t('hl_warning');
          h += `<div class="hl-badge ${hl.severity}" data-tooltip="${tooltipId}">`;
          h += `${sevLabel} — ${esc(hl.category || '')}`;
          h += `</div>`;
          h += `<div class="hl-tooltip ${hl.severity === 'risk' ? 'risk-bg' : 'warning-bg'}" id="${tooltipId}">`;
          h += `${esc(hl.reason || '')}`;
          h += `</div>`;
        }

        h += `</div>`;
        fullText += p.text + ' ';
      });
      contentEl.innerHTML = h;
      document.getElementById('pt-paras').textContent = state.extractedParagraphs.length;
    } else {
      fullText = state.extractedText;
      contentEl.innerHTML = `<div class="raw-text">${esc(state.extractedText)}</div>`;
      document.getElementById('pt-paras').textContent = state.extractedText.split('\n\n').filter(p => p.trim()).length;
    }

    // Stats
    document.getElementById('pt-words').textContent = fullText.trim().split(/\s+/).filter(w => w).length.toLocaleString();
    document.getElementById('pt-chars').textContent = fullText.length.toLocaleString();
    statsBar.style.display = 'flex';

    // Show layout
    layoutEl.style.display = 'grid';

    // ─── Highlight badge click → toggle tooltip ───
    contentEl.querySelectorAll('.hl-badge').forEach(badge => {
      badge.addEventListener('click', () => {
        const tooltipId = badge.dataset.tooltip;
        const tooltip = document.getElementById(tooltipId);
        if (tooltip) {
          const isVisible = tooltip.classList.contains('visible');
          // Close all other tooltips first
          contentEl.querySelectorAll('.hl-tooltip.visible').forEach(t => t.classList.remove('visible'));
          if (!isVisible) tooltip.classList.add('visible');
        }
      });
    });

    // ─── Populate Analysis Sidebar ───
    const sidebar = document.getElementById('pt-sidebar');

    if (analysisResult) {
      renderAnalysisSidebar(analysisResult, actualHighlights, 'sb', contentEl);
    } else {
      // No analysis result — hide sidebar cards except a notice
      sidebar.innerHTML = `<div class="sidebar-card"><p class="no-highlights-msg">${t('no_analysis_msg')}</p></div>`;
    }

  } catch(e) {
    console.error('[VERITAS PT] Render error:', e);
    showError('❌', t('load_failed'), esc(e.message));
  }
})();

function esc(t){ const d=document.createElement('div'); d.textContent=t; return d.innerHTML; }

// ═══════════════════════════════════════════════════════════════
// SHARED: Render analysis sidebar (used by both parsed text & write tab)
// ═══════════════════════════════════════════════════════════════
function renderAnalysisSidebar(analysisResult, actualHighlights, prefix, contentEl) {
  // Trust Score
  const score = analysisResult.trust_score || 0;
  const scoreEl = document.getElementById(prefix + '-score');
  if (scoreEl) {
    scoreEl.textContent = Math.round(score);
    scoreEl.classList.remove('score-high', 'score-mid', 'score-low');
    scoreEl.classList.add(score >= 70 ? 'score-high' : score >= 40 ? 'score-mid' : 'score-low');
  }

  // Criteria
  const c = analysisResult.criteria || {};
  const criteriaData = [
    { name: t('cr_source'), value: c.source_verification, weight: '35%' },
    { name: t('cr_objectivity'), value: c.objectivity, weight: '20%' },
    { name: t('cr_headline'), value: c.headline_relevance, weight: '15%' },
    { name: t('cr_density'), value: c.factual_density, weight: '15%' },
    { name: t('cr_logic'), value: c.logical_consistency, weight: '15%' },
  ];
  const criteriaList = document.getElementById(prefix + '-criteria');
  if (criteriaList) {
    criteriaList.innerHTML = criteriaData.map(cr => {
      const val = cr.value ?? 0;
      const color = val >= 70 ? 'var(--green)' : val >= 40 ? 'var(--yellow)' : 'var(--red)';
      return `<li class="criteria-item">
        <span class="criteria-name">${cr.name}</span>
        <div class="criteria-bar-wrap"><div class="criteria-bar" style="width:${val}%;background:${color}"></div></div>
        <span class="criteria-score" style="color:${color}">${Math.round(val)}</span>
      </li>`;
    }).join('');
  }

  // Highlights in sidebar (only actual highlights that exist)
  const hlList = document.getElementById(prefix + '-highlights');
  const hlCard = document.getElementById(prefix + '-highlights-card');
  if (hlList && actualHighlights.length > 0) {
    hlList.innerHTML = actualHighlights.map(h => {
      return `<li class="hl-summary-item" data-target-para="${h.paragraph_id}">
        <span class="hl-severity-dot ${h.severity}"></span>
        <div class="hl-summary-text">
          <span class="hl-summary-cat">${esc(h.category || (h.severity === 'risk' ? t('high_risk_label') : t('warning_label')))}</span>
          ${esc(h.reason || '')}
        </div>
      </li>`;
    }).join('');

    // Click to scroll to paragraph
    if (contentEl) {
      hlList.querySelectorAll('.hl-summary-item').forEach(item => {
        item.addEventListener('click', () => {
          const paraId = item.dataset.targetPara;
          const target = contentEl.querySelector(`[data-para-id="${paraId}"]`);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            target.style.transition = 'box-shadow 0.3s';
            target.style.boxShadow = '0 0 0 3px rgba(93,64,55,0.3)';
            setTimeout(() => { target.style.boxShadow = 'none'; }, 2000);
          }
        });
      });
    }
  } else if (hlCard) {
    hlCard.style.display = 'none';
  }

  // Explainer
  const explainerEl = document.getElementById(prefix + '-explainer');
  const explainerCard = document.getElementById(prefix + '-explainer-card');
  if (analysisResult.explainer && explainerEl) {
    explainerEl.textContent = analysisResult.explainer;
  } else if (explainerCard) {
    explainerCard.style.display = 'none';
  }
}


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
    id:"C1", cat:"C", expect:[0,20],
    title:"ЄС офіційно скасовує паперові гроші: Європарламент ухвалив скандальну директиву щодо переходу на «цифру»",
    url:"https://eu-insider-news.com/world/economy/eu-bans-cash-2024",
    paragraphs:[
      "Сьогодні вранці Європейський парламент на закритому засіданні ухвалив безпрецедентне рішення, яке назавжди змінить фінансову систему Європи. Згідно з новою Директивою 2024/89-EU, з 1 грудня 2024 року на всій території Європейського Союзу повністю забороняється використання готівкових коштів для будь-яких транзакцій.",
      "Як стало відомо з внутрішнього документа, який опинився в розпорядженні нашої редакції, єдиним законним платіжним засобом залишиться виключно цифровий євро (e-Euro), який контролюватиметься Європейським центральним банком.",
      "«Ми живемо в епоху, коли паперові гроші стали пережитком минулого, який лише сприяє тіньовій економіці та ухиленню від сплати податків. Повна цифровізація — це крок до абсолютно прозорого суспільства», — заявив під час брифінгу новопризначений Комісар з питань фінансового моніторингу Жан-Клод Мартен.",
      "Згідно з текстом директиви, жителі країн ЄС та туристи мають рівно два з половиною місяці, щоб здати всі свої банкноти та монети до спеціальних пунктів прийому, які будуть облаштовані у відділеннях поліції та поштових офісах.",
      "Після 1 грудня 2024 року будь-яка спроба розрахуватися готівкою в магазині каратиметься штрафом у розмірі від 5 000 євро, а при повторному порушенні — блокуванням усіх банківських рахунків на 30 днів.",
      "Експерти вже б'ють на сполох. Відомий економічний аналітик з Мюнхена, доктор Ганс Мюллер, зазначає: «Це катастрофа для літніх людей та малого бізнесу. Крім того, централізована цифрова валюта дозволить чиновникам відстежувати кожну покупку і за бажання одним кліком відключати неугодних громадян від фінансової системи».",
      "Новина вже викликала хвилю невдоволення. У Відні та Берліні тисячі людей почали стихійно збиратися біля будівель місцевих парламентів, вимагаючи накласти вето на рішення Брюсселя."
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
  btn.textContent = t('run_all_tests');

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


// ═══════════════════════════════════════════════════════════════
// TAB 3: WRITE & ANALYZE — Custom Article Input
// ═══════════════════════════════════════════════════════════════
document.getElementById('writeAnalyzeBtn').addEventListener('click', analyzeCustomArticle);

async function analyzeCustomArticle() {
  const titleInput = document.getElementById('writeTitle');
  const urlInput = document.getElementById('writeUrl');
  const textInput = document.getElementById('writeText');
  const refsInput = document.getElementById('writeRefs');
  const btn = document.getElementById('writeAnalyzeBtn');
  const loadingEl = document.getElementById('writeLoading');
  const resultsEl = document.getElementById('writeResults');
  const formEl = document.querySelector('.write-form');

  const title = titleInput.value.trim();
  const url = urlInput.value.trim() || 'custom://user-article';
  const text = textInput.value.trim();
  const refs = refsInput.value.trim();

  // Validation
  if (!title) {
    alert(t('write_error_title'));
    titleInput.focus();
    return;
  }
  if (!text) {
    alert(t('write_error_text'));
    textInput.focus();
    return;
  }

  // Split text into paragraphs (blank lines)
  const rawParagraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
  const paragraphs = rawParagraphs.map((p, idx) => ({ id: idx + 1, text: p }));
  const html_content = rawParagraphs.map(p => '<p>' + p + '</p>').join('');

  // Build payload
  const payload = {
    url: url,
    title: title,
    html_content: html_content,
    paragraphs: paragraphs,
    language: ptCurrentLanguage
  };

  // If user provided reference links, append them to html_content context
  if (refs) {
    const refLinks = refs.split('\n').map(r => r.trim()).filter(r => r.length > 0);
    if (refLinks.length > 0) {
      payload.html_content += '\n<div class="references">' + refLinks.map(r => `<a href="${r}">${r}</a>`).join('<br>') + '</div>';
    }
  }

  // Show loading
  btn.disabled = true;
  formEl.style.display = 'none';
  resultsEl.classList.remove('visible');
  loadingEl.style.display = 'block';

  try {
    const resp = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      let errMsg = err.detail || `HTTP ${resp.status}`;
      if (typeof errMsg === 'object') errMsg = JSON.stringify(errMsg);
      throw new Error(errMsg);
    }

    const data = await resp.json();
    console.log('[VERITAS Write] Analysis complete, score:', data.trust_score);

    // Hide loading
    loadingEl.style.display = 'none';

    // Render results
    renderWriteResults(data, paragraphs, title, url);

  } catch (e) {
    console.error('[VERITAS Write] Error:', e);
    loadingEl.style.display = 'none';
    formEl.style.display = 'block';
    btn.disabled = false;
    alert(t('write_error_api') + ': ' + e.message);
  }
}

function renderWriteResults(analysisResult, paragraphs, title, url) {
  const resultsEl = document.getElementById('writeResults');
  const previewEl = document.getElementById('writePreviewContent');
  const sidebarEl = document.getElementById('writeSidebar');
  const statsEl = document.getElementById('writeStats');
  const formEl = document.querySelector('.write-form');
  const btn = document.getElementById('writeAnalyzeBtn');

  // Build highlight map
  const highlightMap = {};
  const actualHighlights = [];
  if (analysisResult?.highlights?.length) {
    for (const h of analysisResult.highlights) {
      if (h.paragraph_id !== undefined && h.paragraph_id !== null) {
        highlightMap[h.paragraph_id] = h;
        actualHighlights.push(h);
      }
    }
  }

  // Render article preview with highlights
  let previewHTML = `<h2 class="preview-title">${esc(title)}</h2>`;
  let fullText = '';

  paragraphs.forEach((p) => {
    const hl = highlightMap[p.id];
    const hlClass = hl ? (hl.severity === 'risk' ? 'hl-risk' : 'hl-warning') : '';
    const tooltipId = `write-tooltip-${p.id}`;

    previewHTML += `<div class="para ${hlClass}" data-para-id="${p.id}">`;
    previewHTML += `<span class="para-id">#${p.id}</span>`;
    previewHTML += `<p class="para-text">${esc(p.text)}</p>`;

    if (hl) {
      const sevLabel = hl.severity === 'risk' ? t('hl_risk') : t('hl_warning');
      previewHTML += `<div class="hl-badge ${hl.severity}" data-tooltip="${tooltipId}">`;
      previewHTML += `${sevLabel} — ${esc(hl.category || '')}`;
      previewHTML += `</div>`;
      previewHTML += `<div class="hl-tooltip ${hl.severity === 'risk' ? 'risk-bg' : 'warning-bg'}" id="${tooltipId}">`;
      previewHTML += `${esc(hl.reason || '')}`;
      previewHTML += `</div>`;
    }

    previewHTML += `</div>`;
    fullText += p.text + ' ';
  });

  previewEl.innerHTML = previewHTML;

  // Stats
  document.getElementById('writeStatParas').textContent = paragraphs.length;
  document.getElementById('writeStatWords').textContent = fullText.trim().split(/\s+/).filter(w => w).length.toLocaleString();
  document.getElementById('writeStatChars').textContent = fullText.length.toLocaleString();
  statsEl.style.display = 'flex';

  // Build sidebar HTML dynamically (like the parsed text sidebar)
  const score = analysisResult.trust_score || 0;
  const scoreClass = score >= 70 ? 'score-high' : score >= 40 ? 'score-mid' : 'score-low';

  let sidebarHTML = `
    <div class="sidebar-card">
      <div class="trust-score-hero">
        <p class="trust-label">${t('trust_score')}</p>
        <span class="trust-value ${scoreClass}" id="write-score">${Math.round(score)}</span>
        <span class="trust-max">/100</span>
      </div>
    </div>
    <div class="sidebar-card" id="write-criteria-card">
      <p class="sidebar-title">${t('criteria_breakdown')}</p>
      <ul class="criteria-list" id="write-criteria"></ul>
    </div>
    <div class="sidebar-card" id="write-highlights-card">
      <p class="sidebar-title">${t('found_issues')}</p>
      <ul class="hl-summary-list" id="write-highlights"></ul>
    </div>
    <div class="sidebar-card" id="write-explainer-card">
      <p class="sidebar-title">${t('ai_summary')}</p>
      <p class="explainer-text" id="write-explainer"></p>
    </div>
  `;
  sidebarEl.innerHTML = sidebarHTML;

  // Populate using shared function
  renderAnalysisSidebar(analysisResult, actualHighlights, 'write', previewEl);

  // Bind tooltip clicks in preview
  previewEl.querySelectorAll('.hl-badge').forEach(badge => {
    badge.addEventListener('click', () => {
      const tooltipId = badge.dataset.tooltip;
      const tooltip = document.getElementById(tooltipId);
      if (tooltip) {
        const isVisible = tooltip.classList.contains('visible');
        previewEl.querySelectorAll('.hl-tooltip.visible').forEach(t => t.classList.remove('visible'));
        if (!isVisible) tooltip.classList.add('visible');
      }
    });
  });

  // Show results, add "Analyze Again" button at top
  resultsEl.classList.add('visible');

  // Re-show form and re-enable button so user can analyze again
  formEl.style.display = 'block';
  btn.disabled = false;
}
