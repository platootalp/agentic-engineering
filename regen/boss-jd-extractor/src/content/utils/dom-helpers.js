/**
 * @fileoverview DOM helper utilities for content extraction
 */

/**
 * Query for the first matching element from a list of selectors
 * Returns the first element that matches any selector in the list
 * @param {string[]} selectors - Array of CSS selectors to try
 * @param {ParentNode} [parent=document] - Parent element to search within
 * @returns {Element|null} First matching element or null
 */
export function queryFirst(selectors, parent = document) {
  for (const selector of selectors) {
    const el = parent.querySelector(selector);
    if (el && el.textContent.trim()) {
      return el;
    }
  }
  return null;
}

/**
 * Query for all matching elements from a list of selectors
 * Returns elements from the first selector that produces results
 * @param {string[]} selectors - Array of CSS selectors to try
 * @param {ParentNode} [parent=document] - Parent element to search within
 * @returns {NodeListOf<Element>} Matching elements or empty NodeList
 */
export function queryAllFirst(selectors, parent = document) {
  for (const selector of selectors) {
    const elements = parent.querySelectorAll(selector);
    if (elements.length > 0) {
      return elements;
    }
  }
  return parent.querySelectorAll('.non-existent');
}

/**
 * Get text content from an element safely
 * @param {Element|null} el - Element to get text from
 * @param {string} [defaultValue=''] - Default value if element is null
 * @returns {string} Text content or default value
 */
export function getText(el, defaultValue = '') {
  return el ? el.textContent.trim() : defaultValue;
}

/**
 * Find elements matching any of the provided selectors
 * Returns all unique elements that match any selector
 * @param {string[]} selectors - Array of CSS selectors
 * @param {ParentNode} [parent=document] - Parent element to search within
 * @returns {Element[]} Array of unique matching elements
 */
export function queryAny(selectors, parent = document) {
  const results = new Set();
  for (const selector of selectors) {
    parent.querySelectorAll(selector).forEach(el => results.add(el));
  }
  return Array.from(results);
}

/**
 * Check if element matches any of the selectors
 * @param {Element} el - Element to check
 * @param {string[]} selectors - Array of CSS selectors
 * @returns {boolean} True if element matches any selector
 */
export function matchesAny(el, selectors) {
  return selectors.some(selector => el.matches(selector));
}

/**
 * Get attribute value safely
 * @param {Element|null} el - Element to get attribute from
 * @param {string} attr - Attribute name
 * @param {string} [defaultValue=''] - Default value if null
 * @returns {string} Attribute value or default
 */
export function getAttr(el, attr, defaultValue = '') {
  return el ? (el.getAttribute(attr) || defaultValue) : defaultValue;
}
