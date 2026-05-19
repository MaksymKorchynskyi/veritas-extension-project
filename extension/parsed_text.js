

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
    "cr_source": "Прозорість",
    "cr_objectivity": "Об'єктивність",
    "cr_accuracy": "Достовірність",
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
    "extracted_claims": "Витягнуті Тези",
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
    "analytics_cv_title": "Витягнуті Тези — Перехресна Верифікація",
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
    "cr_source": "Transparency",
    "cr_objectivity": "Objectivity",
    "cr_accuracy": "Credibility",
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
    "extracted_claims": "Extracted Claims",
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
    "analytics_cv_title": "Extracted Claims — Cross-Verification",
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
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) el.placeholder = dict[key];
  });
}

(async () => {
  try {
    const storage = await chrome.storage.local.get(['appLanguage']);
    if (storage.appLanguage) {
      ptCurrentLanguage = storage.appLanguage;
    }
  } catch (e) { }

  const langSelect = document.getElementById('pageLangSelect');
  if (langSelect) {
    langSelect.value = ptCurrentLanguage;
    applyPageTranslations();
    langSelect.addEventListener('change', async (e) => {
      ptCurrentLanguage = e.target.value;
      try {
        await chrome.storage.local.set({ appLanguage: ptCurrentLanguage });
      } catch (ex) { }
      applyPageTranslations();
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const articleUrl = urlParams.get('articleUrl') ? decodeURIComponent(urlParams.get('articleUrl')) : null;
  const backBtn = document.getElementById('backToArticleBtn');
  if (backBtn) {
    if (articleUrl) {
      backBtn.href = articleUrl;
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = articleUrl;
      });
    } else {
      backBtn.style.display = 'none';
    }
  }
})();


document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

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

  let state = null;
  let analysisResult = null;

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

  try {
    const effectiveUrl = state.url || articleUrl || '';
    let hostname = 'Unknown';
    try { hostname = new URL(effectiveUrl).hostname.replace('www.', ''); } catch (_) { }

    const articleTitle = state.articleTitle || '';
    if (articleTitle) {
      titleEl.textContent = articleTitle;
    } else {
      titleEl.textContent = hostname;
    }
    titleEl.classList.remove('pulse', 'loading-title');

    sourceDomainEl.textContent = hostname;
    urlEl.href = effectiveUrl;

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

    document.getElementById('pt-words').textContent = fullText.trim().split(/\s+/).filter(w => w).length.toLocaleString();
    document.getElementById('pt-chars').textContent = fullText.length.toLocaleString();
    statsBar.style.display = 'flex';

    layoutEl.style.display = 'grid';

    contentEl.querySelectorAll('.hl-badge').forEach(badge => {
      badge.addEventListener('click', () => {
        const tooltipId = badge.dataset.tooltip;
        const tooltip = document.getElementById(tooltipId);
        if (tooltip) {
          const isVisible = tooltip.classList.contains('visible');
          contentEl.querySelectorAll('.hl-tooltip.visible').forEach(t => t.classList.remove('visible'));
          if (!isVisible) tooltip.classList.add('visible');
        }
      });
    });

    const sidebar = document.getElementById('pt-sidebar');

    if (analysisResult) {
      renderAnalysisSidebar(analysisResult, actualHighlights, 'sb', contentEl);
      renderAnalyticsDashboard(analysisResult, 'pt-analytics');
    } else {
      sidebar.innerHTML = `<div class="sidebar-card"><p class="no-highlights-msg">${t('no_analysis_msg')}</p></div>`;
    }

  } catch (e) {
    console.error('[VERITAS PT] Render error:', e);
    showError('❌', t('load_failed'), esc(e.message));
  }
})();

function esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

function renderAnalysisSidebar(analysisResult, actualHighlights, prefix, contentEl) {
  const score = analysisResult.trust_score || 0;
  const scoreEl = document.getElementById(prefix + '-score');
  if (scoreEl) {
    scoreEl.textContent = Math.round(score);
    scoreEl.classList.remove('score-high', 'score-mid', 'score-low');
    scoreEl.classList.add(score >= 70 ? 'score-high' : score >= 40 ? 'score-mid' : 'score-low');
  }

  const si = analysisResult.scoring_inputs || {};

  const c = analysisResult.criteria || {};
  const criteriaData = [
    { key: 'credibility', name: t('cr_accuracy'), value: c.credibility, weight: '50%' },
    { key: 'transparency', name: t('cr_source'), value: c.transparency, weight: '30%' },
    { key: 'objectivity', name: t('cr_objectivity'), value: c.objectivity, weight: '20%' }
  ];

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

    criteriaList.querySelectorAll('.criteria-item[data-panel]').forEach(item => {
      item.addEventListener('click', () => {
        const panelId = item.dataset.panel;
        const panel = document.getElementById(panelId);
        if (!panel) return;
        const isVisible = panel.classList.contains('visible');
        criteriaList.querySelectorAll('.formula-panel.visible').forEach(p => p.classList.remove('visible'));
        criteriaList.querySelectorAll('.criteria-item.expanded').forEach(i => i.classList.remove('expanded'));
        if (!isVisible) {
          panel.classList.add('visible');
          item.classList.add('expanded');
        }
      });
    });
  }

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

  const mlCard = document.getElementById(prefix + '-ml-card');
  const mlList = document.getElementById(prefix + '-ml-metrics');
  if (analysisResult.ml_metrics && Object.keys(analysisResult.ml_metrics).length > 0 && mlList) {
    const ml = analysisResult.ml_metrics;

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

  const explainerEl = document.getElementById(prefix + '-explainer');
  const explainerCard = document.getElementById(prefix + '-explainer-card');
  if (analysisResult.explainer && explainerEl) {
    explainerEl.textContent = analysisResult.explainer;
  } else if (explainerCard) {
    explainerCard.style.display = 'none';
  }

}


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

  html += `<div class="analytics-header"></div>`;

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

  html += `<div class="formulas-grid">`;

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

  html += `<div class="evidence-section">`;

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

  const claims = analysisResult.extracted_claims || [];
  if (claims.length > 0) {
    html += `<div class="cv-section">
      <div class="evidence-card-title" style="margin-bottom:16px;">
        ${t('analytics_cv_title')}
        <span class="ev-count">${claims.length}</span>
      </div>`;
    claims.forEach(cl => {
      const statusClass = cl.status.toLowerCase();
      let statusLabel = t('claim_unverified');
      if (cl.status === 'CONFIRMED') statusLabel = t('claim_confirmed');
      if (cl.status === 'CONTRADICTED') statusLabel = t('claim_contradicted');

      html += `<div class="cv-claim">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
          <span class="cv-badge ${statusClass}">${statusLabel}</span>
          ${cl.evidence_url ? `
            <a href="${cl.evidence_url}" target="_blank" class="cv-link" title="Перейти до джерела">
              <span>Джерело</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>` : ''}
        </div>
        <div class="cv-claim-text">
          <span class="cv-claim-para">¶ ${cl.paragraph_id}</span>
          ${esc(cl.claim_text)}
        </div>
      </div>`;
    });
    html += `</div>`;
  }

  container.innerHTML = html;
  container.classList.add('visible');
}


const API = 'http://127.0.0.1:8000/analyze';

const ARTICLES = [
  {
    "id": "A1",
    "cat": "A",
    "expect": [60, 100],
    "title": "Trump's new travel ban raises bar for legal challenges",
    "url": "https://www.reuters.com/world/article/1",
    "paragraphs": [
      "The new, more narrowly tailored temporary travel ban President Donald Trump signed on Monday will be more difficult to challenge successfully in court, legal experts said. They said that since his order no longer covers legal residents or existing visa holders, and makes waivers possible for some business, diplomatic and other travelers, challengers are likely to have a harder time finding people in the United States who can legally claim they have been harmed, and thus have so-called “standing” to sue.",
      "Trump’s first executive order signed on Jan. 27 banned travelers from seven Muslim-majority nations - Iran, Iraq, Libya, Somalia, Sudan, Syria and Yemen - for 90 days and halted refugee admission for four months, barring Syrian refugees indefinitely.",
      "Its hasty implementation caused chaos and protests at airports. The order was hit with more than two dozen lawsuits, many that claimed it discriminated against Muslims.",
      "The new ban, which goes into effect on March 16, removes Iraq and adds categories of people who would be exempt from the order. The Trump administration said the executive order is necessary for national security reasons.",
      "It also lists groups of people that could be eligible for waivers, including travelers who have previously been admitted to the United States for work or school, those seeking to visit or live with a close relative and who would face hardship if denied entry; infants, young children and adoptees or people in need of medical care, employees of the U.S. government and international organizations among others.",
      "All the exceptions make the new order “a lot harder to attack,” said Andrew Greenfield, an immigration attorney with Fragomen law firm in Washington D.C. Trump had promised to make the new directive harder to fight in court and many of the changes were expected.",
      "“They dotted their ‘i’s’ and crossed their ‘t’s’ in trying to anticipate what litigation might result,” said Stephen Yale-Loehr, a Cornell Law School professor who specializes in immigration. He said opponents might still be able to find plaintiffs - a U.S.",
    ]
  },
  {
    "id": "A2",
    "cat": "A",
    "expect": [60, 100],
    "title": "Australian PM says first refugees to be resettled in U.S. under swap deal",
    "url": "https://www.reuters.com/world/article/2",
    "paragraphs": [
      "Australian Prime Minister Malcolm Turnbull said on Wednesday the first group of about 50 men and woman held in two controversial detention centers for asylum-seekers on remote Pacific islands will be resettled in the United States within weeks. The comments mark the first official timetable for when the United States will begin resettling up to 1,250 people held in Australian-run centers on Nauru and Papua New Guinea s Manus island as part of a refugee swap deal struck by former U.S.",
      "President Barack Obama late last year. Australia will begin resettling several dozen Central American refugees within weeks under the deal that U.S.",
      "President Donald Trump has described as  dumb  but has nevertheless said Washington will honor. There will be about 25 from both Manus and Nauru will be going to the United States and I just want to thank again President Trump for continuing with that arrangement,  Turnbull said in a video statement.",
      "Three sources familiar with the process said about 25 men from countries such as Bangladesh, Sudan, and Rohingya Muslims from Myanmar held on Manus island were the first to be told on Wednesday, with a similar number on Nauru to be told Thursday. One Sudanese refugee approved for resettlement told Reuters  he would leave Manus Island in a few days.",
      "It feels like my dreams are coming true. All we want is to go to a safe country,  said the refugee, who declined to be identified for fear of jeopardizing the resettlement.",
      "While Trump has said he would honor the swap agreement, concerns remain about how many asylum-seekers will be resettled from the Australian-run centres. Nearly 2,000 men, women and children are held on Manus island and Nauru, the majority of whom have been awarded refugee status by the two tiny Pacific countries.",
      "Refugees and advocates cautioned against assuming the U.S. would take the full allotment, with its processing so far concentrated on individuals with applications that are both easier to verify through background checks and originate from citizens of nations with closer ties to the United States.",
    ]
  },
  {
    "id": "A3",
    "cat": "A",
    "expect": [60, 100],
    "title": "Trump says union head who accused him of lying has 'done a terrible job'",
    "url": "https://www.reuters.com/world/article/3",
    "paragraphs": [
      "Donald Trump clashed on Wednesday with a union official who accused the president-elect of lying about the number of jobs saved in a deal to keep air conditioner maker Carrier from moving some jobs from Indiana to Mexico. Chuck Jones, president of United Steelworkers Local 1999, which represents workers at United Technologies Corp’s Carrier plant in Indianapolis, in an interview on CNN criticized Trump for at least the second time in two days over the deal.",
      "Trump, in a Twitter post on Wednesday, offered a sharp reply: “Chuck Jones, who is President of United Steelworkers Local 1999, has done a terrible job representing workers. No wonder companies flee country!”  On Tuesday, Jones told The Washington Post that when Trump spoke at the Carrier factory last week, “He got up there and, for whatever reason, lied his ass off.” Indiana state officials have agreed to give Carrier $7 million in tax breaks to encourage it to keep about 1,100 jobs in the state, although about 300 of the jobs are in the company’s headquarters and were not scheduled to go to Mexico.",
      "Only 800 of the positions are union factory jobs, and Carrier still plans to send an estimated 1,300 jobs to Mexico. Some employees are disappointed, Jones said on CNN on Wednesday.",
      "“We had a lot of our members, when the word was coming out of 1,100, they thought that they would have a job,” he said. In more remarks on CNN later on Wednesday, Jones responded to Trump’s Twitter post.",
      "“That’s pretty low-down, low life,” he said. “He doesn’t like to be challenged, and I challenged him.” Trump, who made tough talk on trade a centerpiece of his election campaign, had vowed to impose hefty tariffs if Carrier did not reverse course on shifting jobs to Mexico.",
      "Trump posted another tweet after Jones’ later remarks on CNN. “If United Steelworkers 1999 was any good, they would have kept those jobs in Indiana,” Trump wrote.",
    ]
  },
  {
    "id": "A4",
    "cat": "A",
    "expect": [60, 100],
    "title": "'Trump dossier' on Russia links now part of special counsel's probe: sources",
    "url": "https://www.reuters.com/world/article/4",
    "paragraphs": [
      "The special counsel investigating whether Russia tried to sway the 2016 U.S. election has taken over FBI inquiries into a former British spy s dossier of allegations of Russian financial and personal links to President Donald Trump s campaign and associates, sources familiar with the inquiry told Reuters.",
      "A report compiled by former MI6 officer Christopher Steele identified Russian businessmen and others whom U.S. intelligence analysts have concluded are Russian intelligence officers or working on behalf of the Russian government.",
      "A spokesman for special counsel Robert Mueller declined comment. Three sources with knowledge of Mueller s probe said his investigators have assumed control of multiple inquiries into allegations by U.S.",
      "intelligence agencies that Russia interfered in the election to benefit Trump, a Republican. Russia has repeatedly denied any meddling in the election.",
      "Two officials familiar with the investigations said that both Mueller s team and the Senate Intelligence Committee are seeking any evidence that former Trump campaign manager Paul Manafort or others who had financial dealings with Russia might have helped Kremlin intelligence agencies target email hacking and social media postings undermining Trump s election opponent, Democrat Hillary Clinton. On Wednesday, the Senate panel s chairman Richard Burr told reporters that the issue of whether Trump s campaign colluded with Russia remains an open question.",
      "We have not come to any determination on collusion,  Burr said. Trump, who has called allegations of campaign collusion with Moscow a hoax, has faced questions about the matter since he took office in January.",
      "Trump was told by former FBI director James Comey that Steele s report contained salacious material about the businessman-turned-president. Burr said on Wednesday that the Senate panel had made several attempts to contact Steele and to meet him and  those offers have gone unaccepted.",
    ]
  },
  {
    "id": "A5",
    "cat": "A",
    "expect": [60, 100],
    "title": "U.S. sanctions an important tool, not to be used 'frivolously': Treasury's Lew",
    "url": "https://www.reuters.com/world/article/5",
    "paragraphs": [
      "Economic sanctions are a powerful policy weapon but should not be wielded “frivolously,” U.S. Treasury Secretary Jack Lew said in an interview to be aired on Tuesday.",
      "Sanctions - blacklisting individuals and organizations, effectively barring them from the global financial system - have become a favored tool for the United States. It has used them against challenges as varied as drug trafficking, cyber attacks and jihadist financing.",
      "But the impact has to be weighed as carefully as those of military force, Lew said in an interview with Public Television host Charlie Rose, according to a transcript of the interview released on Tuesday. “We can’t shy away from using sanctions because it will slow down growth, but we can’t do it frivolously either,” Lew said.",
      "“It’s a serious step, and it’s something that has to be guarded in order to have it in the future when you need it.” U.S. sanctions have evolved over time from broad embargoes - such as the one imposed for decades on Cuba - to more targeted actions, he said, citing measures imposed on specific Russian industries in response to Russia’s intervention in Ukraine.",
      "“They’re targeted at the centers of power, where the decisions are being made,” Lew said. The United States also should reward countries that change their behavior by removing sanctions, Lew said, pointing to measures against Iran that he credited with leading Tehran to agree to curb its nuclear program.",
      "Iran reached a deal with the United States and other world powers last July, winning relief from the harshest sanctions in return for limiting its nuclear program, which the West feared was aimed at building a weapon. “When you have an agreement that’s predicated on ‘Change your policy and get relief from the sanctions,’ there has to be relief from the sanctions,” Lew said.",
      "“Otherwise, no one will ever respond to a sanctions regime by changing their policy.” Reversing the Iran nuclear deal under a new administration - as Republican presidential candidate and U.S. Senator Ted Cruz has pledged to do - would be “destabilizing and dangerous,” Lew said.",
    ]
  },
  {
    "id": "A6",
    "cat": "A",
    "expect": [60, 100],
    "title": "U.S. weakens retirement advice rule, responding to industry",
    "url": "https://www.reuters.com/world/article/6",
    "paragraphs": [
      "rule aimed at protecting retirement savers from profit-hungry brokers turned out to be much weaker than an initial proposal after the Obama administration bowed to pressure from the financial services industry. The rule, announced by the Department of Labor on Wednesday, sets a so-called fiduciary standard for financial brokers who sell retirement products, requiring them to put clients’ best interests ahead of their bottom line.",
      "The language is tougher than an existing rule that only requires brokers to ensure products are “suitable.” However, the Labor Department did compromise with the industry on a range of provisions. Unlike the draft proposal, the final rule does not restrict brokers from pushing proprietary products, splitting revenue with creators of funds they promote, or recommending risky, high-fee investments in alternative assets and certain annuities.",
      "Brokers also got more time to implement the changes, which they said were costly and difficult. The rule will now take full effect on Jan.",
      "1, 2018, compared with an eight-month compliance deadline in the Labor Department’s initial proposal. Nonetheless, brokers will now be covered by a fiduciary standard, said Massachusetts Senator Elizabeth Warren, a consumer advocate who helped shine a national spotlight on the proposal last year.",
      "“There’s no doubt there is some risk,” Warren, a Democrat, said in an interview. “On the other hand, the Department of Labor was not looking to put all proprietary products out of business,” Warren said.",
      "The goal is to make sure there is “adequate regulation,” said Warren, adding that she now believes there will be. Democratic presidential front-runner Hillary Clinton issued a statement in support of the new rule, saying it will “stop Wall Street from ripping off families” and “save seniors billions.” However, Knut Rostad, an investor advocate who chairs the Institute for the Fiduciary Standard, said he was disappointed that the final rule was not tougher, calling it “a major defeat for investors, period.” Some leading Republican lawmakers also expressed continued opposition to the rule, saying it would prevent low- and middle-income Americans from saving for retirement or getting access to advice.",
      "Several major brokerage firms said they needed time to review the implications, but that they generally supported the idea of a “best interest” rule. Industry trade groups reiterated concerns that the rule could have negative effects.",
    ]
  },
  {
    "id": "A7",
    "cat": "A",
    "expect": [60, 100],
    "title": "U.S. seeks ship ban over North Korea violations, Moon postponing drills",
    "url": "https://www.reuters.com/world/article/7",
    "paragraphs": [
      "The United States has called on the U.N. Security Council to  blacklist 10 ships for circumventing sanctions on North Korea, documents showed on Tuesday, while South Korea s President suggested delaying military exercises with Washington to ease tensions ahead of next year s Winter Olympics.",
      "Documents seen by Reuters said the 10 vessels had been conducting ship-to-ship transfers of refined petroleum products to North Korean vessels or transporting North Korean coal in violation of U.N. sanctions imposed over Pyongyang s nuclear and missile programs.",
      "The ships would be blacklisted - meaning countries would be required to ban them from entering their ports - if none of the 15 members of the Security Council s North Korea sanctions committee object by Thursday afternoon. arms embargo and the Security Council has banned trade in exports such as coal, textiles, seafood, iron and other minerals to choke funding for Pyongyang s missile and nuclear programs.",
      "In September, the council put a cap of 2 million barrels a year on refined petroleum products exports to North Korea. The ships targeted for blacklisting were Xin Sheng Hai (flag unknown); the Hong-Kong-flagged Lighthouse Winmore; the Togo-flagged Yu Yuan; Panama-flagged Glory Hope 1 (also known as Orient Shenyu), Kai Xiang, and Billions No.",
      "18; and the North Korean-flagged Ul Ji Bong 6, Rung Ra 2, Rye Song Gang 1, and Sam Jong 2. Four ships were designated for carrying coal from North Korea by the council s North Korea sanctions committee in October.",
      "The United States has led a drive to step up sanctions on North Korea in response to Pyongyang s efforts to develop nuclear-tipped missiles capable of hitting the United States. In Ottawa on Tuesday, Canada and the United States said they would co-host a foreign ministers meeting in Vancouver on Jan.",
      "16 to demonstrate international solidarity against North Korea s nuclear and missile tests. Representatives of the countries that sent troops or other military support to the U.N.-backed effort to repel North Korean forces after the 1950 invasion of South Korea will attend.",
    ]
  },
  {
    "id": "A8",
    "cat": "A",
    "expect": [60, 100],
    "title": "German FDP leader presses Greens to compromise on immigration",
    "url": "https://www.reuters.com/world/article/8",
    "paragraphs": [
      "Germany s Greens need to compromise on immigration policy if talks on forming a new governing coalition are to succeed, the leader of the Free Democrats (FDP) said, putting the chances of a deal at 50-50. Chancellor Angela Merkel is trying to form a coalition with the FDP and Greens after her conservatives lost support to the far right in a federal election last month.",
      "The three-way alliance is untested at national level. I still see the biggest differences with the Greens,  FDP leader Christian Lindner said of immigration policy in an interview with the Rheinische Post newspaper.",
      "Germany is at the limit of what the majority are ready to provide in humanitarian aid,  he said, adding that  realism cannot be sacrificed in a readiness for coalition. The three parties found common ground in areas of social policy and digital infrastructure during talks on Monday, but remained far apart on issues of immigration, fiscal and climate policies that divided them last week.",
      "Lindner said the Greens did not represent the majority of Germans on the issue of family reunification - allowing foreigners to join loved ones granted asylum in Germany. That is one of the most contentious issues in the coalition talks.",
      "All the parties are eager to show the public they are taking measures to prevent a repeat of 2015, when Merkel s decision to welcome people fleeing wars and persecution led to the largest influx of asylum seekers in the post-war years. But the Greens may not accept a conservative plan to suspend the right to family reunions for asylum seekers who have only been granted so-called subsidiary protection, starting in March 2018.",
      "The Greens say that would hamper integration. Those given subsidiary protection are given one-year visas that can be renewed, because it is deemed their home country is not safe.",
      "But they do not have full refugee status that would give them the right to stay. In the first phase, we haven t come close to solutions to conflicts,  Lindner said of the exploratory talks on a  Jamaica  coalition, so called because the parties  colors match those of the Jamaican national flag.",
    ]
  },
  {
    "id": "A9",
    "cat": "A",
    "expect": [60, 100],
    "title": "U.S. senator says panel could take up Russia sanctions bill this summer",
    "url": "https://www.reuters.com/world/article/9",
    "paragraphs": [
      "The Republican chairman of the U.S. Senate Foreign Relations Committee said on Thursday the panel could take up a bill as soon as this summer to impose new sanctions on Russia over its alleged interference in the 2016 U.S.",
      "Senator Bob Corker said the panel could move forward on sanctions after hearing from U.S. Secretary of State Rex Tillerson.",
      "Some members of the committee, particularly Democrats, had wanted to act more quickly on sanctions over Russian activities that U.S. intelligence agencies concluded were intended to help get Republican Donald Trump elected.",
      "Corker said he expects Tillerson to report to the committee within weeks about the Trump administration’s policy toward Russia and the situation in Syria. Corker said he would be willing to consider a sanctions bill soon after that if, as he expected, Tillerson does not demonstrate to the panel that there has been significant change by Russia in Syria, where Moscow has been supporting President Bashar al-Assad in that country’s six-year-old civil war.",
      "“I’ve committed to mark up Russia sanctions legislation in the event, the probable event, that the secretary of state cannot show us that there’s a change of trajectory,” Corker said at a committee business meeting. A mark up is a session in which a committee debates legislation and possible amendments.",
      "Later in the meeting, the panel overwhelmingly passed legislation to condemn Russian activities including its effort to influence other countries’ elections, aggression in Ukraine and support for Assad. That measure did not include sanctions.",
      "Corker and other senators had suggested it would be prudent to wait on sanctions at a delicate time in dealings with Moscow, especially over Syria. Democrats were not pleased at the delay, but said they were willing to wait to hear from the Trump administration.",
    ]
  },
  {
    "id": "A10",
    "cat": "A",
    "expect": [60, 100],
    "title": "Trump backs New York in bourses' battle for Saudi Aramco listing",
    "url": "https://www.reuters.com/world/article/10",
    "paragraphs": [
      "President Donald Trump publicly appealed on Saturday for Saudi Arabia to list national oil company Saudi Aramco’s shares in New York, intervening in a battle among the world’s top stock exchanges. “Would very much appreciate Saudi Arabia doing their IPO of Aramco with the New York Stock Exchange,” Trump wrote on Twitter.",
      "“Important to the United States!” Trump did not say why he raised the issue at this time or whether he was responding to any information about the NYSE’s bid. But by describing the listing as a priority for Washington, he could help sway the Saudis’ decision.",
      "The Saudi government, seeking to raise money as low oil prices strain its finances, plans to sell about 5 percent of Aramco next year in a sale officials say could raise about $100 billion, making it the world’s largest initial public offer ever. Saudi authorities have said they intend to list Aramco in Riyadh and on one or more foreign exchanges, setting off a competition among New York, London, Hong Kong, Tokyo and other bourses.",
      "An Aramco spokesman had no comment on Trump’s tweet, while a spokeswoman for the NYSE declined to comment. NYSE Group president Thomas Farley said at a conference in Riyadh last week that he had not given up on the IPO and was in talks with Saudi authorities.",
      "The London Stock Exchange has also received some government support for its bid, although that has been less public. Prime Minister Theresa May and the chief of the LSE pitched investments in Britain to the head of Saudi Arabia’s sovereign wealth fund on a visit to Riyadh earlier this year.",
      "While Trump’s tweet named the New York Stock Exchange, it did not mention rival Nasdaq Inc, which is also vying for the Aramco listing. “Generally, public servants should be impartial, not give preferential treatment to anyone, and avoid endorsements,” said  Scott Amey, general counsel for the government ethics watchdog Project on Government Oversight in Washington.",
      "“We have already seen violations in this administration, and it doesn’t help that the president isn’t leading by example.” Nasdaq replied to Trump in a tweet, saying it agreed the United States was the “best destination for global companies” but that Aramco belongs on Nasdaq “with the 5 most valuable operating companies in the world.”  Nearly two years after announcing their plan to sell Aramco shares, Saudi officials say they have not yet decided on foreign listing venues. Sources told Reuters in August that Riyadh favored New York for Aramco’s main foreign listing.",
    ]
  },
  {
    "id": "A11",
    "cat": "A",
    "expect": [60, 100],
    "title": "Uganda's president boosts military unit as rural support slips away",
    "url": "https://www.reuters.com/world/article/11",
    "paragraphs": [
      "When Ugandan President Yoweri Museveni returned to his home region to throw an Independence Day party last month, the uniformed security outnumbered the small crowd of bored spectators. Museveni slowly drove past the crowd, a mix of schoolchildren and farmers, in a top-of-the-range pick-up truck, giving them a wide smile and a thumbs-up, the ruling party symbol.",
      "The apathy - on a continent where strongman rulers are traditionally feted in their home areas - reveals the slow leaching away of political support from one of Africa s longest-serving rulers. Now, as his party plans to extend his rule, the president is increasingly reliant on a military unit from his home area, the Special Forces Command, to quell dissent over collapsing public services, corruption, growing poverty and brutality by security services.",
      "We ve had enough of him,  said butcher Steven Ruturukirira bluntly. In a lengthy speech, the 73-year-old Museveni studiously ignored the day s hot topic: a legislative plan to remove the 75-year age limit for the presidency, clearing the way to extend his leadership of the oil-rich nation.",
      "The pursuit of social and economic transformation of Africa is not a simple matter. It calls for visionary leadership,  Museveni told the crowd.",
      "Relieved to see Uganda freed from the yoke of brutal dictators, the West has given Museveni an easy ride over the last three decades, glad of his support against radical Islam and his role as power broker in the volatile Great Lakes Region. Uganda has also welcomed foreign investors like France s Total, China s CNOOC and Britain s Tullow, who hope to start pumping 6.5 billion barrels worth of crude reserves through a planned $3.55 billion pipeline.",
      "But as the opposition makes inroads in urban areas, Museveni relies on support in rural heartlands, as well as his special forces, exacerbating ethnic tensions and potentially sowing the seeds for conflagration when he eventually leaves power. Currently, the age cap bars Museveni from standing in Uganda s next elections, scheduled for 2021.",
      "But last month a ruling party lawmaker introduced a bill to scrap the rule. The government gave each MP $8,000 to help them consult voters on the bill, provoking fury among ordinary citizens like quarry worker Ronald Malongo, 27, who is among a growing number of Ugandans who make less than a dollar a day.",
    ]
  },
  {
    "id": "A12",
    "cat": "A",
    "expect": [60, 100],
    "title": "Blunt instrument? What a list of banned articles says about China's censors",
    "url": "https://www.reuters.com/world/article/12",
    "paragraphs": [
      "An old review of an academic monograph on agrarian revolutionaries in 1930s China is hardly a political third rail in Beijing today, even by the increasingly sensitive standards of the ruling Communist Party. That such a piece appeared on a list of some 300 scholarly works that Cambridge University Press (CUP) said last week the Chinese government had asked it to block from its website offers clues about the inner workings of China s vast and secretive censorship apparatus, say experts.",
      "President Xi Jinping has stepped up censorship and tightened controls on the internet and various aspects of civil society, as well as reasserting Communist Party authority over academia and other institutions, since coming to power in 2012. Far from being a well-oiled machine, though, China s censorship regime is fragmented and often undermined by gaps, workarounds, and perhaps even hasty officials, say academics specializing in Chinese politics.",
      "Crude is the word,  said Jonathan Sullivan, an associate professor at the University of Nottingham in Britain. The blunt way in which articles were chosen for censoring ...",
      "suggest to me that there was not a lot of thought put into it. CUP, the publishing arm of Britain s elite Cambridge University, on Monday reversed its decision to comply with the request to censor the articles published in the journal China Quarterly following an outcry over academic freedom.",
      "China s response remains to be seen. The education ministry, foreign ministry, cyberspace administration and state publishing authority all declined to comment.",
      "The list of articles the authorities wanted blocked covered topics that are considered sensitive by the government, including the 1989 Tiananmen Square democracy protests, the 1966-76 Cultural Revolution, Tibet, Taiwan and the violence-prone far-western region of Xinjiang. But it was far from thorough or comprehensive.",
      "The article on 1930s agrarian revolutionaries may have got there by mistake, say experts. What appears to have condemned the scathing but otherwise innocuous 1991 review of Kamal Sheel s book about a Communist base area in China s southern heartland was the fact the place was named Xinjiang, and the word appeared in the book title.",
    ]
  },
  {
    "id": "A13",
    "cat": "A",
    "expect": [60, 100],
    "title": "In emotional farewell speech, Michelle Obama praises diversity",
    "url": "https://www.reuters.com/world/article/13",
    "paragraphs": [
      "First lady Michelle Obama made an impassioned case for embracing diversity and welcoming all religious groups on Friday in a not-so-veiled message to her husband’s successor two weeks ahead of Inauguration Day. In what was billed as her last formal speech before President Barack Obama leaves office, the first lady said at an event honoring high school counselors that the United States belonged to people from all backgrounds and walks of life.",
      "“Our glorious diversity - our diversities of faiths and colors and creeds - that is not a threat to who we are, it makes us who we are,” she said. The remarks were reminiscent of her vigorous campaign speeches in favor of Democrat Hillary Clinton during the 2016 election.",
      "President-elect Donald Trump has proposed building a wall along the border of Mexico and temporarily banning Muslims from entering the country. “If you or your parents are immigrants, know that you are part of a proud American tradition: the infusion of new cultures, talents and ideas, generation after generation, that has made us the greatest country on earth,” Mrs.",
      "“If you are a person of faith, know that religious diversity is a great American tradition, too ... And whether you are Muslim, Christian, Jewish, Hindu, Sikh - these religions are teaching our young people about justice and compassion and honesty.” Mrs. Obama gave a series of high profile speeches at campaign events for Clinton last year and made clear her disapproval of Trump for questioning President Obama’s citizenship and for the New York businessman’s treatment of women after a recording was released in which he bragged about groping women.",
      "Trump was a leader of the so-called birther movement that questioned whether President Obama, who was born in Hawaii, had been born in the United States. Obama has kept a lower public profile since the election.",
      "Choking up on Friday, she said being first lady had been the greatest honor of her life. “So that’s my final message to young people as first lady. It is simple. I want our young people to know that they matter, that they belong,” she said. “Lead by example with hope, never fear. And know that I will be with you, rooting for you and working to support you for the rest of my life.”",
    ]
  },
  {
    "id": "A14",
    "cat": "A",
    "expect": [60, 100],
    "title": "Ex-punk rocker challenges Ted Cruz for Senate",
    "url": "https://www.reuters.com/world/article/14",
    "paragraphs": [
      "A punk rocker-turned-congressman from Texas announced his candidacy for the U.S. Senate seat held by Republican Ted Cruz on Friday, making him the first prominent Democrat to challenge the former presidential candidate.",
      "Robert Francis “Beto” O’Rourke, a Spanish-speaking, Irish-American representing a predominantly Latino district that includes the border city of El Paso, is considered a long shot in the Republican-dominated state, analysts said. MORE FROM REUTERS Connecticut may become first state to allow deadly police drones Wayward tabby returning to Denver home after 800-mile adventure British robot helps autistic children with social skills But O’Rourke’s outsider credentials are expected to add flair to the 2018 Senate race in Texas, where a Democrat has not won a state-wide election in more than 20 years.",
      "Beto is short for his name in Spanish, Roberto. He has got a national fundraising network so he will have all the money in the world,” said Cal Jillson, a political science professor at Southern Methodist University in Dallas.",
      "In a campaign launch from El Paso shown on Facebook Live, the Ivy-League educated O’Rourke, 44, pledged to fight for veterans, shun corporate money and serve only two terms in the Senate if elected, saying it was in the people’s best interest to have fresh blood in Congress. O’Rourke, who played guitar and provided vocals for the punk band Foss in the 1990s, also took a shot at Republican President Donald Trump for his hard-line stance on immigration, vowing to “fight when necessary against a president who is focused on building walls, or conducting military immigrant round-ups.”  O’Rourke and Republican Congressman Will Hurd of Texas gained attention on social media earlier this month by live-streaming the journey they made together from Texas to Washington and billing it as 1,600-mile bipartisan road trip.",
      "They rented a car and took the trip due to a winter storm that shut East Coast airports. Polls rate Cruz as the most popular politician in the state among Texans.",
      "O’Rourke does not have much political support outside his base of El Paso, a western Texas city closer to San Diego, California than to Houston. Another possible challenger to Cruz is Democratic U.S.",
      "Representative Joaquin Castro, analysts said. Just ahead of O’Rourke’s announcement, Texas Republican Governor Greg Abbott announced he was endorsing Cruz.",
    ]
  },
  {
    "id": "A15",
    "cat": "A",
    "expect": [60, 100],
    "title": "No talk of ousting U.S. House Speaker Ryan, says key conservative",
    "url": "https://www.reuters.com/world/article/15",
    "paragraphs": [
      "Representative Jim Jordan, a leading House conservative, said on Sunday that fellow conservatives are not discussing replacing Speaker Paul Ryan despite unhappiness with the way Republican leaders handled last week’s debt ceiling increase that included no fiscal reforms. Many Republicans are unhappy with the deal President Donald Trump reached last week with Democratic leaders to raise the government’s debt ceiling and allow it to continue financing federal spending programs until Dec.",
      "In an interview with Fox News Sunday, Jordan, a Republican, appeared to cast blame for the debt ceiling hike on party leaders including Ryan, saying they had not provided any “good options” to Trump before he struck a deal with Democrats. “In this situation, he (Trump) wasn’t presented with good options,” said Jordan, co-founder and former chairman of the House Freedom Caucus, the most conservative group in the House.",
      "“No one is talking about changing the leadership,” Jordan told Fox. He said a Washington Post story last week that reported that conservatives had met with Ryan to express their dismay about the debt ceiling increase was “hardly news,” because the lawmakers meet with Ryan every week.",
      "Rebellious conservatives pushed out Republican John Boehner, Ryan’s predecessor, as speaker in 2015. The new plan also authorized spending $15.25 billion in emergency disaster relief for the victims of hurricanes Harvey and Irma.",
      "Ninety House Republicans, including many members of the Freedom Caucus, voted against the measure, which Trump has now signed into law. Conservatives have long called for coupling spending reforms with any measures that raise the U.S.",
      "But the deal did the opposite, raising the ceiling and paying for hurricane relief without spending cuts elsewhere. Republican leaders had urged an 18-month extension of the debt ceiling, but Trump accepted the three-month extension  proposed by Democrats.",
      "Jordan said he believed Trump has the same vision and focus as the Freedom Caucus, which was to represent people who felt they had been forgotten by officials in Washington. If conservative options are presented to the president, “I’m confident when that happens, he will pick those options that are conservative,” Jordan said.",
    ]
  },
  {
    "id": "A16",
    "cat": "A",
    "expect": [60, 100],
    "title": "Myanmar bars U.N. rights investigator before visit",
    "url": "https://www.reuters.com/world/article/16",
    "paragraphs": [
      "independent investigator into human rights in Myanmar called on Wednesday for stronger international pressure to be exerted on Myanmar s military commanders after being barred from visiting the country for the rest of her tenure. special rapporteur, had been due to visit in January to assess human rights across Myanmar, including alleged abuses against Rohingya Muslims in Rakhine State.",
      "But Myanmar had told her she was no longer welcome, she said, adding in a statement that this suggested something  terribly awful  was happening in the country. From what I see right now I m not sure if they are feeling pressured.",
      "I m not sure if there is the right kind of pressure placed on the military commanders and the generals,  she later told Reuters by telephone from Seoul. She said it was alarming that Myanmar was strongly supported by China, which has a veto at the U.N.",
      "Other countries including the United States and human groups were advocating targeted sanctions on the military, she said. And I m sure the world has to find a way to make it work.",
      "And I think the United Nations and its member states should really try to persuade China to really act towards the protection of human rights,  she said. Surveys of Rohingya refugees in Bangladesh by aid agency Medecins Sans Frontieres have shown at least 6,700 Rohingya were killed in Rakhine state in the month after violence flared up on Aug 25, the aid group said last week.",
      "More than 650,000 Rohingya have fled into Bangladesh since Aug. 25, when attacks by Muslim insurgents on the Myanmar security forces triggered a sweeping response by the army and Buddhist vigilantes.",
      "Speaking in Beijing, Chinese Foreign Ministry spokeswoman Hua Chunying said the situation in Rakhine State was an internal affair for Myanmar with its own complex history. Myanmar and Bangladesh resolving this issue was the only way to go, she told reporters.",
    ]
  },
  {
    "id": "A17",
    "cat": "A",
    "expect": [60, 100],
    "title": "Pence voices U.S. concern to Turkish prime minister about arrests",
    "url": "https://www.reuters.com/world/article/17",
    "paragraphs": [
      "Vice President Mike Pence expressed “deep concern” to Turkey’s prime minister on Thursday about the arrests of American citizens and local staff of U.S. missions in Turkey, the White House said.",
      "The matters raised by Pence are some of the issues that have created tension between the two NATO allies in recent months, along with a dispute over a Turkish cleric living in the United States whom Ankara accuses of orchestrating a failed military coup in Turkey last year. In a White House meeting with Prime Minister Binali Yildirim, Pence voiced “deep concern over the arrests of American citizens, Mission Turkey local staff, journalists, and members of civil society under the state of emergency and urged transparency and due process in the resolution of their cases,” the White House said in a statement.",
      "embassy has said the accusations are baseless. Before leaving for the United States, Yildirim had said Turkey’s demand for the United States to hand over cleric Fethullah Gulen, who has lived in Pennsylvania since 1999, would be discussed during his visit.",
      "officials have said courts require sufficient evidence to order Gulen’s extradition. Another issue to be raised, Yildirim had said, was the fate of some Turkish citizens arrested in the United States - a reference to a wealthy gold trader who was arrested over Iran sanctions evasion last year and an executive at a state-owned bank arrested this year.",
      "The White House statement made no mention of any discussions about either subject. It said the two officials “expressed hope that their meeting would help to usher in a new chapter in U.S.-Turkey relations and agreed on the need for constructive dialogue, as friends and allies, on bilateral challenges.” Pence reaffirmed the “enduring strategic partnership” between the two countries and stressed the U.S.",
    ]
  },
  {
    "id": "A18",
    "cat": "A",
    "expect": [60, 100],
    "title": "Use it or lose it: Occasional Ohio voters may be shut out in November",
    "url": "https://www.reuters.com/world/article/18",
    "paragraphs": [
      "When Larry Harmon tried to vote on a marijuana initiative in November in his hometown of Kent, Ohio, the 59-year-old software engineer found his name had been struck from the voter rolls. Two hours south in Zanesville, restaurant worker Chris Conrad, 37, was also told he was no longer registered.",
      "Both men later found out why: they had not voted often enough. 8 elections loom, officials in Ohio have removed tens of thousands of voters from registration lists because they have not cast a ballot since 2008.",
      "states periodically cleanse their voter rolls, but only a handful remove voters simply because they don’t vote on a regular basis. And nowhere could the practice have a greater potential impact in the state-by-state battle for the White House than Ohio, a swing state that has backed the winner in every presidential election since 1960.",
      "Voters of all stripes in Ohio are affected, but the policy appears to be helping Republicans in the state’s largest metropolitan areas, according to a Reuters survey of voter lists. In the state’s three largest counties that include Cleveland, Cincinnati and Columbus, voters have been struck from the rolls in Democratic-leaning neighborhoods at roughly twice the rate as in Republican neighborhoods.",
      "That’s because residents of relatively affluent Republican-leaning neighborhoods are more likely to vote in both congressional elections and presidential contests, historical turnouts show. Democrats are less likely to vote in mid-term elections and thus are more at risk of falling off the rolls.",
      "In the three biggest counties, at least 144,000 voters have been removed, the Reuters analysis found. The statewide total is unclear.",
      "Each of the state’s 88 counties manages its own voter rolls, which generally are not made public. Unlike other voting-rights disputes that have sparked protests and lawsuits, the practice doesn’t appear to be driven by one specific party.",
    ]
  },
  {
    "id": "A19",
    "cat": "A",
    "expect": [60, 100],
    "title": "Official candidate seen ahead in Buenos Aires Senate race: poll",
    "url": "https://www.reuters.com/world/article/19",
    "paragraphs": [
      "Argentina s ruling party candidate for Senate in the key  province of Buenos Aires is 4.8 percentage points ahead of the opposition candidate, according to a poll by consultancy Management & Fit sent exclusively to Reuters on Friday. The country s mid-term congressional election will be held this Sunday, and is seen as an early indicator of the electoral power that President Mauricio Macri will have going into his 2019 re-election campaign.",
      "Esteban Bullrich, of Macri s  Cambiemos  or  Let s Change  party, is forecast to win 35.3 percent of votes in his bid for the Senate, according to the poll. Buenos Aires province is home to a third of Argentina s population.",
      "His opponent, former President Cristina Fernandez, has 30.5 percent of voter intentions, according to the Management & Fit survey of 2,000 voters. The poll had a margin of error of 3.3 to 3.5 percentage points.",
      "Fernandez is loved by many low-income Argentines for her generous social spending. Macri, a proponent of free-markets,  and Cambiemos have been criticized for reducing popular home heating and transportation subsidies but lauded by investors who say the President s policies can return Argentina to sustained growth.",
    ]
  },
  {
    "id": "A20",
    "cat": "A",
    "expect": [60, 100],
    "title": "U.S. lawmakers want Russia sanctions over hacking, Ukraine, Syria",
    "url": "https://www.reuters.com/world/article/20",
    "paragraphs": [
      "Republican and Democratic senators said Tuesday they want to slap a wide range of sanctions on Russia over its cyber activities and actions in Syria and Ukraine, and force President Donald Trump to formally waive them if he has objections. Ten senators - Republicans John McCain, Lindsey Graham, Marco Rubio, Ben Sasse and Rob Portman and Democrats Ben Cardin, Robert Menendez, Jeanne Shaheen, Amy Klobuchar and Richard Durbin - introduced the legislation and said they hoped to add more sponsors and push Senate leaders to allow a vote.",
      "A sanctions bill with similar provisions is being written in the House of Representatives, led by Democrats Eliot Engel, the Foreign Affairs Committee ranking member, and Gerald Connolly, a panel member. The measures could set up a showdown with the administration of Trump, a Republican who takes office on Jan.",
      "20 and has repeatedly praised Russian President Vladimir Putin and criticized intelligence officials for findings linking him to attempts to influence the 2016 presidential election. The Senate bill was introduced a day before the Senate Foreign Relations Committee holds its confirmation hearing for Trump’s nominee to be secretary of state, Rex Tillerson, who worked for years with Putin’s government as chief executive of Exxon Mobil.",
      "Cardin, the panel’s top Democrat, said Tillerson would be questioned about whether he would support the sanctions. “This is about protecting the security of America,” he told a news conference.",
      "The bill would impose visa bans and freeze the assets of people “who engage in significant activities undermining the cyber security of public or private infrastructure and democratic institutions” or those who aid such activities. It would also impose sanctions on those who engage with the Russian defense or intelligence sectors, which could affect international companies doing business with Russia.",
      "It also puts into law sanctions on Russia that President Barack Obama imposed via executive order late last month. lawmakers have long called for a tougher response to Russian annexation of Ukraine’s Crimea region and intervention in the Syrian civil war on behalf of Syrian President Bashar al-Assad.",
      "Their impatience has increased since intelligence agencies released a report Friday saying Putin ordered a campaign to try to sway the 2016 U.S. “We have to respond to Vladimir Putin’s behavior and if we don’t, he will continue unchecked,” McCain said.",
    ]
  },
  {
    "id": "B1",
    "cat": "B",
    "expect": [25, 60],
    "title": "OBAMA BLAMES “Right Wing” Talk Radio, FOX News For Angering “White People”…”Anti-Government” Attitudes [VIDEO]",
    "url": "https://politicalbias-news.com/articles/1",
    "paragraphs": [
      "Barack only needs to find the closest mirror to understand where the increase in racism and distrust in our over-reaching government originated. He is without a doubt, the most divisive President in the history of the United States of America.",
      "Dividing our nation will be his legacy President Barack Obama accused  right wing  talk radio and cable channels like Fox News of angering white people in America about the economy, arguing that it was actually doing really well under his administration.During his speech, Obama decried Republicans who campaigned on stopping  welfare queens  complaining about  makers and takers  and even referred to Mitt Romney s 47 percent comment. Their basic message is anti-government, anti-immigrant, anti-trade, and let s face it   it s anti-change,  Obama said, accusing them of lying just to oppose him.",
      "What they are saying just isn t true,  he said, before launching his own attempt at  mythbusting  narratives from conservative media.Obama complained that people failed to recognize that he was succeeding in improving the economy, cutting the deficit, and cutting spending. It s the story that is broadcast every day on some cable news stations, on right wing radio it s pumped into cars and bars and VFW halls all across America and right here in Elkhart,  he said.",
      "If you re hearing that story all the time, you start believing it. It s no wonder people start thinking big government is the problem.",
      "Because of conservative radio, Obama argued,  White Americans think that reverse discrimination is as big a problem as discrimination against minorities. Obama argued they were wrong, since black unemployment was still twice as high as white unemployment and Hispanic women earned 55 cents for every dollar earned by a white man.",
      "Obama warned voters against listening to Trump s political argument. The one thing I can promise you is if we turn against each other based on divisions of race and religion if we fall for a bunch of okey-doke just because it sounds funny or the tweets are provocative, then we re not going to build on the progress we started.",
      "At one point, Obama stuttered repeatedly when speaking about Trump.Our President without a teleprompter:https://vine.co/v/iVLaiJxdqV2Obama made his speech at Elkhart, Indiana, where a majority of voters in the county voted against him in the 2012 presidential election. One person in the crowd shouted  one more time!  suggesting that she wanted Obama to run again for office.",
    ]
  },
  {
    "id": "B2",
    "cat": "B",
    "expect": [25, 60],
    "title": "FRIGHTENING Observations By A 75 Year Old American…All Of A Sudden America’s Becoming An Islamic State",
    "url": "https://politicalbias-news.com/articles/2",
    "paragraphs": [
      "These are shocking revelations that have essentially taken place while America and our elected representatives slept.ALL Of A Sudden Before Obama there was virtually no outlandish presence of Islam in America. Only 7 years later, here are some observations made by a 75 year old American:1.",
      "All of a sudden, Islam is taught in schools. Christianity and the bible are banned in schools and in our military.2.",
      "All of a sudden we must allow prayer rugs everywhere and allow for Islamic prayer in schools, airports and businesses.3. All of a sudden we must stop serving pork in prisons.4.",
      "All of a sudden we are inundated with law suits by Muslims who are offended by American culture.5. All of a sudden we must allow burkas to be worn everywhere even though you have no idea who or what is covered up under them.6.",
      "All of a sudden Muslims are suing employers and refusing to do their jobs if they personally deem it conflicts with Sharia Law.7. All of a sudden the Attorney General of the United States vows to prosecute anyone who engages in  anti-Muslim speech .8.",
      "All of a sudden, Jihadists who engage in terrorism and openly admit they acted in the name of Islam and ISIS, are emphatically declared they are NOT Islamic by our leaders and/or their actions are determined NOT to be terrorism, but other nebulous terms like  workplace Violence. All of a sudden, it becomes policy that Secular Middle East dictators that were benign or friendly to the West, must be replaced by Islamists and the Muslim Brotherhood.10.",
      "All of a sudden our troops are withdrawn from Iraq and the Middle East, giving rise to ISIS.11. All of a sudden, America has reduced its nuclear stockpiles to 1950 levels, as Obama s stated goal of a nuke-free America by the time he leaves office continues uninterrupted.12.",
    ]
  },
  {
    "id": "B3",
    "cat": "B",
    "expect": [25, 60],
    "title": "LOL! SHAKEDOWN ARTIST JESSE JACKSON TELLS CROWD: “President Trump Would Not Qualify To Get Into Jesus’ Kingdom” [VIDEO]",
    "url": "https://politicalbias-news.com/articles/3",
    "paragraphs": [
      "Here s a 1999 video of Jesse Jackson praising Donald Trump for his contribution to the black community, awarding him with a lifetime achievement award for African Americans:What a difference a few years (and an [R] behind your name can make:WFB   While speaking to a crowd at the  Ministers March for Justice  Rev. Jesse Jackson suggested that President Trump should be worried about gaining citizenship in heaven.",
      "Trump says you must be able to speak the language of English, [be] qualified, and have a job skill,  Jackson said Monday. Jesus would not qualify to come in Trump s country he would not qualify to get into Jesus  kingdom.",
      "It s difficult to understand Jackson in the video below, as he mumbles through much of his commentary. (For translation, see quotes above):The  Ministers March for Justice,  was spearheaded by Rev.",
      "Al Sharpton and featured ministers from various traditions united in opposing the Trump administration. The event took place on the 54th anniversary of Martin Luther King Jr.",
      "s March on Washington, and Jackson did not shy away from using religious language to judge the president.After judging Trump s ability to enter heaven, he quoted part of a passage from the Gospel of Matthew, in which Jesus says what he will tell his followers at the Final Judgment.Is the notorious shake down artist Jesse Jackson really one to be deciding who will and who will not be given admittance to heaven? In 2006, government watchdog Judicial Watch released a report that revealed new details about the intimidation and shakedown tactics of Jesse Jackson s Rainbow Push Coalition.WND   The report,  Jesse Jackson Exposed,  claims Jackson is  an extortionist who uses his influence as a civil rights leader to essentially blackmail wealthy corporations with absurd discrimination threats. Included, the group says, are  incriminating admissions from Jackson made under oath at trial.",
      "Among the tactics highlighted in the report are:Jackson lobbied the Federal Communications Commission to block companies seeking government approval to merge until they donate money to Rainbow Push.Jackson publicly chastised Toyota for running an ad Jackson deemed  racist. After Toyota pulled the ad, Jackson threatened a boycott the automaker to force it to launch a $7.8 million  diversity program.",
      "Jackson installed one of his friends, J.L. Armstrong, in a management position at Toyota to determine which organizations would receive $700 million in contracts awarded by Toyota.Minority businesses pay Jackson s  Trade Bureau  a fee to help extort lucrative contracts from corporations.",
    ]
  },
  {
    "id": "B4",
    "cat": "B",
    "expect": [25, 60],
    "title": "BREAKING: FORD CEO CITES TRUMP In Announcement To Scrap $1.6 Billion Mexico Plant…Will Invest In MI Instead [VIDEO]",
    "url": "https://politicalbias-news.com/articles/4",
    "paragraphs": [
      "The Government-Orchestrated Bankruptcies Of General Motors And Chrysler Led To Tens Of Thousands Of Direct Factory, Supplier And Other Related Job Cuts. While government influence at decade s end helped Detroit recover financially, the government-orchestrated bankruptcies of General Motors and Chrysler led to tens of thousands of direct factory, supplier and other related job cuts.",
      "The primary benefit of the U.S. industry restructuring for employment has been the balance of jobs saved rather than jobs created.",
      "(John Crawley,  Analysis: Obama Seeks Lift From Detroit Auto Jobs,  Reuters, 1/12/12)TARP Inspector General: Tens Of Thousands Of Jobs Were Lost Due To Hasty Factory Closings. Barofsky, the special inspector general for the Troubled Asset Relief Program of the Treasury Department, said both carmakers needed to shut down some underperforming dealerships.",
      "But it questioned whether the cuts should have been made so quickly, particularly during a recession. The report, released on Sunday, estimated that tens of thousands of jobs were lost as a result.",
      "(Nick Bunkley,  TARP Audit Questions Rush To Close Auto Dealers,  The New York Times, 7/18/10)Ford Motor Company announced Tuesday it will cancel a $1.6 billion plant planned for Mexico and will instead invest $700 million in a Michigan assembly plant, directly tying the decision to  pro-growth policies  championed by President-elect Donald Trump.Trump had previously been critical of Ford s plans to build in Mexico. After the announcement, Trump tweeted a link to a story about the Ford decision and then added in a subsequent message:  Instead of driving jobs and wealth away, AMERICA will become the world s great magnet for INNOVATION & JOB CREATION.",
      "We re doing this decision based on what s right for our business,  Ford CEO Mark Fields told Neil Cavuto on Fox Business Network. As we think about the investments here in Michigan, as you can imagine, Neil, we look at a lot of factors as we make those.",
      "One of the factors that we re looking at is a more positive U.S. manufacturing business environment under President-elect Trump and some of the pro-growth policies he said he s going to pursue.",
    ]
  },
  {
    "id": "B5",
    "cat": "B",
    "expect": [25, 60],
    "title": "HUFFINGTON POST PUBLISHES, Then DELETES “Trump Is Absolutely Right About Sweden” Article…But OOPS! It Was Archived…And We’re Happy To Share Its BRUTALLY HONEST Content With You!",
    "url": "https://politicalbias-news.com/articles/5",
    "paragraphs": [
      "Yesterday, social media was buzzing after The Huffington Post actually posted a story that not only backed up Trump s assertion about Sweden being a hot mess, but it called out journalists for lying about how the invasion of immigrants are destroying European nations. The title of the article in and of itself, is bad enough:  Trump is absolutely right about Sweden but the honesty with which the writer approaches the subject is even more stunning.",
      "Not surprisingly, after getting a lot of negative reaction from the left who felt the Huffington Post let them down by actually telling the truth, the Huffington Post deleted the story. Our friend @TEN_GOP was kind enough to archive the story before they deleted it.https://twitter.com/TEN_GOP/status/834822902495145985President Trump tweeted clarification of the comments he made about Sweden that the Huffington Post author Ren  Zografos  referenced in his article:My statement as to what's happening in Sweden was in reference to a story that was broadcast on @FoxNews concerning immigrants & Sweden.",
      "Trump (@realDonaldTrump) February 19, 2017After The Huffington Post deleted his article, Ren  Zografos  came out in defense of his words and of Trump comments about Sweden on Twitter:Trump is absolutely right about Sweden https://t.co/jyFM3bjIE8  Ren  Zografos (@zokrates) February 22, 2017Here he Zografos defends his article as nothing but the truth. :Thank you for all supports so far, kind people.",
      "The story is nothing but the truth.. #truth #media #Trump  Ren  Zografos (@zokrates) February 23, 2017Sweden has huge problems because of liberal immigration policy Many journalists around the world are eager to condemn Donald Trump no matter what.",
      "When he tweeted about immigration in Sweden few days ago, the social media exploded. Most of the opponent said that Trump has made up the immigration problem Sweden have.",
      "They are wrong.Only hours later there was a riot of violence and destructions by immigrants in the capitol of Sweden, Stockholm. The police was forced to shoot with ammunition to put and end to it.",
      "In Malm , another city south in Sweden they have struggle with gang violence and lawlessness for years. So when Trump talk about that Sweden have an immigration problem he is actually spot on.It s well known for Scandinavians and other Europeans that liberal immigration comes with drugs, rapes, gang wars, robbery and violence.",
    ]
  },
  {
    "id": "B6",
    "cat": "B",
    "expect": [25, 60],
    "title": "NY PROFESSOR Who’s Correctly Chosen President For 100 Years Explains Why Trump Will Win",
    "url": "https://politicalbias-news.com/articles/6",
    "paragraphs": [
      "We ve been telling you all week to ignore the manufactured polls and lies being told by mainstream  journalists  (of which 65 have been found to be in collusion with Hillary s camp)designed to discourage and deflate Donald Trump supporters. The crowds, the enthusiasm and the fundraising for Trump is on fire, while Hillary and Tim Kaine can barely fill a phone booth with supporters.",
      "This SUNY professor has a model that s been working for over 100 years of elections and he s giving the race to Trump The most important thing Trump supporters can do right now, is to reach out to their friends and family and convince them to get out to the polls for Trump. There will undoubtedly be a lot of voter fraud committed by Democrats and it s up to us to help make up that difference with actual voters for Trump.",
      "Donald Trump may be behind in most polls, but one veteran New York prognosticator still predicts he will win come Election Day. I think he was the strongest candidate in the primaries and that he will prevail,  Helmut North, a political science professor at SUNY Stony Brook, told The Post on Monday, even as the RealClearPolitics average shows the Republican candidate trailing Democrat Hillary Clinton by 6.1 percentage points.The sale of halloween masks have also always been correct in predicting the winner of the presidential election.",
      "Check out who s winning in sales: Norpoth developed a model that, applied retroactively in earlier races, would have correctly predicted the winner of every presidential election since 1912   with the exception of 2000, when predicted winner Al Gore barely lost to George W. Bush.The model looks at which of the candidates performed better in the primaries and caucuses and concludes that the stronger performer there will enter the White House.",
    ]
  },
  {
    "id": "B7",
    "cat": "B",
    "expect": [25, 60],
    "title": "BAD NEWS FOR OBAMA, Black Lives Matter Terror Group: New Gallop Poll Shows Love For Police Officers Surged In 2016…Near All-Time High",
    "url": "https://politicalbias-news.com/articles/7",
    "paragraphs": [
      "The insatiable 24/7 news cycle   bolstered by cellphones, body cameras and a ubiquitous social media   fed us grainy, sketchy videos of police shooting citizens and citizens shooting police in never-ending Mobius loops. From this year s media coverage, you d think police-citizen relations were at a low not seen since the civil unrest of the  60s and  70s   an era with its own turmoil.",
      "Seventy-six percent of Americans have  a great deal  of respect for police   up 12 percent from last year  Among conservatives   85 percent respect police  a great deal  compared to 69 percent last year  Among liberals,  a great deal  was selected by 71 percent, compared to 50 percent last year  Whites who respect police a great deal rose 11 points   up to 80 percent from 69 percent last year  Among nonwhites, the rise was more dramatic   up 14 points from 53 percent to 67 percent  The 18-34 age group had the highest jump, going from 50 percent in 2015 to 69 percent in 2016  The 35-54 group went from 61 percent to 77 percent   a 16 percent increase  The 55-and-older crowd rose 4 percent   from 77 percent to 81 percentGallup has asked this question nine times since 1965. A solid majority of Americans have said they respect their local law enforcement in all the polls.",
      "The percentage who say they respect the police is significantly higher now than in any measurement taken since the 1990s and is just 1 point below the high of 77 percent recorded in 1967.This is great news for police and citizens, which is probably one reason it gets little to no news or social media coverage. It means police-citizen relations aren t controlled by what the media chooses to publicize to garner revenue or popularity.",
      "adn.comThe war on cops that was started by Barack Obama, his former AG Eric Holder and Al Sharpton created a massive racial divide in our nation. The most serious result of Obama s war on cops was the creation of the Black Lives Matter terror group that incited so much hate for cops that it inspired the killing of innocent cops across America.",
      "Here are 4 inconvenient facts you need to know about cops killing blacks thanks to the superb research of Heather MacDonald:1. Cops killed nearly twice as many whites as blacks in 2015.",
      "According to data compiled by The Washington Post, 50 percent of the victims of fatal police shootings were white, while 26 percent were black. The majority of these victims had a gun or  were armed or otherwise threatening the officer with potentially lethal force,  according to Mac Donald in a speech at Hillsdale College.2.",
      "More whites and Hispanics die from police homicides than blacks. According to Mac Donald, 12 percent of white and Hispanic homicide deaths were due to police officers, while only four percent of black homicide deaths were the result of police officers.3.",
    ]
  },
  {
    "id": "B8",
    "cat": "B",
    "expect": [25, 60],
    "title": "NYC’S “PROGRESSIVE” MAYOR BEHAVES LIKE A 2-YEAR OLD: DeBlasio literally stares down former Mayor Giuliani",
    "url": "https://politicalbias-news.com/articles/8",
    "paragraphs": [
      "WHAT A NUT! New York s Mayor DeBlasio gives the evil eye and stares down former Mayor Giuliani or criticizing him for the liberal policies that have lead to a surge of homelessness on the streets.Mayor de Blasio couldn t hide his feelings about nemesis Rudy Giuliani, giving him a piercing stare Friday during the 9/11 ceremony at Ground Zero. Only hours before they shared the stage at the solemn event, Giuliani for the second time this week criticized de Blasio for misrepresenting the city s homeless crisis.",
      "OK, here s how ignorant Mayor de Blasio is. He said that there were 40 percent more homeless people during my administration,  Giuliani said on Fox 5, adding the mayor misquoted that statistic, which The New York Times put at 32 percent.",
      "Giuliani also said the spike was only in the shelter population, not in the number of homeless on the street. People who are in shelters, I would like to inform the mayor, are not homeless,  Giuliani sniffed.",
      "The two mayors have been locked in a war of words since Giuliani blasted de Blasio and his  progressive views  for allowing vagrants to sleep on the streets in a Post op-ed last Sunday. De Blasio fired back, calling the ex-mayor  delusional  and saying homelessness rose by 40 percent under his watch between 1994 to 2001.",
      "[Giuliani] clearly doesn t remember the fact that he chased   as he said   he chased and chased people, but he also deprived families of benefits they needed and health care they needed,  de Blasio said earlier this week. But Giuliani patted himself and his successor, ex-Mayor Mike Bloomberg, on the back for cleaning up the streets.",
      "All you had to do was live in this city and you know that when I was mayor, there was very little homelessness in this city. They were in shelters,  Giuliani told Fox 5 on Friday.Read more: NYP",
    ]
  },
  {
    "id": "B9",
    "cat": "B",
    "expect": [25, 60],
    "title": "TUCKER CARLSON Asks How Hypocrite Maxine Waters Affords $4.3 MILLION Mansion After 40 Yrs In Congress",
    "url": "https://politicalbias-news.com/articles/9",
    "paragraphs": [
      "Maxine Waters is so filled with hate for anyone who disagrees with her, that she s decided to appoint herself as the Democrat s chief attack dog for President Trump and his administration. Unfortunately for Maxine, making a public spectacle of herself also comes with a price.",
      "Speaking of a price how about the price tag on career politician Maxine Waters $4.3 million mansion?Tucker Carlson reacted to Rep. Maxine Waters  (D-Calif.) threat to  take [HUD Secretary Dr.",
      "Ben Carson s] a** apart  by noting she might indeed be qualified to take his job.Carlson said Waters, a 40-year politician, lives in a 6,000 square-foot mansion worth $4.3 million that is not in her congressional district.He asked how Waters could afford a home like that in a ritzy neighborhood while solely working as a representative of the 43rd District. We should take her seriously on this subject,  Carlson said, calling her a  confirmed expert on the question on housing.",
      "He said that while Waters sometimes speaks using racially-charged rhetoric, she lives in a neighborhood that is only six percent African-American.Via: Fox News",
    ]
  },
  {
    "id": "B10",
    "cat": "B",
    "expect": [25, 60],
    "title": "HILLARY PLAYS VICTIM CARD…Here’s Why That’s NOT A Good Strategy!",
    "url": "https://politicalbias-news.com/articles/10",
    "paragraphs": [
      "The Clintons always blame somebody else. Now it s FBI Director James Comey s turn to embody their all-purpose bogeyman, the vast right-wing conspiracy.",
      "Somebody, sometimes everybody, is out to get them, unfairly of course.The victim card is a Clinton family heirloom, but there are major problems playing it over Comey s sudden reopening of the e-mail probe.Clinton created the mess with her incredibly stupid decision to use a private server as secretary of state. Virtually every major issue dogging her, including her reputation for chronic dishonesty, was started or exacerbated by that decision, including the current one.Even as her top aides remain mystified about why she did it, the result fits the family pattern now that Huma Abedin, her most loyal  body  person, is on the hook.",
      "It was, by all accounts, the FBI s criminal investigation into Abedin s pervy husband, Anthony Weiner, that led to the new cache of suspect e-mails found on a computer the couple shared.Clinton is in a no-win situation either way this plays out This is serious and real but the Clintons don t deal well with with serious and real. The live in their own entitled world that s about to come tumbling down on them one way or the other Catherine Herridge had this to say about the FBI:CATHERINE HERRIDGE, FOX NEWS CHIEF INTELLIGENCE CORRESPONDENT: Chris, a law enforcement source tells FOX News that thousands of records are involved.",
      "The New York FBI team assessed them as relevant, telling their colleagues on the Clinton e-mail case, quote,  We think we ve come across some documents pertinent to your investigation. Clinton wants the evidence public, which is not standard in ongoing cases.HERRIDGE: A source close to the FBI probe could not recall issuing a subpoena for Abedin s records, adding they did not believe the device shared by Abedin and Weiner was searched by agents.",
      "Abedin told the FBI in April that she sent State Department e-mails, including this one from Clinton, to her personal Yahoo account, where it was easier to print. In June, Abedin swore under oath in a Freedom of Information Act lawsuit that she looked through all her devices that could old government e-mail.On Thursday, FBI Director James Comey was briefed on the findings.",
      "And that same day, he decided to reinitiate the e-mail case and notify Congress. The director s decision is described to FOX News as driven by the sheer volume of records and the commitment he made under oath.That s the reality IT S BAD!Read more: NYP",
    ]
  },
  {
    "id": "B11",
    "cat": "B",
    "expect": [25, 60],
    "title": "New Book Reveals HILLARY’S ANTI-SEMITIC SIDE: Blamed Bill’s Campaign Manager For Losing Congressional Race…Called Him A “F*cking Jew B*stard”",
    "url": "https://politicalbias-news.com/articles/11",
    "paragraphs": [
      "Hillary doesn t recall saying it, but Bill s campaign manager, Paul Fray clearly remembers her saying it. Just another Hillary lie what different does it make? Hillary Clinton is fighting a rearguard action to avoid further damage to her standing with the crucial Jewish vote in her campaign for a Senate seat after a claim that she once used an ethnic insult against one of Bill Clinton s aides.A book out today claims that 26 years ago she called Paul Fray, her husband s campaign manager at the time, a  fucking Jew bastard .Mrs Clinton denied the allegation and pressed the president into supporting her, but the author, Jerry Oppenheimer, said:  Three witnesses have now publicly acknowledged that she said it.",
      "I have never said anything like that, ever,  Mrs Clinton said. I have in the past certainly, you know maybe, called somebody a name.",
      "But I have never used an ethnic, racial, anti-Semitic, bigoted, discriminatory, prejudiced, accusation against anybody. Mr Clinton, who was trying to bring about a Middle East peace deal at Camp David, backed her up.",
      "I was there on election night in 1974 and the charge is simply not true,  he said. She might have called him a bastard, I wouldn t rule that out.",
      "She s never claimed that she was pure on profanity. But I ve never heard her tell a joke with an ethnic connotation.",
      "Referring to a  vast rightwing conspiracy  in previous elections, he said:  This is part of a pattern. They couldn t defeat me politically and they can t defeat her politically so they go after us personally.",
      "Accounts of the dispute on election night 1974, when Mr Clinton failed to win a congressional seat representing Arkansas, have appeared before without the ethnic insult.Those present at the inquest into the defeat were Mr Clinton, his then-girlfriend Hillary, his campaign manager Paul Fray, and Mr Fray s wife, Mary Lee. Neill McDonald, a campaign worker, was just outside the room and claims to have heard everything.The Frays and Mr McDonald are the three witnesses on whom Mr Oppenheimer, a former reporter on the National Inquirer tabloid, relies for the passage in his book State of a Union: Inside the Complex Marriage of Bill and Hillary Clinton.Mr Fray, 57, said yesterday:  I was a little defensive about it.",
    ]
  },
  {
    "id": "B12",
    "cat": "B",
    "expect": [25, 60],
    "title": "CRONY CORRUPT POLITICS: Obama Admin BLOCKED FBI From Doing A Clinton Foundation Investigation",
    "url": "https://politicalbias-news.com/articles/12",
    "paragraphs": [
      "The information is spilling out little by little but we now know that HILLARY CLINTON put America s National Security at risk when she peddled influence for money using our State Department. Is there any doubt that she s lived up to her name  Crooked Hillary ? What s even worse is that the FBI wanted to investigate The Clinton Foundation but Obama s DOJ blocked the investigation.",
      "This is exactly why an outsider like Donald Trump is what we need ASAP!The Trump campaign seized on reports Thursday that the Obama administration rejected requests from three FBI field offices that wanted to open public corruption cases involving the Clinton Foundation and Democratic presidential nominee Hillary Clinton. After banks alerted the field offices to suspicious activity involving the Clinton family charity, the FBI wanted to investigate conflicts of interest stemming from foreign donations during Mrs.",
      "Clinton s tenure as secretary of state, CNN reported. Today s news that President Obama s Department of Justice overruled three separate DOJ field offices and the FBI in declining to open a public corruption charge against the Clinton Foundation shows a troubling pattern of Obama and Clinton politicizing any government institution for their own personal political interests,  Trump campaign spokesman Jason Miller said in a statement.",
      "This latest refusal to allow even a cursory investigation into the Clinton Foundation s pay-for-play dealings smacks of political favoritism. This is exactly why the American public has lost trust in the U.S.",
    ]
  },
  {
    "id": "B13",
    "cat": "B",
    "expect": [25, 60],
    "title": "Gangs Involved In Huge Biker Brawl Have “toned down their threats” After Warning Police Of Retaliation And Threat To kill “anyone in uniform”",
    "url": "https://politicalbias-news.com/articles/13",
    "paragraphs": [
      "We would encourage biker groups to stand down. Patrick SwantonPolice in Texas are on alert after two biker gangs involved in a deadly shootout in Waco over the weekend allegedly issued orders to shoot and kill uniformed law enforcement officers.State and federal authorities distributed memos to local police warning that the Cossacks and Bandidos motorcycle gangs had been told to arm themselves and head to North Texas in the wake of last weekend s bloody shootout.",
      "Nine people were killed and 18 injured in the gun fight, which erupted at a Twin Peaks restaurant in Waco on Sunday.Police made more than 170 arrests and confiscated guns and other weapons after the fight, which is believed to have involved up to five different biker gangs.https://youtu.be/4VV7gdwoJk8Sunday s bloody chaos consumed the Twin Peaks restaurant and spilled into its parking lot where bikers turned their weapons on police. Police returned fire, killing four bikers, CNN reported.The Bandidos are one of the largest motorcycle gangs in the world.",
      "Only the Hells Angels are bigger These outlaws ride Harley s, traffic drugs, carry weapons and run prostitution rings. 2,500 strong, the Bandidos rule the roads in the US and stretch across the globe from Europe to Asia and Australia.",
      "San Antonio, TX is the hub of the gangs activity:Law enforcement officers across Texas received memos Monday warning of possible retaliation. A bulletin posted by the Del Rio Sector Border Patrol said members of the Cossacks and Bandidos biker gangs had been instructed to  shoot and kill law uniformed law enforcement officers,  according to a CBS affiliate that covers the Dallas-Fort Worth area.Other law enforcement memos obtained by the station warned of  escalating violence  and said that members of the rival gangs, both of which originated in Texas in the 1960s, had been ordered to arm themselves and head to North Texas.A warning distributed by the Texas Department of Public Safety said the bikers were told to ignore orders from police they encountered on the way.Waco police told CNN that they had known the Twin Peaks restaurant was a hotspot for bikers, and that uniformed officers regularly patrolled the area closely in the months leading up to the deadly melee.",
      "But police presence wasn t enough to dissuade the bikers from violence. We wanted our presence to be known,  Waco Police Sergeant W.",
      "That mattered not to them   We would encourage biker groups to stand down. In a news briefing Tuesday, Swanton noted that gangs  toned down  their threats for reprisal, although they remain a worry for law enforcement, according to Reuters.According to The New York Times, the biker meet-up over the weekend was originally  intended to discuss bikers  rights and how to work on issues of mutual concern,  but instead collapsed into violence, with a long-standing feud between the Bandidos and the Cossacks as the backdrop.If convicted, the gang members accused in the shooting could face the death penalty.",
    ]
  },
  {
    "id": "B14",
    "cat": "B",
    "expect": [25, 60],
    "title": "MOMS WHOSE CHILDREN Were Killed By Illegals To Testify Before Congress Today",
    "url": "https://politicalbias-news.com/articles/14",
    "paragraphs": [
      "If you haven t yet discovered The Remembrance Project, please do so! The Remembrance Project was started by families of relatives whose loved one was killed by an illegal alien. It s heartbreaking to think that these deaths could have been prevented if we had a border.",
      "A day after the Obama administration argues for an extension of amnesty to millions of illegal immigrants before the Supreme Court, the mothers of victims murdered by illegal immigrants will appear before a House panel to call for tougher immigration enforcement.Tuesday, Michelle Root, the mother of Sarah Root   a recent college graduate who was killed by an illegal immigrant (now on Immigration and Customs Enforcement s Most Wanted List)   and Laura Wilkerson, the mother of Josh Wilkerson   who was tortured and killed by an illegal immigrant   will testify before the House Judiciary Committee s Immigration and Border Security Subcommittee. Not everyone is a DREAMer or a valedictorian   there are criminals motivated by malice and a conscious disrespect for the law,  Subcommittee Chairman Rep.",
      "Trey Gowdy (R-SC)86% said in a statement announcing the hearing. But these losses are preventable, and it should not take the tragic death of another innocent life for this administration to begin enforcing our laws.",
      "The Obama administration has come under fire in recent years for what Republicans and immigration hawks say is a significant dilution of immigration law and enforcement. According to the committee, for example, from October 2011 to December 2014, ICE released criminal aliens from detention over 105,000 times, despite committing assault, sexual assaults, homicide-related offenses, and kidnapping prior to their release.Root and Wilkerson s prepared testimony, posted in advance of the hearing by the committee, offer a glimpse into the heart-wrenching testimony lawmakers will hear Tuesday.",
      "Edwin Mejia spent four days in jail and is believed to have fled the area and possibly the country after posting $5,000 bail,  Root s prepared testimony reads. Less than the amount it cost to bury my baby.",
      "Mejia is charged with killing 21-year-old Sarah Root while street-racing drunk. He absconded after posting bail, and ICE declined to hold him.",
      "Because of the lack of controls, the police, immigration, U.S. Marshals and law enforcement have little or no information on his whereabouts on him, his family and acquaintances.",
    ]
  },
  {
    "id": "B15",
    "cat": "B",
    "expect": [25, 60],
    "title": "BREAKING BOMBSHELL: All Dem Congressmen Phone Numbers And E-mails Hacked…Pelosi PC Hacked",
    "url": "https://politicalbias-news.com/articles/15",
    "paragraphs": [
      "Wow! This just keeps getting better and better! This couldn t have happened to a better person Pelosi! LOL!After disappearing for a couple of weeks, the hacker  Guccifer 2.0  returned late this afternoon to provide a new headache for Democrats.In a post to his WordPress blog, the vandal who previously provided nearly 20,000 Democratic National Committee e-mails to Wikileaks uploaded an Excel file that includes the cell phone numbers and private e-mail addresses of nearly every Democratic member of the House of Representatives.The Excel file also includes similar contact information for hundreds of congressional staff members (chiefs of staff, press secretaries, legislative directors, schedulers) and campaign personnel.In announcing the leak of the document,  Guccifer 2.0  reported that the spreadsheet was stolen during a hack of the Democratic Congressional Campaign Committee. As you see I wasn t wasting my time! It was even easier than in the case of the DNC breach,  the hacker wrote.Along with the Excel file,  Guccifer 2.0  also uploaded documents that included the account names and passwords for an assortment of subscription services used by the DCCC, from Lexis-Nexis to Glenn Beck s web site (password: nutbag).While  Guccifer 2.0  claims to be Romanian and an  unknown hacker with a laptop,  cybersecurity investigators have concluded that he is part of a Russian intelligence operation that has targeted the DNC, Hillary Clinton campaign staffers, and assorted Republicans, including John McCain, Lindsey Graham, and Michele Bachmann.In a message today, the hacker branded the U.S.",
      "presidential elections a  farce  that is  being settled behind the scenes as it was with Bernie Sanders. He added,  I wonder what happened to the true democracy, to the equal opportunities, the things we love the United States for.",
      "The MSM are producing tons of propaganda hiding the real stuff behind it. But I do believe that people have right to know what s going on inside the election process in fact.",
      "Guccifer 2.0  also invited reporters to contact him via Twitter direct message:  Dear journalists, you may send me a DM if you re interested in exclusive materials from the DCCC, which I have plenty of.",
    ]
  },
  {
    "id": "C1",
    "cat": "C",
    "expect": [0, 30],
    "title": "Report: Hillary Clinton To Raise $1 Billion To Unseat GOP Reps. And Senators",
    "url": "https://conspiracy-daily.info/post/1",
    "paragraphs": [
      "As crunch time nears and states are having their primary contests, the Clinton campaign is wasting no time in getting further ahead than the Republicans.In a new report detailed by Politico, Hillary Clinton and her campaign are setting course to raise over $1 billion to unseat vulnerable House and Senate Republicans, with the aim of knocking off 10 to 25 House seats from Republicans and taking back the Senate.Hillary Clinton will raise $1 billion for Democrats and the party will train some of their efforts   and that money   on defeating House and Senate Republicans. Party leaders privately concede that the Senate could be lost either way.",
      "But senior House Republicans say they re in good shape across the country, and see no evidence that the control of the chamber is in playRepublicans are especially antsy at these revelations, considering the Republican National Committee fell almost $10 million short in their July fundraising predications (they only conjured up $27 million). In that same month, the Democratic Congressional Campaign Committee, the fundraising arm of the Democratic National Committee, raised over $35 million (not including the total $90 million in joint fundraising with Clinton), and has raised almost $20 million more than the RNC for the 2016 fiscal year so far.In contrast, Trump had a very good month for fundraising.",
      "Counter that with the RNC s pathetic monthly numbers, the money speaks for itself: the GOP is putting its trust (and money) in Trump and Trump alone.So while Trump is hurting down-ballot candidates and their efforts for re-election, Clinton is set to raise unprecedented amounts of money for the Democrats, all while having her own campaign to fund.Back in May 2015, Politico reported that Clinton s campaign sought to raise over $2 billion by the time the November general election rolled around. Considering the Clinton campaign has raised, per OpenSecrets, $375 million for her own personal campaign, $100 million in 2015 for down-ballot candidates in 2015, and over $60 million through the summer of 2016 (coupled with the goal of $1 billion by November), that leaves the campaign roughly $465 million off target.Still, the Clinton machine is dominating Republicans in fundraising, not just for the presidential candidate, but for everyone else involved.Clinton is serious about getting stuff done   she knows her policies will be  pie-in-the-sky  without support from Congress.",
      "So what does she do? She raises more money for other Democrats than she does for herself. Trump, on the other hand, hoards the money for himself while he s a billionaire.",
    ]
  },
  {
    "id": "C2",
    "cat": "C",
    "expect": [0, 30],
    "title": "Paul Ryan Was So Desperate To Pass Failed Trumpcare Bill That He Got On His Knees To Beg For Votes",
    "url": "https://conspiracy-daily.info/post/2",
    "paragraphs": [
      "This is what being pathetic looks like.House Speaker Paul Ryan was so desperate to secure Republican votes for his disastrous healthcare bill that he literally got down on his knees to beg one lawmaker for his support.As we all know, the floor vote was canceled on Thursday after it became clear that not enough Republicans were willing to support the bill.Donald Trump even met with and threatened Republicans with consequences if they didn t fall in line. But the meeting backfired as even more Republicans leaned against the bill after hearing Trump speak.The cancellation of Thursday s vote infuriated Trump, who proceeded to demand a vote on Friday and Republican leaders reluctantly caved.And so, Paul Ryan spent time fruitlessly begging his Republican colleagues to throw their support behind a bad bill that would have stripped healthcare from over 20 million Americans and caused the cost of healthcare premiums to skyrocket.One lawmaker Ryan approached was Alaska Rep.",
      "Don Young.According to the Washington Post, Ryan actually got down on one knee to beg Young to endorse the bill.Leaders continued to plead with individual lawmakers to support the measure well into Thursday night, with the House Rules Committee slated to meet early Friday morning to consider the proposed changes.Ryan got down on a knee to plead with Rep. Don Young, an 83-year-old from Alaska who is the longest-serving Republican in Congress and remains undecided.But Young ignored Ryan desperate plea and remained in opposition and even praised the cancellation of Friday s vote a  victory for Alaska.",
      "My job is to represent those people in that state, and I think we did this this week,  Young told Alaska Dispatch News. I work with (House Speaker Paul Ryan), don t get me wrong   the speaker talked to me quite a bit.",
      "But it didn t come to a point where I could support this bill. Yeah, he needed it so much that he begged for it on bended knee.",
    ]
  },
  {
    "id": "C3",
    "cat": "C",
    "expect": [0, 30],
    "title": "President Obama Makes Ellen Choke Up Discussing Her Role In LGBT Equality (VIDEO)",
    "url": "https://conspiracy-daily.info/post/3",
    "paragraphs": [
      "It has been a long and windy road for the LGBT community, one they are still traveling, to have true equality under the law. One of the people who really helped clear the path for so many individuals frightened to come out of the closet was Ellen DeGeneres (full disclosure: myself included).",
      "She was brave at a time when it wasn t yet okay to be brave. She was strong at a time when it was still dangerous for many LGBT individuals to live outside the closet.",
      "However, she came out, and not only was she able to be successful, but she is a powerhouse in the entertainment industry, an inspiration to those who needed to know it s okay to be who you are, and just an outright tremendous human being who has been thriving as her true self.So, as Ellen thanked President Obama on her show for all the amazing support he has shown for the gay community, and all the progress that s been made under his leadership, Obama, being the honest and humble man that he is, turned the conversation back to Ellen.He said: As much as we ve done with laws and ending Don t Ask Don t Tell, etc., changing hearts and minds, I don t think anyone has been more influential than you on that. That s true  You know, your courage and you re just really likable  You, being willing to claim who you were, that suddenly empowers other people, and suddenly it s your brother, your uncle, it s your best friend, it s your coworkers.",
      "Ellen, clearly touched by this moment of gratitude from the President of the United States, tries to return to center by joking,  I m not really gay,  which got a huge laugh from the crowd.However, the president is correct. Ellen s bravery opened the doors to people accepting gay individuals for who they are.",
      "She helped the nation and the world see that gay individuals are just like everybody else, and are in our communities, our churches, our circle of friends, and even our homes. And for myself, she made it okay to come out.",
      "She opened the door for so many people in that same regard. You deserve all the praise the president just gave you, and more.This episode of The Ellen Show was absolutely fantastic and not only showed this touching moment, but also a moment of pure hilarity when the president read aloud a love poem to the First Lady.Watch here to see the touching moment between President Obama and Ellen:Video/Featured image from EllenTube",
    ]
  },
  {
    "id": "C4",
    "cat": "C",
    "expect": [0, 30],
    "title": "NRA Board Member Ted Nugent Just Encouraged His Violent Fans To Shoot Hillary Clinton (VIDEO/SCREENSHOTS)",
    "url": "https://conspiracy-daily.info/post/4",
    "paragraphs": [
      "Stochastic terrorism is a term that means to use mass communications like Facebook to incite a seemingly random person to do violence against someone or something. For instance, leading up to Robert Dear s bloody assault on a Planned Parenthood facility, the Right   spurred on by David Daleiden s fraudulent and heavily-edited  baby parts  videos   conservatives regularly informed their mindless followers that the women s health organization kills babies and sells them in pieces for profit.",
      "All across the Right, including from presidential candidates, a single message resounded across the Stupid Part of America: someone somewhere needs to do something about this. Someone needs to be a hero.And someone stepped up.",
      "Robert Dear killed multiple people in his quest to unilaterally stop Planned Parenthood s evil acts. The system, for our frenemies on the Right, worked.In what can only be viewed as an attempt to incite violence against Clinton, Nugent posted a video to Facebook that depicts 2016 hopeful Bernie Sanders shooting Clinton during a debate.",
      "The photo was captioned,  I got your guncontrol right here bitch! The graphic video shows blood spouting from Clinton s chest after Sanders  shoots  her   a very pleasing sight for Nugent s immensely stupid and bloodthirsty followers. It is obvious through a perfunctory glance that these people would love to see Clinton dead.",
      "Sanders too, though many made it clear that he would  earn their vote  by actually shooting Clinton, even if he is a dirty Communist bastard (they don t know what Communist means). Obviously, no one has taken a shot at Clinton yet, but the more right-wing figures encourage such a thing, the higher the chance that someone, somewhere is going to take them up on their suggestion.After all, as Robert Lewis Dear demonstrated, it only takes one crazy person listening to the violent rhetoric who decides that he wants to make a difference.Ted Nugent once adopted a 17-year-old girl so he could have sex with her without difficulty, intentionally sh*t his pants to get out of going to war, and has made numerous racist remarks about Barack Obama and other notable African-American figures.",
      "This has no relevance to the situation at hand, but we thought it important to note whose opinion these people consider important.Watch the disgusting video below:Featured image via Getty Images/David Livingston (modified)",
    ]
  },
  {
    "id": "C5",
    "cat": "C",
    "expect": [0, 30],
    "title": "Government Ethics Office Systems Crash After Avalanche Of Complaints About Kellyanne Conway (TWEETS)",
    "url": "https://conspiracy-daily.info/post/5",
    "paragraphs": [
      "Kellyanne Conway s decision to provide Ivanka Trump s crappy products with a  free commercial  during an appearance on Fox News has already claimed its first casualty: pretty much every major system at the Office of Government Ethics.The Hill reports that the office s website was down for several hours Thursday following Conway s interesting and unethical mix of her boss s daughter s business interests and her own official capacity as propaganda minister. I own some of it,  Conway said of Ivanka s various overpriced products during an appearance on Fox News Thursday.",
      "I fully   I m going to give a free commercial here. The ethics office tweeted that website, phone system and email system are receiving an extraordinary volume of contacts from citizens about recent events.",
      "1/OGE s website, phone system and email system are receiving an extraordinary volume of contacts from citizens about recent events. OGE (@OfficeGovEthics) February 9, 20172/OGE works to prevent ethics violations.",
      "OGE does not have investigative or enforcement authority. OGE (@OfficeGovEthics) February 9, 20173/Congress, GAO, the FBI, Inspectors General, and the Office of Special Counsel have the authority to conduct investigations.",
      "OGE (@OfficeGovEthics) February 9, 20174/ When OGE learns of possible ethics violations, OGE contacts the agency, provides guidance & asks them to notify OGE of any action taken. OGE (@OfficeGovEthics) February 9, 20175/OGE is actively following this agency-contact process.",
      "OGE (@OfficeGovEthics) February 9, 2017The White House has taken an extraordinary interest in promoting Ivanka Trump s clothes and jewelry for some reason. Recently, the sitting President of the United States hate-tweeted a high-end retailer after they dropped his precious little girl s crappy products because they weren t selling.My daughter Ivanka has been treated so unfairly by @Nordstrom.",
      "She is a great person   always pushing me to do the right thing! Terrible!  Donald J. Trump (@realDonaldTrump) February 8, 2017 This is a direct attack on his policies and her name,  White House press secretary Sean Spicer said of the company s decision to drop a product line they deemed unworthy to be on the shelves.While Ivanka feigns surprise, Nordstrom says they informed her last month her products would be dropped.",
    ]
  },
  {
    "id": "C6",
    "cat": "C",
    "expect": [0, 30],
    "title": "Watch Lindsey Graham Accept Defeat Over Trump: ‘I Can’t Go Where He’s Taking The Country’ (VIDEO)",
    "url": "https://conspiracy-daily.info/post/6",
    "paragraphs": [
      "Lindsey Graham has been one of the biggest Republican voices against GOP nominee Donald Trump, and he only grew louder as Trump gained more support. The South Carolina senator has had a hard time of it, too   he has called on Trump to apologize for several offensive things he s said, then he supported Trump briefly before aggressively crusading to get the Republican party to un-endorse Trump, and then he revealed that he himself would not be endorsing the humiliating candidate.Graham has been a nervous wreck over having to watch Trump destroy his beloved GOP right before his very eyes.",
      "But earlier today, Graham seemed to have finally accepted defeat and the fact that the Republican party he has known and loved will never be the same again. In an interview with At This Hour s Kate Bolduan and John Berman on CNN, Graham sorrowfully said: I ve come to the point now where I can t go where he is taking the party or the country.",
      "Graham also expressed that he was worried about what Trump s intentions were for America, but showed a brilliant amount of ignorance as he expressed he was open to the idea that Trump might grow as a politician (not happening). And to prove what a mess Trump s campaign really is, Graham brought up a talking point of Trump s, only be told by the hosts that it was actually an idea that came from Mike Pence, Trump s VP pick.You can watch Graham accept his circumstances below, and you can tell that it s absolutely killing him.Sen.",
      "Lindsey Graham on Trump:  I can t go where he is taking the party  https://t.co/6OZtrfIwim https://t.co/FgCRZeO6Er  CNN Politics (@CNNPolitics) October 6, 2016 Graham seems absolutely destroyed by a GOP under Trump, but we all know that conservatives have created this nightmare for themselves. They created a hateful, bigotry-filled political climate that allowed someone like Trump to excel, and they failed to stop him.Featured image via Scott Olson / Getty Images",
    ]
  },
  {
    "id": "C7",
    "cat": "C",
    "expect": [0, 30],
    "title": "Hillary Clinton Is Officially The Democratic Nominee For President Of The United States",
    "url": "https://conspiracy-daily.info/post/7",
    "paragraphs": [
      "History has been made (once again) in the United States. Hillary Rodham Clinton after decades in public service, has been officially nominated as the first female candidate for President of the United States from a major political party.Sending Secretary Clinton over the 2,383 vote necessary was South Dakota, which awarded 15 delegates to Clinton and 10 to Senator Bernie Sanders, who delivered the acclamation that officially cemented Clinton s nomination.Clinton walked away with 2,838 to Sanders 1,843.",
      "Vermont, which had passed, allowed a final tribute to Sanders, before walking off the convention floor.Just 96 years ago, women (some of them) were given the right to vote. It wasn t until 1965 when ALL women were truly given the right to vote, freely and democratically.",
      "And today, July 26th 2016, a woman has been nominated to take on a rampant sexist and misogynist.Today is a day America should celebrate.To celebrate this truly historic day, the strongest, most successful women in American politics will speak, including Nancy Pelosi, the first female Speaker of the House, Cecile Richards of Planned Parenthood, Barbara Boxer (Senator from California) as well as a plethora of female Representatives such as Lois Frankel and Kathrine Clark, and feminist activist Lena Dunham.Clinton responded on Twitter with a moving tribute dedicated to little girls all across America:This moment is for every little girl who dreams big. #WeMadeHistoryhttps://t.co/DRAJuUUhOr  Hillary Clinton (@HillaryClinton) July 26, 2016Today women all across the country can rejoice in one thing: the highest, hardest glass ceiling has been smashed (sorry Sarah Palin, you didn t make it).Onward to November, where a strong, determined woman will take down a thin skinned, vile xenophobe.",
      "Trump has made it his mission to demean anyone (including women) who stand in his way.Hillary Clinton will knock him down, and the door will hit him on the way out.Featured image via Justin Sullivan/Getty Images",
    ]
  },
  {
    "id": "C8",
    "cat": "C",
    "expect": [0, 30],
    "title": "Christiane Amanpour Rips The Media A New One Over Coverage Of Hillary Clinton’s Pneumonia (VIDEO)",
    "url": "https://conspiracy-daily.info/post/8",
    "paragraphs": [
      "If you ve subjected yourself to cable news over the last few days, you ve probably noticed a non-stop barrage of coverage of the most  pressing issue  of the week. Hillary Clinton is *gasp* human, and she sometimes succumbs to germs.If anything, the fact that Hillary made an appearance at New York s 9/11 Memorial Service, despite the fact that she had pneumonia, is a testament to her stamina, not a sign of weakness, but the media has turned it into just another way Hillary is deceiving the public.This tactic might backfire on the media.",
      "Nearly every woman can relate to the idea of trying to forget they are sick, so they can get s**t done, whether that s**t includes taking care of a household or taking care of a country (or anything in between).CNN reporter Christiane Amanpour is pretty angry. Her network has been among the worst in the non-stop bullying of a woman recovering from a common illness.",
      "So, Amanpour took to the air to beg the media,  Can t a girl have a sick day or two? Finally tonight, imagine a world where you can t slow down, you absolutely cannot, can t get sick. This weekend after attending a 9/11 memorial in New York after more than a year of relentless campaigning, the Democratic presidential nominee, Hillary Clinton, fell ill and these pictures have boomeranged across the world.",
      "Several hours later the campaign revealed the former secretary of state had been diagnosed with pneumonia on Friday. But surely this can t be a case of a human being having an off day.",
      "Like so many things Hillary, the media are having a field day, off to the races with another debilitating case of indignant outrage. This must be another typical Clinton conspiracy to fool them with total transparency breakdown.",
      "Talk about a transparency breakdown what about Donald Trump s tax returns? Where are they? Can t a girl have a sick day or two? Don t get me started because when it comes to overqualified women having to try 100 times harder than underqualified men to get a break or even a level playing field, well we know that story. And then, to hammer home the double standard, Amanpour talked about the male presidents who have suffered from their various forms of frailty.",
      "And seriously now, the 14th president of the United States, Franklin Pierce rose to that role after earning the nickname Fainting Frank for twice collapsing in two battles in 1847,  she continued. Who could ever forget George Bush senior throwing up all over the Japanese prime minister and then fainting at a state dinner? And he oversaw the fall of the Soviet Union and won the first Gulf War.",
    ]
  },
  {
    "id": "C9",
    "cat": "C",
    "expect": [0, 30],
    "title": "UNBELIEVABLE: IL City Denies Re-zoning Request For Islamic Worship Center…That’s When Obama’s Radical DOJ Stepped In",
    "url": "https://conspiracy-daily.info/post/9",
    "paragraphs": [
      "Mums the word on Christian persecution in the White House. Just let them get a whiff of possible injustice against a Muslim in America and Obama s radicalized DOJ is on it, like a dog on a bone In its latest effort to protect Muslim rights in the United States the Obama Justice Department is suing an Illinois town for denying a rezoning application to convert an office building into an Islamic temple.",
      "Failing to approve plans for the Islamic worship center violates a 2000 law known as the Religious Land Use and Institutionalized Persons Act (RLUIPA), according to a Department of Justice (DOJ) lawsuit filed this week in federal court. The accused are lawmakers in Des Plaines, a Chicago suburb with a population of about 60,000.",
      "In 2013 the Des Plaines City Council voted 5-3 to reject a rezoning request made by the American Islamic Center (AIC) to make a vacant office building in a manufacturing zone to an institutional zone that would allow a worship center.The plan called for 3,661 square feet of worship space that would be used for prayer services on Fridays and Sundays as well as nightly prayers during the Islamic holy month of Ramadan when Muslims fast and commemorate the first revelation of the Quran to Muhammad. The new temple would also be used for youth group events and other gatherings, according the rezoning application.In nixing the plan, Des Plaines aldermen expressed concern about the loss of tax revenue since religious institutions are nonprofits that don t pay taxes.",
      "They also cited traffic and safety issues for voting against the project.In its lawsuit the DOJ dismisses those issues and claims that the city s  treatment and denial of AICs rezoning requests constitutes the imposition or implementation of a land use regulation that imposes a substantial burden on AICs religious exercise. Denying a city zoning change to accommodate a Muslim temple also discriminates against the Islamic group on the basis of religion, according to the feds.",
      "Attorney General Loretta Lynch wants the court to issue an order forcing Des Plaines to let AIC construct its worship center in the city. The ability to establish a place for collective worship is a fundamental protection of the First Amendment and our civil rights laws,  said Vanita Gupta, head of the DOJ s bloated civil rights division, in a statement announcing the lawsuit.",
      "The Justice Department will remain vigilant in its mission to ensure that all religious groups enjoy the right to practice their faiths freely. The federal prosecutor handling the case in Illinois said  the freedom to practice the religion of one s choosing is a precious right in our country  and the DOJ will continue to  enforce the laws that protect this important right.",
      "The DOJ s enthusiasm for protecting Muslim rights is in a class of its own, however. Back in 2010 Obama s first Attorney General, Eric Holder, personally reassured Muslims of DOJ protection during an address at a San Francisco-based organization (Muslim Advocates) that urges members not to cooperate in federal terrorism investigations.",
    ]
  },
  {
    "id": "C10",
    "cat": "C",
    "expect": [0, 30],
    "title": "BOMBSHELL REPORT: GOP Looks To Dump Trump, Secret 2020 Shadow Campaigns Already Underway",
    "url": "https://conspiracy-daily.info/post/10",
    "paragraphs": [
      "It s no secret that the Republican Party has never been comfortable with Donald Trump as the titular head of their organization. They also knew he was unfit to be president, yet they got him elected anyway, because they felt they had no choice.",
      "However, seven months into this disastrous excuse for a  presidency,  it seems that the GOP is coming to realize that Trump was a huge mistake. Therefore it should come as no surprise that there are already shadow campaigns from several high profile Republicans   including Trump s second-in-command, Mike Pence   underway for the 2020 presidential race.The New York Times reports that Mike Pence, Ben Sasse and John Kasich appear to be secretly lobbying GOP donors in order to unseat Trump should he last his full four-year term.",
      "Of course, the White House is pushing back against these reports. Spokeswoman Lindsay Walters said of these efforts: The president is as strong as he s ever been in Iowa, and every potentially ambitious Republican knows that.",
      "However, according the the New York Times, donors, elected officials throughout the Republican Party, and conservative groups are all saying that they don t even know if Trump will be able to run in 2020, and there is definitely support for a primary challenger to Trump. Of course, many of these people are not willing to publicly criticize a president from their own party, but others are.",
      "For instance, John McCain spoke for them, saying that many see Trump as weak.Of course, both Ben Sasse and John Kasich have been openly critical of Trump, which has helped both of their public profiles to rise. Further, it s pretty obvious that Pence took the job as the second man on the Trump ticket thinking that Trump would not last in the White House.",
      "Hell, Maxine Waters even came out and said that Pence is planning his inauguration.In short, the GOP s bigoted base stuck them   and the nation   with Trump. But, now that he hasn t been the controllable vehicle to sign their disastrous agenda into law like they thought he would be, they re ready to get rid of him   no matter the cost.Featured image via Chip Somodevilla/Getty Images",
    ]
  },
  {
    "id": "C11",
    "cat": "C",
    "expect": [0, 30],
    "title": "Gary Johnson Displays Stunning Foreign Policy Ignorance On ‘Morning Joe’ (VIDEO)",
    "url": "https://conspiracy-daily.info/post/11",
    "paragraphs": [
      "Libertarian presidential candidate Gary Johnson has been seen as an alternative to Donald Trump for many Republicans and other right-leaning types who can t stomach their own party s nominee and don t want to vote for Hillary Clinton. However, that prospect likely just went right out the window for many people after a Thursday morning question that revealed Johnson s ignorance when it comes to foreign policy.Johnson appeared on MSNBC s Morning Joe, and when asked about what he would do about Aleppo, he actually asked,  What is Aleppo? Veteran columnist and frequent Morning Joe panelist Mike Barnacle looked at Johnson with the rest of the panel, visibly stunned.",
      "Johnson said, with a blank stare,  No. In case anyone here is as clueless as Gary Johnson is on this matter, Aleppo is the largest city in Syria, and the heart of the refugee crisis.",
      "It s the source of all of those heartbreaking images of children of war that have been ripping all of our hearts out. It s where the battle for Syria is being waged.",
      "It s essentially the epicenter of the war that ISIS is waging. To have a person who wishes to be President of the United States and Commander-in-Chief of our military not know these basic facts is not only breathtaking in its ignorance, but also disqualifying.In other words, just like Donald Trump, Gary Johnson is far too ignorant of world affairs to be considered for the position he seeks.",
      "Out of the viable candidates for the White House, the only person who has the knowledge of world affairs and policy issues to actually be able to effectively do the job is Hillary Clinton. Whatever one might think of her as a person, or of her policy positions, she is qualified.",
      "No one else presented to us is.Watch the exchange with Johnson below:.@mikebarnicle: What would you do, if you were elected, about Aleppo? @GovGaryJohnson: And what is Aleppo? https://t.co/ZbqO5RAEsk  Morning Joe (@Morning_Joe) September 8, 2016Featured image via video screen capture",
    ]
  },
  {
    "id": "C12",
    "cat": "C",
    "expect": [0, 30],
    "title": "This 2016 Hannity Tweet Is Now Like A Knife In The Back For Trump",
    "url": "https://conspiracy-daily.info/post/12",
    "paragraphs": [
      "No one on earth has been a bigger cheerleader for Donald Trump than Fox News  Sean Hannity. In the wake of Monday s indictments of former Trump campaign manager Paul Manafort, Manafort s top aide Rick Gates and with a guilty plea of former economic advisor to Trump, George Papadopoulos, it appears the house of cards is beginning to collapse.Hannity, though, is ready with the pro-Trump propaganda.",
      "Immediately after the news of the indictment hit, Hannity was ready with his defense of Trump which means he s blaming Hillary:Not that there wasn t Russian collusion with a 2016 presidential candidate. It s just that her name was not Trump.",
      "We now have real evidence that the FBI uncovered a Russian plot dating back to 2009 that involved bribery, extortion, blackmail, money laundering and racketeering. It all came a year before Hillary Clinton and the Obama Administration approved the corrupt Uranium One deal.",
      "We have evidence of another Russia scandal, also involving a 2016 candidate not named Trump. We now know that the Clinton campaign and the Democratic National Committee paid over $9 million to help fund the discredited, Russia-linked dossier crafted to ruin then-candidate Donald Trump.",
      "This was nothing short of a collaborative effort with the Russians to manipulate the outcome of the last presidential election.Not surprisingly, Trump s statements are mirroring Hannity:Sorry, but this is years ago, before Paul Manafort was part of the Trump campaign. But why aren't Crooked Hillary & the Dems the focus?????  Donald J.",
      "Trump (@realDonaldTrump) October 30, 2017  Only, Manafort was part of the Trump campaign during many of these alleged crimes and Hannity knows it. In fact, in 2016, he tweeted it:While a Sean Hannity tweet certainly won t stand up in a court of law, Hannity has long been the media sycophant for the Trump administration.",
    ]
  },
  {
    "id": "C13",
    "cat": "C",
    "expect": [0, 30],
    "title": "Watch A 12-Year-Old ‘Scientist’ OBLITERATE Anti-Vaxxers’ Lies In 2 Minutes Flat (VIDEO)",
    "url": "https://conspiracy-daily.info/post/13",
    "paragraphs": [
      "A 12-year-old boy has just gone viral for absolutely shredding every anti-vaxxer s argument against vaccinating children.The boy, who goes by the name Marco Arturo, is a science-loving video blogger who uses his Facebook page to share his findings and ignite discussions related to science. His latest video was a major hit, and has left the young boy shocked that his 2-minute video has been seen by more people than the population of Bahamas, Belize, Greenland, Monaco, Bermuda and Dominica combined.",
      "His educational message to anti-vaxxers has been viewed millions of times, and when you watch it, you will understand why.Marco begins the video addressing two major concerns being proposed by anti-vaxxers: that vaccines are to blame for autism, and that they re part of a government conspiracy. Marco says: We ve all been lied to by doctors and pharmaceutical companies about vaccines.",
      "After a lot of research I realized that vaccines do and will cause autism. At first it sounds like Marco is taking their side, but if anti-vaxxers thought they d just found their youngest recruit, they re dead wrong.",
      "Seconds later, Marco holds up a folder labeled Evidence that vaccines cause autism, stating that he will explain his findings  page by page. By now, anti-vaxxers are probably salivating all over themselves, eager to hear the scientific proof that their ridiculous theories are correct.",
      "However, when Marco opens the folder, all of the pages are blank. Marco explains: I think it might be because there is absolutely no evidence to support the statement that vaccines are linked to autism in any way whatsoever.",
      "To make anti-vaxxers even more furious that they d been tricked so expertly, Marco stresses how important vaccines are, and what they re REALLY responsible for: saving the lives of millions of children. Marco closes by begging parents to get their children vaccinated, and reiterates that there is no evidence that can link vaccines to autism.In closing, Marco notices that one of the pages actually DOES have something on it, which might get gullible anti-vaxxers  hopes up once again.",
    ]
  },
  {
    "id": "C14",
    "cat": "C",
    "expect": [0, 30],
    "title": "Trump Mocked For Inventing Fake Civil War Battle On His Golf Course – There’s A Plaque And Everything (TWEETS)",
    "url": "https://conspiracy-daily.info/post/14",
    "paragraphs": [
      "Frederick Douglass and Andrew Jackson will be very disappointed in Donald Trump when they learn he fibbed a teensy bit about a Civil War battle he says happened on one of his golf courses. According to a plaque   yes, a plaque   Trump proudly displays at the  Trump National Golf Club in Virginia, the length of the Potomac River that borders his course is called the River of Blood because both Union and Southern soldiers died en masse between the 14th and 15th holes.",
      "The  FAILING  New York Times reported in 2015:Between the 14th hole and the 15th tee of one of the club s two courses, Mr. Trump installed a flagpole on a stone pedestal overlooking the Potomac, to which he affixed a plaque purportedly designating  The River of Blood.",
      "Many great American soldiers, both of the North and South, died at this spot,  the inscription reads. The casualties were so great that the water would turn red and thus became known as  The River of Blood.",
      "The inscription, beneath his family crest and above Mr. Trump s full name, concludes:  It is my great honor to have preserved this important section of the Potomac River! The site does have historical significance alongside the Bowling Green Massacre, in that its historical significance is completely made up.",
      "Nothing like that ever happened there,  said Richard Gillespie, executive director of the Mosby Heritage Area Association, said of Trump s claim. Gillespie added that the only thing  close to  that was the  Battle of Ball s Bluff in 1861 in which several hundred Union solders were killed.",
      "It happened 11 miles upriver, nowhere near the  River of Blood. Called on his lie, Trump attempted to salvage his story by explaining: That was a prime site for river crossings.",
      "So, if people are crossing the river, and you happen to be in a civil war, I would say that people were shot   a lot of them. Historians say that literally no one has ever died in that crossing, but Trump complains that someone might have died at some point.",
    ]
  },
  {
    "id": "C15",
    "cat": "C",
    "expect": [0, 30],
    "title": "WATCH: John McCain Twice Claims President Obama Is ‘Directly Responsible’ For Orlando Attack",
    "url": "https://conspiracy-daily.info/post/15",
    "paragraphs": [
      "Senator John McCain is in damage control mode after he openly accused President Obama of being  directly responsible  for the mass shooting in Orlando, thus going even further than Donald Trump s attacks of the president.In the wake of the attack that left 50 people dead and 53 wounded, Trump responded by suggesting that President Obama is somehow helping ISIS carry out their attacks on our shores. He doesn t get it or he gets it better than anybody understands.",
      "We re led by a man who is a very   look, we re led by a man that either is, is not tough, not smart, or he s got something else in mind. And the something else in mind, you know, people can t believe it.",
      "People cannot   they cannot believe that President Obama is acting the ways he acts and can t even mention the words radical Islamic terrorism. But McCain, who is facing one of the toughest re-election campaigns of his political career, went even further than that.",
      "Barack Obama is directly responsible for it, because when he pulled everybody out of Iraq, al-Qaeda went to Syria, became ISIS, and ISIS is what it is today thanks to Barack Obama s failures,  McCain said.After being given a chance to clarify his remarks, McCain repeated his claim. He pulled everybody out of Iraq, and I predicted at the time that ISIS would go unchecked, and there would be attacks on the United States of America.",
      "It s a matter of record, so he is directly responsible. Here s the audio via the Washington Post.Of course, Trump s campaign manager quickly tweeted what McCain said, most likely thinking they had found an ally for their own attacks against President Obama.John McCain: Obama is  directly responsible  for Orlando attack   The Washington Post https://t.co/hjh5ry2r3B  Corey Lewandowski (@CLewandowski_) June 16, 2016There are many problems with McCain s claims.",
      "First of all, the shooter is the one who is  directly responsible  for the mass killing. Second, President Obama followed the order signed by President George W.",
    ]
  },
];

let currentArticles = ARTICLES;
let currentDataset = 1;

function switchDataset(num) {
  currentDataset = num;
  currentArticles = (num === 2 && typeof COURSEWORK_ARTICLES !== 'undefined') ? COURSEWORK_ARTICLES : ARTICLES;
  document.getElementById('dsBtn1').classList.toggle('active', num === 1);
  document.getElementById('dsBtn2').classList.toggle('active', num === 2);
  testResults = [];
  document.getElementById('summarySection').style.display = 'none';
  document.getElementById('progressWrap').style.display = 'none';
  renderArticles();
}

function renderArticles() {
  const c = document.getElementById('testArticlesContainer');
  const cats = {
    A: { label: "Quality Journalism (Reuters)", desc: "Expected: 60–100" },
    B: { label: "Biased / Low Quality", desc: "Expected: 25–60" },
    C: { label: "Manipulative / Fake", desc: "Expected: 0–30" },
  };
  let html = '', curCat = '';
  for (const a of currentArticles) {
    if (a.cat !== curCat) {
      curCat = a.cat;
      const ci = cats[curCat];
      html += '<div class="cat-header"><span class="cat-badge" style="background:var(--' + (curCat === 'A' ? 'green' : curCat === 'B' ? 'yellow' : 'red') + ')">' + curCat + '</span><h3>' + ci.label + '</h3><span class="cat-desc">' + ci.desc + '</span></div>';
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

document.getElementById('runAllBtn').addEventListener('click', runAllTests);
document.getElementById('exportBtn').addEventListener('click', exportCSV);
document.getElementById('dsBtn1').addEventListener('click', () => switchDataset(1));
document.getElementById('dsBtn2').addEventListener('click', () => switchDataset(2));

let testResults = [];
let stopTestingFlag = false;

async function runAllTests() {
  stopTestingFlag = false;
  const btn = document.getElementById('runAllBtn');
  btn.disabled = true;
  btn.innerHTML = '⏳ Running... <span id="stopBtn" style="margin-left:10px; cursor:pointer; text-decoration:underline; color:#ff4d4d;">[Stop]</span>';
  
  const stopBtn = document.getElementById('stopBtn');
  stopBtn.onclick = (e) => {
    e.stopPropagation();
    stopTestingFlag = true;
    btn.textContent = '🛑 Stopping...';
  };

  testResults = [];

  document.getElementById('progressWrap').style.display = 'block';
  document.getElementById('summarySection').style.display = 'none';

  currentArticles.forEach(a => {
    const row = document.getElementById('row-' + a.id);
    if (row) {
      row.className = 'test-article';
      document.getElementById('res-' + a.id).innerHTML = '<span class="ta-status" style="color:var(--text-sec)">Waiting...</span>';
    }
  });

  for (let i = 0; i < currentArticles.length; i++) {
    const a = currentArticles[i];
    const row = document.getElementById('row-' + a.id);
    const resEl = document.getElementById('res-' + a.id);
    
    if (row) {
      row.className = 'test-article running';
      row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (resEl) resEl.innerHTML = '<span class="ta-status color-yellow">Analyzing...</span>';

    document.getElementById('progressFill').style.width = ((i) / currentArticles.length * 100) + '%';
    document.getElementById('progressText').textContent = (i + 1) + ' / ' + currentArticles.length + ' — ' + a.id;

    const paragraphs = a.paragraphs.map((p, idx) => ({ id: idx + 1, text: p }));
    const html_content = a.paragraphs.map(p => '<p>' + p + '</p>').join('');
    const payload = { url: a.url, title: a.title, html_content: html_content, paragraphs: paragraphs, language: 'en' };

    let success = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!success && attempts < maxAttempts) {
      const start = performance.now();
      try {
        attempts++;
        const resp = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const elapsed = ((performance.now() - start) / 1000).toFixed(1);

        if (resp.status === 503 || resp.status === 429) {
          const waitTime = resp.status === 429 ? 120 : 20;
          resEl.innerHTML = `<span class="ta-status color-yellow">Quota hit. Waiting ${waitTime}s...</span>`;
          await new Promise(r => setTimeout(r, waitTime * 1000));
          continue;
        }

        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const data = await resp.json();
        
        // ПЕРЕВІРКА НА ЗАГЛУШКУ (FALLBACK)
        // Якщо бекенд не зміг згенерувати результат через ліміти, він повертає 50/50/50
        const isFallback = data.trust_score === 50 && data.criteria.credibility === 50 && (data.explainer || '').includes('Помилка');
        
        if (isFallback) {
          resEl.innerHTML = `<span class="ta-status color-yellow">AI Limit (Fallback). Waiting 90s...</span>`;
          await new Promise(r => setTimeout(r, 90000)); // Чекаємо 1.5 хвилини
          continue; 
        }

        const score = data.trust_score;
        const lo = a.expect[0], hi = a.expect[1];
        const pass = score >= lo && score <= hi;

        if (row) row.className = 'test-article ' + (pass ? 'passed' : 'failed');
        const scoreColor = score >= 70 ? 'green' : score >= 40 ? 'yellow' : 'red';
        if (resEl) {
          resEl.innerHTML =
            '<div class="ta-score color-' + scoreColor + '">' + score + '</div>' +
            '<div class="ta-time">' + elapsed + 's · ' + (pass ? '✅' : '❌') + '</div>';
        }

        testResults.push({
          id: a.id, cat: a.cat, title: a.title, score: score, expected: lo + '-' + hi,
          pass: pass, elapsed: elapsed,
          acc: data.criteria.credibility,
          auth: data.criteria.transparency,
          obj: data.criteria.objectivity,
          highlights: (data.highlights || []).length,
          full_response: data
        });

        renderDetailPanel(a.id, data);
        success = true;

      } catch(e) {
        if (attempts >= maxAttempts || stopTestingFlag) {
          if (row) row.className = 'test-article failed';
          if (resEl) resEl.innerHTML = '<span class="ta-status color-red">Error</span><div class="ta-time">' + e.message.substring(0,20) + '</div>';
          testResults.push({ id: a.id, cat: a.cat, status: 'exception', error: e.message });
          success = true;
        } else {
          if (resEl) resEl.innerHTML = `<span class="ta-status color-yellow">Retry in 30s...</span>`;
          await new Promise(r => setTimeout(r, 30000));
        }
      }
    }
    
    if (stopTestingFlag) break;
    
    // ВЕЛИКА ПАУЗА МІЖ СТАТТЯМИ (60 секунд)
    if (i < currentArticles.length - 1) {
      const wait = 60; 
      resEl.innerHTML += `<div style="font-size:10px; color:var(--text-sec)">Next in ${wait}s...</div>`;
      await new Promise(r => setTimeout(r, wait * 1000));
    }
  }

  document.getElementById('progressFill').style.width = '100%';
  document.getElementById('progressText').textContent = 'Done — ' + currentArticles.length + ' / ' + currentArticles.length;
  btn.disabled = false;
  btn.textContent = t('run_all_tests');

  showSummary();
}

function renderDetailPanel(id, data) {
  const dEl = document.getElementById('detail-' + id);
  if (!dEl) return;
  
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
    csv += r.id + ',' + r.cat + ',"' + r.title + '",' + r.score + ',' + r.expected + ',' + (r.pass ? 'YES' : 'NO') + ',' + r.elapsed + ',' + r.acc + ',' + r.auth + ',' + r.obj + ',' + r.highlights + '\n';
  }
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'veritas_test_' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
}


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

  const rawParagraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
  const paragraphs = rawParagraphs.map((p, idx) => ({ id: idx + 1, text: p }));
  const html_content = rawParagraphs.map(p => '<p>' + p + '</p>').join('');

  const payload = {
    url: url,
    title: title,
    html_content: html_content,
    paragraphs: paragraphs,
    language: ptCurrentLanguage
  };

  if (refs) {
    const refLinks = refs.split('\n').map(r => r.trim()).filter(r => r.length > 0);
    if (refLinks.length > 0) {
      payload.html_content += '\n<div class="references">' + refLinks.map(r => `<a href="${r}">${r}</a>`).join('<br>') + '</div>';
    }
  }

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

    loadingEl.style.display = 'none';

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

  document.getElementById('writeStatParas').textContent = paragraphs.length;
  document.getElementById('writeStatWords').textContent = fullText.trim().split(/\s+/).filter(w => w).length.toLocaleString();
  document.getElementById('writeStatChars').textContent = fullText.length.toLocaleString();
  statsEl.style.display = 'flex';

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

  renderAnalysisSidebar(analysisResult, actualHighlights, 'write', previewEl);

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

  resultsEl.classList.add('visible');

  formEl.style.display = 'block';
  btn.disabled = false;
}