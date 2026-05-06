/**
 * @fileoverview Boss JD Extractor - Popup (Bundled Non-Module Version)
 * All components bundled into single file for reliability
 */

// ===== Constants =====
const UIState = {
  IDLE: 'idle',
  EXTRACTING: 'extracting',
  COMPLETED: 'completed',
  ERROR: 'error'
};

const STORAGE_KEYS = {
  LAST_EXTRACTION: 'lastExtraction',
  EXTRACTION_STATUS: 'extractionStatus'
};

const DELAYS = {
  MIN_DELAY: 2000,
  MAX_DELAY: 5000,
  CONTENT_SCRIPT_RETRY_DELAY: 1000,
  STORAGE_READ_DELAY: 500
};

const RETRIES = {
  CONTENT_SCRIPT: 3
};

const PROGRESS = {
  INITIAL: 10,
  LIST_EXTRACTED: 30,
  BATCH_RANGE: 60,
  BEFORE_COMPLETE: 95,
  DETAIL_HALF: 50
};

// ===== Status Display Component =====
class StatusDisplay {
  constructor() {
    this.statusBox = document.getElementById('statusBox');
    this.statusText = document.getElementById('statusText');
    this.progressBar = document.getElementById('progressBar');
    this.progressFill = document.getElementById('progressFill');
  }

  showIdle(message = '准备就绪，点击开始提取') {
    this.setState(UIState.IDLE, message);
    this.hideProgress();
  }

  showExtracting(message, progress = 0) {
    this.setState(UIState.EXTRACTING, message);
    this.showProgress(progress);
  }

  showCompleted(message) {
    this.setState(UIState.COMPLETED, message);
    this.hideProgress();
  }

  showError(message) {
    this.setState(UIState.ERROR, message);
    this.hideProgress();
  }

  setState(state, message) {
    this.statusBox.className = `status-box status-${state}`;
    this.statusText.textContent = message;
  }

  showProgress(percent) {
    this.progressBar.classList.remove('hidden');
    this.progressFill.style.width = percent + '%';
  }

  hideProgress() {
    this.progressBar.classList.add('hidden');
  }
}

// ===== Action Buttons Component =====
class ActionButtons {
  constructor() {
    this.extractBtn = document.getElementById('extractBtn');
    this.cancelBtn = document.getElementById('cancelBtn');
    this.downloadBtn = document.getElementById('downloadBtn');
  }

  bindHandlers(handlers) {
    this.extractBtn.addEventListener('click', handlers.onExtract);
    this.cancelBtn.addEventListener('click', handlers.onCancel);
    this.downloadBtn.addEventListener('click', handlers.onDownload);
  }

  showExtract() {
    this.extractBtn.classList.remove('hidden');
    this.cancelBtn.classList.add('hidden');
    this.downloadBtn.classList.add('hidden');
  }

  showCancel() {
    this.extractBtn.classList.add('hidden');
    this.cancelBtn.classList.remove('hidden');
    this.downloadBtn.classList.add('hidden');
  }

  showCompleted() {
    this.extractBtn.classList.add('hidden');
    this.cancelBtn.classList.add('hidden');
    this.downloadBtn.classList.remove('hidden');
  }
}

// ===== Download Service =====
class DownloadService {
  async downloadMarkdown(markdown, filename = null) {
    if (!filename) {
      filename = `boss-jobs-${new Date().toISOString().slice(0, 10)}.md`;
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    try {
      await chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

// ===== Extraction Service =====
class ExtractionService {
  constructor() {
    this.currentResult = null;
  }

  async getCurrentTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
  }

  async checkContentScriptReady(tabId, retries = RETRIES.CONTENT_SCRIPT) {
    console.log(`[ExtractionService] Checking content script ready for tab ${tabId}, retries: ${retries}`);
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`[ExtractionService] Ping attempt ${i + 1}/${retries}`);
        const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
        console.log(`[ExtractionService] Ping response:`, response);
        if (response && response.pong) {
          console.log(`[ExtractionService] Content script is ready!`);
          return true;
        }
      } catch (e) {
        console.log(`[ExtractionService] Ping attempt ${i + 1} failed:`, e.message);
        if (i < retries - 1) {
          await new Promise(r => setTimeout(r, DELAYS.CONTENT_SCRIPT_RETRY_DELAY));
        }
      }
    }
    console.error(`[ExtractionService] Content script not ready after ${retries} attempts`);
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

// ===== Main Popup App =====
class PopupApp {
  constructor() {
    this.statusDisplay = new StatusDisplay();
    this.actionButtons = new ActionButtons();
    this.extractionService = new ExtractionService();
    this.downloadService = new DownloadService();

    this.init();
  }

  async init() {
    await this.checkPreviousExtraction();
    this.bindEvents();
    this.setupProgressListener();
  }

  bindEvents() {
    this.actionButtons.bindHandlers({
      onExtract: () => this.startExtraction(),
      onCancel: () => this.cancelExtraction(),
      onDownload: () => this.downloadResult()
    });
    
    // Clear data button
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearData());
    }
  }
  
  async clearData() {
    try {
      await chrome.storage.local.remove([STORAGE_KEYS.LAST_EXTRACTION, STORAGE_KEYS.EXTRACTION_STATUS]);
      this.statusDisplay.showIdle('数据已清除');
      this.actionButtons.showExtract();
      console.log('[Popup] Data cleared');
    } catch (e) {
      console.error('[Popup] Failed to clear data:', e);
      this.statusDisplay.showError('清除失败: ' + e.message);
    }
  }

  setupProgressListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'extractionProgress') {
        this.handleProgressUpdate(request);
      }
      sendResponse({ received: true });
      return true;
    });
  }

  async checkPreviousExtraction() {
    const result = await this.extractionService.loadFromStorage();
    if (result) {
      const count = result.type === 'list' ? result.count : 1;
      this.statusDisplay.showCompleted(`Previous extraction: ${count} jobs`);
      this.actionButtons.showCompleted();
    } else {
      this.statusDisplay.showIdle();
      this.actionButtons.showExtract();
    }
  }

  async startExtraction() {
    console.log('[PopupApp] Starting extraction...');
    try {
      const tab = await this.extractionService.getCurrentTab();
      console.log('[PopupApp] Current tab:', tab?.id, tab?.url);

      if (!tab.url || !tab.url.includes('zhipin.com')) {
        this.statusDisplay.showError('Please use on Boss Zhipin website');
        return;
      }

      const pageType = this.extractionService.detectPageType(tab.url);
      console.log('[PopupApp] Detected page type:', pageType);

      if (pageType === 'unknown') {
        this.statusDisplay.showError('Please use on job list or detail page');
        return;
      }

      this.statusDisplay.showExtracting(
        pageType === 'detail' ? 'Extracting job details...' : 'Extracting job list...',
        PROGRESS.INITIAL
      );
      this.actionButtons.showCancel();

      console.log('[PopupApp] Checking content script...');
      const isReady = await this.extractionService.checkContentScriptReady(tab.id);
      console.log('[PopupApp] Content script ready:', isReady);

      if (!isReady) {
        throw new Error('Page connection failed. Please refresh and try again.');
      }

      if (pageType === 'detail') {
        console.log('[PopupApp] Extracting detail page...');
        await this.extractDetail(tab.id);
      } else {
        console.log('[PopupApp] Extracting list page...');
        await this.extractList(tab.id, tab.url);
      }

    } catch (error) {
      console.error('[PopupApp] Extraction error:', error);
      this.statusDisplay.showError('Error: ' + error.message);
      this.actionButtons.showExtract();
    }
  }

  async extractDetail(tabId) {
    this.statusDisplay.showExtracting('Extracting job info...', PROGRESS.DETAIL_HALF);

    const result = await this.extractionService.extractDetail(tabId);

    this.statusDisplay.showCompleted(
      `Job: ${result.data.jobName}\nCompany: ${result.data.company}`
    );
    this.actionButtons.showCompleted();
  }

  async extractList(tabId, pageUrl) {
    this.statusDisplay.showExtracting('Getting job list...', 20);

    await this.extractionService.extractList(tabId, pageUrl);

    // Wait for background completion
    this.statusDisplay.showExtracting('Processing in background...', PROGRESS.LIST_EXTRACTED);
  }

  handleProgressUpdate(request) {
    const { status, current, total, message } = request;

    if (status === 'progress' && total > 0) {
      const progress = PROGRESS.LIST_EXTRACTED + Math.round((current / total) * PROGRESS.BATCH_RANGE);
      this.statusDisplay.showExtracting(message || `Extracting ${current}/${total}...`, progress);
    } else if (status === 'completed') {
      this.handleCompletion();
    } else if (message) {
      this.statusDisplay.statusText.textContent = message;
    }
  }

  async handleCompletion() {
    this.statusDisplay.showExtracting('Getting results...', PROGRESS.BEFORE_COMPLETE);

    const result = await this.extractionService.checkPendingResult();

    if (result) {
      this.statusDisplay.showCompleted(
        `Extracted ${result.count} jobs with full descriptions`
      );
      this.actionButtons.showCompleted();
    }
  }

  async cancelExtraction() {
    await this.extractionService.cancel();
    this.statusDisplay.showIdle('Extraction cancelled');
    this.actionButtons.showExtract();
  }

  async downloadResult() {
    const result = this.extractionService.getCurrentResult();

    if (!result || !result.markdown) {
      this.statusDisplay.showError('No content to download');
      return;
    }

    try {
      await this.downloadService.downloadMarkdown(result.markdown);
      this.statusDisplay.showIdle('Download started');
    } catch (error) {
      console.error('Download error:', error);
      this.statusDisplay.showError('Download failed: ' + error.message);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupApp();
});
