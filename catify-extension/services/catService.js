/**
 * Catify — Cat Service
 *
 * Generates random cat image URLs from the Cataas public API.
 * Loaded before content.js so CatService is available when replacement runs.
 */

'use strict';

/** Base endpoint — each request with a unique query param returns a different cat. */
const CATAAS_ENDPOINT = 'https://cataas.com/cat';

/**
 * @namespace CatService
 */
const CatService = {
  /**
   * Returns a unique random cat image URL.
   * Appends a random query parameter to bypass browser/CDN caching.
   *
   * @returns {string} A cataas.com URL pointing to a random cat image.
   */
  getRandomCat() {
    const cacheBuster = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    return `${CATAAS_ENDPOINT}?random=${cacheBuster}`;
  }
};

// Expose globally for content script access (no module bundler)
if (typeof window !== 'undefined') {
  window.CatService = CatService;
}
