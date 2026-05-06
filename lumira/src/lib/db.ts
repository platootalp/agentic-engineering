/**
 * IndexedDB 数据库管理
 * 
 * 使用 Dexie.js 实现本地优先的数据存储
 * 支持离线使用和云同步
 */

import Dexie, { type Table } from 'dexie';
import type {
  Fund,
  Holding,
  Transaction,
  AppSettings,
  FundNavHistory
} from '@/types';

// ============================================
// 数据库定义
// ============================================

export class LumiraDatabase extends Dexie {
  // 表定义
  funds!: Table<Fund>;
  holdings!: Table<Holding>;
  transactions!: Table<Transaction>;
  navHistories!: Table<FundNavHistory>;
  settings!: Table<AppSettings & { id: string }>;

  constructor() {
    super('LumiraDB');

    this.version(1).stores({
      funds: 'id, name, type, company, managerId, navDate',
      holdings: 'id, fundId, group, [fundId+id], updatedAt',
      transactions: 'id, holdingId, fundId, date, type, [holdingId+date]',
      navHistories: 'fundId',
      settings: 'id'
    });

    // 添加钩子
    this.holdings.hook('creating', (_primKey, obj) => {
      obj.updatedAt = new Date();
      obj.version = (obj.version || 0) + 1;
    });

    this.holdings.hook('updating', (modifications, _primKey, obj) => {
      return { ...modifications, updatedAt: new Date(), version: (obj.version || 0) + 1 };
    });
  }
}

// 单例实例
export const db = new LumiraDatabase();

// ============================================
// Fund 操作
// ============================================

export const fundDb = {
  /**
   * 获取基金信息
   */
  async get(fundId: string): Promise<Fund | undefined> {
    return db.funds.get(fundId);
  },

  /**
   * 保存或更新基金信息
   */
  async put(fund: Fund): Promise<string> {
    await db.funds.put(fund);
    return fund.id;
  },

  /**
   * 批量保存基金
   */
  async bulkPut(funds: Fund[]): Promise<void> {
    await db.funds.bulkPut(funds);
  },

  /**
   * 搜索基金
   */
  async search(query: string): Promise<Fund[]> {
    return db.funds
      .filter(fund => 
        fund.id.includes(query) || 
        fund.name.toLowerCase().includes(query.toLowerCase())
      )
      .toArray();
  },

  /**
   * 按类型获取基金
   */
  async getByType(type: string): Promise<Fund[]> {
    return db.funds.where('type').equals(type).toArray();
  },

  /**
   * 获取过期的基金数据
   */
  async getStale(maxAge: number = 24 * 60 * 60 * 1000): Promise<Fund[]> {
    const cutoff = new Date(Date.now() - maxAge);
    return db.funds.where('updatedAt').below(cutoff).toArray();
  },

  /**
   * 删除基金
   */
  async delete(fundId: string): Promise<void> {
    await db.funds.delete(fundId);
  }
};

// ============================================
// Holding 操作
// ============================================

export const holdingDb = {
  /**
   * 获取单个持仓
   */
  async get(id: string): Promise<Holding | undefined> {
    return db.holdings.get(id);
  },

  /**
   * 获取所有持仓
   */
  async getAll(): Promise<Holding[]> {
    return db.holdings.toArray();
  },

  /**
   * 按基金代码获取持仓
   */
  async getByFundId(fundId: string): Promise<Holding[]> {
    return db.holdings.where('fundId').equals(fundId).toArray();
  },

  /**
   * 创建持仓
   */
  async create(holding: Omit<Holding, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date();
    await db.holdings.add({
      ...holding,
      id,
      createdAt: now,
      updatedAt: now,
      version: 1
    });
    return id;
  },

  /**
   * 更新持仓
   */
  async update(id: string, changes: Partial<Holding>): Promise<void> {
    await db.holdings.update(id, changes);
  },

  /**
   * 更新份额和成本
   */
  async updateSharesAndCost(
    id: string, 
    newShares: number, 
    newAvgCost: number
  ): Promise<void> {
    await db.holdings.update(id, {
      totalShares: newShares,
      avgCost: newAvgCost,
      totalCost: newShares * newAvgCost
    });
  },

  /**
   * 删除持仓
   */
  async delete(id: string): Promise<void> {
    await db.holdings.delete(id);
    // 同时删除关联的交易记录
    await db.transactions.where('holdingId').equals(id).delete();
  },

  /**
   * 按分组获取持仓
   */
  async getByGroup(group: string): Promise<Holding[]> {
    return db.holdings.where('group').equals(group).toArray();
  },

  /**
   * 获取所有分组
   */
  async getAllGroups(): Promise<string[]> {
    const holdings = await db.holdings.toArray();
    const groups = new Set(holdings.map(h => h.group).filter(Boolean));
    return Array.from(groups) as string[];
  }
};

// ============================================
// Transaction 操作
// ============================================

export const transactionDb = {
  /**
   * 获取交易记录
   */
  async get(id: string): Promise<Transaction | undefined> {
    return db.transactions.get(id);
  },

  /**
   * 获取持仓的所有交易
   */
  async getByHoldingId(holdingId: string): Promise<Transaction[]> {
    return db.transactions
      .where('holdingId')
      .equals(holdingId)
      .sortBy('date');
  },

  /**
   * 获取基金的所有交易
   */
  async getByFundId(fundId: string): Promise<Transaction[]> {
    return db.transactions
      .where('fundId')
      .equals(fundId)
      .sortBy('date');
  },

  /**
   * 创建交易记录
   */
  async create(
    transaction: Omit<Transaction, 'id' | 'createdAt'>
  ): Promise<string> {
    const id = crypto.randomUUID();
    await db.transactions.add({
      ...transaction,
      id,
      createdAt: new Date()
    });
    return id;
  },

  /**
   * 批量创建交易
   */
  async bulkCreate(
    transactions: Omit<Transaction, 'id' | 'createdAt'>[]
  ): Promise<void> {
    const now = new Date();
    const txs = transactions.map(t => ({
      ...t,
      id: crypto.randomUUID(),
      createdAt: now
    }));
    await db.transactions.bulkAdd(txs);
  },

  /**
   * 删除交易
   */
  async delete(id: string): Promise<void> {
    await db.transactions.delete(id);
  },

  /**
   * 获取指定日期范围的交易
   */
  async getByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    return db.transactions
      .where('date')
      .between(startDate, endDate)
      .toArray();
  }
};

// ============================================
// Settings 操作
// ============================================

export const settingsDb = {
  /**
   * 获取设置
   */
  async get(): Promise<AppSettings> {
    const settings = await db.settings.get('app');
    return settings || getDefaultSettings();
  },

  /**
   * 保存设置
   */
  async save(settings: Partial<AppSettings>): Promise<void> {
    const current = await this.get();
    await db.settings.put({
      ...current,
      ...settings,
      id: 'app'
    });
  },

  /**
   * 重置设置
   */
  async reset(): Promise<void> {
    await db.settings.put({ ...getDefaultSettings(), id: 'app' });
  }
};

// ============================================
// 默认设置
// ============================================

function getDefaultSettings(): AppSettings & { id: string } {
  return {
    id: 'app',
    theme: 'system',
    defaultTimeRange: 'all',
    refreshInterval: 30,
    showEstimateWarning: true,
    hiddenFunds: [],
    groups: ['核心持仓', '卫星持仓', '定投计划']
  };
}

// ============================================
// 工具函数
// ============================================

/**
 * 导出所有数据
 */
export async function exportAllData() {
  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    funds: await db.funds.toArray(),
    holdings: await db.holdings.toArray(),
    transactions: await db.transactions.toArray(),
    settings: await settingsDb.get()
  };
}

/**
 * 导入数据
 */
export async function importAllData(data: {
  holdings: Holding[];
  transactions: Transaction[];
  settings: AppSettings;
}) {
  await db.transaction('rw', db.holdings, db.transactions, db.settings, async () => {
    await db.holdings.clear();
    await db.transactions.clear();
    
    if (data.holdings?.length) {
      await db.holdings.bulkAdd(data.holdings);
    }
    if (data.transactions?.length) {
      await db.transactions.bulkAdd(data.transactions);
    }
    if (data.settings) {
      await settingsDb.save(data.settings);
    }
  });
}

/**
 * 清空所有数据
 */
export async function clearAllData() {
  await db.transaction('rw', 
    db.funds, db.holdings, db.transactions, db.navHistories, 
    async () => {
      await db.funds.clear();
      await db.holdings.clear();
      await db.transactions.clear();
      await db.navHistories.clear();
    }
  );
}