/**
 * 职位适配器基类
 * 定义了所有适配器必须实现的接口和通用方法
 */

import type {
  IJobAdapter,
  JobData,
  ExtractionResult,
  PageType,
  JobListData,
} from '@/types/jd';

/**
 * 职位适配器抽象基类
 * 所有网站适配器都需要继承此类
 */
export abstract class BaseJobAdapter implements IJobAdapter {
  /** 适配器名称 */
  abstract readonly name: string;

  /** 支持的域名模式 */
  abstract readonly hostPatterns: string[];

  /** 当前页面URL */
  protected url: string;

  /** 当前文档 */
  protected document: Document;

  constructor() {
    this.url = window.location.href;
    this.document = document;
  }

  /**
   * 检查是否支持当前页面
   */
  isSupported(): boolean {
    const host = window.location.host;
    return this.hostPatterns.some((pattern) => {
      // 支持通配符匹配
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(host);
    });
  }

  /**
   * 检测当前页面类型
   * 子类需要重写此方法
   */
  abstract detectPageType(): PageType;

  /**
   * 提取职位数据
   * 子类需要重写此方法
   */
  abstract extract(): ExtractionResult;

  /**
   * 通用工具方法：尝试多个选择器获取元素
   * @param selectors 选择器列表
   * @returns 找到的第一个元素或null
   */
  protected querySelector(selectors: string[]): Element | null {
    for (const selector of selectors) {
      const el = this.document.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  /**
   * 通用工具方法：尝试多个选择器获取元素文本
   * @param selectors 选择器列表
   * @param defaultValue 默认值
   * @returns 元素文本或默认值
   */
  protected getTextContent(selectors: string[], defaultValue = ''): string {
    const el = this.querySelector(selectors);
    return el?.textContent?.trim() || defaultValue;
  }

  /**
   * 通用工具方法：在容器内尝试多个选择器获取元素文本
   * @param container 容器元素
   * @param selectors 选择器列表
   * @param defaultValue 默认值
   * @returns 元素文本或默认值
   */
  protected getTextContentInContainer(
    container: Element,
    selectors: string[],
    defaultValue = ''
  ): string {
    for (const selector of selectors) {
      const el = container.querySelector(selector);
      if (el?.textContent?.trim()) {
        return el.textContent.trim();
      }
    }
    return defaultValue;
  }

  /**
   * 通用工具方法：获取多个元素
   * @param selectors 选择器列表
   * @returns 元素数组
   */
  protected querySelectorAll(selectors: string[]): Element[] {
    for (const selector of selectors) {
      const els = this.document.querySelectorAll(selector);
      if (els.length > 0) {
        return Array.from(els);
      }
    }
    return [];
  }

  /**
   * 通用工具方法：清理HTML标签
   * @param html HTML字符串
   * @returns 清理后的文本
   */
  protected cleanHtml(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<li[^>]*>/gi, '  • ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim();
  }

  /**
   * 通用工具方法：生成职位Markdown
   * @param job 职位数据
   * @returns Markdown字符串
   */
  protected generateJobMarkdown(job: JobData): string {
    let md = `# ${job.jobName}\n\n`;
    md += `## 基本信息\n\n`;
    md += `- **公司**：${job.company}\n`;
    md += `- **薪资**：${job.salary || '面议'}\n`;
    md += `- **地点**：${job.location || '未知'}\n`;
    md += `- **经验要求**：${job.experience || '不限'}\n`;
    md += `- **学历要求**：${job.education || '不限'}\n`;

    if (job.isAgency) {
      md += `- **公司类型**：⚠️ 代招/猎头职位（公司名称未公开）\n`;
    }

    if (job.companyTags && job.companyTags.length > 0) {
      md += `- **公司情况**：${job.companyTags.join(' | ')}\n`;
    }

    if (job.skillTags.length > 0) {
      md += `- **技能标签**：${job.skillTags.slice(0, 10).join('、')}\n`;
    }

    if (job.bossName) {
      md += `- **招聘官**：${job.bossName}${job.bossTitle ? '（' + job.bossTitle + '）' : ''}\n`;
    }

    if (job.bossActive) {
      md += `- **活跃度**：${job.bossActive}\n`;
    }

    md += `- **链接**：${job.url}\n\n`;

    if (job.jobDescription) {
      md += `## 职位描述\n\n${job.jobDescription}\n\n`;
    }

    md += `---\n*提取自 ${this.name}*\n`;

    return md;
  }

  /**
   * 通用工具方法：生成职位列表Markdown
   * @param jobs 职位列表
   * @param pageUrl 页面URL
   * @returns Markdown字符串
   */
  protected generateListMarkdown(jobs: JobData[], pageUrl: string): string {
    if (jobs.length === 0) {
      return '# 职位列表\n\n未找到职位信息\n';
    }

    let md = `# ${this.name}职位列表\n\n`;
    md += `**来源页面**：${pageUrl}\n\n`;
    md += `**共找到 ${jobs.length} 个职位**\n\n`;
    md += `---\n\n`;

    jobs.forEach((job, idx) => {
      md += `## ${idx + 1}. ${job.jobName}\n\n`;
      md += `- **公司**：${job.company}\n`;
      md += `- **薪资**：${job.salary}\n`;
      if (job.location) md += `- **地点**：${job.location}\n`;
      if (job.experience) md += `- **经验要求**：${job.experience}\n`;
      if (job.education) md += `- **学历要求**：${job.education}\n`;
      if (job.skillTags.length > 0) {
        md += `- **技能标签**：${job.skillTags.slice(0, 8).join('、')}\n`;
      }
      if (job.bossName) {
        md += `- **招聘官**：${job.bossName}${job.bossTitle ? '（' + job.bossTitle + '）' : ''}\n`;
      }
      if (job.url) {
        md += `- **链接**：${job.url}\n`;
      }
      md += `\n`;
    });

    md += `---\n*提取自 ${this.name}*\n`;

    return md;
  }

  /**
   * 创建成功结果
   */
  protected createSuccessResult(
    pageType: PageType,
    data: JobData | JobListData,
    markdown?: string
  ): ExtractionResult {
    return {
      success: true,
      pageType,
      data,
      markdown,
    };
  }

  /**
   * 创建失败结果
   */
  protected createErrorResult(error: string): ExtractionResult {
    return {
      success: false,
      pageType: 'unknown',
      data: {} as JobData,
      error,
    };
  }

  /**
   * 判断是否是福利类标签（需要排除）
   * @param text 标签文本
   * @returns 是否是福利标签
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
   * 判断是否是薪资文本
   * @param text 文本
   * @returns 是否是薪资
   */
  protected isSalary(text: string): boolean {
    if (!text) return false;
    return /^\d+[-\d]*K/i.test(text) || /薪|工资|面议/i.test(text);
  }
}
