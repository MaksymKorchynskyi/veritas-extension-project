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
    "cr_source": "Прозорість",
    "cr_objectivity": "Об'єктивність",
    "cr_accuracy": "Достовірність",
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
    "ai_metrics": "ШІ Метрики (HuggingFace)",
    "ml_fake_news": "Ймовірність Фейку (RoBERTa)",
    "ml_sentiment": "Тональність (DistilBERT)",
    "ml_clickbait": "Клікбейт (BERT)",
    "scoring_inputs": "Вхідні Дані Скорингу",
    "extracted_claims": "Витягнуті Тези (OSINT)",
    "formula_title": "Формула BRS",
    "input_confirmed": "Підтв.",
    "input_contradicted": "Спрост.",
    "input_unverified": "Не перев.",
    "input_domain_trust": "Довіра домену",
    "input_citations": "Цитати",
    "input_emotional": "Емоц. слова",
    "input_total_words": "Всього слів",
    "claim_confirmed": "Підтверджено",
    "claim_contradicted": "Спростовано",
    "claim_unverified": "Не перевірено",
    "click_formula": "натисніть для формули",
    "analytics_title": "Аналітична Декомпозиція",
    "analytics_subtitle": "Beta Reputation System (Jøsang & Ismail, 2002)",
    "analytics_credibility": "Достовірність",
    "analytics_transparency": "Прозорість",
    "analytics_objectivity": "Об'єктивність",
    "analytics_evidence": "Витягнуті Докази",
    "analytics_citations_found": "Знайдені Цитати",
    "analytics_emotional_found": "Маніпулятивні Фрази",
    "analytics_osint_title": "Витягнуті Тези — OSINT Верифікація",
    "analytics_no_data": "Немає даних",
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
    "cr_source": "Transparency",
    "cr_objectivity": "Objectivity",
    "cr_accuracy": "Credibility",
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
    "ai_metrics": "AI Metrics (HuggingFace)",
    "ml_fake_news": "Fake News Prob (RoBERTa)",
    "ml_sentiment": "Sentiment (DistilBERT)",
    "ml_clickbait": "Clickbait Prob (BERT)",
    "scoring_inputs": "Scoring Inputs",
    "extracted_claims": "Extracted Claims (OSINT)",
    "formula_title": "BRS Formula",
    "input_confirmed": "Confirmed",
    "input_contradicted": "Contradicted",
    "input_unverified": "Unverified",
    "input_domain_trust": "Domain Trust",
    "input_citations": "Citations",
    "input_emotional": "Emot. Words",
    "input_total_words": "Total Words",
    "claim_confirmed": "Confirmed",
    "claim_contradicted": "Contradicted",
    "claim_unverified": "Unverified",
    "click_formula": "click for formula",
    "analytics_title": "Analytical Decomposition",
    "analytics_subtitle": "Beta Reputation System (Jøsang & Ismail, 2002)",
    "analytics_credibility": "Credibility",
    "analytics_transparency": "Transparency",
    "analytics_objectivity": "Objectivity",
    "analytics_evidence": "Extracted Evidence",
    "analytics_citations_found": "Citations Found",
    "analytics_emotional_found": "Manipulative Phrases",
    "analytics_osint_title": "Extracted Claims — OSINT Verification",
    "analytics_no_data": "No data",
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
      renderAnalyticsDashboard(analysisResult, 'pt-analytics');
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

  // Scoring inputs from backend
  const si = analysisResult.scoring_inputs || {};

  // Criteria with formula panels
  const c = analysisResult.criteria || {};
  const criteriaData = [
    { key: 'credibility', name: t('cr_accuracy'), value: c.credibility, weight: '50%' },
    { key: 'transparency', name: t('cr_source'), value: c.transparency, weight: '30%' },
    { key: 'objectivity', name: t('cr_objectivity'), value: c.objectivity, weight: '20%' }
  ];

  // Build formula HTML for each criteria
  function buildFormulaHTML(key, val) {
    const nConf = si.n_confirmed || 0;
    const nContra = si.n_contradicted || 0;
    const nUnv = si.n_unverified || 0;
    const dt = si.domain_trust || 0.5;
    const cit = si.citations_count || 0;
    const emo = si.emotional_words_count || 0;
    const tw = si.total_words || 0;

    if (key === 'credibility') {
      const r = (nConf * 1.0 + cit * 0.2).toFixed(1);
      const s = (nContra * 1.0 + emo * 0.3 + nUnv * 0.4).toFixed(1);
      const W = 2;
      const raw = ((parseFloat(r) + W * dt) / (parseFloat(r) + parseFloat(s) + W) * 100).toFixed(1);
      return `<div class="formula-title">${t('formula_title')}: E(p) = (r + W·a) / (r + s + W)</div>
        <div class="formula-equation">
          r = <span class="val">${nConf}</span>×1.0 + <span class="val">${cit}</span>×0.2 = <span class="val">${r}</span><br>
          s = <span class="val">${nContra}</span>×1.0 + <span class="val">${emo}</span>×0.3 + <span class="val">${nUnv}</span>×0.4 = <span class="val">${s}</span><br>
          a = <span class="val">${dt}</span> <span class="op">(domain trust)</span>, W = <span class="val">${W}</span><br>
          <span class="op">―――――――――――――――――</span><br>
          E = (<span class="val">${r}</span> + ${W}×<span class="val">${dt}</span>) / (<span class="val">${r}</span> + <span class="val">${s}</span> + ${W}) × 100
        </div>
        <div class="formula-result">= <span class="result-val">${raw}</span> → <span class="result-val">${Math.round(val)}</span></div>`;
    }
    if (key === 'transparency') {
      const raw = ((cit + 2 * 0.3) / (cit + 2) * 100).toFixed(1);
      return `<div class="formula-title">${t('formula_title')}: E(p) = (r + W·a) / (r + s + W)</div>
        <div class="formula-equation">
          r = <span class="val">${cit}</span> <span class="op">(citations)</span><br>
          s = <span class="val">0</span>, a = <span class="val">0.3</span>, W = <span class="val">2</span><br>
          <span class="op">―――――――――――――――――</span><br>
          E = (<span class="val">${cit}</span> + 2×<span class="val">0.3</span>) / (<span class="val">${cit}</span> + 0 + 2) × 100
        </div>
        <div class="formula-result">= <span class="result-val">${raw}</span> → <span class="result-val">${Math.round(val)}</span></div>`;
    }
    if (key === 'objectivity') {
      const K = Math.max(8, Math.floor(tw / 50));
      const sVal = Math.min(emo, K);
      const rVal = K - sVal;
      const raw = ((rVal + 2 * 0.5) / (rVal + sVal + 2) * 100).toFixed(1);
      return `<div class="formula-title">${t('formula_title')}: E(p) = (r + W·a) / (r + s + W)</div>
        <div class="formula-equation">
          K = max(8, <span class="val">${tw}</span> / 50) = <span class="val">${K}</span> <span class="op">(window)</span><br>
          s = min(<span class="val">${emo}</span>, <span class="val">${K}</span>) = <span class="val">${sVal}</span><br>
          r = <span class="val">${K}</span> - <span class="val">${sVal}</span> = <span class="val">${rVal}</span><br>
          a = <span class="val">0.5</span>, W = <span class="val">2</span><br>
          <span class="op">―――――――――――――――――</span><br>
          E = (<span class="val">${rVal}</span> + 2×<span class="val">0.5</span>) / (<span class="val">${rVal}</span> + <span class="val">${sVal}</span> + 2) × 100
        </div>
        <div class="formula-result">= <span class="result-val">${raw}</span> → <span class="result-val">${Math.round(val)}</span></div>`;
    }
    return '';
  }

  const criteriaList = document.getElementById(prefix + '-criteria');
  if (criteriaList) {
    criteriaList.innerHTML = criteriaData.map((cr, idx) => {
      const val = cr.value ?? 0;
      const color = val >= 70 ? 'var(--green)' : val >= 40 ? 'var(--yellow)' : 'var(--red)';
      const panelId = `${prefix}-formula-${idx}`;
      const hasInputs = si.total_words !== undefined;
      return `<li class="criteria-item" data-panel="${panelId}">
        <span class="criteria-name">${cr.name}${hasInputs ? '<span class="criteria-expand-icon">▶</span>' : ''}</span>
        <div class="criteria-bar-wrap"><div class="criteria-bar" style="width:${val}%;background:${color}"></div></div>
        <span class="criteria-score" style="color:${color}">${Math.round(val)}</span>
      </li>
      ${hasInputs ? `<div class="formula-panel" id="${panelId}">${buildFormulaHTML(cr.key, val)}</div>` : ''}`;
    }).join('');

    // Bind click events for formula expansion
    criteriaList.querySelectorAll('.criteria-item[data-panel]').forEach(item => {
      item.addEventListener('click', () => {
        const panelId = item.dataset.panel;
        const panel = document.getElementById(panelId);
        if (!panel) return;
        const isVisible = panel.classList.contains('visible');
        // Close all panels first
        criteriaList.querySelectorAll('.formula-panel.visible').forEach(p => p.classList.remove('visible'));
        criteriaList.querySelectorAll('.criteria-item.expanded').forEach(i => i.classList.remove('expanded'));
        if (!isVisible) {
          panel.classList.add('visible');
          item.classList.add('expanded');
        }
      });
    });
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

  // ML Metrics
  const mlCard = document.getElementById(prefix + '-ml-card');
  const mlList = document.getElementById(prefix + '-ml-metrics');
  if (analysisResult.ml_metrics && Object.keys(analysisResult.ml_metrics).length > 0 && mlList) {
    const ml = analysisResult.ml_metrics;
    
    // Format sentiment mapping
    let sentimentColor = 'var(--text-sec)';
    let sentimentLabel = ml.sentiment;
    if (ml.sentiment === 'NEGATIVE') { sentimentColor = 'var(--red)'; sentimentLabel = 'Negative'; }
    else if (ml.sentiment === 'POSITIVE') { sentimentColor = 'var(--green)'; sentimentLabel = 'Positive'; }
    else { sentimentLabel = 'Neutral'; }

    const fakeVal = (ml.fake_news_prob * 100).toFixed(1);
    const fakeColor = fakeVal >= 70 ? 'var(--red)' : fakeVal >= 30 ? 'var(--yellow)' : 'var(--green)';
    
    const clickVal = (ml.clickbait_prob * 100).toFixed(1);
    const clickColor = clickVal >= 70 ? 'var(--red)' : clickVal >= 30 ? 'var(--yellow)' : 'var(--green)';

    const items = [
      { name: t('ml_fake_news'), val: fakeVal + '%', color: fakeColor },
      { name: t('ml_sentiment'), val: sentimentLabel, color: sentimentColor },
      { name: t('ml_clickbait'), val: clickVal + '%', color: clickColor }
    ];

    mlList.innerHTML = items.map(item => `
      <li class="criteria-item">
        <span class="criteria-name">${item.name}</span>
        <span class="criteria-score" style="font-size:0.85rem; color:${item.color}">${item.val}</span>
      </li>
    `).join('');
    
    if (mlCard) mlCard.style.display = 'block';
  } else if (mlCard) {
    mlCard.style.display = 'none';
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
// FULL-WIDTH ANALYTICS DASHBOARD (below article)
// ═══════════════════════════════════════════════════════════════
function renderAnalyticsDashboard(analysisResult, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const si = analysisResult.scoring_inputs || {};
  const c = analysisResult.criteria || {};
  if (!si.total_words) { container.classList.remove('visible'); return; }

  const nConf = si.n_confirmed || 0;
  const nContra = si.n_contradicted || 0;
  const nUnv = si.n_unverified || 0;
  const dt = si.domain_trust || 0.5;
  const cit = si.citations_count || 0;
  const emo = si.emotional_words_count || 0;
  const tw = si.total_words || 0;

  // Pre-calculate formula values
  const credR = (nConf * 1.0 + cit * 0.2).toFixed(1);
  const credS = (nContra * 1.0 + emo * 0.3 + nUnv * 0.4).toFixed(1);
  const credW = 2;
  const credRaw = ((parseFloat(credR) + credW * dt) / (parseFloat(credR) + parseFloat(credS) + credW) * 100).toFixed(1);

  const transRaw = ((cit + 2 * 0.3) / (cit + 2) * 100).toFixed(1);

  const objK = Math.max(8, Math.floor(tw / 50));
  const objS = Math.min(emo, objK);
  const objR = objK - objS;
  const objRaw = ((objR + 2 * 0.5) / (objR + objS + 2) * 100).toFixed(1);

  const credColor = (c.credibility || 0) >= 70 ? 'var(--green)' : (c.credibility || 0) >= 40 ? 'var(--yellow)' : 'var(--red)';
  const transColor = (c.transparency || 0) >= 70 ? 'var(--green)' : (c.transparency || 0) >= 40 ? 'var(--yellow)' : 'var(--red)';
  const objColor = (c.objectivity || 0) >= 70 ? 'var(--green)' : (c.objectivity || 0) >= 40 ? 'var(--yellow)' : 'var(--red)';

  let html = '';

  // Header
  html += `<div class="analytics-header">
    <h2>${t('analytics_title')}</h2>
    <p>${t('analytics_subtitle')}</p>
  </div>`;

  // Scoring Summary Strip
  html += `<div class="scoring-strip">
    <div class="scoring-strip-item">
      <span class="scoring-strip-val" style="color:var(--green)">${nConf}</span>
      <span class="scoring-strip-lbl">${t('input_confirmed')}</span>
    </div>
    <div class="scoring-strip-item">
      <span class="scoring-strip-val" style="color:var(--red)">${nContra}</span>
      <span class="scoring-strip-lbl">${t('input_contradicted')}</span>
    </div>
    <div class="scoring-strip-item">
      <span class="scoring-strip-val" style="color:var(--yellow)">${nUnv}</span>
      <span class="scoring-strip-lbl">${t('input_unverified')}</span>
    </div>
    <div class="scoring-strip-item">
      <span class="scoring-strip-val">${dt}</span>
      <span class="scoring-strip-lbl">${t('input_domain_trust')}</span>
    </div>
    <div class="scoring-strip-item">
      <span class="scoring-strip-val" style="color:var(--green)">${cit}</span>
      <span class="scoring-strip-lbl">${t('input_citations')}</span>
    </div>
    <div class="scoring-strip-item">
      <span class="scoring-strip-val" style="color:var(--red)">${emo}</span>
      <span class="scoring-strip-lbl">${t('input_emotional')}</span>
    </div>
    <div class="scoring-strip-item">
      <span class="scoring-strip-val">${tw.toLocaleString()}</span>
      <span class="scoring-strip-lbl">${t('input_total_words')}</span>
    </div>
  </div>`;

  // Formula Cards Grid (3 columns)
  html += `<div class="formulas-grid">`;

  // Credibility Card
  html += `<div class="formula-card">
    <div class="formula-card-header">
      <span class="formula-card-title">${t('analytics_credibility')}</span>
      <span class="formula-card-score" style="color:${credColor}">${Math.round(c.credibility || 0)}</span>
    </div>
    <div class="formula-card-subtitle">E(p) = (r + W·a) / (r + s + W) × 100</div>
    <div class="formula-equation">
      r = <span class="val">${nConf}</span>×1.0 + <span class="val">${cit}</span>×0.2 = <span class="val">${credR}</span><br>
      s = <span class="val">${nContra}</span>×1.0 + <span class="val">${emo}</span>×0.3 + <span class="val">${nUnv}</span>×0.4 = <span class="val">${credS}</span><br>
      a = <span class="val">${dt}</span> <span class="op">(domain trust)</span><br>
      W = <span class="val">${credW}</span> <span class="op">(weight)</span><br>
      <span class="op">――――――――――――――――――――――</span><br>
      E = (<span class="val">${credR}</span> + ${credW}×<span class="val">${dt}</span>) / (<span class="val">${credR}</span> + <span class="val">${credS}</span> + ${credW}) × 100
    </div>
    <div class="formula-card-result">= <span class="result-val" style="color:${credColor}">${credRaw} → ${Math.round(c.credibility || 0)}</span></div>
  </div>`;

  // Transparency Card
  html += `<div class="formula-card">
    <div class="formula-card-header">
      <span class="formula-card-title">${t('analytics_transparency')}</span>
      <span class="formula-card-score" style="color:${transColor}">${Math.round(c.transparency || 0)}</span>
    </div>
    <div class="formula-card-subtitle">E(p) = (r + W·a) / (r + s + W) × 100</div>
    <div class="formula-equation">
      r = <span class="val">${cit}</span> <span class="op">(citations found)</span><br>
      s = <span class="val">0</span><br>
      a = <span class="val">0.3</span> <span class="op">(uninformative prior)</span><br>
      W = <span class="val">2</span> <span class="op">(weight)</span><br>
      <span class="op">――――――――――――――――――――――</span><br>
      E = (<span class="val">${cit}</span> + 2×<span class="val">0.3</span>) / (<span class="val">${cit}</span> + 0 + 2) × 100
    </div>
    <div class="formula-card-result">= <span class="result-val" style="color:${transColor}">${transRaw} → ${Math.round(c.transparency || 0)}</span></div>
  </div>`;

  // Objectivity Card
  html += `<div class="formula-card">
    <div class="formula-card-header">
      <span class="formula-card-title">${t('analytics_objectivity')}</span>
      <span class="formula-card-score" style="color:${objColor}">${Math.round(c.objectivity || 0)}</span>
    </div>
    <div class="formula-card-subtitle">E(p) = (r + W·a) / (r + s + W) × 100</div>
    <div class="formula-equation">
      K = max(8, <span class="val">${tw}</span> / 50) = <span class="val">${objK}</span> <span class="op">(dynamic window)</span><br>
      s = min(<span class="val">${emo}</span>, <span class="val">${objK}</span>) = <span class="val">${objS}</span><br>
      r = <span class="val">${objK}</span> - <span class="val">${objS}</span> = <span class="val">${objR}</span><br>
      a = <span class="val">0.5</span> <span class="op">(neutral prior)</span><br>
      W = <span class="val">2</span> <span class="op">(weight)</span><br>
      <span class="op">――――――――――――――――――――――</span><br>
      E = (<span class="val">${objR}</span> + 2×<span class="val">0.5</span>) / (<span class="val">${objR}</span> + <span class="val">${objS}</span> + 2) × 100
    </div>
    <div class="formula-card-result">= <span class="result-val" style="color:${objColor}">${objRaw} → ${Math.round(c.objectivity || 0)}</span></div>
  </div>`;

  html += `</div>`; // close formulas-grid

  // Evidence Section (2 columns: citations + emotional words)
  html += `<div class="evidence-section">`;

  // Citations Card
  const cits = si.found_citations || [];
  html += `<div class="evidence-card">
    <div class="evidence-card-title">
      ${t('analytics_citations_found')}
      <span class="ev-count">${cits.length}</span>
    </div>`;
  if (cits.length > 0) {
    cits.forEach(c => {
      html += `<div class="evidence-item">
        <span class="evidence-icon citation">✓</span>
        <span class="evidence-text">${esc(c)}</span>
      </div>`;
    });
  } else {
    html += `<p class="no-evidence">${t('analytics_no_data')}</p>`;
  }
  html += `</div>`;

  // Emotional Words Card
  const emos = si.found_emotional_words || [];
  html += `<div class="evidence-card">
    <div class="evidence-card-title">
      ${t('analytics_emotional_found')}
      <span class="ev-count">${emos.length}</span>
    </div>`;
  if (emos.length > 0) {
    html += `<div class="emotional-tags">`;
    emos.forEach(w => {
      html += `<span class="emotional-tag">${esc(w)}</span>`;
    });
    html += `</div>`;
  } else {
    html += `<p class="no-evidence">${t('analytics_no_data')}</p>`;
  }
  html += `</div>`;
  html += `</div>`; // close evidence-section

  // OSINT Claims Section
  const claims = analysisResult.extracted_claims || [];
  if (claims.length > 0) {
    html += `<div class="osint-section">
      <div class="evidence-card-title" style="margin-bottom:16px;">
        ${t('analytics_osint_title')}
        <span class="ev-count">${claims.length}</span>
      </div>`;
    claims.forEach(cl => {
      const statusClass = cl.status.toLowerCase();
      const statusLabel = cl.status === 'CONFIRMED' ? t('claim_confirmed') : cl.status === 'CONTRADICTED' ? t('claim_contradicted') : t('claim_unverified');
      html += `<div class="osint-claim">
        <span class="osint-badge ${statusClass}">${statusLabel}</span>
        <div class="osint-claim-text">
          <span class="osint-claim-para">¶ ${cl.paragraph_id}</span>
          ${esc(cl.claim_text)}
        </div>
      </div>`;
    });
    html += `</div>`;
  }

  container.innerHTML = html;
  container.classList.add('visible');
}


// ═══════════════════════════════════════════════════════════════
// TAB 2: TEST DASHBOARD — Real Articles Dataset
// ═══════════════════════════════════════════════════════════════
const API = 'http://127.0.0.1:8000/analyze';

const ARTICLES = [
  {
    "id": "A1",
    "cat": "A",
    "expect": [
      55,
      95
    ],
    "title": "Зеленський підписав закон про посилення захисту прав на землю",
    "url": "https://www.pravda.com.ua/news/2025/01/10/7441234/",
    "paragraphs": [
      "Президент України Володимир Зеленський підписав закон, що посилює захист прав власників земельних ділянок, нерухомість на яких була зруйнована внаслідок бойових дій.",
      "Про це повідомляє пресслужба Верховної Ради України з посиланням на офіційну публікацію в «Голосі України».",
      "Відповідно до закону, власники зруйнованих будинків зможуть повернути або отримати у власність земельні ділянки за спрощеною процедурою. Закон набуває чинності через 30 днів з моменту публікації.",
      "Голова парламентського комітету з питань аграрної політики Олександр Гайду зазначив: «Цей закон є важливим кроком для відновлення справедливості щодо постраждалих громадян».",
      "За даними Міністерства аграрної політики, понад 120 тисяч земельних ділянок потребують перереєстрації у зв'язку з руйнуваннями.",
      "Світовий банк підтримав ініціативу, зазначивши, що захист майнових прав є ключовим елементом післявоєнного відновлення."
    ]
  },
  {
    "id": "A2",
    "cat": "A",
    "expect": [
      55,
      95
    ],
    "title": "ЄС ухвалив 20-й пакет санкцій проти Росії з акцентом на криптоактиви",
    "url": "https://www.bbc.com/ukrainian/articles/c5y6r2k1d78o",
    "paragraphs": [
      "Європейський Союз затвердив 20-й пакет економічних санкцій проти Російської Федерації, що вперше масштабно охоплює криптоактиви.",
      "Рішення було ухвалене Радою ЄС у Брюсселі у квітні 2026 року за підтримки всіх 27 країн-членів.",
      "За повідомленням Європейської Комісії, новий пакет включає тотальну заборону на надання криптовалютних послуг для осіб та компаній з РФ.",
      "Верховний представник ЄС Жозеп Боррель зазначив: «Ці заходи спрямовані на закриття лазівок для обходу існуючих санкцій через цифрові валюти».",
      "Аналітики White & Case відзначають, що до санкційних списків додано понад 2600 осіб та організацій з початку повномасштабного вторгнення.",
      "Міністерство закордонних справ РФ засудило рішення, назвавши його «деструктивним для глобальної фінансової стабільності»."
    ]
  },
  {
    "id": "A3",
    "cat": "A",
    "expect": [
      55,
      95
    ],
    "title": "НБУ знизив облікову ставку: що це означає для економіки",
    "url": "https://www.liga.net/ua/economics/news/nbu-rate-decision-2025",
    "paragraphs": [
      "Національний банк України ухвалив рішення знизити облікову ставку, повідомляє офіційний сайт регулятора.",
      "Голова НБУ Андрій Пишний під час пресбрифінгу зазначив, що рішення обумовлене уповільненням інфляції.",
      "За даними Державної служби статистики, індекс споживчих цін у березні 2025 року знизився до 6.8% у річному вимірі.",
      "Аналітики Dragon Capital прогнозують подальше пом'якшення монетарної політики за умови збереження макроекономічної стабільності.",
      "Міністерство фінансів підтримало рішення НБУ, зазначивши, що це сприятиме здешевленню кредитування для бізнесу та населення.",
      "Forbes Ukraine зазначає, що курс гривні залишається стабільним після оголошення рішення регулятора."
    ]
  },
  {
    "id": "A4",
    "cat": "A",
    "expect": [
      55,
      95
    ],
    "title": "Ukraine receives new EU loan package worth 90 billion euros",
    "url": "https://www.reuters.com/world/europe/eu-approves-ukraine-aid-package-2026/",
    "paragraphs": [
      "The European Union approved a major 90-billion-euro loan package for Ukraine following months of political negotiations.",
      "European Commission President Ursula von der Leyen announced the decision at a press conference in Brussels on Monday.",
      "The package includes funds for energy infrastructure reconstruction, military support, and humanitarian assistance, according to an official EU statement.",
      "NATO Secretary General Mark Rutte welcomed the decision, calling it 'a clear demonstration of European unity in support of Ukraine'.",
      "The International Monetary Fund noted that the funding is critical for maintaining Ukraine's macroeconomic stability during wartime.",
      "Poland's Prime Minister Donald Tusk emphasized that the loan reflects the EU's long-term commitment to Ukraine's sovereignty and territorial integrity."
    ]
  },
  {
    "id": "B1",
    "cat": "B",
    "expect": [
      25,
      65
    ],
    "title": "Рада може ухвалити скандальний законопроєкт: наслідки будуть жахливі",
    "url": "https://politeka.net/ua/politics/rada-skandal-2025",
    "paragraphs": [
      "Уже наступного тижня Верховна Рада може розглянути вкрай неоднозначний законопроєкт, який загрожує масовими протестами.",
      "На думку автора, ця ініціатива є прямим наслідком лобістських зусиль великих корпорацій, які контролюють владу.",
      "Один з нардепів від опозиції, який побажав залишитися анонімним, назвав законопроєкт «катастрофою для малого бізнесу».",
      "Деякі експерти вважають, що прийняття цього закону призведе до різкого зростання безробіття.",
      "Водночас прихильники законопроєкту зазначають, що він сприятиме модернізації окремих галузей промисловості."
    ]
  },
  {
    "id": "B2",
    "cat": "B",
    "expect": [
      25,
      65
    ],
    "title": "Чому ціни на бензин знову злетять у космос — пояснення експерта",
    "url": "https://autocentre.ua/news/fuel-prices-2025",
    "paragraphs": [
      "Після тимчасового зниження ціни на бензин знову повзуть угору, і це вже нікого не дивує.",
      "Я вважаю, що головна причина — це жадібність нафтотрейдерів, які використовують будь-яку можливість для збагачення.",
      "За інформацією з неназваних джерел, маржа на АЗС зараз складає рекордні суми за весь час спостережень.",
      "АМКУ до цих пір не провів жодного ефективного розслідування щодо картельної змови на паливному ринку.",
      "Можна прогнозувати, що до літа ціна за літр А-95 перевищить 70 гривень, якщо влада не вживе рішучих заходів."
    ]
  },
  {
    "id": "B3",
    "cat": "B",
    "expect": [
      25,
      65
    ],
    "title": "Сенсація: нова українська соцмережа може знищити Instagram",
    "url": "https://ain.ua/2025/03/15/nova-socmerezha-ukraina/",
    "paragraphs": [
      "Українські розробники створили нову соціальну мережу, яка, за їхніми словами, здатна повністю витіснити Instagram з ринку.",
      "Неймовірний стартап вже залучив мільйони доларів інвестицій від невідомих інвесторів.",
      "Особливістю платформи є використання штучного інтелекту, що робить її абсолютно унікальною.",
      "Скептики заявляють, що конкурувати з Meta неможливо, але засновник переконаний у своїй геніальності.",
      "Вже мільйони людей чекають на запуск цієї революційної платформи."
    ]
  },
  {
    "id": "B4",
    "cat": "B",
    "expect": [
      25,
      65
    ],
    "title": "Лікарі приховують правду: цей продукт лікує все!",
    "url": "https://healthinfo.ua/articles/sensational-cure-2025",
    "paragraphs": [
      "Сенсаційне відкриття у світі медицини перевернуло все, що ми знали про здоров'я.",
      "Відомі лікарі роками приховували цей простий метод лікування від широкої громадськості.",
      "Один анонімний нутриціолог розповів нам всю шокуючу правду про фармацевтичну індустрію.",
      "Люди, які вживають цей продукт, повідомляють про неймовірні результати вже через тиждень.",
      "Фармацевтичні компанії панікують і намагаються заблокувати цю інформацію в інтернеті."
    ]
  },
  {
    "id": "C1",
    "cat": "C",
    "expect": [
      0,
      40
    ],
    "title": "ЄС скасовує готівку: всіх примусово переведуть на цифрові гроші з чипами",
    "url": "https://eu-insider-news.com/world/economy/eu-bans-cash-2024",
    "paragraphs": [
      "Європарламент на закритому засіданні ухвалив скандальну директиву про повну заборону готівки на території всього ЄС.",
      "За нашими ексклюзивними даними, кожного громадянина змусять імплантувати спеціальний мікрочип для контролю всіх фінансових операцій.",
      "Експерти попереджають про тотальний цифровий концтабір, який знищить свободу кожного європейця.",
      "Мільйони людей вийшли на масові протести, але продажні ЗМІ повністю замовчують ці події.",
      "Єдиний шлях до порятунку — негайна відмова від банківських карток та перехід на бартер."
    ]
  },
  {
    "id": "C2",
    "cat": "C",
    "expect": [
      0,
      40
    ],
    "title": "США таємно припинили всю допомогу Україні: Конгрес ухвалив секретний указ",
    "url": "https://truth-news-today.info/usa-ukraine-betrayal",
    "paragraphs": [
      "Стало відомо, що Конгрес США на секретному засіданні ухвалив рішення про повне припинення будь-якої допомоги Україні.",
      "Американські генерали визнали повний і ганебний провал своєї стратегії підтримки Києва.",
      "Наші джерела у Пентагоні підтверджують, що всі поставки озброєння зупинені ще два місяці тому.",
      "Наївні українці продовжують вірити у казки про «західну підтримку», хоча вся ця допомога — лише корупційна схема.",
      "Європа також готується до повного зняття санкцій з Росії протягом найближчих тижнів."
    ]
  },
  {
    "id": "C3",
    "cat": "C",
    "expect": [
      0,
      40
    ],
    "title": "Польща офіційно вимагає повернути Львів: армія стягується до кордону",
    "url": "https://slavic-truth.info/poland-demands-lviv-2025",
    "paragraphs": [
      "Президент Польщі на терміновому засіданні Сейму висунув ультиматум Україні з вимогою негайно передати Львівську область.",
      "Польська армія вже концентрує танкові дивізії безпосередньо на кордоні з Україною.",
      "Західні політики відкрито підтримують розчленування української держави та розділ її територій.",
      "Зрадники у вищому керівництві України вже ведуть таємні переговори про капітуляцію.",
      "Єдиний порятунок для нашого народу — негайний союз зі Сходом проти підступного Заходу."
    ]
  },
  {
    "id": "C4",
    "cat": "C",
    "expect": [
      0,
      40
    ],
    "title": "Секретні біолабораторії НАТО створили вірус для знищення слов'ян",
    "url": "https://anti-nato-truth.net/biolabs-virus-2025",
    "paragraphs": [
      "Незалежні журналісти знайшли беззаперечні докази створення смертоносного вірусу у лабораторіях НАТО під Харковом.",
      "Цей жахливий вірус спеціально створений для знищення певних етнічних груп слов'янських народів.",
      "Пентагон категорично відмовляється коментувати ці шокуючі факти, що лише підтверджує їхню провину.",
      "Всі вакцини, які нав'язують населенню, насправді є частиною масштабної програми геноциду.",
      "Прокидайтеся, люди! Ваші діти та онуки у смертельній небезпеці від цього глобального заговору!"
    ]
  }
];

function renderArticles() {
  const c = document.getElementById('testArticlesContainer');
  const cats = {
    A: { label:"Якісні статті (авторитетні джерела)", desc:"Очікуваний: 60–100" },
    B: { label:"Середня якість (bias / мало джерел)", desc:"Очікуваний: 30–75" },
    C: { label:"Маніпулятивні / фейкові", desc:"Очікуваний: 0–45" },
    D: { label:"Реклама / Спам / Нерелевантні", desc:"Очікуваний: 10–60" },
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
    '</div>' +
    '<div class="test-detail-panel" id="detail-' + a.id + '" style="display:none;"></div>';
  }
  c.innerHTML = html;
  
  // Bind click to open detail panel
  document.querySelectorAll('.test-article').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.id.replace('row-', '');
      const detailEl = document.getElementById('detail-' + id);
      if (detailEl && detailEl.innerHTML.trim() !== '') {
        const isVisible = detailEl.style.display === 'block';
        document.querySelectorAll('.test-detail-panel').forEach(p => p.style.display = 'none');
        document.querySelectorAll('.test-article.expanded').forEach(r => r.classList.remove('expanded'));
        if (!isVisible) {
          detailEl.style.display = 'block';
          el.classList.add('expanded');
        }
      }
    });
  });
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
        acc: data.criteria.credibility,
        auth: data.criteria.transparency,
        obj: data.criteria.objectivity,
        highlights: (data.highlights || []).length,
        full_response: data
      });

      // Render detail panel HTML
      const dEl = document.getElementById('detail-' + a.id);
      if (dEl) {
        let dHtml = '<div class="td-grid">';
        dHtml += '<div class="td-col"><h4>Аналіз</h4><p><b>Credibility:</b> ' + Math.round(data.criteria.credibility||0) + '</p><p><b>Transparency:</b> ' + Math.round(data.criteria.transparency||0) + '</p><p><b>Objectivity:</b> ' + Math.round(data.criteria.objectivity||0) + '</p></div>';
        
        const hlCount = (data.highlights || []).length;
        dHtml += '<div class="td-col"><h4>Проблеми (' + hlCount + ')</h4><ul class="td-list">';
        (data.highlights || []).slice(0,3).forEach(h => {
           dHtml += '<li><span style="color:var(--' + (h.severity==='risk'?'red':'yellow') + ')">●</span> ' + esc(h.reason || h.category) + '</li>';
        });
        if(hlCount > 3) dHtml += '<li>...та ще ' + (hlCount-3) + '</li>';
        dHtml += '</ul></div>';

        const clCount = (data.extracted_claims || []).length;
        dHtml += '<div class="td-col"><h4>Тези (' + clCount + ')</h4><ul class="td-list">';
        (data.extracted_claims || []).slice(0,3).forEach(c => {
           const col = c.status === 'CONFIRMED' ? 'green' : (c.status === 'CONTRADICTED' ? 'red' : 'yellow');
           dHtml += '<li><span style="color:var(--' + col + ')">■</span> ' + esc(c.claim_text).substring(0,60) + '...</li>';
        });
        if(clCount > 3) dHtml += '<li>...та ще ' + (clCount-3) + '</li>';
        dHtml += '</ul></div>';

        dHtml += '</div>';
        if (data.explainer) dHtml += '<div class="td-explainer"><b>AI Підсумок:</b> ' + esc(data.explainer) + '</div>';
        dEl.innerHTML = dHtml;
      }

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
  let csv = 'ID,Category,Title,Score,Expected,Pass,Elapsed_s,Accuracy,Authority,Objectivity,Highlights\n';
  for (const r of testResults) {
    if (r.score === undefined) continue;
    csv += r.id + ',' + r.cat + ',"' + r.title + '",' + r.score + ',' + r.expected + ',' + (r.pass?'YES':'NO') + ',' + r.elapsed + ',' + r.acc + ',' + r.auth + ',' + r.obj + ',' + r.highlights + '\n';
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
    <div class="sidebar-card" id="write-ml-card">
      <p class="sidebar-title">${t('ai_metrics')}</p>
      <ul class="criteria-list" id="write-ml-metrics"></ul>
    </div>
    <div class="sidebar-card" id="write-explainer-card">
      <p class="sidebar-title">${t('ai_summary')}</p>
      <p class="explainer-text" id="write-explainer"></p>
    </div>
    <div class="sidebar-card" id="write-inputs-card" style="display:none;">
      <p class="sidebar-title">${t('scoring_inputs')}</p>
      <div class="inputs-grid" id="write-inputs"></div>
    </div>
    <div class="sidebar-card" id="write-claims-card" style="display:none;">
      <p class="sidebar-title">${t('extracted_claims')}</p>
      <ul class="claims-list" id="write-claims"></ul>
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
