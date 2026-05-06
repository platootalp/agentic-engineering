/**
 * @fileoverview Action buttons component for popup UI
 */

/**
 * Manages action buttons (extract, cancel, download)
 */
export class ActionButtons {
  constructor() {
    this.extractBtn = document.getElementById('extractBtn');
    this.cancelBtn = document.getElementById('cancelBtn');
    this.downloadBtn = document.getElementById('downloadBtn');
    
    this._setupIcons();
  }

  /**
   * Setup button icons
   * @private
   */
  _setupIcons() {
    this.icons = {
      download: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>`,
      refresh: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M23 4v6h-6"/>
        <path d="M1 20v-6h6"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>`
    };
  }

  /**
   * Show extract button (initial state)
   */
  showExtract() {
    this.extractBtn.classList.remove('hidden');
    this.extractBtn.disabled = false;
    this.extractBtn.innerHTML = `${this.icons.download} Start Extraction`;
    this.cancelBtn.classList.add('hidden');
    this.downloadBtn.classList.add('hidden');
  }

  /**
   * Show cancel button during extraction
   */
  showCancel() {
    this.extractBtn.classList.add('hidden');
    this.cancelBtn.classList.remove('hidden');
    this.downloadBtn.classList.add('hidden');
  }

  /**
   * Show completed state (re-extract + download)
   */
  showCompleted() {
    this.extractBtn.classList.remove('hidden');
    this.extractBtn.innerHTML = `${this.icons.refresh} Re-extract`;
    this.cancelBtn.classList.add('hidden');
    this.downloadBtn.classList.remove('hidden');
  }

  /**
   * Enable extract button
   */
  enableExtract() {
    this.extractBtn.disabled = false;
  }

  /**
   * Disable extract button
   */
  disableExtract() {
    this.extractBtn.disabled = true;
  }

  /**
   * Bind click handlers
   * @param {Object} handlers - Handler functions
   * @param {Function} handlers.onExtract - Extract button handler
   * @param {Function} handlers.onCancel - Cancel button handler
   * @param {Function} handlers.onDownload - Download button handler
   */
  bindHandlers(handlers) {
    this.extractBtn.addEventListener('click', handlers.onExtract);
    this.cancelBtn.addEventListener('click', handlers.onCancel);
    this.downloadBtn.addEventListener('click', handlers.onDownload);
  }
}
