/**
 * VERITAS Background Service Worker
 * Handles persistent analysis that survives popup close
 */

const BASE_URL = "http://127.0.0.1:8000";

// =============================================================================
// STORAGE HELPERS
// =============================================================================

async function getStorageKey(url) {
    // SHA-256 hash for collision-free cache keys
    if (!url) return 'analysis_unknown';

    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(url);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return `analysis_${hashHex.substring(0, 32)}`;
    } catch (e) {
        // Fallback for edge cases
        console.warn('[VERITAS BG] Hash failed, using fallback:', e.message);
        return `analysis_${btoa(url).substring(0, 40)}`;
    }
}

async function setAnalysisState(tabId, state) {
    const key = `state_${tabId}`;
    await chrome.storage.local.set({ [key]: state });
    console.log('[VERITAS BG] State set:', key, state.status);
}

async function getAnalysisState(tabId) {
    const key = `state_${tabId}`;
    const result = await chrome.storage.local.get([key]);
    return result[key] || null;
}

async function saveAnalysisResult(url, data, extractedParagraphs, articleTitle) {
    const key = await getStorageKey(url);
    const storagePayload = {
        [key]: data,
        [`timestamp_${key}`]: Date.now()
    };
    // Persist extracted paragraphs alongside the analysis result (keyed by URL)
    // so parsed_text.html can retrieve them even after tab state is cleared
    if (extractedParagraphs) {
        storagePayload[`paragraphs_${key}`] = extractedParagraphs;
        storagePayload[`url_${key}`] = url;
    }
    if (articleTitle) {
        storagePayload[`title_${key}`] = articleTitle;
    }
    await chrome.storage.local.set(storagePayload);
    console.log('[VERITAS BG] Result saved for:', url.substring(0, 50));
}

async function getAnalysisResult(url) {
    const key = await getStorageKey(url);
    const result = await chrome.storage.local.get([key, `timestamp_${key}`]);

    if (result[key]) {
        const timestamp = result[`timestamp_${key}`] || 0;
        const age = Date.now() - timestamp;
        // Cache valid for 1 hour
        if (age < 3600000) {
            console.log('[VERITAS BG] Cache hit for:', url.substring(0, 50));
            return result[key];
        }
    }
    return null;
}


// =============================================================================
// ANALYSIS ORCHESTRATION
// =============================================================================

async function performAnalysis(tabId, tabUrl) {
    console.log('[VERITAS BG] Starting analysis for tab:', tabId);

    try {
        // Update state: analyzing (store URL for stale-state detection)
        await setAnalysisState(tabId, {
            status: 'analyzing',
            step: 1,
            message: 'Extracting content...',
            url: tabUrl
        });

        // Step 1: Extract content from tab
        let extractedData;

        // Check if content script already loaded via ping
        let scriptReady = false;
        try {
            const pingResponse = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
            scriptReady = pingResponse?.pong === true;
            console.log('[VERITAS BG] Ping result:', scriptReady);
        } catch (e) {
            console.log('[VERITAS BG] Ping failed, will inject script');
        }

        // Inject only if not already loaded
        if (!scriptReady) {
            try {
                await chrome.scripting.executeScript({
                    target: { tabId },
                    files: ['Readability.js', 'content.js']
                });
                await new Promise(r => setTimeout(r, 300));
                console.log('[VERITAS BG] Script injected');
            } catch (injectErr) {
                console.log('[VERITAS BG] Script inject failed:', injectErr.message);
            }
        }

        // Now try to extract content
        try {
            const response = await chrome.tabs.sendMessage(tabId, { action: 'extractContent' });
            if (!response?.success) {
                // Handle "Text too short" as a user-friendly message
                const errorMsg = response?.error || 'Extraction failed';
                if (errorMsg.includes('too short')) {
                    throw new Error('Not enough text on this page. Try on an article page.');
                }
                throw new Error(errorMsg);
            }
            extractedData = response.data;
        } catch (msgErr) {
            console.error('[VERITAS BG] Message error:', msgErr.message);
            if (msgErr.message.includes('Not enough text')) {
                throw msgErr;
            }
            throw new Error('Cannot connect to page. Please refresh and try again.');
        }

        console.log('[VERITAS BG] Extracted:', extractedData.wordCount, 'words');

        // Update state: step 2
        await setAnalysisState(tabId, {
            status: 'analyzing',
            step: 2,
            message: 'Analyzing with AI...',
            url: tabUrl
        });

        // Step 2: Call backend API with Readability-extracted content
        const storage = await chrome.storage.local.get(['appLanguage']);
        const lang = storage.appLanguage || 'uk';
        
        const apiResponse = await fetch(`${BASE_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: extractedData.url,
                title: extractedData.title,
                html_content: extractedData.html_content,
                paragraphs: extractedData.paragraphs,
                language: lang
            })
        });

        if (!apiResponse.ok) {
            const err = await apiResponse.json().catch(() => ({}));
            let errMsg = err.detail || `Server error: ${apiResponse.status}`;
            // If FastAPI validation error (422), detail is an array of objects
            if (typeof errMsg === 'object') {
                errMsg = JSON.stringify(errMsg);
            }
            throw new Error(errMsg);
        }

        const analysisResult = await apiResponse.json();
        console.log('[VERITAS BG] Analysis complete, score:', analysisResult.trust_score);

        // Save result to storage
        await saveAnalysisResult(tabUrl, analysisResult, extractedData.paragraphs, extractedData.title);

        // Update state: complete
        await setAnalysisState(tabId, {
            status: 'complete',
            step: 3,
            message: 'Analysis complete',
            result: analysisResult,
            url: tabUrl,
            extractedParagraphs: extractedData.paragraphs,
            articleTitle: extractedData.title
        });

        // Apply highlights if any
        if (analysisResult.highlights?.length > 0) {
            try {
                await chrome.tabs.sendMessage(tabId, {
                    action: 'applyHighlights',
                    highlights: analysisResult.highlights
                });
                console.log('[VERITAS BG] Highlights applied:', analysisResult.highlights.length);
            } catch (e) {
                console.warn('[VERITAS BG] Could not apply highlights:', e.message);
            }
        }

        return analysisResult;

    } catch (error) {
        console.error('[VERITAS BG] Analysis error:', error);
        await setAnalysisState(tabId, {
            status: 'error',
            message: error.message
        });
        throw error;
    }
}


// =============================================================================
// MESSAGE LISTENER
// =============================================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[VERITAS BG] Message received:', request.action);

    if (request.action === 'START_ANALYSIS') {
        const { tabId, tabUrl } = request;

        // Run analysis in background (async)
        performAnalysis(tabId, tabUrl)
            .then(result => {
                console.log('[VERITAS BG] Analysis finished successfully');
            })
            .catch(error => {
                console.error('[VERITAS BG] Analysis failed:', error.message);
            });

        // Respond immediately that analysis has started
        sendResponse({ started: true });
        return false; // Sync response
    }

    if (request.action === 'GET_STATE') {
        const { tabId } = request;
        getAnalysisState(tabId).then(state => {
            sendResponse({ state });
        });
        return true; // Async response
    }

    if (request.action === 'GET_CACHED') {
        const { url } = request;
        getAnalysisResult(url).then(result => {
            sendResponse({ result });
        });
        return true; // Async response
    }

    if (request.action === 'GET_CACHED_FULL') {
        // Returns analysis result + extracted paragraphs + url, keyed by URL
        const { url } = request;
        (async () => {
            const key = await getStorageKey(url);
            const result = await chrome.storage.local.get([key, `paragraphs_${key}`, `url_${key}`, `title_${key}`, `timestamp_${key}`]);
            if (result[key]) {
                sendResponse({
                    found: true,
                    result: result[key],
                    extractedParagraphs: result[`paragraphs_${key}`] || null,
                    url: result[`url_${key}`] || url,
                    articleTitle: result[`title_${key}`] || '',
                    status: 'complete'
                });
            } else {
                sendResponse({ found: false });
            }
        })();
        return true; // Async response
    }

    if (request.action === 'CLEAR_STATE') {
        const { tabId } = request;
        chrome.storage.local.remove([`state_${tabId}`]).then(() => {
            sendResponse({ cleared: true });
        });
        return true;
    }

    return false;
});


// =============================================================================
// AUTO-CLEAR STATE ON TAB NAVIGATION
// =============================================================================

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // When a tab navigates to a new URL, clear old analysis state
    if (changeInfo.url) {
        console.log('[VERITAS BG] Tab', tabId, 'navigated to:', changeInfo.url.substring(0, 60));
        // Clear the analysis state for this tab so popup shows fresh "Analyze" button
        chrome.storage.local.remove([`state_${tabId}`]);
    }
});


// =============================================================================
// HEALTH CHECK
// =============================================================================

chrome.runtime.onInstalled.addListener(() => {
    console.log('[VERITAS BG] Extension installed/updated');
});

console.log('[VERITAS BG] Service worker loaded');
