/**
 * @fileoverview Centralized CSS selectors for Boss直聘JD提取器
 * All DOM selectors are defined here for easy maintenance
 */

/**
 * Job card selectors for list page extraction
 * Ordered by priority - first matching selector wins
 */
export const JOB_CARD_SELECTORS = [
  '.job-card-wrapper',
  '.job-list-box > li',
  '[class*="job-card"]',
  '.search-job-list .item',
  '.job-list-item'
];

/**
 * Job name selectors within a job card
 */
export const JOB_NAME_SELECTORS = [
  '.job-name',
  '.name a',
  'a[href*="/job/"]',
  '.title',
  'h3 a'
];

/**
 * Company name selectors within a job card
 */
export const COMPANY_SELECTORS = [
  '.company-name a',
  '.company-name',
  '.comp-name',
  '.job-card-wrapper .company-name a',
  '.job-card-wrapper [class*="company"] a',
  'a[href*="/gongsi/"]',
  '[class*="company"] a',
  '.job-card-company',
  '.company-info a'
];

/**
 * Company selectors for detail page
 */
export const DETAIL_COMPANY_SELECTORS = [
  '.company-info a[href*="/gongsi/"]',
  '.company-info .company-name',
  '.company-name a',
  'a[href*="/gongsi/"]',
  '.job-sec .company-info a',
  '.sider-company a[ka*="job-detail-company"]',
  '.sider-company .company-name',
  '.company .name',
  '[class*="company"] a[href*="gongsi"]',
  '.job-primary .company-name a',
  'h3 a[href*="/gongsi/"]',
  '.company-info h3',
  '.job-company h3'
];

/**
 * Salary selectors for list page
 */
export const SALARY_SELECTORS = [
  '.salary',
  '.salary-blur',
  '.job-salary',
  '[class*="salary"]',
  '.job-limit .salary',
  '.job-card-wrapper .salary',
  'span[class*="salary"]',
  '.info-salary'
];

/**
 * Limit info selectors (experience, education, location)
 */
export const LIMIT_SELECTORS = [
  '.job-limit span',
  '.job-limit-left span',
  '.info-desc span',
  '.tags span',
  '.tag-list span'
];

/**
 * Detail page limit selectors
 */
export const DETAIL_LIMIT_SELECTORS = [
  '.job-limit .job-limit-left span',
  '.job-info .tag-list span',
  '.job-limit span',
  '.job-primary .tag-list span',
  '.info-primary span',
  '.job-tags span',
  '[class*="job-limit"] span',
  '[class*="job-info"] span',
  '.tag-list span'
];

/**
 * Skill tag selectors
 */
export const SKILL_TAG_SELECTORS = [
  '.tag-list .tag-item',
  '.job-tags .tag-item',
  '.job-card-wrapper .tag-item',
  '.tags .tag-item',
  '[class*="tag"]'
];

/**
 * Detail page skill tag selectors
 */
export const DETAIL_SKILL_TAG_SELECTORS = [
  '.job-tags .tag-item',
  '.tag-list .tag-item',
  '.job-tag-list .tag-item'
];

/**
 * Boss name selectors
 */
export const BOSS_NAME_SELECTORS = [
  '.boss-name',
  '.boss-info .name',
  '.recruiter-name',
  '.job-boss-name',
  '[class*="boss"] .name'
];

/**
 * Boss title selectors
 */
export const BOSS_TITLE_SELECTORS = [
  '.boss-info .job-title',
  '.boss-title',
  '.recruiter-title'
];

/**
 * Job link selectors
 */
export const JOB_LINK_SELECTORS = [
  'a[href*="/job/"]',
  'a[href*="/job_detail/"]'
];

/**
 * Job name selectors for detail page
 */
export const DETAIL_JOB_NAME_SELECTORS = [
  '.job-name .name h1',
  '.job-name h1',
  'h1.job-name',
  '.job-title h1',
  'h1[title]',
  '.info-primary .name h1',
  '.job-primary .name h1',
  'h1.position-name',
  '[class*="job-name"] h1',
  'h1:first-of-type'
];

/**
 * Location selectors for detail page
 */
export const LOCATION_SELECTORS = [
  '.job-address .location-address',
  '.location-address',
  '.job-location',
  '.job-area',
  '[class*="location"]',
  '.job-primary .location',
  '.info-primary .location',
  '.job-sec .job-address'
];

/**
 * Job description selectors
 */
export const DESCRIPTION_SELECTORS = [
  '.job-sec-text',
  '.job-description .text',
  '.job-sec .text',
  '.job-desc',
  '[class*="job-desc"]',
  '.job-sec .job-sec-text',
  '.job-detail-section .text',
  '.detail-section .text'
];

/**
 * Boss active time selector
 */
export const BOSS_ACTIVE_SELECTOR = '.boss-active-time, .active-time';

/**
 * Salary element selector (detail page - simple)
 */
export const DETAIL_SALARY_SELECTOR = '.job-name .salary, .salary';

/**
 * Boss info selectors (detail page)
 */
export const DETAIL_BOSS_NAME_SELECTOR = '.boss-info .name, .job-boss-name';
export const DETAIL_BOSS_TITLE_SELECTOR = '.boss-info .job-title, .boss-title';

/**
 * Company tag selectors (funding stage, size)
 */
export const COMPANY_TAG_SELECTOR = '.company-info .company-tag, .company-tag';

/**
 * Company search selectors (for agency detection)
 */
export const COMPANY_SEARCH_ELEMENTS = 'h3, h2, .company-name, .company-title, [class*="company"], [class*="job-company"]';

/**
 * Experience fallback selector
 */
export const EXPERIENCE_FALLBACK_SELECTOR = '.job-limit-left, [class*="experience"]';

/**
 * Section selectors for description fallback
 */
export const SECTION_SELECTORS = '.job-sec, .detail-section, section';

/**
 * Section title selectors
 */
export const SECTION_TITLE_SELECTORS = 'h3, .title, .section-title';

/**
 * Section content selectors
 */
export const SECTION_CONTENT_SELECTORS = '.text, .content, p';
