/**
 * @fileoverview State manager for extraction tasks
 * Encapsulates extraction state and provides clean interface
 */
import { STORAGE_KEYS } from '../../shared/constants/limits.js';

/**
 * Manages extraction state
 */
export class StateManager {
  constructor() {
    this._reset();
  }

  /**
   * Reset state to initial values
   * @private
   */
  _reset() {
    this.state = {
      isRunning: false,
      jobs: [],
      currentIndex: 0,
      results: [],
      errors: [],
      startTime: null,
      cancelRequested: false
    };
  }

  /**
   * Initialize new extraction task
   * @param {Array} jobs - Jobs to extract
   */
  start(jobs) {
    this._reset();
    this.state.isRunning = true;
    this.state.jobs = jobs;
    this.state.startTime = Date.now();
  }

  /**
   * Mark extraction as complete
   */
  complete() {
    this.state.isRunning = false;
  }

  /**
   * Request cancellation
   */
  cancel() {
    this.state.cancelRequested = true;
  }

  /**
   * Check if cancellation was requested
   * @returns {boolean}
   */
  isCancelled() {
    return this.state.cancelRequested;
  }

  /**
   * Update current job index
   * @param {number} index - Current index
   */
  setCurrentIndex(index) {
    this.state.currentIndex = index;
  }

  /**
   * Add successful result
   * @param {Object} result - Extraction result
   */
  addResult(result) {
    this.state.results.push(result);
  }

  /**
   * Add error
   * @param {Object} job - Job that failed
   * @param {string} error - Error message
   */
  addError(job, error) {
    this.state.errors.push({ job, error });
  }

  /**
   * Get current state snapshot
   * @returns {Object} Current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Check if extraction is running
   * @returns {boolean}
   */
  isRunning() {
    return this.state.isRunning;
  }

  /**
   * Get current job
   * @returns {Object|null}
   */
  getCurrentJob() {
    return this.state.jobs[this.state.currentIndex] || null;
  }

  /**
   * Get extraction duration in seconds
   * @returns {number}
   */
  getDuration() {
    if (!this.state.startTime) return 0;
    return Math.round((Date.now() - this.state.startTime) / 1000);
  }

  /**
   * Get progress statistics
   * @returns {Object} Progress info
   */
  getProgress() {
    return {
      current: this.state.currentIndex,
      total: this.state.jobs.length,
      success: this.state.results.length,
      errors: this.state.errors.length,
      duration: this.getDuration()
    };
  }

  /**
   * Save final result to storage
   * @param {Object} result - Result to save
   */
  async saveToStorage(result) {
    await chrome.storage.local.set({
      [STORAGE_KEYS.LAST_EXTRACTION]: result,
      [STORAGE_KEYS.EXTRACTION_STATUS]: 'completed'
    });
  }

  /**
   * Load result from storage
   * @returns {Promise<Object|null>}
   */
  async loadFromStorage() {
    const stored = await chrome.storage.local.get([
      STORAGE_KEYS.LAST_EXTRACTION,
      STORAGE_KEYS.EXTRACTION_STATUS
    ]);
    
    if (stored[STORAGE_KEYS.EXTRACTION_STATUS] === 'completed') {
      return stored[STORAGE_KEYS.LAST_EXTRACTION];
    }
    return null;
  }
}
