# 存储模块设计 Review

**审查日期：** 2026-04-21
**审查人：** Claude Code
**文档：** `docs/superpowers/specs/2026-04-21-storage-design.md`

---

## 1. 概述

设计合理，分类清晰，复用现有组件策略正确。但存在**类型定义遗漏**和**潜在数据冲突**需要处理。

---

## 2. 问题清单

### 🔴 严重问题

#### 2.1 `category` 类型未包含 `storage`

**位置：** `src/data/tech/types.ts:96`

```typescript
// 当前定义
category: 'frontend' | 'backend' | 'ai' | 'infrastructure' | 'llm-algorithm' | 'llm-application'

// 需要扩展为
category: 'frontend' | 'backend' | 'ai' | 'infrastructure' | 'llm-algorithm' | 'llm-application' | 'storage'
```

**影响：** 存储技术数据无法通过 TypeScript 类型检查。

**建议：** 更新 `TechDetail` 接口的 `category` 类型定义。

---

#### 2.2 需确认 ID 不冲突

**位置：** 待添加的 16 个存储技术

需确认以下 ID 在 `tech-database.ts` 中不存在：
- `postgresql`、`mysql`、`tidb`、`clickhouse`、`hbase`、`druid`、`starrocks`
- `mongodb`、`redis`、`rocksdb`、`influxdb`、`timescale`、`milvus`、`neo4j`、`tugraph`、`minio`

**验证命令：**
```bash
grep -E "id:\s*'(postgresql|mysql|tidb|clickhouse|hbase|druid|starrocks|mongodb|redis|rocksdb|influxdb|timescale|milvus|neo4j|tugraph|minio)'" src/data/tech/tech-database.ts
```

---

### 🟡 建议问题

#### 2.3 `categoryLabels` 在 `/tech-stack/` 页面硬编码

**位置：** `src/app/tech-stack/page.tsx:39-46`

```typescript
const categoryLabels: Record<string, string> = {
  frontend: '前端',
  backend: '后端',
  // ... 没有 storage
}
```

**建议：** 考虑将 `categoryLabels` 移到 `tech-database.ts` 作为导出常量，或添加 storage 映射。

---

#### 2.4 首页入口的 `Database` icon 需确认导入

**位置：** 设计文档 Section 2

设计文档中 `icon: Database`，需确认 `src/app/page.tsx` 已导入 `Database` from `lucide-react`。

---

#### 2.5 存储技术数据需补充完整字段

**位置：** `src/data/tech/tech-database.ts`

存储技术的 `TechDetail` 包含大量必填字段：
- `scores` - 需从 `score-data.ts` 获取评分
- `popularity` - GitHub stars 等
- `companyUsers` - 实际使用者公司
- `deepDive` - 深度内容（features、resources、bestPractices、comparisons、useCases）

**建议：** 设计文档 Section 4 的表格过于简化，建议补充每条记录的必填字段说明。

---

#### 2.6 缺少 8 个子分类的标签映射

设计定义了 8 个子分类：
- `relational`、`columnar`、`document`、`key-value`、`timeseries`、`vector`、`graph`、`object-storage`

但 `/tech-stack/` 页面的 `categoryLabels` 只映射主分类，未处理子分类标签展示。

**建议：** 确认是否需要在 UI 层展示子分类中文标签。

---

## 3. 设计亮点

1. **分类合理** - 8 个子分类覆盖了主流存储类型
2. **组件复用** - 正确复用现有 TechCard/TechGrid，避免重复造轮子
3. **实施步骤清晰** - 5 步实施计划具有可操作性

---

## 4. 建议的实施顺序

```
1. 更新 types.ts 的 category 类型定义
2. 在 tech-database.ts 添加存储技术数据（先不填 deepDive）
3. 验证数据加载无类型错误
4. 创建 /storage/page.tsx 页面
5. 更新 categoryLabels 和首页入口
6. 补充 deepDive 内容
```

---

## 5. 结论

| 项目 | 状态 |
|------|------|
| 分类架构 | ✅ 通过 |
| 数据结构 | 🔴 需修复类型 |
| 实施步骤 | ⚠️ 需补充字段说明 |
| 组件复用 | ✅ 通过 |
| 技术债务 | ⚠️ 需明确映射位置 |

**总体评价：** 设计方向正确，核心问题是需要更新 `TechDetail` 的类型定义以支持 `storage` category。修复后可以继续实施。

---

## 6. 附录

### A. 需更新的文件清单

1. `src/data/tech/types.ts` - 添加 `storage` 到 category 联合类型
2. `src/data/tech/tech-database.ts` - 添加 16 个存储技术数据
3. `src/app/page.tsx` - 添加存储入口
4. `src/app/storage/page.tsx` - 新建页面
5. `src/app/tech-stack/page.tsx` - 添加 `storage` 到 `categoryLabels`

### B. 参考：现有 category 分布

从 `src/app/tech-stack/page.tsx` 读取：
- `frontend` - 前端
- `backend` - 后端
- `ai` - AI
- `infrastructure` - 基础设施
- `llm-algorithm` - LLM算法
- `llm-application` - LLM应用
