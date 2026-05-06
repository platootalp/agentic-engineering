/**
 * @fileoverview Boss JD Extractor - Popup Entry Point
 * Modular version with clean architecture
 */
import { StatusDisplay, UIState } from './components/status-display.js';
import { ActionButtons } from './components/action-buttons.js';
import { ExtractionService } from './services/extraction-service.js';
import { DownloadService } from './services/download-service.js';
import { PROGRESS } from '../shared/constants/limits.js';

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
    try {
      const tab = await this.extractionService.getCurrentTab();
      
      if (!tab.url || !tab.url.includes('zhipin.com')) {
        this.statusDisplay.showError('Please use on Boss Zhipin website');
        return;
      }

      const pageType = this.extractionService.detectPageType(tab.url);
      
      if (pageType === 'unknown') {
        this.statusDisplay.showError('Please use on job list or detail page');
        return;
      }

      this.statusDisplay.showExtracting(
        pageType === 'detail' ? 'Extracting job details...' : 'Extracting job list...',
        PROGRESS.INITIAL
      );
      this.actionButtons.showCancel();

      const isReady = await this.extractionService.checkContentScriptReady(tab.id);
      
      if (!isReady) {
        throw new Error('Page connection failed. Please refresh and try again.');
      }

      if (pageType === 'detail') {
        await this.extractDetail(tab.id);
      } else {
        await this.extractList(tab.id, tab.url);
      }

    } catch (error) {
      console.error('Extraction error:', error);
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
