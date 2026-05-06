# Boss直聘JD提取器 — AGENTS.md

**Generated:** 2026-02-25
**Type:** Chrome Extension (Manifest V3)
**Language:** Vanilla JavaScript

## OVERVIEW

Chrome extension that extracts job descriptions from Boss直聘 (zhipin.com) and exports as Markdown. Supports both single job detail pages and batch extraction from job list pages.

## ARCHITECTURE

```
boss-jd-extractor/
├── manifest.json      # Extension manifest (MV3)
├── content.js         # Content script: DOM scraping
├── background.js      # Service worker: batch processing
├── popup.html/js      # Extension popup UI
├── icon*.png/svg      # Extension icons
└── install.sh         # Installation helper
```

**3-Component Design:**
1. **Content Script** (`content.js`) — Injected into zhipin.com pages, handles DOM extraction
2. **Background Worker** (`background.js`) — Service worker for async batch job processing
3. **Popup UI** (`popup.html/js`) — User interface for triggering extraction

## WHERE TO LOOK

| Task | File | Function |
|------|------|----------|
| Add new field extraction | `content.js` | `extractJD()` or `extractJobList()` |
| Change markdown format | `content.js` | `generateMarkdown()` / `generateListMarkdown()` |
| Modify UI flow | `popup.js` | `startExtraction()`, `updateUI()` |
| Adjust batch timing | `background.js` | `randomDelay()` (2-5s anti-crawl) |
| Add permissions | `manifest.json` | `permissions` / `host_permissions` |

## KEY PATTERNS

### DOM Scraping Strategy
- **Multi-selector fallback**: Try 5-10 selectors, use first match (see `jobNameSelectors`, `companySelectors`)
- **Content filtering**: Explicit exclude lists for benefit tags, salary text (see `isBenefitTag()`)
- **Page type detection**: URL + element checks in `getPageType()`

### Message Flow
```
popup.js → content.js (extract single page)
popup.js → background.js (batch extract)
background.js → tabs.create() + content.js (per job)
chrome.storage.local (persist results across popup close)
```

### State Management
- `extractionState` in `background.js` — tracks batch progress
- `chrome.storage.local` — persists results for download after popup closes

## ANTI-PATTERNS (AVOID)

- **No async/await in content script message handlers** — must return `true` to keep channel open
- **Don't shorten delays below 2s** — will trigger anti-bot measures
- **Never assume selector exists** — always check null + use fallback chain
- **Don't store large data in memory** — use `chrome.storage.local` for job lists

## CONVENTIONS

- Chinese UI labels in popup
- 2-space indentation
- Single quotes for strings
- SVG icons embedded inline in HTML/CSS
- No build tools — pure vanilla JS

## TESTING

Manual test flow:
1. Load extension in `chrome://extensions/` (dev mode)
2. Test single job: Open `/job_detail/` page → extract → download
3. Test batch: Open `/web/geek/jobs` → extract (opens tabs in background) → download
4. Verify cancel button works during batch extraction
