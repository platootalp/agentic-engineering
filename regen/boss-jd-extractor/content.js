/**
 * Boss JD Extractor - Content Script (Bundled)
 */
(function() {
  'use strict';
  if (window.bossJDExtractorInjected) return;
  window.bossJDExtractorInjected = true;

  // Constants
  const JOB_CARD_SELECTORS = ['.job-card-wrapper','.job-list-box > li','[class*="job-card"]','.search-job-list .item','.job-list-item'];
  const JOB_NAME_SELECTORS = ['.job-name','.name a','a[href*="/job/"]','.title','h3 a'];
  const COMPANY_SELECTORS = ['.company-name a','.company-name','.comp-name','.job-card-wrapper .company-name a','a[href*="/gongsi/"]','[class*="company"] a','.job-card-company','.company-info a'];
  const DETAIL_COMPANY_SELECTORS = ['.company-info a[href*="/gongsi/"]','.company-info .company-name','.company-name a','a[href*="/gongsi/"]','.sider-company a[ka*="job-detail-company"]','.sider-company .company-name','.company .name','[class*="company"] a[href*="gongsi"]','.job-primary .company-name a','h3 a[href*="/gongsi/"]','.company-info h3','.job-company h3'];
  const SALARY_SELECTORS = ['.salary','.salary-blur','.job-salary','[class*="salary"]','.job-limit .salary','.job-card-wrapper .salary','span[class*="salary"]','.info-salary'];
  const LIMIT_SELECTORS = ['.job-limit span','.job-limit-left span','.info-desc span','.tags span','.tag-list span'];
  const DETAIL_LIMIT_SELECTORS = ['.job-limit .job-limit-left span','.job-info .tag-list span','.job-limit span','.job-primary .tag-list span','.info-primary span','.job-tags span','[class*="job-limit"] span','[class*="job-info"] span','.tag-list span'];
  const SKILL_TAG_SELECTORS = ['.tag-list .tag-item','.job-tags .tag-item','.job-card-wrapper .tag-item','.tags .tag-item','[class*="tag"]'];
  const DETAIL_SKILL_TAG_SELECTORS = ['.job-tags .tag-item','.tag-list .tag-item','.job-tag-list .tag-item'];
  const BOSS_NAME_SELECTORS = ['.boss-name','.boss-info .name','.recruiter-name','.job-boss-name','[class*="boss"] .name'];
  const BOSS_TITLE_SELECTORS = ['.boss-info .job-title','.boss-title','.recruiter-title'];
  const JOB_LINK_SELECTORS = ['a[href*="/job/"]','a[href*="/job_detail/"]'];
  const DETAIL_JOB_NAME_SELECTORS = ['.job-name .name h1','.job-name h1','h1.job-name','.job-title h1','h1[title]','.info-primary .name h1','.job-primary .name h1','h1.position-name','[class*="job-name"] h1','h1:first-of-type'];
  const LOCATION_SELECTORS = ['.job-address .location-address','.location-address','.job-location','.job-area','[class*="location"]','.job-primary .location','.info-primary .location','.job-sec .job-address'];
  const DESCRIPTION_SELECTORS = ['.job-sec-text','.job-description .text','.job-sec .text','.job-desc','[class*="job-desc"]','.job-sec .job-sec-text','.job-detail-section .text','.detail-section .text'];
  const BOSS_ACTIVE_SELECTOR = '.boss-active-time, .active-time';
  const DETAIL_SALARY_SELECTOR = '.job-name .salary, .salary';
  const DETAIL_BOSS_NAME_SELECTOR = '.boss-info .name, .job-boss-name';
  const DETAIL_BOSS_TITLE_SELECTOR = '.boss-info .job-title, .boss-title';
  const COMPANY_TAG_SELECTOR = '.company-info .company-tag, .company-tag';
  const COMPANY_SEARCH_ELEMENTS = 'h3, h2, .company-name, .company-title, [class*="company"], [class*="job-company"]';
  const SECTION_SELECTORS = '.job-sec, .detail-section, section';
  const SECTION_TITLE_SELECTORS = 'h3, .title, .section-title';
  const SECTION_CONTENT_SELECTORS = '.text, .content, p';
  const BENEFIT_WORDS = ['薪','假','补','贴','金','险','利','旅游','团建','聚餐','下午茶','零食','包吃','包住','住房','生日','体检','期权','股票','五险','公积金','社保','医保','节假日','加班费','餐补','定期体检','保底工资','年终奖','交通补助','有无线网','待优化'];
  const LENGTH_LIMITS = {COMPANY_NAME_MAX:50,BOSS_NAME_MIN:2,BOSS_NAME_MAX:8,SKILL_TAG_MAX:20,COMPANY_TAG_MAX:15,MIN_DESCRIPTION_LENGTH:20};
  const HTML_CLEANUP_PATTERNS = {lineBreak:/<br\s*\/?>/gi,listItem:/<li[^>]*>/gi,listItemClose:/<\/li>/gi,allTags:/<[^>]+>/g};
  const TITLE_COMPANY_PATTERN = /[\u00B7-]\s*(.+?)\s*-\s*BOSS\u76F4\u8058$/;

  function queryFirst(selectors, parent) { parent = parent || document; for (const s of selectors) { const el = parent.querySelector(s); if (el && el.textContent.trim()) return el; } return null; }
  function getText(el, defaultValue) { return el ? el.textContent.trim() : (defaultValue || ''); }
  function getPageType() { const url = window.location.href; if (url.includes('/job/') || url.includes('/job_detail/') || document.querySelector('.job-sec-text, .job-description')) return 'detail'; if (url.includes('/web/geek/job') || document.querySelector('.job-list-box, .job-card-wrapper, [class*="job-card"]')) return 'list'; if (document.querySelector('.job-name .name, .job-sec')) return 'detail'; return 'unknown'; }
  function isDetailPage() { return getPageType() === 'detail'; }
  function isListPage() { return getPageType() === 'list'; }
  function isBenefitTag(text) { if (!text) return true; return BENEFIT_WORDS.some(w => text.includes(w)); }
  function isSalary(text) { if (!text) return false; return /^\d+[-\d]*K/i.test(text) || /薪|工资|面议/.test(text); }
  function isAgencyCompany(name) { if (!name) return false; return /代招公司|代招：|某大型|某知名|某互联网|某上市|某外资|某国企|某央企|某\w+公司/.test(name); }
  function cleanCompanyName(name) { if (!name) return ''; return name.replace(/公司介绍|我要提问|查看全部\d+个职位|招聘/g, '').trim(); }
  function isValidCompanyName(name) { if (!name) return false; if (name.length >= 50) return false; if (name.includes('\u00B7')) return false; if (name.includes('\u62DB\u8058')) return false; return true; }
  function isExperience(text) { return /\d+[-\d]*年/.test(text) || /\u7ECF\u9A8C\u4E0D\u9650/.test(text) || /\u65E0\u9700\u7ECF\u9A8C/.test(text) || /\u5E94\u5C4A/.test(text); }
  function isEducation(text) { return /\u672C\u79D1|\u7855\u58EB|\u535A\u58EB|\u5927\u4E13|\u4E2D\u4E13|\u9AD8\u4E2D|\u5B66\u5386|\u53CA\u4EE5\u4E0A/.test(text); }
  function isValidSkillTag(text) { if (!text) return false; if (text.length === 0) return false; if (text.length >= LENGTH_LIMITS.SKILL_TAG_MAX) return false; if (isBenefitTag(text)) return false; if (isExperience(text)) return false; if (isEducation(text)) return false; if (isSalary(text)) return false; return true; }

  class BaseExtractor { _createBaseResult() { return {url: window.location.href, extractedAt: new Date().toISOString()}; } }

  class DetailExtractor extends BaseExtractor {
    canHandle() { return isDetailPage(); }
    extract() {
      const result = this._createBaseResult(); result.pageType = 'detail';
      result.jobName = getText(queryFirst(DETAIL_JOB_NAME_SELECTORS));
      result.salary = getText(document.querySelector(DETAIL_SALARY_SELECTOR));
      const compInfo = this._extractCompany(); result.company = compInfo.name; result.isAgency = compInfo.isAgency;
      result.companyTags = this._extractCompanyTags();
      result.location = getText(queryFirst(LOCATION_SELECTORS));
      const limitInfo = this._extractLimitInfo(); result.experience = limitInfo.experience; result.education = limitInfo.education;
      result.skillTags = this._extractSkillTags();
      result.jobDescription = this._extractDescription();
      const bossInfo = this._extractBossInfo(); result.bossName = bossInfo.name; result.bossTitle = bossInfo.title; result.bossActive = bossInfo.active;
      return result;
    }
    _extractCompany() {
      let company = '', isAgency = false;
      const allElements = document.querySelectorAll(COMPANY_SEARCH_ELEMENTS);
      for (const el of allElements) { const text = el.textContent.trim(); if (text.includes('代招') && text.length < 100) { company = cleanCompanyName(text); isAgency = true; break; } }
      if (!company) { for (const s of DETAIL_COMPANY_SELECTORS) { const el = document.querySelector(s); if (el && el.textContent.trim()) { const extracted = cleanCompanyName(el.textContent); if (extracted) { company = extracted; isAgency = isAgencyCompany(company); break; } } } }
      if (!company) { const title = document.title || ''; const match = title.match(TITLE_COMPANY_PATTERN); if (match) company = cleanCompanyName(match[1]); }
      return {name: company || '未识别', isAgency: isAgency || isAgencyCompany(company)};
    }
    _extractCompanyTags() { const tags = []; document.querySelectorAll(COMPANY_TAG_SELECTOR).forEach(el => { const text = el.textContent.trim(); if (text && text.length < LENGTH_LIMITS.COMPANY_TAG_MAX && !isBenefitTag(text) && !isSalary(text)) tags.push(text); }); return tags; }
    _extractLimitInfo() { let experience = '', education = '', limitTexts = []; for (const s of DETAIL_LIMIT_SELECTORS) { const spans = document.querySelectorAll(s); if (spans.length > 0) { limitTexts = Array.from(spans).map(s => s.textContent.trim()).filter(t => t); break; } } limitTexts.forEach(text => { if ((text.includes('年') || text.includes('经验')) && !text.includes('薪') && text.length < 20) experience = text; if (isEducation(text) && text.length < 20) education = text; }); return {experience, education}; }
    _extractSkillTags() { const tags = []; document.querySelectorAll(DETAIL_SKILL_TAG_SELECTORS).forEach(el => { const text = el.textContent.trim(); if (text && text.length > 0 && text.length < LENGTH_LIMITS.SKILL_TAG_MAX && !isBenefitTag(text) && !tags.includes(text)) tags.push(text); }); return tags.length > 0 ? tags : ['未提取到技能标签']; }
    _extractDescription() {
      let descEl = null;
      for (const s of DESCRIPTION_SELECTORS) { descEl = document.querySelector(s); if (descEl && descEl.textContent.trim().length > LENGTH_LIMITS.MIN_DESCRIPTION_LENGTH) break; }
      if (!descEl) { const sections = document.querySelectorAll(SECTION_SELECTORS); for (const section of sections) { const title = section.querySelector(SECTION_TITLE_SELECTORS); if (title && /职位描述|岗位职责|岗位描述/.test(title.textContent)) { const textEl = section.querySelector(SECTION_CONTENT_SELECTORS); if (textEl && textEl.textContent.trim().length > LENGTH_LIMITS.MIN_DESCRIPTION_LENGTH) { descEl = textEl; break; } } } }
      if (descEl) { let html = descEl.innerHTML; return html.replace(HTML_CLEANUP_PATTERNS.lineBreak, '\n').replace(HTML_CLEANUP_PATTERNS.listItem, '  • ').replace(HTML_CLEANUP_PATTERNS.listItemClose, '\n').replace(HTML_CLEANUP_PATTERNS.allTags, '').trim(); }
      return '';
    }
    _extractBossInfo() { const nameEl = document.querySelector(DETAIL_BOSS_NAME_SELECTOR); const titleEl = document.querySelector(DETAIL_BOSS_TITLE_SELECTOR); const activeEl = document.querySelector(BOSS_ACTIVE_SELECTOR); return {name: getText(nameEl), title: getText(titleEl), active: getText(activeEl)}; }
  }

  class ListExtractor extends BaseExtractor {
    canHandle() { return isListPage(); }
    extract() { const result = this._createBaseResult(); result.pageType = 'list'; result.jobs = this._extractJobs(); result.jobCount = result.jobs.length; return result; }
    _extractJobs() { const jobs = []; const cards = this._findJobCards(); cards.forEach((card, index) => { try { const job = this._extractJobFromCard(card, index); if (job && job.jobName) { const isDuplicate = jobs.some(j => j.url === job.url); if (!isDuplicate) { job.index = jobs.length + 1; jobs.push(job); } } } catch (e) {} }); return jobs; }
    _findJobCards() { for (const s of JOB_CARD_SELECTORS) { const cards = document.querySelectorAll(s); if (cards.length > 0) return Array.from(cards); } return []; }
    _extractJobFromCard(card) { const job = {jobName: this._extractJobName(card), company: this._extractCompany(card), salary: this._extractSalary(card), location: '', experience: '', education: '', skillTags: this._extractSkillTags(card), bossName: this._extractBossName(card), bossTitle: this._extractBossTitle(card), url: this._extractJobUrl(card)}; const limitInfo = this._extractLimitInfo(card); job.location = limitInfo.location; job.experience = limitInfo.experience; job.education = limitInfo.education; return job; }
    _extractJobName(card) { return getText(queryFirst(JOB_NAME_SELECTORS, card)); }
    _extractCompany(card) { for (const s of COMPANY_SELECTORS) { const el = card.querySelector(s); if (el && el.textContent.trim()) { const text = el.textContent.trim(); if (isValidCompanyName(text)) return text; } } const companyEl = card.querySelector('[aria-label*="公司"], [title*="公司"]'); if (companyEl) return companyEl.getAttribute('aria-label') || companyEl.getAttribute('title') || 'Unknown'; return 'Unknown'; }
    _extractSalary(card) { for (const s of SALARY_SELECTORS) { const el = card.querySelector(s); if (el && el.textContent.trim()) { const text = el.textContent.trim(); if (/^\d+[-~]?\d*K/i.test(text) || /\d+[-~]?\d*元\/月/.test(text) || /面议/.test(text)) return text; } } const allSpans = card.querySelectorAll('span, .job-limit span, .job-card-wrapper span'); for (const span of allSpans) { const text = span.textContent.trim(); if (/^\d+[-~]?\d*K/i.test(text) || /\d+[-~]?\d*元\/月/.test(text) || /面议/.test(text)) return text; } return 'Negotiable'; }
    _extractLimitInfo(card) { let location = '', experience = '', education = ''; for (const s of LIMIT_SELECTORS) { const spans = card.querySelectorAll(s); if (spans.length > 0) { spans.forEach(span => { const text = span.textContent.trim(); if (/\d+[-\d]*年/.test(text) || /经验不限/.test(text) || /无需经验/.test(text) || /应届/.test(text)) experience = text; else if (/本科|硕士|博士|大专|中专|高中|学历|及以上/.test(text)) education = text; else if (text && !text.includes('薪') && text.length < 15) location = text; }); break; } } return {location, experience, education}; }
    _extractSkillTags(card) { const tags = []; for (const s of SKILL_TAG_SELECTORS) { const tagElements = card.querySelectorAll(s); tagElements.forEach(tag => { const text = tag.textContent.trim(); if (isValidSkillTag(text) && !tags.includes(text)) tags.push(text); }); if (tags.length > 0) break; } return tags; }
    _extractBossName(card) { for (const s of BOSS_NAME_SELECTORS) { const el = card.querySelector(s); if (el && el.textContent.trim()) { const text = el.textContent.trim(); if (text.length >= 2 && text.length <= 8 && !text.includes('公司') && !text.includes('集团')) return text; } } return ''; }
    _extractBossTitle(card) { for (const s of BOSS_TITLE_SELECTORS) { const el = card.querySelector(s); if (el && el.textContent.trim()) return el.textContent.trim(); } return ''; }
    _extractJobUrl(card) { for (const s of JOB_LINK_SELECTORS) { const el = card.querySelector(s); if (el && el.href) return el.href; } return window.location.href; }
  }

  function generateDetailMarkdown(data) {
    let md = '# ' + (data.jobName || 'Job Title') + '\n\n';
    md += '## Basic Information\n\n';
    md += '- **Company**: ' + data.company + '\n';
    md += '- **Salary**: ' + (data.salary || 'Negotiable') + '\n';
    md += '- **Location**: ' + (data.location || 'Unknown') + '\n';
    md += '- **Experience**: ' + (data.experience || 'Any') + '\n';
    md += '- **Education**: ' + (data.education || 'Any') + '\n';
    if (data.isAgency) md += '- **Type**: Agency/Hunting Position\n';
    if (data.companyTags && data.companyTags.length > 0) md += '- **Company Info**: ' + data.companyTags.join(' | ') + '\n';
    if (data.skillTags && data.skillTags.length > 0 && data.skillTags[0] !== '未提取到技能标签') md += '- **Skills**: ' + data.skillTags.slice(0, 10).join(', ') + '\n';
    if (data.bossName) { md += '- **Recruiter**: ' + data.bossName; if (data.bossTitle) md += ' (' + data.bossTitle + ')'; md += '\n'; }
    if (data.bossActive) md += '- **Activity**: ' + data.bossActive + '\n';
    md += '- **Link**: ' + data.url + '\n\n';
    if (data.jobDescription) md += '## Job Description\n\n' + data.jobDescription + '\n\n';
    md += '---\n*Extracted by Boss JD Extractor*';
    return md;
  }

  function generateListMarkdown(jobs, pageUrl) {
    if (!jobs || jobs.length === 0) return '# Job List\n\nNo jobs found.\n';
    let md = '# Boss Job List\n\n';
    md += '**Source**: ' + pageUrl + '\n\n';
    md += '**Total**: ' + jobs.length + ' jobs\n\n';
    md += '---\n\n';
    jobs.forEach((job, idx) => {
      md += '## ' + (idx + 1) + '. ' + job.jobName + '\n\n';
      md += '- **Company**: ' + job.company + '\n';
      md += '- **Salary**: ' + job.salary + '\n';
      if (job.location) md += '- **Location**: ' + job.location + '\n';
      if (job.experience) md += '- **Experience**: ' + job.experience + '\n';
      if (job.education) md += '- **Education**: ' + job.education + '\n';
      if (job.skillTags && job.skillTags.length > 0) md += '- **Skills**: ' + job.skillTags.slice(0, 8).join(', ') + '\n';
      if (job.bossName) { md += '- **Recruiter**: ' + job.bossName; if (job.bossTitle) md += ' (' + job.bossTitle + ')'; md += '\n'; }
      if (job.url) md += '- **Link**: ' + job.url + '\n';
      md += '\n';
    });
    md += '---\n*Extracted by Boss JD Extractor*';
    return md;
  }

  function extractJD() {
    try {
      const pageType = getPageType();
      if (pageType === 'list') {
        const extractor = new ListExtractor();
        const data = extractor.extract();
        return { success: true, pageType: 'list', data: data, markdown: generateListMarkdown(data.jobs, data.url) };
      }
      if (pageType === 'detail') {
        const extractor = new DetailExtractor();
        const data = extractor.extract();
        return { success: true, pageType: 'detail', data: data, markdown: generateDetailMarkdown(data) };
      }
      return { success: false, error: 'Unknown page type. Please use on job list or detail page.' };
    } catch (error) {
      console.error('[Boss JD Extractor] Extraction failed:', error);
      return { success: false, error: error.message };
    }
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'ping') {
      sendResponse({ pong: true });
      return true;
    }
    if (request.action === 'extract') {
      const result = extractJD();
      sendResponse(result);
      return true;
    }
  });

  console.log('[Boss JD Extractor] Content script initialized');
})();
