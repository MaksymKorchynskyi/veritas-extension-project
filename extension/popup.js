/**
 * VERITAS Popup Script
 * Communicates with background.js for persistent analysis
 * Progressive disclosure UI
 */

// =============================================================================
// DOM ELEMENTS
// =============================================================================

const el = {
    // Buttons
    analyzeBtn: document.getElementById('analyzeBtn'),
    reanalyzeBtn: document.getElementById('reanalyzeBtn'),
    retryBtn: document.getElementById('retryBtn'),
    toggleDetails: document.getElementById('toggleDetails'),
    resetBtn: document.getElementById('resetBtn'), // New hard reset button
    settingsBtn: document.getElementById('settingsBtn'),
    backToAnalysisBtn: document.getElementById('backToAnalysisBtn'),
    languageSelect: document.getElementById('languageSelect'),
    
    // States
    stateInitial: document.getElementById('stateInitial'),
    stateAnalyzing: document.getElementById('stateAnalyzing'),
    stateResults: document.getElementById('stateResults'),
    stateError: document.getElementById('stateError'),
    stateSettings: document.getElementById('stateSettings'),

    // Analyzing
    statusText: document.getElementById('statusText'),
    dot1: document.getElementById('dot1'),
    dot2: document.getElementById('dot2'),
    dot3: document.getElementById('dot3'),

    // Results
    heroScore: document.getElementById('heroScore'),
    heroScoreWrapper: document.getElementById('heroScoreWrapper'),
    scoreValue: document.getElementById('scoreValue'),
    scoreRingFill: document.getElementById('scoreRingFill'),
    detailsPanel: document.getElementById('detailsPanel'),
    radarChartContainer: document.getElementById('radarChartContainer'),
    metricSource: document.getElementById('metricSource'),
    metricObjectivity: document.getElementById('metricObjectivity'),
    metricHeadline: document.getElementById('metricHeadline'),
    metricDensity: document.getElementById('metricDensity'),
    metricLogic: document.getElementById('metricLogic'),
    explainerText: document.getElementById('explainerText'),

    // Highlight Navigator
    highlightNavigator: document.getElementById('highlightNavigator'),
    badgeWarnings: document.getElementById('badgeWarnings'),
    badgeRisks: document.getElementById('badgeRisks'),
    warningCount: document.getElementById('warningCount'),
    riskCount: document.getElementById('riskCount'),
    navControls: document.getElementById('navControls'),
    prevHighlight: document.getElementById('prevHighlight'),
    nextHighlight: document.getElementById('nextHighlight'),
    navPosition: document.getElementById('navPosition'),

    // Error
    errorText: document.getElementById('errorText'),

    // Footer
    connectionDot: document.getElementById('connectionDot'),
    connectionText: document.getElementById('connectionText')
};

let currentTabId = null;
let currentTabUrl = null;
let pollInterval = null;
let currentHighlights = [];
let currentHighlightIndex = 0;

// Dynamic loading status messages timer
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
        "source_verification": "Перевірка Джерел",
        "objectivity": "Об'єктивність",
        "headline_relevance": "Заголовок",
        "factual_density": "Фактологічність",
        "logical_consistency": "Логіка",
        "analyze_again": "Аналізувати Знову",
        "try_again": "Спробувати Знову",
        "checking": "Перевірка...",
        "settings_title": "Налаштування",
        "language_label": "Мова Додатку",
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
        "source_verification": "Source Verification",
        "objectivity": "Objectivity",
        "headline_relevance": "Headline Relevance",
        "factual_density": "Factual Density",
        "logical_consistency": "Logical Consistency",
        "analyze_again": "Analyze Again",
        "try_again": "Try Again",
        "checking": "Checking...",
        "settings_title": "Settings",
        "language_label": "App Language",
        "back_to_analysis": "Back to Analysis"
    }
};

let currentLanguage = 'uk'; // Default

// =============================================================================
// DYNAMIC LOADING STATUS MESSAGES
// =============================================================================

const loadingMessages = {
    "uk": [
        "Аналіз структури документа...",
        "Виявлення іменованих сутностей...",
        "Перехресна перевірка баз OSINT...",
        "Аналіз логічної послідовності...",
        "Синтез Veritas Trust Score..."
    ],
    "en": [
        "Parsing document structure...",
        "Extracting named entities...",
        "Cross-referencing OSINT databases...",
        "Analyzing logical consistency...",
        "Synthesizing Veritas Trust Score..."
    ]
};

function startLoadingStatusCycle() {
    stopLoadingStatusCycle();
    loadingStatusIndex = 0;

    const messages = loadingMessages[currentLanguage] || loadingMessages["en"];
    // Set the first message immediately
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

/** Fade-out, swap text, fade-in */
function setStatusTextAnimated(text) {
    if (!el.statusText) return;
    el.statusText.classList.add('fade-out');
    setTimeout(() => {
        el.statusText.textContent = text;
        el.statusText.classList.remove('fade-out');
    }, 300);
}


// =============================================================================
// ANIMATED SCORE RING + COUNTER
// =============================================================================

const RING_CIRCUMFERENCE = 2 * Math.PI * 62; // ≈ 389.56

/**
 * Animate the score ring fill and numeric counter from 0 → targetScore
 * @param {number} targetScore - The final score value (0-100)
 * @param {number} duration - Animation duration in ms (default 1500)
 */
function animateScoreRing(targetScore, duration = 1500) {
    const ringFill = el.scoreRingFill;
    const scoreDisplay = el.scoreValue;
    if (!ringFill || !scoreDisplay) return;

    // Determine color class
    const colorClass = getScoreClass(targetScore);
    ringFill.classList.remove('score-high', 'score-mid', 'score-low');
    ringFill.classList.add(colorClass);

    // Apply color class to content container too
    el.heroScore?.classList.remove('score-high', 'score-mid', 'score-low');
    el.heroScore?.classList.add(colorClass);

    const startTime = performance.now();
    const fraction = Math.max(0, Math.min(targetScore, 100)) / 100;
    const targetOffset = RING_CIRCUMFERENCE * (1 - fraction);

    function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic
        const ease = 1 - Math.pow(1 - progress, 3);

        // Ring fill
        const currentOffset = RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE - targetOffset) * ease;
        ringFill.setAttribute('stroke-dashoffset', currentOffset.toFixed(2));

        // Number counter
        const currentValue = Math.round(targetScore * ease);
        scoreDisplay.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            // Final exact values
            ringFill.setAttribute('stroke-dashoffset', targetOffset.toFixed(2));
            scoreDisplay.textContent = Math.round(targetScore);
        }
    }

    // Reset before starting
    ringFill.setAttribute('stroke-dashoffset', RING_CIRCUMFERENCE.toFixed(2));
    scoreDisplay.textContent = '0';

    requestAnimationFrame(tick);
}


// =============================================================================
// SVG PENTAGON RADAR CHART
// =============================================================================

/**
 * Draw a pentagon radar chart into the radarChartContainer
 * @param {Object} scores - { source, objectivity, headline, density, logic } each 0-100
 */
function drawRadarChart(scores) {
    const container = el.radarChartContainer;
    if (!container) return;

    // Clear previous chart
    container.innerHTML = '';

    const size = 210;
    const cx = size / 2;
    const cy = size / 2;
    const maxRadius = 80; // max radius for the outermost ring
    const labels = ['Source', 'Objectivity', 'Headline', 'Density', 'Logic'];
    const values = [
        Math.max(0, Math.min(scores.source || 0, 100)),
        Math.max(0, Math.min(scores.objectivity || 0, 100)),
        Math.max(0, Math.min(scores.headline || 0, 100)),
        Math.max(0, Math.min(scores.density || 0, 100)),
        Math.max(0, Math.min(scores.logic || 0, 100))
    ];

    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.setAttribute('width', '200');
    svg.setAttribute('height', '200');
    svg.style.display = 'block';

    // Read CSS variable colors
    const style = getComputedStyle(document.documentElement);
    const borderAccent = style.getPropertyValue('--border-accent').trim() || '#8D6E63';
    const textSecondary = style.getPropertyValue('--text-secondary').trim() || '#795548';
    const textPrimary = style.getPropertyValue('--text-primary').trim() || '#3E2723';

    // Determine fill color based on average score
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

    /**
     * Get (x, y) for a pentagon vertex
     * @param {number} index 0-4
     * @param {number} radius
     */
    function getPoint(index, radius) {
        // Start from top (−90° = −π/2), go clockwise
        const angle = (2 * Math.PI * index) / 5 - Math.PI / 2;
        return {
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle)
        };
    }

    /** Build a polygon points-string from indices 0..4 at given radius */
    function pentagonPoints(radius) {
        return Array.from({ length: 5 }, (_, i) => {
            const p = getPoint(i, radius);
            return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
        }).join(' ');
    }

    // --- Background grid: 4 concentric pentagons ---
    const rings = [0.25, 0.5, 0.75, 1.0];
    rings.forEach(frac => {
        const polygon = document.createElementNS(ns, 'polygon');
        polygon.setAttribute('points', pentagonPoints(maxRadius * frac));
        polygon.setAttribute('fill', 'none');
        polygon.setAttribute('stroke', borderAccent);
        polygon.setAttribute('stroke-opacity', '0.2');
        polygon.setAttribute('stroke-width', '1');
        svg.appendChild(polygon);
    });

    // --- Axes (from center to each vertex) ---
    for (let i = 0; i < 5; i++) {
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

    // --- Data polygon ---
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

    // --- Data point dots ---
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

    // --- Labels ---
    const labelOffsets = [
        { dx: 0, dy: -12 },    // top
        { dx: 14, dy: 2 },     // top-right
        { dx: 10, dy: 14 },    // bottom-right
        { dx: -10, dy: 14 },   // bottom-left
        { dx: -14, dy: 2 }     // top-left
    ];
    const labelAnchors = ['middle', 'start', 'start', 'end', 'end'];

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

        // Also show value next to label
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


// =============================================================================
// INITIALIZATION
// =============================================================================

async function init() {
    console.log('[VERITAS Popup] Initializing...');

    // Load language preferences
    const storage = await chrome.storage.local.get(['appLanguage']);
    if (storage.appLanguage) {
        currentLanguage = storage.appLanguage;
        if (el.languageSelect) el.languageSelect.value = currentLanguage;
    }
    applyTranslations();

    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
        currentTabId = tab.id;
        currentTabUrl = tab.url;
    }

    // Bind events
    el.analyzeBtn?.addEventListener('click', startAnalysis);
    el.reanalyzeBtn?.addEventListener('click', startAnalysis);
    el.retryBtn?.addEventListener('click', startAnalysis);
    el.toggleDetails?.addEventListener('click', toggleDetailsPanel);
    el.resetBtn?.addEventListener('click', forceResetState);
    
    // Settings Binding
    el.settingsBtn?.addEventListener('click', () => showState('settings'));
    el.backToAnalysisBtn?.addEventListener('click', () => {
        // Just reload the logical state by running init checks again, or just show initial
        // But safer to just reload popup context fully, or handle states
        window.location.reload(); 
    });
    el.languageSelect?.addEventListener('change', async (e) => {
        currentLanguage = e.target.value;
        await chrome.storage.local.set({ appLanguage: currentLanguage });
        applyTranslations();
    });
    
    // Bind new View Parsed Text button
    document.getElementById('viewParsedTextBtn')?.addEventListener('click', () => {
        const encodedUrl = encodeURIComponent(currentTabUrl || '');
        chrome.tabs.create({ url: `parsed_text.html?tabId=${currentTabId}&articleUrl=${encodedUrl}` });
    });

    // Highlight Navigator events
    el.badgeWarnings?.addEventListener('click', () => jumpToHighlight('warning'));
    el.badgeRisks?.addEventListener('click', () => jumpToHighlight('risk'));
    el.prevHighlight?.addEventListener('click', () => navigateHighlight(-1));
    el.nextHighlight?.addEventListener('click', () => navigateHighlight(1));

    // Check server connection
    checkConnection();

    // Check for cached result first (cached by URL, so safe)
    const cached = await getCachedResult();
    if (cached) {
        console.log('[VERITAS Popup] Found cached result');
        showResults(cached);
        return;
    }

    // Check if analysis is in progress
    const state = await getAnalysisState();

    // Safety check: ignore state if it belongs to a different URL (user navigated away)
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

    // Default: show initial state
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

    // Handle dynamically toggled text safely
    if (el.toggleDetails) {
        const isHidden = el.detailsPanel?.classList.contains('hidden');
        el.toggleDetails.textContent = isHidden ? dict["view_breakdown"] : dict["hide_details"];
    }
}

// =============================================================================
// STATE MANAGEMENT
// =============================================================================

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
    // The dynamic loading messages handle status text now,
    // but we still update dots based on step
    el.dot1?.classList.toggle('active', step >= 1);
    el.dot1?.classList.toggle('done', step > 1);
    el.dot2?.classList.toggle('active', step >= 2);
    el.dot2?.classList.toggle('done', step > 2);
    el.dot3?.classList.toggle('active', step >= 3);
}


// =============================================================================
// BACKGROUND COMMUNICATION
// =============================================================================

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

    // Clear previous state
    await chrome.runtime.sendMessage({ action: 'CLEAR_STATE', tabId: currentTabId });

    // Start analysis in background
    chrome.runtime.sendMessage({
        action: 'START_ANALYSIS',
        tabId: currentTabId,
        tabUrl: currentTabUrl
    });

    // Start polling for updates
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


// =============================================================================
// RESULTS DISPLAY
// =============================================================================

function showResults(result) {
    showState('results');

    const score = result.trust_score;

    // Apply color class to content container
    el.heroScore?.classList.remove('score-high', 'score-mid', 'score-low');
    el.heroScore?.classList.add(getScoreClass(score));

    // Animate score ring + counter
    animateScoreRing(score);

    // Metrics
    const c = result.criteria || {};
    setMetric(el.metricSource, c.source_verification);
    setMetric(el.metricObjectivity, c.objectivity);
    setMetric(el.metricHeadline, c.headline_relevance);
    setMetric(el.metricDensity, c.factual_density);
    setMetric(el.metricLogic, c.logical_consistency);

    // Draw radar chart with the criteria scores
    drawRadarChart({
        source: c.source_verification || 0,
        objectivity: c.objectivity || 0,
        headline: c.headline_relevance || 0,
        density: c.factual_density || 0,
        logic: c.logical_consistency || 0
    });

    // Explainer
    if (el.explainerText && result.explainer) {
        el.explainerText.textContent = result.explainer;
    }

    // Highlight Navigator
    const highlights = result.highlights || [];
    currentHighlights = highlights;
    currentHighlightIndex = 0;
    updateHighlightNavigator(highlights);

    // Collapse details by default
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


// =============================================================================
// HIGHLIGHT NAVIGATOR
// =============================================================================

function updateHighlightNavigator(highlights) {
    if (!highlights || highlights.length === 0) {
        el.highlightNavigator?.classList.add('hidden');
        return;
    }

    const warnings = highlights.filter(h => h.severity === 'warning').length;
    const risks = highlights.filter(h => h.severity === 'risk').length;

    // Hide badge if count is 0
    if (el.warningCount) el.warningCount.textContent = warnings;
    if (el.badgeWarnings) el.badgeWarnings.style.display = warnings > 0 ? '' : 'none';
    if (el.riskCount) el.riskCount.textContent = risks;
    if (el.badgeRisks) el.badgeRisks.style.display = risks > 0 ? '' : 'none';

    // Only show navigator if there's at least one actual badge visible
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

    // Find index in full array
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


// =============================================================================
// CONNECTION CHECK
// =============================================================================

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


// =============================================================================
// INIT
// =============================================================================

document.addEventListener('DOMContentLoaded', init);
