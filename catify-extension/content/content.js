/**
 * Catify — Content Script
 *
 * Injected into every webpage matched by manifest.json.
 * Phase 2: Replaces all existing <img> elements with random cat images on page load.
 *
 * Phase 3 will add MutationObserver for dynamically loaded images.
 */

'use strict';

/**
 * Returns true if the element is a replaceable image.
 * @param {Element} img
 * @returns {boolean}
 */
function isValidImage(img) {
  if (!(img instanceof HTMLImageElement)) {
    return false;
  }
  if (!img.isConnected) {
    return false;
  }
  if (img.dataset.catifyProcessed === 'true') {
    return false;
  }
  return true;
}

/**
 * Locks the current rendered size so layout does not shift after src swap.
 * @param {HTMLImageElement} img
 */
function preserveDimensions(img) {
  const rect = img.getBoundingClientRect();

  if (rect.width > 0) {
    img.style.width = `${rect.width}px`;
  }
  if (rect.height > 0) {
    img.style.height = `${rect.height}px`;
  }
}

/**
 * Replaces a single image src with a random cat URL.
 * @param {HTMLImageElement} img
 */
function replaceImage(img) {
  if (!isValidImage(img)) {
    return;
  }

  try {
    const catUrl = CatService.getRandomCat();

    if (!catUrl) {
      console.warn('[Catify] Failed replacing image: no cat URL returned', img);
      return;
    }

    preserveDimensions(img);

    // Prevent responsive srcset from overriding the new src
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');

    img.src = catUrl;
    img.dataset.catifyProcessed = 'true';

    console.log('[Catify] Replaced image', img);
  } catch (error) {
    console.warn('[Catify] Failed replacing image', img, error);
  }
}

/**
 * Finds and replaces every existing <img> on the page.
 */
function replaceAllImages() {
  const images = document.querySelectorAll('img');

  console.log(`[Catify] Found ${images.length} image(s) on page`);

  for (const img of images) {
    replaceImage(img);
  }
}

/**
 * Entry point — waits until the page has fully loaded before replacing images.
 */
function init() {
  console.log('[Catify] Content script loaded on:', window.location.href);
  replaceAllImages();
}

// manifest.json uses run_at: document_idle; also wait for the load event
// so images present at full page load (including late-parsed ones) are captured.
if (document.readyState === 'complete') {
  init();
} else {
  window.addEventListener('load', init, { once: true });
}
