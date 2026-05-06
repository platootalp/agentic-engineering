/**
 * Boss直聘适配器
 * 提取Boss直聘职位详情和列表页数据
 */

import { BaseJobAdapter } from "./base";
import type { JobData, ExtractionResult, PageType, JobListData } from "@/types/jd";

export class ZhipinAdapter extends BaseJobAdapter {
  readonly name = "Boss直聘";
  readonly hostPatterns = ["zhipin.com", "*.zhipin.com"];

  /**
   * 判断是否是福利类标签（排除这些）
   */
  protected isBenefitTag(text: string): boolean {
    if (!text) return true;
    const benefitWords = ['薪', '假', '补', '贴', '金', '险', '利', '旅游', '团建', '聚餐',
      '下午茶', '零食', '包吃', '包住', '住房', '生日', '体检', '期权', '股票',
      '五险', '公积金', '社保', '医保', '节假日', '加班费', '餐补', '定期体检',
      '保底工资', '年终奖', '餐补', '交通补助', '有无线网', '待优化'];
    return benefitWords.some(w => text.includes(w));
  }

  /**
   * 判断是否是薪资
   */
  protected isSalary(text: string): boolean {
    if (!text) return false;
    return /^\d+[-\d]*K/i.test(text) || /薪|工资|面议/i.test(text);
  }

  /**
   * 检查是否是代招/占位符公司名
   */
  private isAgencyCompany(name: string): boolean {
    if (!name) return false;
    return /代招公司|代招：|某大型|某知名|某互联网|某上市|某外资|某国企|某央企|某\w+公司/.test(name);
  }

  /**
   * 清理公司名
   */
  private cleanCompanyName(name: string): string {
    if (!name) return '';
    return name.replace(/公司介绍|我要提问|查看全部\d+个职位|招聘/g, '').trim();
  }

  /**
   * 检测当前页面类型
   */
  detectPageType(): PageType {
    const url = window.location.href;
    if (url.includes('/job/') || url.includes('/job_detail/') || document.querySelector('.job-sec-text, .job-description')) {
      return 'detail';
    }
    if (url.includes('/web/geek/job') || document.querySelector('.job-list-box, .job-card-wrapper, [class*="job-card"]')) {
      return 'list';
    }
    // 兜底：检查是否有详情页特有的元素
    if (document.querySelector('.job-name .name, .job-sec')) {
      return 'detail';
    }
    return 'unknown';
  }

  /**
   * 提取职位数据
   */
  extract(): ExtractionResult {
    try {
      const pageType = this.detectPageType();

      if (pageType === 'list') {
        const jobs = this.extractJobList();
        const listData: JobListData = {
          url: this.url,
          extractedAt: new Date().toISOString(),
          jobCount: jobs.length,
          jobs,
        };
        const markdown = this.generateListMarkdown(jobs, this.url);
        return this.createSuccessResult('list', listData, markdown);
      }

      if (pageType === 'detail') {
        const job = this.extractJobDetail();
        const markdown = this.generateJobMarkdown(job);
        return this.createSuccessResult('detail', job, markdown);
      }

      return this.createErrorResult('无法识别页面类型');
    } catch (error) {
      return this.createErrorResult(error instanceof Error ? error.message : '提取失败');
    }
  }

  /**
   * 从列表页提取所有职位
   */
  private extractJobList(): JobData[] {
    const jobs: JobData[] = [];

    // 尝试多种可能的选择器
    const cardSelectors = [
      '.job-card-wrapper',
      '.job-list-box > li',
      '[class*="job-card"]',
      '.search-job-list .item',
      '.job-list-item'
    ];

    let cards: NodeListOf<Element> = document.querySelectorAll('');
    for (const selector of cardSelectors) {
      cards = document.querySelectorAll(selector);
      if (cards.length > 0) break;
    }

    cards.forEach((card) => {
      try {
        // 职位名
        const nameSelectors = ['.job-name', '.name a', 'a[href*="/job/"]', '.title', 'h3 a'];
        const jobName = this.getTextContentInContainer(card, nameSelectors, '');

        // 公司名
        const companySelectors = ['.company-name', '.company-name a', '.comp-name', '[class*="company"] a'];
        const company = this.getTextContentInContainer(card, companySelectors, '未知');

        // 薪资
        let salary = '';
        const salarySelectors = ['.salary', '.salary-blur', '.job-salary', '[class*="salary"]', '.info-salary'];
        for (const sel of salarySelectors) {
          const el = card.querySelector(sel);
          if (el && el.textContent) {
            const text = el.textContent.trim();
            if (/\d+K|月薪|年薪|面议|元\/月|k-|K-|薪/.test(text)) {
              salary = text;
              break;
            }
          }
        }

        // 地点、经验、学历
        let location = '', experience = '', education = '';
        const limitSelectors = ['.job-limit span', '.job-limit-left span', '.info-desc span', '.tags span'];
        for (const sel of limitSelectors) {
          const spans = card.querySelectorAll(sel);
          if (spans.length > 0) {
            spans.forEach(span => {
              const text = span.textContent?.trim() || '';
              if (/\d+[-\d]*年|经验不限|无需经验|应届/.test(text)) {
                experience = text;
              } else if (/本科|硕士|博士|大专|中专|高中|学历|及以上/.test(text)) {
                education = text;
              } else if (text && !text.includes('薪') && text.length < 15) {
                location = text;
              }
            });
            break;
          }
        }

        // 技能标签
        const skillTags: string[] = [];
        const tagSelectors = ['.tag-list .tag-item', '.job-tags .tag-item', '.tags .tag-item'];
        for (const sel of tagSelectors) {
          const tags = card.querySelectorAll(sel);
          tags.forEach(tag => {
            const text = tag.textContent?.trim() || '';
            if (text && text.length < 20 && !this.isBenefitTag(text)) {
              skillTags.push(text);
            }
          });
          if (skillTags.length > 0) break;
        }

        // 招聘官信息
        const bossSelectors = ['.boss-name', '.boss-info .name', '.recruiter-name'];
        const bossName = this.getTextContentInContainer(card, bossSelectors, '');

        // 职位链接
        let jobLink = '';
        const linkSelectors = ['a[href*="/job/"]', 'a[href*="/job_detail/"]'];
        for (const sel of linkSelectors) {
          const el = card.querySelector(sel);
          if (el && (el as HTMLAnchorElement).href) {
            jobLink = (el as HTMLAnchorElement).href;
            break;
          }
        }

        if (jobName) {
          jobs.push({
            jobName,
            company: company || '未知',
            salary: salary || '面议',
            location: location || '',
            experience: experience || '',
            education: education || '',
            skillTags: skillTags.length > 0 ? skillTags : [],
            bossName,
            bossTitle: '',
            url: jobLink || this.url,
            source: 'zhipin',
            extractedAt: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.log('[ZhipinAdapter] 提取单个职位失败:', e);
      }
    });

    return jobs;
  }

  /**
   * 提取职位详情页数据
   */
  private extractJobDetail(): JobData {
    const data: Partial<JobData> = {
      url: this.url,
      extractedAt: new Date().toISOString(),
      source: 'zhipin',
    };

    // 职位名称
    const jobNameSelectors = [
      '.job-name .name h1', '.job-name h1', 'h1.job-name',
      '.job-title h1', 'h1[title]', '.info-primary .name h1',
      '.job-primary .name h1', 'h1.position-name'
    ];
    data.jobName = this.getTextContent(jobNameSelectors);

    // 薪资
    const salarySelectors = ['.job-name .salary', '.salary', '.info-primary .salary'];
    data.salary = this.getTextContent(salarySelectors) || '面议';

    // 公司名称（增强版 - 支持代招）
    let company = '';

    // 策略1: 全文搜索包含"代招"的元素
    const allElements = document.querySelectorAll('h3, h2, .company-name, .company-title, [class*="company"]');
    for (const el of allElements) {
      const text = el.textContent?.trim() || '';
      if (text.includes('代招') && text.length < 100) {
        company = this.cleanCompanyName(text);
        break;
      }
    }

    // 策略2: 标准公司选择器
    if (!company) {
      const companySelectors = [
        '.company-info a[href*="/gongsi/"]', '.company-info .company-name',
        '.company-name a', 'a[href*="/gongsi/"]', '.sider-company .company-name',
        '.company .name', '.job-primary .company-name a'
      ];
      company = this.getTextContent(companySelectors);
      company = this.cleanCompanyName(company);
    }

    // 策略3: 从页面标题兜底
    if (!company) {
      const title = document.title || '';
      const titleMatch = title.match(/[·-]\s*(.+?)\s*-\s*BOSS直聘$/);
      if (titleMatch) {
        company = this.cleanCompanyName(titleMatch[1]);
      }
    }

    data.company = company || '未识别';
    data.isAgency = this.isAgencyCompany(company);

    // 公司标签
    const companyTags: string[] = [];
    const companyTagEls = document.querySelectorAll('.company-info .company-tag, .company-tag');
    companyTagEls.forEach(el => {
      const text = el.textContent?.trim() || '';
      if (text && text.length < 15 && !this.isBenefitTag(text) && !this.isSalary(text)) {
        companyTags.push(text);
      }
    });
    data.companyTags = companyTags;

    // 工作地点
    const locationSelectors = [
      '.job-address .location-address', '.location-address', '.job-location',
      '.job-area', '.job-primary .location', '.info-primary .location'
    ];
    data.location = this.getTextContent(locationSelectors);

    // 经验和学历
    let experience = '', education = '';
    const limitSelectors = [
      '.job-limit .job-limit-left span', '.job-info .tag-list span',
      '.job-limit span', '.job-primary .tag-list span', '.info-primary span'
    ];
    for (const sel of limitSelectors) {
      const spans = document.querySelectorAll(sel);
      if (spans.length > 0) {
        spans.forEach(span => {
          const text = span.textContent?.trim() || '';
          if ((text.includes('年') || text.includes('经验')) && !text.includes('薪') && text.length < 20) {
            experience = text;
          }
          if (/本科|硕士|博士|大专|中专|高中|学历|及以上/.test(text) && text.length < 20) {
            education = text;
          }
        });
        break;
      }
    }
    data.experience = experience;
    data.education = education;

    // 技能标签
    const skillTags: string[] = [];
    const tagEls = document.querySelectorAll('.job-tags .tag-item, .tag-list .tag-item, .job-tag-list .tag-item');
    tagEls.forEach(el => {
      const text = el.textContent?.trim() || '';
      if (text && text.length > 0 && text.length < 20 && !this.isBenefitTag(text)) {
        if (!skillTags.includes(text)) {
          skillTags.push(text);
        }
      }
    });
    data.skillTags = skillTags.length > 0 ? skillTags : ['未提取到技能标签'];

    // 职位描述
    const descSelectors = [
      '.job-sec-text', '.job-description .text', '.job-sec .text',
      '.job-desc', '.job-detail-section .text', '.detail-section .text'
    ];
    let descHtml = '';
    for (const sel of descSelectors) {
      const el = document.querySelector(sel);
      if (el && el.innerHTML) {
        descHtml = el.innerHTML;
        break;
      }
    }

    // 兜底：查找包含"职位描述"标题的section
    if (!descHtml) {
      const sections = document.querySelectorAll('.job-sec, .detail-section, section');
      for (const section of sections) {
        const title = section.querySelector('h3, .title, .section-title');
        if (title && /职位描述|岗位职责|岗位描述/.test(title.textContent || '')) {
          const textEl = section.querySelector('.text, .content, p');
          if (textEl && textEl.innerHTML) {
            descHtml = textEl.innerHTML;
            break;
          }
        }
      }
    }

    if (descHtml) {
      data.jobDescription = this.cleanHtml(descHtml);
    }

    // Boss信息
    const bossNameSelectors = ['.boss-info .name', '.job-boss-name', '.boss-name'];
    data.bossName = this.getTextContent(bossNameSelectors);

    const bossTitleSelectors = ['.boss-info .job-title', '.boss-title', '.job-boss-title'];
    data.bossTitle = this.getTextContent(bossTitleSelectors);

    const activeSelectors = ['.boss-active-time', '.active-time'];
    data.bossActive = this.getTextContent(activeSelectors);

    return data as JobData;
  }

  /**
   * 生成Markdown
   */
  generateMarkdown(data: JobData | JobListData): string {
    if ('jobs' in data) {
      return this.generateListMarkdown(data.jobs, data.url);
    }
    return this.generateJobMarkdown(data);
  }
}
