/**
 * @fileoverview Status display component for popup UI
 */

/**
 * UI state types
 */
export const UIState = {
  IDLE: 'idle',
  EXTRACTING: 'extracting',
  COMPLETED: 'completed',
  ERROR: 'error'
};

/**
 * Manages status display UI
 */
export class StatusDisplay {
  constructor() {
    this.statusBox = document.getElementById('statusBox');
    this.statusText = document.getElementById('statusText');
    this.progressBar = document.getElementById('progressBar');
    this.progressFill = document.getElementById('progressFill');
    this.resultInfo = document.getElementById('resultInfo');
    this.resultDetails = document.getElementById('resultDetails');
    this.currentState = UIState.IDLE;
  }

  /**
   * Show idle state
   * @param {string} [message] - Optional message
   */
  showIdle(message = 'Ready to extract') {
    this.currentState = UIState.IDLE;
    this._resetClasses();
    this.statusBox.classList.add('status-idle');
    this.statusText.textContent = message;
    this._hideProgress();
    this._hideResult();
  }

  /**
   * Show extracting state
   * @param {string} message - Status message
   * @param {number} [progress=0] - Progress percentage
   */
  showExtracting(message, progress = 0) {
    this.currentState = UIState.EXTRACTING;
    this._resetClasses();
    this.statusBox.classList.add('status-extracting');
    this.statusText.textContent = message;
    this._showProgress(progress);
    this._hideResult();
  }

  /**
   * Show completed state
   * @param {string} details - Result details
   */
  showCompleted(details) {
    this.currentState = UIState.COMPLETED;
    this._resetClasses();
    this.statusBox.classList.add('status-success');
    this.statusText.textContent = 'Extraction complete!';
    this._hideProgress();
    this._showResult(details);
  }

  /**
   * Show error state
   * @param {string} message - Error message
   */
  showError(message) {
    this.currentState = UIState.ERROR;
    this._resetClasses();
    this.statusBox.classList.add('status-error');
    this.statusText.textContent = message;
    this._hideProgress();
    this._hideResult();
  }

  /**
   * Update progress bar
   * @param {number} progress - Progress percentage (0-100)
   */
  updateProgress(progress) {
    if (this.progressFill) {
      this.progressFill.style.width = progress + '%';
    }
  }

  /**
   * Get current UI state
   * @returns {string} Current state
   */
  getState() {
    return this.currentState;
  }

  /**
   * Reset CSS classes
   * @private
   */
  _resetClasses() {
    this.statusBox.className = 'status-box';
  }

  /**
   * Show progress bar
   * @private
   */
  _showProgress(progress) {
    this.progressBar.classList.remove('hidden');
    this.updateProgress(progress);
  }

  /**
   * Hide progress bar
   * @private
   */
  _hideProgress() {
    this.progressBar.classList.add('hidden');
  }

  /**
   * Show result info
   * @private
   */
  _showResult(details) {
    this.resultInfo.classList.remove('hidden');
    this.resultDetails.textContent = details;
  }

  /**
   * Hide result info
   * @private
   */
  _hideResult() {
    this.resultInfo.classList.add('hidden');
  }
}
