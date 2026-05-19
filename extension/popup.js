


const el = {
    analyzeBtn: document.getElementById('analyzeBtn'),
    reanalyzeBtn: document.getElementById('reanalyzeBtn'),
    retryBtn: document.getElementById('retryBtn'),
    toggleDetails: document.getElementById('toggleDetails'),
    resetBtn: document.getElementById('resetBtn'), // New hard reset button
    settingsBtn: document.getElementById('settingsBtn'),
    backToAnalysisBtn: document.getElementById('backToAnalysisBtn'),
    languageSelect: document.getElementById('languageSelect'),
    highlightsToggle: document.getElementById('highlightsToggle'),
    
    stateInitial: document.getElementById('stateInitial'),
    stateAnalyzing: document.getElementById('stateAnalyzing'),
    stateResults: document.getElementById('stateResults'),
    stateError: document.getElementById('stateError'),
    stateSettings: document.getElementById('stateSettings'),

    statusText: document.getElementById('statusText'),
    dot1: document.getElementById('dot1'),
    dot2: document.getElementById('dot2'),
    dot3: document.getElementById('dot3'),

    heroScore: document.getElementById('heroScore'),
    heroScoreWrapper: document.getElementById('heroScoreWrapper'),
    scoreValue: document.getElementById('scoreValue'),
    scoreRingFill: document.getElementById('scoreRingFill'),
    detailsPanel: document.getElementById('detailsPanel'),
    radarChartContainer: document.getElementById('radarChartContainer'),
    metricAccuracy: document.getElementById('metricAccuracy'),
    metricSource: document.getElementById('metricSource'),
    metricObjectivity: document.getElementById('metricObjectivity'),
    explainerText: document.getElementById('explainerText'),

    highlightNavigator: document.getElementById('highlightNavigator'),
    badgeWarnings: document.getElementById('badgeWarnings'),
    badgeRisks: document.getElementById('badgeRisks'),
    warningCount: document.getElementById('warningCount'),
    riskCount: document.getElementById('riskCount'),
    navControls: document.getElementById('navControls'),
    prevHighlight: document.getElementById('prevHighlight'),
    nextHighlight: document.getElementById('nextHighlight'),
    navPosition: document.getElementById('navPosition'),

    errorText: document.getElementById('errorText'),

    connectionDot: document.getElementById('connectionDot'),
    connectionText: document.getElementById('connectionText')
};

let currentTabId = null;
let currentTabUrl = null;
let pollInterval = null;
let currentHighlights = [];
let currentHighlightIndex = 0;

let loadingStatusTimer = null;
let loadingStatusIndex = 0;


const translations = {
    "uk": {
        "tagline": "Аналізатор Достовірності Новин",
        "analyze_article": "Аналізувати Цю Статтю",
        "hint_click": "Натисніть, щоб оцінити достовірність",
        "extracting_content": "Витягуємо контент...",
        "cancel": "Скасувати",
        "trust_score": "Рейтинг Довіри",
        "view_breakdown": "Показати деталі",
        "hide_details": "Приховати деталі",
        "found_issues": "Знайдені Проблеми",
        "warnings": "Попередження",
        "high_risk": "Ризики",
        "credibility": "Достовірність",
        "transparency": "Прозорість",
        "objectivity": "Об'єктивність Подачі",
        "analyze_again": "Аналізувати Знову",
        "try_again": "Спробувати Знову",
        "checking": "Перевірка...",
        "settings_title": "Налаштування",
        "language_label": "Мова Додатку",
        "highlights_label": "Підсвічування Статей",
        "back_to_analysis": "Повернутись до Аналізу"
    },
    "en": {
        "tagline": "News Credibility Analyzer",
        "analyze_article": "Analyze This Article",
        "hint_click": "Click to assess article credibility",
        "extracting_content": "Extracting content...",
        "cancel": "Cancel",
        "trust_score": "Trust Score",
        "view_breakdown": "View Detailed Breakdown",
        "hide_details": "Hide Details",
        "found_issues": "Found Issues",
        "warnings": "Warnings",
        "high_risk": "High Risk",
        "credibility": "Credibility",
        "transparency": "Transparency",
        "objectivity": "Objectivity",
        "analyze_again": "Analyze Again",
        "try_again": "Try Again",
        "checking": "Checking...",
        "settings_title": "Settings",
        "language_label": "App Language",
        "highlights_label": "Article Highlights",
        "back_to_analysis": "Back to Analysis"
    }
};

let currentLanguage = 'uk'; // Default


const loadingMessages = {
    "uk": [
        "Аналіз структури документа...",
        "Виявлення іменованих сутностей...",
        "Перехресна верифікація тез...",
        "Аналіз логічної послідовності...",
        "Синтез Veritas Trust Score..."
    ],
    "en": [
        "Parsing document structure...",
        "Extracting named entities...",
        "Cross-verifying extracted claims...",
        "Analyzing logical consistency...",
        "Synthesizing Veritas Trust Score..."
    ]
};

function startLoadingStatusCycle() {
    stopLoadingStatusCycle();
    loadingStatusIndex = 0;

    const messages = loadingMessages[currentLanguage] || loadingMessages["en"];
    setStatusTextAnimated(messages[0]);

    loadingStatusTimer = setInterval(() => {
        loadingStatusIndex = (loadingStatusIndex + 1) % messages.length;
        setStatusTextAnimated(messages[loadingStatusIndex]);
    }, 1800);
}

function stopLoadingStatusCycle() {
    if (loadingStatusTimer) {
        clearInterval(loadingStatusTimer);
        loadingStatusTimer = null;
    }
}


function setStatusTextAnimated(text) {
    if (!el.statusText) return;
    el.statusText.classList.add('fade-out');
    setTimeout(() => {
        el.statusText.textContent = text;
        el.statusText.classList.remove('fade-out');
    }, 300);
}



const RING_CIRCUMFERENCE = 2 * Math.PI * 62; // ≈ 389.56


function animateScoreRing(targetScore, duration = 1500) {
    const ringFill = el.scoreRingFill;
    const scoreDisplay = el.scoreValue;
    if (!ringFill || !scoreDisplay) return;

    const colorClass = getScoreClass(targetScore);
    ringFill.classList.remove('score-high', 'score-mid', 'score-low');
    ringFill.classList.add(colorClass);

    el.heroScore?.classList.remove('score-high', 'score-mid', 'score-low');
    el.heroScore?.classList.add(colorClass);

    const startTime = performance.now();
    const fraction = Math.max(0, Math.min(targetScore, 100)) / 100;
    const targetOffset = RING_CIRCUMFERENCE * (1 - fraction);

    function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const ease = 1 - Math.pow(1 - progress, 3);

        const currentOffset = RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE - targetOffset) * ease;
        ringFill.setAttribute('stroke-dashoffset', currentOffset.toFixed(2));

        const currentValue = Math.round(targetScore * ease);
        scoreDisplay.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            ringFill.setAttribute('stroke-dashoffset', targetOffset.toFixed(2));
            scoreDisplay.textContent = Math.round(targetScore);
        }
    }

    ringFill.setAttribute('stroke-dashoffset', RING_CIRCUMFERENCE.toFixed(2));
    scoreDisplay.textContent = '0';

    requestAnimationFrame(tick);
}




function drawRadarChart(scores) {
    const container = el.radarChartContainer;
    if (!container) return;

    container.innerHTML = '';

    const size = 210;
    const cx = size / 2;
    const cy = size / 2;
    const maxRadius = 80; // max radius for the outermost ring
    const labels = ['Accuracy', 'Authority', 'Objectivity'];
    const values = [
        Math.max(0, Math.min(scores.accuracy || 0, 100)),
        Math.max(0, Math.min(scores.authority || 0, 100)),
        Math.max(0, Math.min(scores.objectivity || 0, 100))
    ];

    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.setAttribute('width', '200');
    svg.setAttribute('height', '200');
    svg.style.display = 'block';

    const style = getComputedStyle(document.documentElement);
    const borderAccent = style.getPropertyValue('--border-accent').trim() || '#8D6E63';
    const textSecondary = style.getPropertyValue('--text-secondary').trim() || '#795548';
    const textPrimary = style.getPropertyValue('--text-primary').trim() || '#3E2723';

    const avgScore = values.reduce((a, b) => a + b, 0) / values.length;
    let fillColor, strokeColor;
    if (avgScore >= 70) {
        fillColor = style.getPropertyValue('--score-high').trim() || '#33691E';
        strokeColor = fillColor;
    } else if (avgScore >= 40) {
        fillColor = style.getPropertyValue('--score-mid').trim() || '#C58940';
        strokeColor = fillColor;
    } else {
        fillColor = style.getPropertyValue('--score-low').trim() || '#8D2D24';
        strokeColor = fillColor;
    }

    
    function getPoint(index, radius) {
        const angle = (2 * Math.PI * index) / 3 - Math.PI / 2;
        return {
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle)
        };
    }

    
    function polygonPoints(radius) {
        return Array.from({ length: 3 }, (_, i) => {
            const p = getPoint(i, radius);
            return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
        }).join(' ');
    }

    const rings = [0.25, 0.5, 0.75, 1.0];
    rings.forEach(frac => {
        const polygon = document.createElementNS(ns, 'polygon');
        polygon.setAttribute('points', polygonPoints(maxRadius * frac));
        polygon.setAttribute('fill', 'none');
        polygon.setAttribute('stroke', borderAccent);
        polygon.setAttribute('stroke-opacity', '0.2');
        polygon.setAttribute('stroke-width', '1');
        svg.appendChild(polygon);
    });

    for (let i = 0; i < 3; i++) {
        const p = getPoint(i, maxRadius);
        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', cx);
        line.setAttribute('y1', cy);
        line.setAttribute('x2', p.x.toFixed(2));
        line.setAttribute('y2', p.y.toFixed(2));
        line.setAttribute('stroke', borderAccent);
        line.setAttribute('stroke-opacity', '0.2');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
    }

    const dataPoints = values.map((v, i) => {
        const r = (v / 100) * maxRadius;
        const p = getPoint(i, r);
        return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
    }).join(' ');

    const dataPolygon = document.createElementNS(ns, 'polygon');
    dataPolygon.setAttribute('points', dataPoints);
    dataPolygon.setAttribute('fill', fillColor);
    dataPolygon.setAttribute('fill-opacity', '0.15');
    dataPolygon.setAttribute('stroke', strokeColor);
    dataPolygon.setAttribute('stroke-width', '2');
    dataPolygon.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(dataPolygon);

    values.forEach((v, i) => {
        const r = (v / 100) * maxRadius;
        const p = getPoint(i, r);
        const circle = document.createElementNS(ns, 'circle');
        circle.setAttribute('cx', p.x.toFixed(2));
        circle.setAttribute('cy', p.y.toFixed(2));
        circle.setAttribute('r', '3');
        circle.setAttribute('fill', strokeColor);
        svg.appendChild(circle);
    });

    const labelOffsets = [
        { dx: 0, dy: -12 },    // top
        { dx: 14, dy: 14 },    // bottom-right
        { dx: -14, dy: 14 }    // bottom-left
    ];
    const labelAnchors = ['middle', 'start', 'end'];

    labels.forEach((label, i) => {
        const p = getPoint(i, maxRadius);
        const text = document.createElementNS(ns, 'text');
        text.setAttribute('x', (p.x + labelOffsets[i].dx).toFixed(2));
        text.setAttribute('y', (p.y + labelOffsets[i].dy).toFixed(2));
        text.setAttribute('text-anchor', labelAnchors[i]);
        text.setAttribute('font-family', 'Manrope, sans-serif');
        text.setAttribute('font-size', '9');
        text.setAttribute('font-weight', '600');
        text.setAttribute('fill', textSecondary);
        text.textContent = label;

        const valText = document.createElementNS(ns, 'text');
        valText.setAttribute('x', (p.x + labelOffsets[i].dx).toFixed(2));
        valText.setAttribute('y', (p.y + labelOffsets[i].dy + 10).toFixed(2));
        valText.setAttribute('text-anchor', labelAnchors[i]);
        valText.setAttribute('font-family', 'Manrope, sans-serif');
        valText.setAttribute('font-size', '8');
        valText.setAttribute('font-weight', '400');
        valText.setAttribute('fill', textSecondary);
        valText.setAttribute('opacity', '0.7');
        valText.textContent = Math.round(values[i]);

        svg.appendChild(text);
        svg.appendChild(valText);
    });

    container.appendChild(svg);
}



async function init() {
    console.log('[VERITAS Popup] Initializing...');

    const storage = await chrome.storage.local.get(['appLanguage', 'highlightsEnabled']);
    if (storage.appLanguage) {
        currentLanguage = storage.appLanguage;
        if (el.languageSelect) el.languageSelect.value = currentLanguage;
    }
    if (el.highlightsToggle) {
        el.highlightsToggle.checked = storage.highlightsEnabled !== false;
    }
    applyTranslations();

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
        currentTabId = tab.id;
        currentTabUrl = tab.url;
    }

    el.analyzeBtn?.addEventListener('click', startAnalysis);
    el.reanalyzeBtn?.addEventListener('click', startAnalysis);
    el.retryBtn?.addEventListener('click', startAnalysis);
    el.toggleDetails?.addEventListener('click', toggleDetailsPanel);
    el.resetBtn?.addEventListener('click', forceResetState);
    
    el.settingsBtn?.addEventListener('click', () => showState('settings'));
    el.backToAnalysisBtn?.addEventListener('click', () => {
        window.location.reload(); 
    });
    el.languageSelect?.addEventListener('change', async (e) => {
        currentLanguage = e.target.value;
        await chrome.storage.local.set({ appLanguage: currentLanguage });
        applyTranslations();
    });

    el.highlightsToggle?.addEventListener('change', async (e) => {
        const enabled = e.target.checked;
        await chrome.storage.local.set({ highlightsEnabled: enabled });
        if (currentTabId) {
            try {
                await chrome.tabs.sendMessage(currentTabId, {
                    action: 'toggleHighlights',
                    enabled: enabled
                });
            } catch (err) {
                console.log('[VERITAS Popup] Could not toggle highlights:', err.message);
            }
        }
    });
    
    document.getElementById('viewParsedTextBtn')?.addEventListener('click', () => {
        const encodedUrl = encodeURIComponent(currentTabUrl || '');
        chrome.tabs.create({ url: `parsed_text.html?tabId=${currentTabId}&articleUrl=${encodedUrl}` });
    });

    el.badgeWarnings?.addEventListener('click', () => jumpToHighlight('warning'));
    el.badgeRisks?.addEventListener('click', () => jumpToHighlight('risk'));
    el.prevHighlight?.addEventListener('click', () => navigateHighlight(-1));
    el.nextHighlight?.addEventListener('click', () => navigateHighlight(1));

    checkConnection();

    const cached = await getCachedResult();
    if (cached) {
        console.log('[VERITAS Popup] Found cached result');
        showResults(cached);
        return;
    }

    const state = await getAnalysisState();

    if (state?.url && currentTabUrl && state.url !== currentTabUrl) {
        console.log('[VERITAS Popup] State URL mismatch, clearing stale state');
        await forceResetState();
        return;
    }

    if (state?.status === 'analyzing') {
        console.log('[VERITAS Popup] Analysis in progress, showing loading');
        showState('analyzing');
        updateProgress(state.step, state.message);
        startPolling();
        return;
    }

    if (state?.status === 'complete' && state.result) {
        console.log('[VERITAS Popup] Found complete result in state');
        showResults(state.result);
        return;
    }

    showState('initial');
}

async function forceResetState() {
    console.log('[VERITAS Popup] Force resetting state...');
    if (currentTabId) {
        await chrome.runtime.sendMessage({ action: 'CLEAR_STATE', tabId: currentTabId });
    }
    stopPolling();
    stopLoadingStatusCycle();
    showState('initial');
}


function applyTranslations() {
    const dict = translations[currentLanguage] || translations["uk"];
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (dict[key]) {
            element.textContent = dict[key];
        }
    });

    if (el.toggleDetails) {
        const isHidden = el.detailsPanel?.classList.contains('hidden');
        el.toggleDetails.textContent = isHidden ? dict["view_breakdown"] : dict["hide_details"];
    }
}


function showState(stateName) {
    el.stateInitial?.classList.add('hidden');
    el.stateAnalyzing?.classList.add('hidden');
    el.stateResults?.classList.add('hidden');
    el.stateError?.classList.add('hidden');
    el.stateSettings?.classList.add('hidden');

    switch (stateName) {
        case 'initial':
            el.stateInitial?.classList.remove('hidden');
            stopLoadingStatusCycle();
            break;
        case 'analyzing':
            el.stateAnalyzing?.classList.remove('hidden');
            startLoadingStatusCycle();
            break;
        case 'results':
            el.stateResults?.classList.remove('hidden');
            stopLoadingStatusCycle();
            break;
        case 'error':
            el.stateError?.classList.remove('hidden');
            stopLoadingStatusCycle();
            break;
        case 'settings':
            el.stateSettings?.classList.remove('hidden');
            stopLoadingStatusCycle();
            break;
    }
}

function updateProgress(step, message) {
    el.dot1?.classList.toggle('active', step >= 1);
    el.dot1?.classList.toggle('done', step > 1);
    el.dot2?.classList.toggle('active', step >= 2);
    el.dot2?.classList.toggle('done', step > 2);
    el.dot3?.classList.toggle('active', step >= 3);
}



async function getCachedResult() {
    if (!currentTabUrl) return null;

    return new Promise(resolve => {
        chrome.runtime.sendMessage(
            { action: 'GET_CACHED', url: currentTabUrl },
            response => resolve(response?.result || null)
        );
    });
}

async function getAnalysisState() {
    if (!currentTabId) return null;

    return new Promise(resolve => {
        chrome.runtime.sendMessage(
            { action: 'GET_STATE', tabId: currentTabId },
            response => resolve(response?.state || null)
        );
    });
}

async function startAnalysis() {
    if (!currentTabId || !currentTabUrl) {
        showError('No active tab found');
        return;
    }

    console.log('[VERITAS Popup] Starting analysis...');
    showState('analyzing');
    updateProgress(1, 'Extracting content...');

    await chrome.runtime.sendMessage({ action: 'CLEAR_STATE', tabId: currentTabId });

    chrome.runtime.sendMessage({
        action: 'START_ANALYSIS',
        tabId: currentTabId,
        tabUrl: currentTabUrl
    });

    startPolling();
}

function startPolling() {
    if (pollInterval) clearInterval(pollInterval);

    pollInterval = setInterval(async () => {
        const state = await getAnalysisState();

        if (!state) return;

        if (state.status === 'analyzing') {
            updateProgress(state.step, state.message);
        } else if (state.status === 'complete') {
            stopPolling();
            showResults(state.result);
        } else if (state.status === 'error') {
            stopPolling();
            showError(state.message);
        }
    }, 500);
}

function stopPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
}



function showResults(result) {
    showState('results');

    const score = result.trust_score;

    el.heroScore?.classList.remove('score-high', 'score-mid', 'score-low');
    el.heroScore?.classList.add(getScoreClass(score));

    animateScoreRing(score);

    const c = result.criteria || {};
    setMetric(el.metricAccuracy, c.credibility);
    setMetric(el.metricSource, c.transparency);
    setMetric(el.metricObjectivity, c.objectivity);

    drawRadarChart({
        accuracy: c.credibility || 0,
        authority: c.transparency || 0,
        objectivity: c.objectivity || 0
    });

    if (el.explainerText && result.explainer) {
        el.explainerText.textContent = result.explainer;
    }

    const highlights = result.highlights || [];
    currentHighlights = highlights;
    currentHighlightIndex = 0;
    updateHighlightNavigator(highlights);

    el.detailsPanel?.classList.add('hidden');
    const dict = translations[currentLanguage] || translations["uk"];
    if (el.toggleDetails) el.toggleDetails.textContent = dict["view_breakdown"];
}

function setMetric(element, value) {
    if (!element || value === undefined) return;
    element.textContent = value.toFixed(0);
    element.classList.remove('score-high', 'score-mid', 'score-low');
    element.classList.add(getScoreClass(value));
}

function getScoreClass(score) {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-mid';
    return 'score-low';
}

function toggleDetailsPanel() {
    const isHidden = el.detailsPanel?.classList.toggle('hidden');
    const dict = translations[currentLanguage] || translations["uk"];
    if (el.toggleDetails) {
        el.toggleDetails.textContent = isHidden ? dict["view_breakdown"] : dict["hide_details"];
    }
}

function showError(message) {
    showState('error');
    if (el.errorText) el.errorText.textContent = message || 'An error occurred';
    stopPolling();
}



function updateHighlightNavigator(highlights) {
    if (!highlights || highlights.length === 0) {
        el.highlightNavigator?.classList.add('hidden');
        return;
    }

    const warnings = highlights.filter(h => h.severity === 'warning').length;
    const risks = highlights.filter(h => h.severity === 'risk').length;

    if (el.warningCount) el.warningCount.textContent = warnings;
    if (el.badgeWarnings) el.badgeWarnings.style.display = warnings > 0 ? '' : 'none';
    if (el.riskCount) el.riskCount.textContent = risks;
    if (el.badgeRisks) el.badgeRisks.style.display = risks > 0 ? '' : 'none';

    if (warnings === 0 && risks === 0) {
        el.highlightNavigator?.classList.add('hidden');
    } else {
        el.highlightNavigator?.classList.remove('hidden');
    }
    el.navControls?.classList.add('hidden');
}

function jumpToHighlight(severity) {
    const filtered = currentHighlights.filter(h => h.severity === severity);
    if (filtered.length === 0) return;

    const targetHighlight = filtered[0];
    currentHighlightIndex = currentHighlights.indexOf(targetHighlight);

    scrollToHighlightInPage(currentHighlightIndex);
    showNavControls();
}

function navigateHighlight(direction) {
    if (currentHighlights.length === 0) return;

    currentHighlightIndex += direction;
    if (currentHighlightIndex < 0) currentHighlightIndex = currentHighlights.length - 1;
    if (currentHighlightIndex >= currentHighlights.length) currentHighlightIndex = 0;

    scrollToHighlightInPage(currentHighlightIndex);
    updateNavPosition();
}

function showNavControls() {
    el.navControls?.classList.remove('hidden');
    updateNavPosition();
}

function updateNavPosition() {
    if (el.navPosition) {
        el.navPosition.textContent = `${currentHighlightIndex + 1} of ${currentHighlights.length}`;
    }
}

function scrollToHighlightInPage(index) {
    if (!currentTabId) return;

    chrome.tabs.sendMessage(currentTabId, {
        action: 'scrollToHighlight',
        index: index
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.log('[VERITAS Popup] Could not scroll to highlight:', chrome.runtime.lastError.message);
        }
    });
}



async function checkConnection() {
    try {
        const response = await fetch('http://127.0.0.1:8000/health');
        if (response.ok) {
            el.connectionDot?.classList.add('connected');
            if (el.connectionText) el.connectionText.textContent = 'Connected';
        } else {
            throw new Error('Server error');
        }
    } catch (e) {
        el.connectionDot?.classList.add('disconnected');
        if (el.connectionText) el.connectionText.textContent = 'Offline';
    }
}



document.addEventListener('DOMContentLoaded', init);