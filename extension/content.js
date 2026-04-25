/**
 * VERITAS Content Script
 * Readability.js-Based Article Extraction + Indexed Paragraphs
 * Phase 6 - Enterprise Architecture
 */

// Guard against duplicate injection
if (window.__VERITAS_LOADED__) {
    console.log('[VERITAS] Script already loaded, skipping.');
} else {
    window.__VERITAS_LOADED__ = true;

    // =============================================================================
    // UTILITIES
    // =============================================================================

    let veritasParagraphCounter = 0;

    function assignObjectIdsToOriginalDOM() {
        // Tag all meaningful text containers in original DOM with IDs BEFORE parsing.
        // This ensures the IDs are preserved when Readability clones the DOM.
        const blocks = document.body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, div');
        blocks.forEach(block => {
            // Only tag if it doesn't already have children that are block elements
            // (we want leaf nodes or simple text wrappers)
            if (block.children.length === 0 || block.tagName.toLowerCase() === 'p') {
                const text = block.innerText || block.textContent;
                if (text && text.trim().length > 30) {
                    veritasParagraphCounter++;
                    block.setAttribute('data-veritas-id', veritasParagraphCounter);
                }
            }
        });
        console.log(`[VERITAS] Assigned IDs to ${veritasParagraphCounter} DOM elements.`);
    }

    function preCleanDOM(doc) {
        const noiseSelectors = [
            'aside', 'footer', 'nav', '.sidebar', '#sidebar',
            '.read-more', '.related-news', '.similar-articles', '.see-also',
            '.recommended', '.widget', '[class*="widget"]', '[id*="widget"]',
            '.comments', '#comments', '.advertisement', '.banner',
            '[class*="lun"]', '[id*="lun"]', // Anti-LUN widgets
            '[class*="telegram"]', '.social-share', '.subscribe',
            '.read-also', '[class*="read-also"]', '[class*="recommended"]', '[id*="recommended"]', 
            '.news-read', '.news-read-more', '.news-video', 'iframe', '[class*="banner"]', '[class*="teaser"]'
        ];

        noiseSelectors.forEach(selector => {
            try {
                const elements = doc.querySelectorAll(selector);
                elements.forEach(el => el.remove());
            } catch (e) { }
        });
        
        return doc;
    }

    // =============================================================================
    // MAIN EXTRACTION: Readability
    // =============================================================================

    function extractArticleData() {
        console.log('[VERITAS] Extracting from', window.location.hostname);

        try {
            // Check if Readability is available
            if (typeof Readability === 'undefined') {
                throw new Error('Readability.js not loaded');
            }

            // 1. Tag original DOM so that highlights perfectly map back later
            assignObjectIdsToOriginalDOM();

            // 2. Clone the DOM so we don't destroy page layout during cleanups
            let clonedDoc = document.cloneNode(true);
            
            // 3. Pre-clean obvious noise
            clonedDoc = preCleanDOM(clonedDoc);

            // 4. Parse cleanly
            const reader = new Readability(clonedDoc);
            const article = reader.parse();

            if (!article || !article.content) {
                throw new Error('Readability returned null or empty content');
            }

            // 5. Post-process: Extract the array of paragraphs that Readability kept
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = article.content;
            
            const paragraphs = [];
            const taggedNodes = tempDiv.querySelectorAll('[data-veritas-id]');
            
            taggedNodes.forEach(node => {
                const text = node.textContent.trim();
                // Filter out empty or tiny fragments
                if (text.length > 20) {
                    paragraphs.push({
                        id: parseInt(node.getAttribute('data-veritas-id'), 10),
                        text: text
                    });
                }
            });

            if (paragraphs.length === 0) {
                throw new Error('Readability preserved no tagged paragraphs. Text length was: ' + (article.textContent || '').length);
            }

            console.log(`[VERITAS] Successfully extracted ${paragraphs.length} structured paragraphs.`);

            return {
                success: true,
                data: {
                    url: window.location.href,
                    title: article.title || document.title,
                    html_content: article.content, // HTML includes tags, useful for internal links
                    paragraphs: paragraphs        // Replaces text_content
                }
            };
        } catch (e) {
            console.error('[VERITAS] Extraction error:', e.message);
            // Fallback strategy: just snatch ALL tagged paragraphs from the raw body.
            // This bypasses Readability's smart filtering, but guarantees SOMETHING returns.
            const fallbackParagraphs = [];
            document.body.querySelectorAll('[data-veritas-id]').forEach(node => {
                const text = node.innerText || node.textContent;
                if (text && text.trim().length > 30) {
                    fallbackParagraphs.push({
                        id: parseInt(node.getAttribute('data-veritas-id'), 10),
                        text: text.trim().replace(/\s+/g, ' ')
                    });
                }
            });

            if (fallbackParagraphs.length > 0) {
                console.warn(`[VERITAS] Fallback extraction yielded ${fallbackParagraphs.length} paragraphs.`);
                return {
                    success: true,
                    data: {
                        url: window.location.href,
                        title: document.title,
                        html_content: document.body.innerHTML,
                        paragraphs: fallbackParagraphs
                    }
                };
            }

            return { success: false, error: e.message };
        }
    }


    // =============================================================================
    // PRECISE HIGHLIGHTING (O(1) Element Lookup via ID)
    // =============================================================================

    function applyHighlights(highlights) {
        if (!highlights || highlights.length === 0) {
            console.log('[VERITAS] No highlights');
            return { applied: 0 };
        }

        console.log('[VERITAS] Applying', highlights.length, 'highlights via ID mapping');
        let applied = 0;

        for (const h of highlights) {
            if (h.paragraph_id === undefined || h.paragraph_id === null) {
                console.warn('[VERITAS] Highlight missing paragraph_id:', h);
                continue;
            }

            const targetElement = document.body.querySelector(`[data-veritas-id="${h.paragraph_id}"]`);
            
            if (targetElement) {
                console.log(`[VERITAS] Found target for ID ${h.paragraph_id}. Wrapping.`);
                
                try {
                    // Wrap the element's INNER contents. Better than range selection because 
                    // this element was exactly the boundary of the text.
                    const span = document.createElement('span');
                    span.className = `veritas-highlight veritas-${h.severity || 'warning'}`;
                    span.dataset.reason = h.reason || 'Ця ділянка тексту містить маніпуляції.';
                    span.dataset.category = h.category || '';
                    span.dataset.severity = h.severity || 'warning';
                    span.title = `VERITAS: ${h.category || h.reason || h.severity || 'Issue'}`;
                    
                    if (h.severity === 'risk') {
                        span.style.cssText = 'background-color: #ff8a80 !important; color: black !important; padding: 2px 4px !important; border-radius: 3px !important; display: inline-block;';
                    } else {
                        span.style.cssText = 'background-color: #fff176 !important; color: black !important; padding: 2px 4px !important; border-radius: 3px !important; display: inline-block;';
                    }

                    // Move all inner content of the targetElement into our highlight span, then append the span.
                    while (targetElement.firstChild) {
                        span.appendChild(targetElement.firstChild);
                    }
                    targetElement.appendChild(span);
                    applied++;
                } catch (e) {
                    console.error('[VERITAS] Failed to apply highlight to ID', h.paragraph_id, e);
                }
            } else {
                console.warn(`[VERITAS] Could not find element with ID ${h.paragraph_id} in DOM.`);
            }
        }

        console.log('[VERITAS] Applied', applied, '/', highlights.length);
        return { applied };
    }

    function removeHighlights() {
        const spans = document.querySelectorAll('.veritas-highlight');
        spans.forEach(span => {
            const parent = span.parentNode;
            while (span.firstChild) parent.insertBefore(span.firstChild, span);
            parent.removeChild(span);
        });
        removeTooltip();
        console.log('[VERITAS] Removed', spans.length, 'highlights');
        return { removed: spans.length };
    }


    // =============================================================================
    // TOOLTIP SYSTEM (Coffee Edition Design)
    // =============================================================================

    function injectTooltipStyles() {
        if (document.getElementById('veritas-tooltip-styles')) return;

        const style = document.createElement('style');
        style.id = 'veritas-tooltip-styles';
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;800&family=Playfair+Display:ital,wght@1,500;1,700&display=swap');
            
            .veritas-tooltip {
                position: absolute !important;
                z-index: 2147483647 !important;
                max-width: 280px !important;
                background: #EFE9E1 !important;
                border: 1px solid #8D6E63 !important;
                border-radius: 12px !important;
                box-shadow: 0 4px 20px rgba(62, 39, 35, 0.15) !important;
                font-family: 'Manrope', sans-serif !important;
                padding: 0 !important;
                animation: veritas-fadeIn 0.2s ease !important;
            }
            
            .veritas-tooltip__header {
                padding: 12px 16px !important;
                border-bottom: 1px solid #8D6E63 !important;
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
            }
            
            .veritas-tooltip__title {
                font-family: 'Playfair Display', serif !important;
                font-size: 15px !important;
                font-weight: 700 !important;
                font-style: italic !important;
                margin: 0 !important;
                line-height: 1.3 !important;
            }
            
            .veritas-tooltip__title--warning {
                color: #7A5321 !important;
                background: rgba(197, 137, 64, 0.15) !important;
                padding: 4px 8px !important;
                border-radius: 4px !important;
            }
            
            .veritas-tooltip__title--risk {
                color: #631F18 !important;
                background: rgba(141, 45, 36, 0.15) !important;
                padding: 4px 8px !important;
                border-radius: 4px !important;
            }
            
            .veritas-tooltip__body {
                padding: 12px 16px !important;
            }
            
            .veritas-tooltip__explanation {
                font-size: 13px !important;
                color: #3E2723 !important;
                line-height: 1.5 !important;
                margin: 0 0 12px 0 !important;
            }
            
            .veritas-tooltip__footer {
                padding: 8px 16px 12px !important;
                display: flex !important;
                justify-content: flex-end !important;
            }
            
            .veritas-tooltip__btn {
                padding: 6px 12px !important;
                font-size: 12px !important;
                font-family: 'Manrope', sans-serif !important;
                border: 1px solid #8D6E63 !important;
                border-radius: 6px !important;
                background: transparent !important;
                color: #795548 !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
            }
            
            .veritas-tooltip__btn:hover {
                background: #3E2723 !important;
                color: #EFE9E1 !important;
                border-color: #3E2723 !important;
            }
            
            .veritas-tooltip__arrow {
                position: absolute !important;
                width: 12px !important;
                height: 12px !important;
                background: #EFE9E1 !important;
                border: 1px solid #8D6E63 !important;
                transform: rotate(45deg) !important;
            }
            
            .veritas-tooltip__arrow--top {
                bottom: -7px !important;
                border-top: none !important;
                border-left: none !important;
            }
            
            .veritas-tooltip__arrow--bottom {
                top: -7px !important;
                border-bottom: none !important;
                border-right: none !important;
            }
            
            @keyframes veritas-fadeIn {
                from { opacity: 0; transform: translateY(4px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes veritas-pulse {
                0%, 100% { box-shadow: 0 0 0 0 rgba(197, 137, 64, 0.4); }
                50% { box-shadow: 0 0 0 8px rgba(197, 137, 64, 0); }
            }
            
            .veritas-highlight--pulse {
                animation: veritas-pulse 0.6s ease 2 !important;
            }
        `;
        document.head.appendChild(style);
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function createTooltip(highlight, targetElement) {
        removeTooltip();
        injectTooltipStyles();

        const reason = targetElement.dataset.reason || highlight.reason || 'This content has been flagged for review.';
        const category = targetElement.dataset.category || highlight.category || '';
        const severity = targetElement.dataset.severity || highlight.severity || 'warning';
        const title = category || (severity === 'risk' ? 'Manipulative Claim' : 'Unverified Claim');

        const tooltip = document.createElement('div');
        tooltip.className = 'veritas-tooltip';
        tooltip.id = 'veritas-active-tooltip';

        tooltip.innerHTML = `
            <div class="veritas-tooltip__header">
                <span class="veritas-tooltip__title veritas-tooltip__title--${severity}">${escapeHTML(title)}</span>
            </div>
            <div class="veritas-tooltip__body">
                <p class="veritas-tooltip__explanation">${escapeHTML(reason)}</p>
            </div>
            <div class="veritas-tooltip__footer">
                <button class="veritas-tooltip__btn" id="veritas-dismiss-btn">Dismiss</button>
            </div>
            <div class="veritas-tooltip__arrow"></div>
        `;

        document.body.appendChild(tooltip);
        positionTooltip(tooltip, targetElement);

        tooltip.querySelector('#veritas-dismiss-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            removeTooltip();
        });

        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 100);
    }

    function positionTooltip(tooltip, target) {
        const targetRect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const arrow = tooltip.querySelector('.veritas-tooltip__arrow');

        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        let left = targetRect.left + scrollX + (targetRect.width / 2) - (tooltipRect.width / 2);

        const padding = 10;
        if (left < padding) left = padding;
        if (left + tooltipRect.width > window.innerWidth - padding) {
            left = window.innerWidth - tooltipRect.width - padding;
        }

        const spaceAbove = targetRect.top;
        const spaceBelow = window.innerHeight - targetRect.bottom;

        let top;
        if (spaceAbove > tooltipRect.height + 20 || spaceAbove > spaceBelow) {
            top = targetRect.top + scrollY - tooltipRect.height - 10;
            arrow.className = 'veritas-tooltip__arrow veritas-tooltip__arrow--top';
        } else {
            top = targetRect.bottom + scrollY + 10;
            arrow.className = 'veritas-tooltip__arrow veritas-tooltip__arrow--bottom';
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;

        const arrowLeft = targetRect.left + scrollX + (targetRect.width / 2) - left - 6;
        arrow.style.left = `${Math.max(10, Math.min(arrowLeft, tooltipRect.width - 22))}px`;
    }

    function removeTooltip() {
        const existing = document.getElementById('veritas-active-tooltip');
        if (existing) existing.remove();
        document.removeEventListener('click', handleOutsideClick);
    }

    function handleOutsideClick(e) {
        const tooltip = document.getElementById('veritas-active-tooltip');
        if (tooltip && !tooltip.contains(e.target) && !e.target.classList.contains('veritas-highlight')) {
            removeTooltip();
        }
    }

    function setupHighlightClicks() {
        document.querySelectorAll('.veritas-highlight').forEach((el, index) => {
            el.style.cursor = 'pointer';
            el.dataset.veritasIndex = index;

            el.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const idx = parseInt(el.dataset.veritasIndex);
                const highlight = window.__VERITAS_HIGHLIGHTS__[idx];

                if (highlight) {
                    createTooltip(highlight, el);
                }
            });
        });
    }

    function scrollToHighlight(index) {
        const highlights = document.querySelectorAll('.veritas-highlight');
        if (index < 0 || index >= highlights.length) return false;

        const target = highlights[index];
        if (!target) return false;

        target.scrollIntoView({ behavior: 'smooth', block: 'center' });

        target.classList.add('veritas-highlight--pulse');
        setTimeout(() => {
            target.classList.remove('veritas-highlight--pulse');
        }, 1500);

        return true;
    }

    function getHighlightCounts() {
        const highlights = window.__VERITAS_HIGHLIGHTS__ || [];
        return {
            warnings: highlights.filter(h => h.severity === 'warning').length,
            risks: highlights.filter(h => h.severity === 'risk').length,
            total: highlights.length
        };
    }


    // =============================================================================
    // MESSAGE LISTENER
    // =============================================================================

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('[VERITAS] Message:', request.action);

        try {
            switch (request.action) {
                case 'ping':
                    sendResponse({ pong: true });
                    break;
                case 'extractContent':
                    sendResponse(extractArticleData());
                    break;
                case 'applyHighlights':
                    console.log('[VERITAS] Received highlights:', request.highlights);
                    window.__VERITAS_HIGHLIGHTS__ = request.highlights || [];
                    const result = applyHighlights(request.highlights);
                    injectTooltipStyles();
                    setupHighlightClicks();
                    sendResponse(result);
                    break;
                case 'removeHighlights':
                    window.__VERITAS_HIGHLIGHTS__ = [];
                    sendResponse(removeHighlights());
                    break;
                case 'scrollToHighlight':
                    const scrolled = scrollToHighlight(request.index);
                    sendResponse({ success: scrolled });
                    break;
                case 'getHighlightCounts':
                    sendResponse(getHighlightCounts());
                    break;
                case 'toggleHighlights':
                    if (request.enabled) {
                        // Re-apply stored highlights
                        const stored = window.__VERITAS_HIGHLIGHTS__ || [];
                        if (stored.length > 0) {
                            const toggleResult = applyHighlights(stored);
                            injectTooltipStyles();
                            setupHighlightClicks();
                            sendResponse(toggleResult);
                        } else {
                            sendResponse({ applied: 0 });
                        }
                    } else {
                        // Remove highlights but keep data in memory
                        removeHighlights();
                        sendResponse({ removed: true });
                    }
                    break;
                default:
                    sendResponse({ error: 'Unknown action' });
            }
        } catch (e) {
            console.error('[VERITAS] Handler error:', e);
            sendResponse({ error: e.message });
        }

        return true;
    });

    console.log('[VERITAS] Content script ready on', window.location.hostname);

} // End of duplicate guard else block
