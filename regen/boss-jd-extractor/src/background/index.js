/**
 * @fileoverview Boss JD Extractor - Background Service Worker Entry Point
 * Modular version with clean architecture
 */
import { BatchExtractor } from './services/batch-extractor.js';
import { StateManager } from './services/state-manager.js';

const batchExtractor = new BatchExtractor();
const stateManager = new StateManager();

/**
 * Handle async message responses
 * @param {Object} request - Message request
 * @param {Function} sendResponse - Response callback
 */
async function handleMessage(request, sendResponse) {
  switch (request.action) {
    case 'batchExtract':
      try {
        const result = await batchExtractor.extract(request.jobs, request.pageUrl);
        sendResponse({
          success: true,
          results: result.results,
          count: result.count,
          markdown: result.markdown
        });
      } catch (error) {
        sendResponse({
          success: false,
          error: error.message
        });
      }
      break;

    case 'cancelExtraction':
      batchExtractor.cancel();
      sendResponse({ success: true });
      break;

    case 'getStatus':
      sendResponse(batchExtractor.getStatus());
      break;

    default:
      sendResponse({ error: 'Unknown action' });
  }
}

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handleMessage(request, sendResponse);
  return true;
});

console.log('[Boss JD Extractor v2.0] Background service started');
