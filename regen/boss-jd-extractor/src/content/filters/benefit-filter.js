/**
 * @fileoverview Benefit tag filtering logic
 */
import { BENEFIT_WORDS } from '../../shared/constants/filters.js';

/**
 * Check if text is a benefit-related tag (should be excluded from skills)
 * @param {string} text - Text to check
 * @returns {boolean} True if text is a benefit tag
 */
export function isBenefitTag(text) {
  if (!text) return true;
  return BENEFIT_WORDS.some(word => text.includes(word));
}

/**
 * Check if text appears to be salary information
 * @param {string} text - Text to check
 * @returns {boolean} True if text looks like salary info
 */
export function isSalary(text) {
  if (!text) return false;
  return /^\d+[-\d]*K/i.test(text) || /薪|工资|面议/i.test(text);
}

/**
 * Check if text is an agency/placeholder company name
 * @param {string} name - Company name to check
 * @returns {boolean} True if it's an agency placeholder
 */
export function isAgencyCompany(name) {
  if (!name) return false;
  return /代招公司|代招：|某大型|某知名|某互联网|某上市|某外资|某国企|某央企|某\w+公司/.test(name);
}

/**
 * Clean up company name by removing unwanted text
 * @param {string} name - Raw company name
 * @returns {string} Cleaned company name
 */
export function cleanCompanyName(name) {
  if (!name) return '';
  return name.replace(/公司介绍|我要提问|查看全部\d+个职位|招聘/g, '').trim();
}

/**
 * Validate company name format
 * @param {string} name - Company name to validate
 * @returns {boolean} True if name appears valid
 */
export function isValidCompanyName(name) {
  if (!name) return false;
  if (name.length >= 50) return false;
  if (name.includes('·')) return false;
  if (name.includes('招聘')) return false;
  return true;
}
