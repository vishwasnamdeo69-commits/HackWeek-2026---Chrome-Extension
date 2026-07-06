/**
 * Catify — Content Script
 *
 * Injected into every webpage matched by manifest.json.
 * Phase 2: Replaces all existing <img> elements with random cat images on page load.
 * Phase 3: MutationObserver watches for dynamically added <img> elements.
 * Phase 4: Attribute observation, <picture> support, and debounce for modern SPAs.
 */

'use strict';

/** Debounce window for dynamic replacements (ms). */
const DEBOUNCE_MS = 75;

/** @type {Map<HTMLImageElement, number>} Pending debounced replacements. */
const pendingReplacements = new Map();

/**
 * Returns true if a URL points to the Catify cat API.
 * @param {string} url
 * @returns {boolean}
 */
function isCatifyUrl(url) {
  return typeof url === 'string' && url.includes('cataas.com/cat');
}

/**
 * Returns true if the element is a replaceable image.
 * @param {Element} img
 * @param {{ allowReprocess?: boolean }} [options]
 * @returns {boolean}
 */
function isValidImage(img, options = {}) {
  const allowReprocess = options.allowReprocess === true;

  if (!(img instanceof HTMLImageElement)) {
    return false;
  }
  if (!img.isConnected) {
    return false;
  }
  if (img.dataset.catifyProcessing === 'true') {
    return false;
  }
  if (img.dataset.catifyProcessed === 'true') {
    return allowReprocess;
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
 * Clears responsive attributes from sibling <source> elements inside a <picture>.
 * Prevents <picture> from overriding the replaced <img> src.
 * @param {HTMLImageElement} img
 */
function clearPictureSources(img) {
  const picture = img.closest('picture');
  if (!picture) {
    return;
  }

  for (const source of picture.querySelectorAll('source')) {
    source.removeAttribute('srcset');
    source.removeAttribute('sizes');
  }
}

/**
 * Schedules a debounced replacement for dynamically changing images.
 * @param {HTMLImageElement} img
 * @param {{ dynamic?: boolean, allowReprocess?: boolean }} [options]
 */
function scheduleReplaceImage(img, options = {}) {
  const existingTimeout = pendingReplacements.get(img);
  if (existingTimeout !== undefined) {
    clearTimeout(existingTimeout);
  }

  const timeoutId = window.setTimeout(() => {
    pendingReplacements.delete(img);
    replaceImage(img, { dynamic: true, ...options });
  }, DEBOUNCE_MS);

  pendingReplacements.set(img, timeoutId);
}

/**
 * Replaces a single image src with a random cat URL.
 * @param {HTMLImageElement} img
 * @param {{ dynamic?: boolean, allowReprocess?: boolean }} [options]
 */
function replaceImage(img, options = {}) {
  const dynamic = options.dynamic === true;
  const allowReprocess = options.allowReprocess === true;

  if (!isValidImage(img, { allowReprocess })) {
    return;
  }

  try {
    img.dataset.catifyProcessing = 'true';

    const catUrl = CatService.getRandomCat();

    if (!catUrl) {
      console.warn('[Catify] Failed replacing image: no cat URL returned', img);
      return;
    }

    preserveDimensions(img);
    clearPictureSources(img);

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
  } finally {
    delete img.dataset.catifyProcessing;
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
    scheduleReplaceImage(node);
    return;
  }

  const images = node.querySelectorAll('img');
  for (const img of images) {
    console.log('[Catify] New image found', img);
    scheduleReplaceImage(img);
  }
}

/**
 * Handles attribute changes on existing <img> elements (e.g. lazy-loaded src updates).
 * @param {MutationRecord} mutation
 */
function processAttributeChange(mutation) {
  const target = mutation.target;

  if (!(target instanceof HTMLImageElement)) {
    return;
  }

  if (target.dataset.catifyProcessing === 'true') {
    return;
  }

  // Ignore src mutations caused by our own replacement
  if (mutation.attributeName === 'src' && isCatifyUrl(target.getAttribute('src'))) {
    return;
  }

  console.log('[Catify] Image attribute changed', mutation.attributeName, target);
  scheduleReplaceImage(target, { allowReprocess: true });
}

/**
 * Handles MutationObserver callbacks — child additions and attribute changes only.
 * @param {MutationRecord[]} mutations
 */
function handleMutations(mutations) {
  console.log('[Catify] Mutation detected');

  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      for (const node of mutation.addedNodes) {
        try {
          processAddedNode(node);
        } catch (error) {
          console.warn('[Catify] Failed processing added node', node, error);
        }
      }
    } else if (mutation.type === 'attributes') {
      try {
        processAttributeChange(mutation);
      } catch (error) {
        console.warn('[Catify] Failed processing attribute change', mutation.target, error);
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
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'srcset', 'sizes']
  });

  console.log('[Catify] MutationObserver started (childList + attributes)');
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
