/**
 * VERITAS Popup Script
 * Communicates with background.js for persistent analysis
 * Progressive disclosure UI
 */

// =============================================================================
// DOM ELEMENTS
// =============================================================================

const el = {
    // States
    stateInitial: document.getElementById('stateInitial'),
    stateAnalyzing: document.getElementById('stateAnalyzing'),
    stateResults: document.getElementById('stateResults'),
    stateError: document.getElementById('stateError'),

    // Buttons
    analyzeBtn: document.getElementById('analyzeBtn'),
    reanalyzeBtn: document.getElementById('reanalyzeBtn'),
    retryBtn: document.getElementById('retryBtn'),
    toggleDetails: document.getElementById('toggleDetails'),

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


// =============================================================================
// INITIALIZATION
// =============================================================================

async function init() {
    console.log('[VERITAS Popup] Initializing...');

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

    // Highlight Navigator events
    el.badgeWarnings?.addEventListener('click', () => jumpToHighlight('warning'));
    el.badgeRisks?.addEventListener('click', () => jumpToHighlight('risk'));
    el.prevHighlight?.addEventListener('click', () => navigateHighlight(-1));
    el.nextHighlight?.addEventListener('click', () => navigateHighlight(1));

    // Check server connection
    checkConnection();

    // Check for cached result first
    const cached = await getCachedResult();
    if (cached) {
        console.log('[VERITAS Popup] Found cached result');
        showResults(cached);
        return;
    }

    // Check if analysis is in progress
    const state = await getAnalysisState();
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


// =============================================================================
// STATE MANAGEMENT
// =============================================================================

function showState(stateName) {
    el.stateInitial?.classList.add('hidden');
    el.stateAnalyzing?.classList.add('hidden');
    el.stateResults?.classList.add('hidden');
    el.stateError?.classList.add('hidden');

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
    if (el.toggleDetails) {
        el.toggleDetails.textContent = isHidden ? 'View Detailed Breakdown' : 'Hide Details';
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
