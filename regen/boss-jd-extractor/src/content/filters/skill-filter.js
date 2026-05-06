/**
 * @fileoverview Skill tag filtering and validation
 */
import { 
  EXPERIENCE_PATTERNS, 
  EDUCATION_PATTERNS, 
  SALARY_PATTERNS,
  LENGTH_LIMITS 
} from '../../shared/constants/filters.js';
import { isBenefitTag } from './benefit-filter.js';

/**
 * Check if text matches experience requirement patterns
 * @param {string} text - Text to check
 * @returns {boolean} True if text is an experience requirement
 */
export function isExperience(text) {
  return EXPERIENCE_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Check if text matches education requirement patterns
 * @param {string} text - Text to check
 * @returns {boolean} True if text is an education requirement
 */
export function isEducation(text) {
  return EDUCATION_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Check if text matches salary patterns
 * @param {string} text - Text to check
 * @returns {boolean} True if text looks like salary info
 */
export function isSalaryPattern(text) {
  return SALARY_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Validate if a tag is a valid skill tag
 * Filters out: benefits, experience, education, salary, invalid lengths
 * @param {string} text - Tag text to validate
 * @returns {boolean} True if valid skill tag
 */
export function isValidSkillTag(text) {
  if (!text) return false;
  if (text.length === 0) return false;
  if (text.length >= LENGTH_LIMITS.SKILL_TAG_MAX) return false;
  if (isBenefitTag(text)) return false;
  if (isExperience(text)) return false;
  if (isEducation(text)) return false;
  if (isSalaryPattern(text)) return false;
  return true;
}

/**
 * Filter and deduplicate skill tags from a list
 * @param {string[]} tags - Raw tag list
 * @returns {string[]} Filtered, deduplicated skill tags
 */
export function filterSkillTags(tags) {
  const seen = new Set();
  return tags.filter(tag => {
    if (!isValidSkillTag(tag)) return false;
    if (seen.has(tag)) return false;
    seen.add(tag);
    return true;
  });
}

/**
 * Extract skill tags from elements
 * @param {Element[]} elements - DOM elements containing potential skill tags
 * @returns {string[]} Extracted skill tags
 */
export function extractSkillTagsFromElements(elements) {
  const tags = [];
  elements.forEach(el => {
    const text = el.textContent.trim();
    if (isValidSkillTag(text)) {
      tags.push(text);
    }
  });
  return filterSkillTags(tags);
}
