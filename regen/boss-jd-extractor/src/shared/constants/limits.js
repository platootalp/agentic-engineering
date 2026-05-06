/**
 * @fileoverview Limit and timing constants for the extension
 */

/**
 * Text length limits
 */
export const LENGTH_LIMITS = {
  /** Maximum length for company names */
  COMPANY_NAME_MAX: 50,
  /** Minimum length for boss names */
  BOSS_NAME_MIN: 2,
  /** Maximum length for boss names */
  BOSS_NAME_MAX: 8,
  /** Maximum length for skill tags */
  SKILL_TAG_MAX: 20,
  /** Maximum length for company tags */
  COMPANY_TAG_MAX: 15,
  /** Maximum number of skill tags to display */
  MAX_SKILL_TAGS_DISPLAY: 10,
  /** Maximum number of skill tags in list view */
  MAX_SKILL_TAGS_LIST: 8,
  /** Minimum description length to be considered valid */
  MIN_DESCRIPTION_LENGTH: 20
};

/**
 * Delay constants (in milliseconds)
 */
export const DELAYS = {
  /** Minimum delay for anti-crawl protection (2 seconds) */
  MIN_DELAY: 2000,
  /** Maximum delay for anti-crawl protection (5 seconds) */
  MAX_DELAY: 5000,
  /** Delay range for anti-crawl (max - min) */
  DELAY_RANGE: 3000,
  /** Wait time after page load for dynamic content */
  DYNAMIC_CONTENT_WAIT: 2000,
  /** Short delay for script injection */
  SCRIPT_INJECTION_WAIT: 500,
  /** Retry delay for content script check */
  CONTENT_SCRIPT_RETRY_DELAY: 1000,
  /** Storage read delay after popup close */
  STORAGE_READ_DELAY: 500
};

/**
 * Timeout constants (in milliseconds)
 */
export const TIMEOUTS = {
  /** Page load timeout for tab creation */
  PAGE_LOAD: 15000,
  /** Extraction response timeout */
  EXTRACTION: 8000,
  /** Content script ping timeout per retry */
  PING: 3000
};

/**
 * Retry constants
 */
export const RETRIES = {
  /** Number of retries for content script check */
  CONTENT_SCRIPT: 3,
  /** Number of selector fallback attempts */
  SELECTOR_FALLBACK: 10
};

/**
 * Progress calculation constants
 */
export const PROGRESS = {
  /** Initial progress percentage */
  INITIAL: 10,
  /** Progress after list extraction */
  LIST_EXTRACTED: 30,
  /** Progress range for batch extraction (added to LIST_EXTRACTED) */
  BATCH_RANGE: 60,
  /** Progress before completion */
  BEFORE_COMPLETE: 95,
  /** Progress for detail page extraction */
  DETAIL_HALF: 50
};

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  /** Last extraction result */
  LAST_EXTRACTION: 'lastExtraction',
  /** Extraction status */
  EXTRACTION_STATUS: 'extractionStatus'
};
