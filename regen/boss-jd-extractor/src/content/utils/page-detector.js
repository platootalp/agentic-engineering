/**
 * @fileoverview Page type detection utilities
 */

/**
 * Detect the current page type based on URL and DOM elements
 * @returns {'detail'|'list'|'unknown'} Page type
 */
export function getPageType() {
  const url = window.location.href;
  
  if (url.includes('/job/') || 
      url.includes('/job_detail/') || 
      document.querySelector('.job-sec-text, .job-description')) {
    return 'detail';
  }
  
  if (url.includes('/web/geek/job') || 
      document.querySelector('.job-list-box, .job-card-wrapper, [class*="job-card"]')) {
    return 'list';
  }
  
  // Fallback: check for detail page specific elements
  if (document.querySelector('.job-name .name, .job-sec')) {
    return 'detail';
  }
  
  return 'unknown';
}

/**
 * Check if current page is a detail page
 * @returns {boolean}
 */
export function isDetailPage() {
  return getPageType() === 'detail';
}

/**
 * Check if current page is a list page
 * @returns {boolean}
 */
export function isListPage() {
  return getPageType() === 'list';
}

/**
 * Detect page type from URL string (for use in popup/background)
 * @param {string} url - URL to check
 * @returns {'detail'|'list'|'unknown'} Page type
 */
export function detectPageTypeFromUrl(url) {
  if (url.includes('/job_detail/') || url.includes('/job/')) {
    return 'detail';
  }
  if (url.includes('/web/geek/job') || url.includes('/web/geek/jobs')) {
    return 'list';
  }
  return 'unknown';
}
