/**
 * @fileoverview List page extractor for job list pages
 */
import { BaseExtractor } from './base-extractor.js';
import { queryFirst, getText } from '../utils/dom-helpers.js';
import { isListPage } from '../utils/page-detector.js';
import { 
  JOB_CARD_SELECTORS,
  JOB_NAME_SELECTORS,
  COMPANY_SELECTORS,
  SALARY_SELECTORS,
  LIMIT_SELECTORS,
  SKILL_TAG_SELECTORS,
  BOSS_NAME_SELECTORS,
  BOSS_TITLE_SELECTORS,
  JOB_LINK_SELECTORS
} from '../../shared/constants/selectors.js';
import { isValidCompanyName } from '../filters/benefit-filter.js';
import { isValidSkillTag } from '../filters/skill-filter.js';
import { SALARY_PATTERNS, EXPERIENCE_PATTERNS, EDUCATION_PATTERNS } from '../../shared/constants/filters.js';

/**
 * Extractor for job list pages
 */
export class ListExtractor extends BaseExtractor {
  canHandle() {
    return isListPage();
  }

  extract() {
    const result = this._createBaseResult();
    result.pageType = 'list';
    result.jobs = this._extractJobs();
    result.jobCount = result.jobs.length;
    return result;
  }

  _extractJobs() {
    const jobs = [];
    const cards = this._findJobCards();

    cards.forEach((card, index) => {
      try {
        const job = this._extractJobFromCard(card, index);
        if (job && job.jobName) {
          const isDuplicate = jobs.some(j => j.url === job.url);
          if (!isDuplicate) {
            job.index = jobs.length + 1;
            jobs.push(job);
          }
        }
      } catch (e) {
        console.log('[Boss JD Extractor] Extract job failed:', e);
      }
    });

    return jobs;
  }

  _findJobCards() {
    for (const selector of JOB_CARD_SELECTORS) {
      const cards = document.querySelectorAll(selector);
      if (cards.length > 0) {
        return Array.from(cards);
      }
    }
    return [];
  }

  _extractJobFromCard(card) {
    const job = {
      jobName: this._extractJobName(card),
      company: this._extractCompany(card),
      salary: this._extractSalary(card),
      location: '',
      experience: '',
      education: '',
      skillTags: this._extractSkillTags(card),
      bossName: this._extractBossName(card),
      bossTitle: this._extractBossTitle(card),
      url: this._extractJobUrl(card)
    };

    const limitInfo = this._extractLimitInfo(card);
    job.location = limitInfo.location;
    job.experience = limitInfo.experience;
    job.education = limitInfo.education;

    return job;
  }

  _extractJobName(card) {
    const el = queryFirst(JOB_NAME_SELECTORS, card);
    return getText(el);
  }

  _extractCompany(card) {
    for (const selector of COMPANY_SELECTORS) {
      const el = card.querySelector(selector);
      if (el && el.textContent.trim()) {
        const text = el.textContent.trim();
        if (isValidCompanyName(text)) {
          return text;
        }
      }
    }

    const companyEl = card.querySelector('[aria-label*="公司"], [title*="公司"]');
    if (companyEl) {
      return companyEl.getAttribute('aria-label') || 
             companyEl.getAttribute('title') || 
             'Unknown';
    }

    return 'Unknown';
  }

  _extractSalary(card) {
    for (const selector of SALARY_SELECTORS) {
      const el = card.querySelector(selector);
      if (el && el.textContent.trim()) {
        const text = el.textContent.trim();
        if (SALARY_PATTERNS.some(pattern => pattern.test(text))) {
          return text;
        }
      }
    }

    const allSpans = card.querySelectorAll('span, .job-limit span, .job-card-wrapper span');
    for (const span of allSpans) {
      const text = span.textContent.trim();
      if (/^\d+[-~]?\d*K/i.test(text) || /\d+[-~]?\d*元\/月/.test(text) || /面议/.test(text)) {
        return text;
      }
    }

    return 'Negotiable';
  }

  _extractLimitInfo(card) {
    let location = '';
    let experience = '';
    let education = '';

    for (const selector of LIMIT_SELECTORS) {
      const spans = card.querySelectorAll(selector);
      if (spans.length > 0) {
        spans.forEach(span => {
          const text = span.textContent.trim();
          if (EXPERIENCE_PATTERNS.some(pattern => pattern.test(text))) {
            experience = text;
          } else if (EDUCATION_PATTERNS.some(pattern => pattern.test(text))) {
            education = text;
          } else if (text && !text.includes('薪') && text.length < 15) {
            location = text;
          }
        });
        break;
      }
    }

    return { location, experience, education };
  }

  _extractSkillTags(card) {
    const tags = [];

    for (const selector of SKILL_TAG_SELECTORS) {
      const tagElements = card.querySelectorAll(selector);
      tagElements.forEach(tag => {
        const text = tag.textContent.trim();
        if (isValidSkillTag(text) && !tags.includes(text)) {
          tags.push(text);
        }
      });
      if (tags.length > 0) break;
    }

    return tags;
  }

  _extractBossName(card) {
    for (const selector of BOSS_NAME_SELECTORS) {
      const el = card.querySelector(selector);
      if (el && el.textContent.trim()) {
        const text = el.textContent.trim();
        if (text.length >= 2 && text.length <= 8 && 
            !text.includes('公司') && !text.includes('集团')) {
          return text;
        }
      }
    }
    return '';
  }

  _extractBossTitle(card) {
    for (const selector of BOSS_TITLE_SELECTORS) {
      const el = card.querySelector(selector);
      if (el && el.textContent.trim()) {
        return el.textContent.trim();
      }
    }
    return '';
  }

  _extractJobUrl(card) {
    for (const selector of JOB_LINK_SELECTORS) {
      const el = card.querySelector(selector);
      if (el && el.href) {
        return el.href;
      }
    }
    return window.location.href;
  }
}
