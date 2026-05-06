/**
 * @fileoverview Extraction service for popup
 */
import { RETRIES, DELAYS, STORAGE_KEYS } from '../../shared/constants/limits.js';

export class ExtractionService {
  constructor() {
    this.currentResult = null;
  }

  async getCurrentTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
  }

  async checkContentScriptReady(tabId, retries = RETRIES.CONTENT_SCRIPT) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
        if (response && response.pong) {
          return true;
        }
      } catch (e) {
        if (i < retries - 1) {
          await new Promise(r => setTimeout(r, DELAYS.CONTENT_SCRIPT_RETRY_DELAY));
        }
      }
    }
    return false;
  }

  async extractDetail(tabId) {
    const response = await chrome.tabs.sendMessage(tabId, { action: 'extract' });
    
    if (!response || !response.success) {
      throw new Error(response?.error || 'Extraction failed');
    }

    this.currentResult = {
      type: 'detail',
      data: response.data,
      markdown: response.markdown,
      timestamp: new Date().toISOString()
    };

    await this._saveToStorage();
    return this.currentResult;
  }

  async extractList(tabId, pageUrl) {
    const listResponse = await chrome.tabs.sendMessage(tabId, { action: 'extract' });
    
    if (!listResponse || !listResponse.success) {
      throw new Error(listResponse?.error || 'Failed to get job list');
    }

    const jobs = listResponse.data.jobs || [];
    
    if (jobs.length === 0) {
      throw new Error('No jobs found');
    }

    const result = await this._sendBatchRequest(jobs, pageUrl);
    
    if (result) {
      this.currentResult = {
        type: 'list',
        data: result.results,
        markdown: result.markdown,
        count: result.count,
        timestamp: new Date().toISOString()
      };
      await this._saveToStorage();
    }

    return this.currentResult;
  }

  async _sendBatchRequest(jobs, pageUrl) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'batchExtract',
        jobs: jobs,
        pageUrl: pageUrl
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Batch request pending:', chrome.runtime.lastError.message);
          resolve(null);
        } else if (response && response.success) {
          resolve(response);
        } else {
          reject(new Error(response?.error || 'Batch extraction failed'));
        }
      });
    });
  }

  async checkPendingResult() {
    await new Promise(r => setTimeout(r, DELAYS.STORAGE_READ_DELAY));
    return this.loadFromStorage();
  }

  async cancel() {
    try {
      await chrome.runtime.sendMessage({ action: 'cancelExtraction' });
    } catch (e) {
      console.log('Cancel extraction:', e);
    }
  }

  async _saveToStorage() {
    await chrome.storage.local.set({
      [STORAGE_KEYS.LAST_EXTRACTION]: this.currentResult,
      [STORAGE_KEYS.EXTRACTION_STATUS]: 'completed'
    });
  }

  async loadFromStorage() {
    const stored = await chrome.storage.local.get([
      STORAGE_KEYS.LAST_EXTRACTION,
      STORAGE_KEYS.EXTRACTION_STATUS
    ]);

    if (stored[STORAGE_KEYS.EXTRACTION_STATUS] === 'completed') {
      this.currentResult = stored[STORAGE_KEYS.LAST_EXTRACTION];
      return this.currentResult;
    }
    return null;
  }

  getCurrentResult() {
    return this.currentResult;
  }

  detectPageType(url) {
    if (url.includes('/job_detail/') || url.includes('/job/')) {
      return 'detail';
    }
    if (url.includes('/web/geek/job')) {
      return 'list';
    }
    return 'unknown';
  }
}
