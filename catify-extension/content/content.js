/**
 * Catify — Content Script
 *
 * Injected into every webpage matched by manifest.json.
 * Phase 2: Replaces all existing <img> elements with random cat images on page load.
 * Phase 3: MutationObserver watches for dynamically added <img> elements.
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

/** @type {MutationObserver|null} Single observer instance for the page lifetime. */
let mutationObserver = null;

/**
 * Replaces a single image src with a random cat URL.
 * @param {HTMLImageElement} img
 * @param {{ dynamic?: boolean }} [options]
 */
function replaceImage(img, options = {}) {
  const dynamic = options.dynamic === true;
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

    console.log(
      dynamic ? '[Catify] Dynamic image replaced' : '[Catify] Replaced image',
      img
    );
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
 * Processes a single added DOM node — only inspects the node itself, not the full document.
 * @param {Node} node
 */
function processAddedNode(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  if (node instanceof HTMLImageElement) {
    console.log('[Catify] New image found', node);
    replaceImage(node, { dynamic: true });
    return;
  }

  const images = node.querySelectorAll('img');
  for (const img of images) {
    console.log('[Catify] New image found', img);
    replaceImage(img, { dynamic: true });
  }
}

/**
 * Handles MutationObserver callbacks — iterates only over newly added nodes.
 * @param {MutationRecord[]} mutations
 */
function handleMutations(mutations) {
  console.log('[Catify] Mutation detected');

  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      try {
        processAddedNode(node);
      } catch (error) {
        console.warn('[Catify] Failed processing added node', node, error);
      }
    }
  }
}

/**
 * Starts a single MutationObserver on document.body for dynamically added images.
 */
function startMutationObserver() {
  if (mutationObserver || !document.body) {
    return;
  }

  mutationObserver = new MutationObserver(handleMutations);
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('[Catify] MutationObserver started');
}

/**
 * Entry point — waits until the page has fully loaded before replacing images.
 */
function init() {
  console.log('[Catify] Content script loaded on:', window.location.href);
  replaceAllImages();
  startMutationObserver();
}

// manifest.json uses run_at: document_idle; also wait for the load event
// so images present at full page load (including late-parsed ones) are captured.
if (document.readyState === 'complete') {
  init();
} else {
  window.addEventListener('load', init, { once: true });
}
