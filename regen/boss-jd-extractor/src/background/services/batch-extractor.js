/**
 * @fileoverview Batch extraction service
 * Coordinates extraction of multiple jobs
 */
import { StateManager } from './state-manager.js';
import { TabManager } from './tab-manager.js';
import { randomDelay, delay } from '../utils/delay.js';
import { DELAYS } from '../../shared/constants/limits.js';
import { generateBatchMarkdown } from '../../content/transformers/markdown-generator.js';

/**
 * Broadcast progress to popup
 * @param {string} status - Status type
 * @param {Object} data - Progress data
 */
function broadcastProgress(status, data) {
  const message = {
    action: 'extractionProgress',
    status,
    ...data
  };

  chrome.runtime.sendMessage(message).catch(() => {
    // Popup may be closed, ignore error
  });
}

/**
 * Batch extraction coordinator
 */
export class BatchExtractor {
  constructor() {
    this.stateManager = new StateManager();
    this.tabManager = new TabManager();
  }

  /**
   * Execute batch extraction
   * @param {Array} jobs - Jobs to extract
   * @param {string} pageUrl - Source page URL
   * @returns {Promise<Object>} Extraction results
   */
  async extract(jobs, pageUrl) {
    if (this.stateManager.isRunning()) {
      throw new Error('Extraction already in progress');
    }

    this.stateManager.start(jobs);

    broadcastProgress('started', {
      total: jobs.length,
      message: 'Starting batch extraction...'
    });

    try {
      for (let i = 0; i < jobs.length; i++) {
        if (this.stateManager.isCancelled()) {
          broadcastProgress('cancelled', { message: 'Cancelled' });
          break;
        }

        const job = jobs[i];
        this.stateManager.setCurrentIndex(i);

        broadcastProgress('progress', {
          current: i + 1,
          total: jobs.length,
          jobName: job.jobName,
          message: `Extracting ${i + 1}/${jobs.length}: ${job.jobName}`
        });

        await this._extractSingleJob(job);

        // Add delay between jobs (except last)
        if (i < jobs.length - 1 && !this.stateManager.isCancelled()) {
          broadcastProgress('waiting', {
            message: 'Waiting...',
            current: i + 1,
            total: jobs.length
          });
          await randomDelay();
        }
      }

      return await this._finalize(pageUrl);

    } catch (error) {
      console.error('[BatchExtractor] Extraction failed:', error);
      throw error;
    } finally {
      await this.tabManager.cleanup();
    }
  }

  /**
   * Extract single job
   * @private
   * @param {Object} job - Job to extract
   */
  async _extractSingleJob(job) {
    let tab = null;

    try {
      // Create tab and wait for load
      tab = await this.tabManager.createTab(job.url);
      await delay(DELAYS.DYNAMIC_CONTENT_WAIT);

      // Inject content script
      await this.tabManager.injectContentScript(tab.id);
      await delay(DELAYS.SCRIPT_INJECTION_WAIT);

      // Extract data
      const response = await this.tabManager.extractFromTab(tab.id);

      if (response && response.success) {
        this.stateManager.addResult({
          ...job,
          detail: response.data,
          detailMarkdown: response.markdown
        });
      } else {
        throw new Error(response?.error || 'Extraction failed');
      }

    } catch (error) {
      console.error(`[BatchExtractor] Failed to extract ${job.jobName}:`, error);
      this.stateManager.addError(job, error.message);
      // Still add basic job info
      this.stateManager.addResult(job);
    } finally {
      if (tab) {
        await this.tabManager.closeTab(tab.id);
      }
    }
  }

  /**
   * Finalize extraction and save results
   * @private
   * @param {string} pageUrl - Source page URL
   * @returns {Object} Final results
   */
  async _finalize(pageUrl) {
    this.stateManager.complete();

    const state = this.stateManager.getState();
    const progress = this.stateManager.getProgress();

    const finalResult = {
      type: 'list',
      data: state.results,
      markdown: generateBatchMarkdown(state.results, pageUrl),
      count: state.results.length,
      timestamp: new Date().toISOString(),
      pageUrl: pageUrl
    };

    // Save to storage
    await this.stateManager.saveToStorage(finalResult);

    // Broadcast completion
    broadcastProgress('completed', {
      total: state.jobs.length,
      success: progress.success,
      errors: progress.errors,
      duration: progress.duration,
      message: `Complete! Success: ${progress.success}, Failed: ${progress.errors}, Time: ${progress.duration}s`
    });

    return {
      results: state.results,
      count: state.results.length,
      markdown: finalResult.markdown,
      errors: state.errors
    };
  }

  /**
   * Cancel ongoing extraction
   */
  cancel() {
    this.stateManager.cancel();
  }

  /**
   * Get current extraction status
   * @returns {Object} Status info
   */
  getStatus() {
    return this.stateManager.getProgress();
  }
}
