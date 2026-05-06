/**
 * @fileoverview Delay strategy for anti-crawl protection
 */
import { DELAYS } from '../../shared/constants/limits.js';

/**
 * Create a delay promise
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate random delay for anti-crawl (2-5 seconds)
 * @returns {Promise<void>}
 */
export function randomDelay() {
  const ms = DELAYS.MIN_DELAY + Math.random() * DELAYS.DELAY_RANGE;
  return delay(ms);
}

/**
 * Get random delay duration without executing
 * @returns {number} Delay duration in ms
 */
export function getRandomDelayDuration() {
  return DELAYS.MIN_DELAY + Math.random() * DELAYS.DELAY_RANGE;
}

/**
 * Delay constants for external use
 */
export { DELAYS };
