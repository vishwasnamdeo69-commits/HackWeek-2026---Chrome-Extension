/**
 * Catify — Content Script
 *
 * Injected into every webpage matched by manifest.json.
 * Phase 1: Foundation only — confirms the script loads successfully.
 *
 * Phase 2 will implement:
 *   - querySelectorAll('img') to detect images
 *   - Delegation to catService for random cat URLs
 *   - src replacement on each image element
 *   - MutationObserver for dynamically loaded images
 */

'use strict';

console.log('[Catify] Content script loaded on:', window.location.href);
