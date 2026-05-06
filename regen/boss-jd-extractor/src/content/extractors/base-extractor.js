/**
 * @fileoverview Base extractor class defining common extraction interface
 */

/**
 * Base class for all extractors
 * Provides common extraction utilities and interface
 */
export class BaseExtractor {
  /**
   * Extract data from the current page
   * Must be implemented by subclasses
   * @abstract
   * @returns {Object} Extracted data
   */
  extract() {
    throw new Error('extract() must be implemented by subclass');
  }

  /**
   * Check if this extractor can handle the current page
   * Must be implemented by subclasses
   * @abstract
   * @returns {boolean}
   */
  canHandle() {
    throw new Error('canHandle() must be implemented by subclass');
  }

  /**
   * Create base extraction result object with common metadata
   * @protected
   * @returns {Object} Base result with url and timestamp
   */
  _createBaseResult() {
    return {
      url: window.location.href,
      extractedAt: new Date().toISOString()
    };
  }

  /**
   * Safely extract text from multiple selectors
   * @protected
   * @param {string[]} selectors - CSS selectors to try
   * @param {Function} [transform] - Optional transform function
   * @returns {string} Extracted text or empty string
   */
  _extractText(selectors, transform = null) {
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el && el.textContent.trim()) {
        const text = el.textContent.trim();
        return transform ? transform(text) : text;
      }
    }
    return '';
  }

  /**
   * Extract all matching text from elements
   * @protected
   * @param {string} selector - CSS selector
   * @param {Function} [filterFn] - Optional filter function
   * @returns {string[]} Array of extracted texts
   */
  _extractAllText(selector, filterFn = null) {
    const elements = document.querySelectorAll(selector);
    const texts = [];
    elements.forEach(el => {
      const text = el.textContent.trim();
      if (text && (!filterFn || filterFn(text))) {
        texts.push(text);
      }
    });
    return texts;
  }
}
