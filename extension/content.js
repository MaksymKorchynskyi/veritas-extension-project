/**
 * VERITAS Content Script
 * Smart Article Extraction + Aggressive Fuzzy Highlighting
 * Phase 5 - Final Version
 */

// Guard against duplicate injection
if (window.__VERITAS_LOADED__) {
    console.log('[VERITAS] Script already loaded, skipping.');
} else {
    window.__VERITAS_LOADED__ = true;

    // =============================================================================
    // CONFIGURATION
    // =============================================================================

    const SEMANTIC_SELECTORS = [
        '.article__content', '[data-component="text-block"]', '.zn-body__paragraph',
        '.story-body__inner', 'article', '[role="main"]', '[itemprop="articleBody"]',
        '.article-body', '.article-content', '.post-content', '.entry-content',
        '.main-content', 'main'
    ];

    const NOISE_SELECTORS = [
        '.el-editorial-source', '.media__caption', '.image__caption', '.video__caption',
        '.related-content', '.ob-widget', '.zn-body__read-more', '.advertisement',
        '.ad', '[class*="advert"]', '[id*="advert"]', '.share-buttons', '.social-share',
        '[class*="share"]', '.related-articles', '.related-posts', '.related',
        '.more-news', '.comments', '.comment-section', '#comments', '.subscribe',
        '.newsletter', '.subscription', '.author-bio', '.author-box', 'nav', 'aside',
        'footer:not(article footer)', 'script', 'style', 'noscript', 'iframe', '[hidden]'
    ];

    const NOISE_INDICATORS = [
        'sidebar', 'menu', 'navigation', 'nav', 'footer', 'header', 'comment',
        'advertisement', 'ad-', 'banner', 'widget', 'related', 'popular', 'trending',
        'subscribe', 'newsletter', 'social', 'share', 'author-bio', 'breadcrumb'
    ];

    const SOCIAL_DOMAINS = [
        'facebook.com', 'twitter.com', 't.co', 'x.com', 'instagram.com',
        'linkedin.com', 'youtube.com', 'tiktok.com', 'telegram.org',
        't.me', 'wa.me', 'whatsapp.com', 'viber.com', 'pinterest.com'
    ];


    // =============================================================================
    // UTILITY: Aggressive Text Cleaner
    // =============================================================================

    function clean(str) {
        if (!str) return '';
        return str
            .replace(/\s+/g, ' ')      // Multiple spaces/newlines -> single space
            .replace(/[""''„"]/g, '"') // Normalize quotes
            .replace(/[—–]/g, '-')     // Normalize dashes
            .replace(/\u00A0/g, ' ')   // Non-breaking space -> space
            .trim()
            .toLowerCase();
    }


    // =============================================================================
    // CONTENT EXTRACTION
    // =============================================================================

    function findMainContent() {
        for (const sel of SEMANTIC_SELECTORS) {
            try {
                const el = document.querySelector(sel);
                if (el && (el.innerText || '').split(/\s+/).filter(w => w.length > 2).length > 100) {
                    console.log('[VERITAS] Found via:', sel);
                    return { element: el, method: 'semantic', selector: sel };
                }
            } catch (e) { }
        }
        return findByScoringAlgorithm();
    }

    function findByScoringAlgorithm() {
        let best = { element: document.body, score: -Infinity, info: 'body' };

        document.querySelectorAll('div, section').forEach(el => {
            let score = 0;
            const className = (el.className || '').toLowerCase();
            const id = (el.id || '').toLowerCase();

            el.querySelectorAll('p').forEach(p => {
                const len = p.innerText.trim().length;
                score += len > 100 ? 10 : len > 50 ? 5 : len > 20 ? 2 : 0;
            });
            score += el.querySelectorAll('h1, h2, h3').length * 3;
            NOISE_INDICATORS.forEach(n => { if (className.includes(n) || id.includes(n)) score -= 50; });
            if ((el.innerText || '').length < 500) score -= 30;

            if (score > best.score) best = { element: el, score, info: (className || id).substring(0, 30) };
        });

        console.log('[VERITAS] Scoring:', best.info, best.score);
        return { element: best.element, method: 'scoring', selector: best.info };
    }

    function cleanContainer(container) {
        const clone = container.cloneNode(true);
        NOISE_SELECTORS.forEach(sel => {
            try { clone.querySelectorAll(sel).forEach(el => el.remove()); } catch (e) { }
        });
        return clone;
    }

    function extractText(container) {
        const clean = cleanContainer(container);
        const texts = [];
        clean.querySelectorAll('p').forEach(p => {
            const t = p.innerText.trim();
            if (t.length > 30) texts.push(t);
        });
        return texts.length > 0 ? texts.join('\n\n') : clean.innerText.replace(/\s+/g, ' ').trim();
    }

    function extractLinks(container) {
        const clean = cleanContainer(container);
        const links = [], seen = new Set();
        const host = window.location.hostname.replace(/^www\./, '');

        clean.querySelectorAll('a[href]').forEach(a => {
            const href = a.href;
            if (seen.has(href) || !href.startsWith('http')) return;
            try {
                const linkHost = new URL(href).hostname.replace(/^www\./, '');
                if (linkHost === host || host.endsWith(linkHost) || linkHost.endsWith(host)) return;
                if (SOCIAL_DOMAINS.some(d => linkHost.includes(d))) return;
                seen.add(href);
                links.push({ url: href, text: (a.innerText || '').trim().substring(0, 200), domain: linkHost });
            } catch (e) { }
        });

        console.log('[VERITAS] Links:', links.length);
        return links;
    }

    function extractHeadline() {
        const sels = ['h1[itemprop="headline"]', 'article h1', '.article-title', '.post-title', '.headline', 'h1'];
        for (const sel of sels) {
            try {
                const el = document.querySelector(sel);
                if (el) {
                    const t = el.innerText.trim();
                    if (t.length > 10 && t.length < 500) return t;
                }
            } catch (e) { }
        }
        return document.title.split('|')[0].split('-')[0].split('—')[0].trim();
    }

    function extractArticleData() {
        console.log('[VERITAS] Extracting from', window.location.hostname);
        try {
            const { element, method, selector } = findMainContent();
            const headline = extractHeadline();
            const text = extractText(element);
            const links = extractLinks(element);
            const wordCount = text.split(/\s+/).filter(w => w.length > 2).length;

            console.log('[VERITAS] Result:', { method, wordCount, links: links.length });

            if (wordCount < 50) throw new Error('Text too short');

            return {
                success: true,
                data: { url: window.location.href, headline, text, html: cleanContainer(element).innerHTML, links, wordCount }
            };
        } catch (e) {
            console.error('[VERITAS] Error:', e);
            return { success: false, error: e.message };
        }
    }


    // =============================================================================
    // AGGRESSIVE FUZZY HIGHLIGHTING
    // =============================================================================

    function applyHighlights(highlights) {
        if (!highlights || highlights.length === 0) {
            console.log('[VERITAS] No highlights');
            return { applied: 0 };
        }

        console.log('[VERITAS] Applying', highlights.length, 'highlights');
        let applied = 0;

        // Collect ALL text nodes
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: (node) => {
                const p = node.parentElement;
                if (!p) return NodeFilter.FILTER_REJECT;
                const tag = p.tagName.toLowerCase();
                if (['script', 'style', 'noscript', 'textarea', 'input'].includes(tag)) return NodeFilter.FILTER_REJECT;
                if (p.classList.contains('veritas-highlight')) return NodeFilter.FILTER_REJECT;
                return node.nodeValue.trim().length > 3 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        });

        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        console.log('[VERITAS] Found', nodes.length, 'text nodes');

        for (const h of highlights) {
            const searchClean = clean(h.text);
            if (searchClean.length < 8) continue;

            // Take first 40 chars for fuzzy match
            const searchShort = searchClean.substring(0, 40);
            console.log('[VERITAS] Searching:', searchShort);

            for (const node of nodes) {
                const nodeClean = clean(node.nodeValue);

                if (nodeClean.includes(searchShort)) {
                    console.log('[VERITAS] MATCH FOUND!', node.nodeValue.substring(0, 50));

                    try {
                        // Find position in original text
                        const origLower = node.nodeValue.toLowerCase().replace(/\s+/g, ' ');
                        const searchWords = searchShort.split(' ').slice(0, 3).join(' ');
                        let idx = origLower.indexOf(searchWords);

                        if (idx === -1) idx = 0; // Fallback to start

                        const matchLen = Math.min(h.text.length, node.nodeValue.length - idx, 80);

                        if (matchLen > 5 && idx + matchLen <= node.nodeValue.length) {
                            const range = document.createRange();
                            range.setStart(node, idx);
                            range.setEnd(node, idx + matchLen);

                            const span = document.createElement('span');
                            span.className = `veritas-highlight veritas-${h.severity || 'warning'}`;
                            span.title = `VERITAS: ${h.reason || h.severity || 'Issue'}`;

                            // AGGRESSIVE STYLES with !important
                            if (h.severity === 'risk') {
                                span.style.cssText = 'background-color: #ff8a80 !important; color: black !important; padding: 2px 4px !important; border-radius: 3px !important;';
                            } else {
                                span.style.cssText = 'background-color: #fff176 !important; color: black !important; padding: 2px 4px !important; border-radius: 3px !important;';
                            }

                            range.surroundContents(span);
                            applied++;
                            console.log('[VERITAS] Highlighted:', h.severity);
                            break;
                        }
                    } catch (e) {
                        console.warn('[VERITAS] Wrap failed:', e.message);
                    }
                }
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

    // Inject Coffee Edition styles for tooltip
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
            
            .veritas-tooltip__icon {
                font-size: 18px !important;
            }
            
            .veritas-tooltip__title {
                font-size: 14px !important;
                font-weight: 600 !important;
                font-family: 'Playfair Display', serif !important;
                font-style: italic !important;
                margin: 0 !important;
                line-height: 1.3 !important;
            }
            
            .veritas-tooltip__title--warning {
                color: #C58940 !important;
                background: rgba(197, 137, 64, 0.1) !important;
                padding: 4px 8px !important;
                border-radius: 4px !important;
            }
            
            .veritas-tooltip__title--risk {
                color: #8D2D24 !important;
                background: rgba(141, 45, 36, 0.1) !important;
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
            
            .veritas-tooltip__tip {
                font-size: 12px !important;
                color: #795548 !important;
                background: rgba(255,255,255,0.6) !important;
                padding: 8px 10px !important;
                border-radius: 8px !important;
                margin: 0 !important;
                line-height: 1.4 !important;
            }
            
            .veritas-tooltip__tip-icon {
                margin-right: 4px !important;
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

    // Category display names (clean, no emojis - professional look)
    const CATEGORY_LABELS = {
        'emotional_manipulation': 'Emotional Manipulation',
        'unverified_claim': 'Unverified Claim',
        'source_contradiction': 'Source Contradiction',
        'logical_fallacy': 'Logical Fallacy',
        'clickbait': 'Clickbait'
    };

    function createTooltip(highlight, targetElement) {
        removeTooltip(); // Remove any existing tooltip
        injectTooltipStyles();

        console.log('[VERITAS Tooltip] Creating with data:', highlight);

        const tooltip = document.createElement('div');
        tooltip.className = 'veritas-tooltip';
        tooltip.id = 'veritas-active-tooltip';

        const isRisk = highlight.severity === 'risk';
        const categoryLabel = CATEGORY_LABELS[highlight.category] || CATEGORY_LABELS['unverified_claim'];

        tooltip.innerHTML = `
            <div class="veritas-tooltip__header">
                <span class="veritas-tooltip__title veritas-tooltip__title--${highlight.severity}">${categoryLabel}</span>
            </div>
            <div class="veritas-tooltip__body">
                <p class="veritas-tooltip__explanation">${highlight.explanation || 'This content has been flagged for review.'}</p>
                <p class="veritas-tooltip__tip">
                    <strong>Tip:</strong> ${highlight.recommendation || 'Verify this information with trusted sources.'}
                </p>
            </div>
            <div class="veritas-tooltip__footer">
                <button class="veritas-tooltip__btn" id="veritas-dismiss-btn">Dismiss</button>
            </div>
            <div class="veritas-tooltip__arrow"></div>
        `;

        document.body.appendChild(tooltip);

        // Position tooltip
        positionTooltip(tooltip, targetElement);

        // Dismiss button
        tooltip.querySelector('#veritas-dismiss-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            removeTooltip();
        });

        // Close on click outside
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

        // Calculate horizontal center
        let left = targetRect.left + scrollX + (targetRect.width / 2) - (tooltipRect.width / 2);

        // Keep within viewport
        const padding = 10;
        if (left < padding) left = padding;
        if (left + tooltipRect.width > window.innerWidth - padding) {
            left = window.innerWidth - tooltipRect.width - padding;
        }

        // Position above or below based on space
        const spaceAbove = targetRect.top;
        const spaceBelow = window.innerHeight - targetRect.bottom;

        let top;
        if (spaceAbove > tooltipRect.height + 20 || spaceAbove > spaceBelow) {
            // Position above
            top = targetRect.top + scrollY - tooltipRect.height - 10;
            arrow.className = 'veritas-tooltip__arrow veritas-tooltip__arrow--top';
        } else {
            // Position below
            top = targetRect.bottom + scrollY + 10;
            arrow.className = 'veritas-tooltip__arrow veritas-tooltip__arrow--bottom';
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;

        // Position arrow horizontally
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

    // Add click listeners to highlights
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

    // Scroll to highlight with pulse
    function scrollToHighlight(index) {
        const highlights = document.querySelectorAll('.veritas-highlight');
        if (index < 0 || index >= highlights.length) return false;

        const target = highlights[index];
        if (!target) return false;

        // Scroll into view
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Add pulse animation
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
                    // Store highlights globally
                    window.__VERITAS_HIGHLIGHTS__ = request.highlights || [];
                    const result = applyHighlights(request.highlights);
                    // Setup click handlers after applying
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
