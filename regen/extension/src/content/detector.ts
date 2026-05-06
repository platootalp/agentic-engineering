/**
 * 网站检测器
 * 自动检测当前网站并返回对应的适配器
 */

import { ZhipinAdapter } from './adapters/zhipin';
import type { IJobAdapter, SiteType } from '@/types/jd';




// 注册所有适配器
const adapters: IJobAdapter[] = [
  new ZhipinAdapter(),
  // 未来可以在这里添加更多适配器
  // new LagouAdapter(),
  // new BossAdapter(),
];

/**
 * 检测当前网站类型
 */
export function detectSite(): SiteType {
  const host = window.location.host;

  if (host.includes('zhipin.com')) {
    return 'zhipin';
  }

  // 未来可以添加更多网站检测
  // if (host.includes('lagou.com')) return 'lagou';

  return 'unknown';
}

/**
 * 获取当前页面适用的适配器
 */
export function getAdapter(): IJobAdapter | null {
  for (const adapter of adapters) {
    if (adapter.isSupported()) {
      return adapter;
    }
  }
  return null;
}

/**
 * 检查当前页面是否被支持
 */
export function isCurrentPageSupported(): boolean {
  return getAdapter() !== null;
}

/**
 * 获取所有已注册的适配器
 */
export function getAllAdapters(): IJobAdapter[] {
  return [...adapters];
}

/**
 * 获取支持的网站列表
 */
export function getSupportedSites(): string[] {
  return adapters.map(adapter => adapter.name);
}
