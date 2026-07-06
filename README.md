# Catify

**Replace every image on the web with random cats.**

Catify is a Chrome Extension built with Manifest V3 that transforms any webpage by swapping every `<img>` element with a random cat image fetched from a public API. Built for HackWeek 26.

> **Phase 1 (current):** Project foundation — manifest, folder structure, and placeholder scripts. No image replacement yet.

---

## Features

| Feature | Status |
|---------|--------|
| Manifest V3 configuration | ✅ Ready |
| Content script injection on all URLs | ✅ Ready |
| Replace all existing images | 🔜 Planned |
| Handle dynamically loaded images (MutationObserver) | 🔜 Planned |
| Random cat images via public API | 🔜 Planned |
| Graceful offline / API failure handling | 🔜 Planned |

---

## Folder Structure

```
catify-extension/
│
├── manifest.json          # Extension configuration (MV3)
│
├── content/
│   └── content.js         # Content script — runs on every page
│
├── services/
│   └── catService.js      # Cat API abstraction layer
│
├── assets/
│   ├── icon16.png         # Toolbar icon
│   ├── icon48.png         # Extensions management page
│   └── icon128.png        # Chrome Web Store / install dialog
│
├── README.md
└── LICENSE
```

Future phases may add `popup/`, `background/`, and `options/` directories.

---

## Installation

### Prerequisites

- [Google Chrome](https://www.google.com/chrome/) (version 88+ recommended for full MV3 support)

### Load via Developer Mode

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked**.
5. Select the `catify-extension` folder (the directory containing `manifest.json`).
6. Confirm Catify appears in your extensions list with no errors.

### Verify Phase 1

1. With Catify enabled, open any website (e.g. `https://google.com`).
2. Open DevTools → **Console** tab.
3. You should see: `[Catify] Content script loaded on: <url>`
4. Images on the page should **not** change yet — that is expected for Phase 1.

---

## Technologies Used

- **JavaScript (ES6+)** — Content scripts and service layer
- **Chrome Extension Manifest V3** — Modern extension platform
- **Content Scripts** — Page-level script injection
- **Public Cat APIs** *(Phase 2)* — [Cataas](https://cataas.com/) / [The Cat API](https://thecatapi.com/)

---

## Roadmap

### Phase 1 — Foundation *(current)*

- [x] Project structure
- [x] Manifest V3 configuration
- [x] Content script registration for all URLs
- [x] Placeholder icons and service module
- [x] README and LICENSE

### Phase 2 — Core Replacement

- [ ] Detect all `<img>` elements on page load
- [ ] Fetch random cat URLs via `catService.js`
- [ ] Replace image `src` attributes
- [ ] Add `MutationObserver` for dynamically loaded images
- [ ] Deduplicate replacements to avoid re-processing the same image

### Phase 3 — Polish

- [ ] Offline / API error handling
- [ ] Performance optimization for large pages
- [ ] Demo video and final testing across major sites

---

## License

MIT — see [LICENSE](LICENSE).
