/**
 * @fileoverview Tab lifecycle management
 */
import { TIMEOUTS } from '../../shared/constants/limits.js';
import { delay } from '../utils/delay.js';

/**
 * Manages tab creation, loading, and cleanup
 */
export class TabManager {
  constructor() {
    this.activeTab = null;
  }

  /**
   * Create a new tab and wait for it to load
   * @param {string} url - URL to load
   * @param {number} [timeout=15000] - Load timeout in ms
   * @returns {Promise<Object>} Created tab
   */
  async createTab(url, timeout = TIMEOUTS.PAGE_LOAD) {
    const tab = await chrome.tabs.create({
      url: url,
      active: false
    });
    
    this.activeTab = tab;
    await this._waitForLoad(tab.id, timeout);
    return tab;
  }

  /**
   * Wait for tab to finish loading
   * @private
   * @param {number} tabId - Tab ID
   * @param {number} timeout - Timeout in ms
   * @returns {Promise<void>}
   */
  _waitForLoad(tabId, timeout) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Page load timeout'));
      }, timeout);

      const listener = (updatedTabId, info) => {
        if (updatedTabId === tabId && info.status === 'complete') {
          clearTimeout(timeoutId);
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      };

      chrome.tabs.onUpdated.addListener(listener);
    });
  }

  /**
   * Inject content script into tab
   * @param {number} tabId - Tab ID
   */
  async injectContentScript(tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });
    } catch (e) {
      // Script may already be injected
      console.log('[TabManager] Script injection skipped:', e.message);
    }
  }

  /**
   * Send extraction message to tab
   * @param {number} tabId - Tab ID
   * @param {number} [timeout=8000] - Response timeout
   * @returns {Promise<Object>} Extraction response
   */
  async extractFromTab(tabId, timeout = TIMEOUTS.EXTRACTION) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Extraction timeout'));
      }, timeout);

      chrome.tabs.sendMessage(tabId, { action: 'extract' }, (response) => {
        clearTimeout(timeoutId);
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Close tab safely
   * @param {number} [tabId] - Tab ID (uses active if not provided)
   */
  async closeTab(tabId) {
    const id = tabId || (this.activeTab && this.activeTab.id);
    if (!id) return;

    try {
      await chrome.tabs.remove(id);
    } catch (e) {
      // Tab may already be closed
      console.log('[TabManager] Tab close skipped:', e.message);
    }

    if (this.activeTab && this.activeTab.id === id) {
      this.activeTab = null;
    }
  }

  /**
   * Close active tab if exists
   */
  async cleanup() {
    if (this.activeTab) {
      await this.closeTab(this.activeTab.id);
    }
  }
}
