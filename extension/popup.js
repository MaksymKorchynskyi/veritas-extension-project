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
    scoreValue: document.getElementById('scoreValue'),
    detailsPanel: document.getElementById('detailsPanel'),
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
        chrome.tabs.create({ url: `parsed_text.html?tabId=${currentTabId}` });
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
            break;
        case 'analyzing':
            el.stateAnalyzing?.classList.remove('hidden');
            break;
        case 'results':
            el.stateResults?.classList.remove('hidden');
            break;
        case 'error':
            el.stateError?.classList.remove('hidden');
            break;
        case 'settings':
            el.stateSettings?.classList.remove('hidden');
            break;
    }
}

function updateProgress(step, message) {
    if (el.statusText) el.statusText.textContent = message || 'Processing...';

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
    if (el.scoreValue) el.scoreValue.textContent = score.toFixed(0);

    // Apply color class
    el.heroScore?.classList.remove('score-high', 'score-mid', 'score-low');
    el.heroScore?.classList.add(getScoreClass(score));

    // Metrics
    const c = result.criteria || {};
    setMetric(el.metricSource, c.source_verification);
    setMetric(el.metricObjectivity, c.objectivity);
    setMetric(el.metricHeadline, c.headline_relevance);
    setMetric(el.metricDensity, c.factual_density);
    setMetric(el.metricLogic, c.logical_consistency);

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
    if (el.toggleDetails) el.toggleDetails.textContent = 'View Detailed Breakdown';
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

    if (el.warningCount) el.warningCount.textContent = warnings;
    if (el.riskCount) el.riskCount.textContent = risks;

    el.highlightNavigator?.classList.remove('hidden');
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
