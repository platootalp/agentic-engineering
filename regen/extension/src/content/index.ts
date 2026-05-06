/**
 * Content Script Entry Point
 * Initializes adapters and handles message passing
 */

import { ZhipinAdapter } from './adapters/zhipin';
import type { JobData, ExtractionResult, MessageRequest, MessageResponse } from '@/types/jd';

// Prevent double injection
if (window.jdExtractorInjected) {
  console.log('[JD Extractor] Already injected, skipping');
} else {
  window.jdExtractorInjected = true;
  console.log('[JD Extractor] Content script loaded');

  // Initialize adapters
  const adapters = [new ZhipinAdapter()];

  // Find matching adapter for current page
  function getAdapter() {
    return adapters.find((adapter) => adapter.isSupported());
  }

  // Extract job data from current page
  function extractJobs(): ExtractionResult {
    const adapter = getAdapter();
    if (!adapter) {
      return {
        success: false,
        pageType: 'unknown',
        data: {} as JobData,
        error: 'No adapter found for this page',
      };
    }
    return adapter.extract();
  }

  // Listen for messages from popup/background
  chrome.runtime.onMessage.addListener((
    request: MessageRequest,
    _sender,
    sendResponse: (response: MessageResponse) => void
  ) => {
    console.log('[JD Extractor] Received message:', request.action);

    switch (request.action) {
      case 'extract':
        const result = extractJobs();
        sendResponse({
          success: result.success,
          data: result,
          error: result.error,
        });
        break;

      case 'getStatus':
        const adapter = getAdapter();
        sendResponse({
          success: true,
          data: {
            isSupported: !!adapter,
            pageType: adapter?.detectPageType() || 'unknown',
            adapterName: adapter?.name,
          },
        });
        break;

      default:
        sendResponse({
          success: false,
          error: 'Unknown action: ' + request.action,
        });
    }

    return true; // Keep message channel open for async
  });

  // Auto-extract on page load if supported
  const adapter = getAdapter();
  if (adapter) {
    console.log('[JD Extractor] Adapter found:', adapter.name);
    
    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      autoExtract();
    } else {
      window.addEventListener('load', autoExtract);
    }
  }

  function autoExtract() {
    setTimeout(() => {
      const result = extractJobs();
      if (result.success) {
        console.log('[JD Extractor] Auto-extracted:', result);
        
        // Store in chrome.storage for popup to access
        chrome.storage.local.set({
          lastExtraction: {
            type: result.pageType,
            data: result.data,
            markdown: result.markdown,
            timestamp: new Date().toISOString(),
          },
          extractionStatus: 'completed',
        });

        // Send to background script for sync
        chrome.runtime.sendMessage({
          action: 'extractionComplete',
          result,
        }).catch(() => {
          // Background may not be listening, ignore
        });
      }
    }, 2000); // Wait 2s for dynamic content
  }
}

// Type declaration for global
declare global {
  interface Window {
    jdExtractorInjected?: boolean;
  }
}

export {};
