/**
 * 存储工具
 * 封装 Chrome Storage API，提供类型安全的存储操作
 */

import type { ExtractorConfig, StorageData, JobData } from '@/types/jd';

// 默认配置
const DEFAULT_CONFIG: ExtractorConfig = {
  apiBaseUrl: 'http://localhost:3000',
  autoSync: false,
  showFloatingButton: true,
};

/**
 * 存储工具类
 */
class Storage {
  /**
   * 获取配置
   */
  async getConfig(): Promise<ExtractorConfig> {
    const result = await chrome.storage.local.get('config');
    return {
      ...DEFAULT_CONFIG,
      ...(result.config || {}),
    };
  }

  /**
   * 设置配置
   */
  async setConfig(config: Partial<ExtractorConfig>): Promise<void> {
    const currentConfig = await this.getConfig();
    await chrome.storage.local.set({
      config: {
        ...currentConfig,
        ...config,
      },
    });
  }

  /**
   * 获取上次提取结果
   */
  async getLastExtraction(): Promise<StorageData['lastExtraction'] | null> {
    const result = await chrome.storage.local.get('lastExtraction');
    return result.lastExtraction || null;
  }

  /**
   * 设置上次提取结果
   */
  async setLastExtraction(
    type: 'detail' | 'list',
    data: JobData | JobData[],
    markdown: string
  ): Promise<void> {
    const extraction = {
      type,
      data,
      markdown,
      timestamp: new Date().toISOString(),
      count: Array.isArray(data) ? data.length : 1,
    };

    await chrome.storage.local.set({
      lastExtraction: extraction,
      extractionStatus: 'completed',
    });
  }

  /**
   * 获取提取状态
   */
  async getExtractionStatus(): Promise<StorageData['extractionStatus']> {
    const result = await chrome.storage.local.get('extractionStatus');
    return result.extractionStatus || 'idle';
  }

  /**
   * 设置提取状态
   */
  async setExtractionStatus(status: StorageData['extractionStatus']): Promise<void> {
    await chrome.storage.local.set({ extractionStatus: status });
  }

  /**
   * 清除所有数据
   */
  async clear(): Promise<void> {
    await chrome.storage.local.clear();
  }

  /**
   * 获取所有存储的数据
   */
  async getAll(): Promise<StorageData> {
    const result = await chrome.storage.local.get([
      'config',
      'lastExtraction',
      'extractionStatus',
    ]);

    return {
      config: result.config || DEFAULT_CONFIG,
      lastExtraction: result.lastExtraction,
      extractionStatus: result.extractionStatus || 'idle',
    };
  }
}

// 导出单例
export const storage = new Storage();
