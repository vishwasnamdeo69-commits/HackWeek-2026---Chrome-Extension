/**
 * Catify — Cat Service
 *
 * Abstraction layer for fetching random cat image URLs from public APIs.
 * Loaded before content.js so the service is available when replacement logic is added.
 *
 * Phase 1: Foundation only — no API calls or fetch() yet.
 *
 * Phase 2 will integrate with:
 *   - https://cataas.com/cat
 *   - https://api.thecatapi.com/v1/images/search
 */

'use strict';

/**
 * Placeholder namespace for future cat image operations.
 * @namespace CatService
 */
const CatService = {
  /**
   * Returns a random cat image URL.
   * @returns {string} Placeholder — real implementation in Phase 2.
   */
  getRandomCatUrl() {
    return '';
  }
};

// Expose globally for content script access (no module bundler in Phase 1)
if (typeof window !== 'undefined') {
  window.CatService = CatService;
}
