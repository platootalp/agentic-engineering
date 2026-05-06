/**
 * @fileoverview Boss JD Extractor - Content Script Entry Point
 * Modular version with clean architecture
 */
import { getPageType } from './utils/page-detector.js';
import { DetailExtractor } from './extractors/detail-extractor.js';
import { ListExtractor } from './extractors/list-extractor.js';
import { generateDetailMarkdown, generateListMarkdown } from './transformers/markdown-generator.js';

(function() {
  'use strict';

  if (window.bossJDExtractorInjected) return;
  window.bossJDExtractorInjected = true;

  console.log('[Boss JD Extractor] Modular version loaded');

  /**
   * Main extraction function - routes to appropriate extractor
   * @returns {Object} Extraction result
   */
  function extractJD() {
    try {
      const pageType = getPageType();

      if (pageType === 'list') {
        const extractor = new ListExtractor();
        const data = extractor.extract();
        return {
          success: true,
          pageType: 'list',
          data: data,
          markdown: generateListMarkdown(data.jobs, data.url)
        };
      }

      if (pageType === 'detail') {
        const extractor = new DetailExtractor();
        const data = extractor.extract();
        return {
          success: true,
          pageType: 'detail',
          data: data,
          markdown: generateDetailMarkdown(data)
        };
      }

      return {
        success: false,
        error: 'Unknown page type. Please use on job list or detail page.'
      };

    } catch (error) {
      console.error('[Boss JD Extractor] Extraction failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Message handler
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'ping') {
      sendResponse({ pong: true });
      return true;
    }

    if (request.action === 'extract') {
      const result = extractJD();
      sendResponse(result);
      return true;
    }
  });

})();
