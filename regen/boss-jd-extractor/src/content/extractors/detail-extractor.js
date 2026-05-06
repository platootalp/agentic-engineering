/**
 * @fileoverview Detail page extractor for job detail pages
 */
import { BaseExtractor } from './base-extractor.js';
import { queryFirst, getText } from '../utils/dom-helpers.js';
import { isDetailPage } from '../utils/page-detector.js';
import { 
  DETAIL_JOB_NAME_SELECTORS,
  DETAIL_COMPANY_SELECTORS,
  DETAIL_SALARY_SELECTOR,
  LOCATION_SELECTORS,
  DETAIL_LIMIT_SELECTORS,
  DETAIL_SKILL_TAG_SELECTORS,
  DETAIL_BOSS_NAME_SELECTOR,
  DETAIL_BOSS_TITLE_SELECTOR,
  BOSS_ACTIVE_SELECTOR,
  DESCRIPTION_SELECTORS,
  COMPANY_TAG_SELECTOR,
  COMPANY_SEARCH_ELEMENTS,
  SECTION_SELECTORS,
  SECTION_TITLE_SELECTORS,
  SECTION_CONTENT_SELECTORS
} from '../../shared/constants/selectors.js';
import { 
  isAgencyCompany, 
  cleanCompanyName, 
  isBenefitTag, 
  isSalary 
} from '../filters/benefit-filter.js';
import { isExperience, isEducation } from '../filters/skill-filter.js';
import { LENGTH_LIMITS, HTML_CLEANUP_PATTERNS, TITLE_COMPANY_PATTERN } from '../../shared/constants/filters.js';
import { queryAllFirst } from '../utils/dom-helpers.js';

/**
 * Extractor for job detail pages
 */
export class DetailExtractor extends BaseExtractor {
  /**
   * Check if this extractor can handle the current page
   * @returns {boolean}
   */
  canHandle() {
    return isDetailPage();
  }

  /**
   * Extract job details from detail page
   * @returns {Object} Extracted job details
   */
  extract() {
    const result = this._createBaseResult();
    result.pageType = 'detail';

    // Job name
    const jobNameEl = queryFirst(DETAIL_JOB_NAME_SELECTORS);
    result.jobName = getText(jobNameEl);

    // Salary
    result.salary = this._extractSalary();

    // Company (with agency detection)
    const companyInfo = this._extractCompany();
    result.company = companyInfo.name;
    result.isAgency = companyInfo.isAgency;

    // Company tags
    result.companyTags = this._extractCompanyTags();

    // Location
    result.location = this._extractLocation();

    // Experience and education
    const limitInfo = this._extractLimitInfo();
    result.experience = limitInfo.experience;
    result.education = limitInfo.education;

    // Skill tags
    result.skillTags = this._extractSkillTags();

    // Job description
    result.jobDescription = this._extractDescription();

    // Boss info
    const bossInfo = this._extractBossInfo();
    result.bossName = bossInfo.name;
    result.bossTitle = bossInfo.title;
    result.bossActive = bossInfo.active;

    return result;
  }

  /**
   * @private
   */
  _extractSalary() {
    const salaryEl = document.querySelector(DETAIL_SALARY_SELECTOR);
    return getText(salaryEl);
  }

  /**
   * @private
   */
  _extractCompany() {
    let company = '';
    let isAgency = false;

    // Strategy 1: Search for agency indicators
    const allElements = document.querySelectorAll(COMPANY_SEARCH_ELEMENTS);
    for (const el of allElements) {
      const text = el.textContent.trim();
      if (text.includes('代招') && text.length < 100) {
        company = cleanCompanyName(text);
        isAgency = true;
        break;
      }
    }

    // Strategy 2: Standard selectors
    if (!company) {
      for (const selector of DETAIL_COMPANY_SELECTORS) {
        const el = document.querySelector(selector);
        if (el && el.textContent.trim()) {
          const extracted = cleanCompanyName(el.textContent);
          if (extracted) {
            company = extracted;
            isAgency = isAgencyCompany(company);
            break;
          }
        }
      }
    }

    // Strategy 3: From page title
    if (!company) {
      const title = document.title || '';
      const match = title.match(TITLE_COMPANY_PATTERN);
      if (match) {
        company = cleanCompanyName(match[1]);
      }
    }

    return {
      name: company || '未识别',
      isAgency: isAgency || isAgencyCompany(company)
    };
  }

  /**
   * @private
   */
  _extractCompanyTags() {
    const tags = [];
    const elements = document.querySelectorAll(COMPANY_TAG_SELECTOR);
    elements.forEach(el => {
      const text = el.textContent.trim();
      if (text && 
          text.length < LENGTH_LIMITS.COMPANY_TAG_MAX && 
          !isBenefitTag(text) && 
          !isSalary(text)) {
        tags.push(text);
      }
    });
    return tags;
  }

  /**
   * @private
   */
  _extractLocation() {
    const locationEl = queryFirst(LOCATION_SELECTORS);
    return getText(locationEl);
  }

  /**
   * @private
   */
  _extractLimitInfo() {
    let experience = '';
    let education = '';
    let limitTexts = [];

    // Try selectors in order
    for (const selector of DETAIL_LIMIT_SELECTORS) {
      const spans = document.querySelectorAll(selector);
      if (spans.length > 0) {
        limitTexts = Array.from(spans)
          .map(s => s.textContent.trim())
          .filter(t => t);
        break;
      }
    }

    // Parse limit texts
    limitTexts.forEach(text => {
      if ((text.includes('年') || text.includes('经验')) && 
          !text.includes('薪') && 
          text.length < 20) {
        experience = text;
      }
      if (isEducation(text) && text.length < 20) {
        education = text;
      }
    });

    // Fallback experience extraction
    if (!experience) {
      const expEl = document.querySelector('.job-limit-left, [class*="experience"]');
      if (expEl) {
        const text = expEl.textContent;
        const match = text.match(/(\d+[-\d]*年|经验不限|无需经验|应届毕业生)/);
        if (match) experience = match[1];
      }
    }

    return { experience, education };
  }

  /**
   * @private
   */
  _extractSkillTags() {
    const tags = [];
    const elements = document.querySelectorAll(DETAIL_SKILL_TAG_SELECTORS);
    
    elements.forEach(el => {
      const text = el.textContent.trim();
      if (text && 
          text.length > 0 && 
          text.length < LENGTH_LIMITS.SKILL_TAG_MAX && 
          !isBenefitTag(text)) {
        if (!tags.includes(text)) {
          tags.push(text);
        }
      }
    });

    return tags.length > 0 ? tags : ['未提取到技能标签'];
  }

  /**
   * @private
   */
  _extractDescription() {
    let descEl = null;

    // Try primary selectors
    for (const selector of DESCRIPTION_SELECTORS) {
      descEl = document.querySelector(selector);
      if (descEl && descEl.textContent.trim().length > LENGTH_LIMITS.MIN_DESCRIPTION_LENGTH) {
        break;
      }
    }

    // Fallback: find by section title
    if (!descEl) {
      const sections = document.querySelectorAll(SECTION_SELECTORS);
      for (const section of sections) {
        const title = section.querySelector(SECTION_TITLE_SELECTORS);
        if (title && /职位描述|岗位职责|岗位描述/.test(title.textContent)) {
          const textEl = section.querySelector(SECTION_CONTENT_SELECTORS);
          if (textEl && textEl.textContent.trim().length > LENGTH_LIMITS.MIN_DESCRIPTION_LENGTH) {
            descEl = textEl;
            break;
          }
        }
      }
    }

    if (descEl) {
      let html = descEl.innerHTML;
      return html
        .replace(HTML_CLEANUP_PATTERNS.lineBreak, '\n')
        .replace(HTML_CLEANUP_PATTERNS.listItem, '  • ')
        .replace(HTML_CLEANUP_PATTERNS.listItemClose, '\n')
        .replace(HTML_CLEANUP_PATTERNS.allTags, '')
        .trim();
    }

    return '';
  }

  /**
   * @private
   */
  _extractBossInfo() {
    const nameEl = document.querySelector(DETAIL_BOSS_NAME_SELECTOR);
    const titleEl = document.querySelector(DETAIL_BOSS_TITLE_SELECTOR);
    const activeEl = document.querySelector(BOSS_ACTIVE_SELECTOR);

    return {
      name: getText(nameEl),
      title: getText(titleEl),
      active: getText(activeEl)
    };
  }
}
