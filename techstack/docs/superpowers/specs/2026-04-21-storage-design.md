# 存储技术模块设计

**审查日期：** 2026-04-21
**文档状态：** 已更新（修复 review 发现的问题）

---

## 1. 概述

在 TechStack Panorama 中新增**存储**主分类，展示关系型与非关系型存储技术。

### 1.1 设计目标

- 新增独立主分类 `storage`，与前端、后端、AI、基础设施平级
- 添加 16 个主流存储技术的数据
- 复用现有 UI 组件，最小化开发工作量

---

## 2. 分类架构

### 2.1 主分类

新增独立分类：`storage`（存储）

### 2.2 子分类（8 个）

| 子分类 ID | 中文名 | 说明 |
|-----------|--------|------|
| `relational` | 关系型数据库 | PostgreSQL、MySQL 等 |
| `columnar` | 列式存储 | ClickHouse、HBase 等 |
| `document` | 文档数据库 | MongoDB |
| `key-value` | 键值存储 | Redis、RocksDB 等 |
| `timeseries` | 时序数据库 | InfluxDB、TimescaleDB |
| `vector` | 向量数据库 | Milvus |
| `graph` | 图数据库 | Neo4j、TuGraph |
| `object-storage` | 对象存储 | MinIO |

---

## 3. 类型定义更新

### 3.1 `src/data/tech/types.ts` - category 类型扩展

```typescript
// 现有定义（第 96 行）
category: 'frontend' | 'backend' | 'ai' | 'infrastructure' | 'llm-algorithm' | 'llm-application'

// 更新为
category: 'frontend' | 'backend' | 'ai' | 'infrastructure' | 'llm-algorithm' | 'llm-application' | 'storage'
```

### 3.2 子分类标签映射

在 `categoryLabels` 中添加：
```typescript
storage: '存储'
```

---

## 4. 首页入口

**文件：** `src/app/page.tsx`

在 `techModules` 数组中添加：

```typescript
{
  title: '存储技术栈',
  href: '/storage',
  icon: Database,  // 已导入，无需修改
  description: '关系型与非关系型存储，覆盖数据库、列式存储、时序、向量等',
  gradient: 'from-orange-500/10 to-red-500/10',
  iconColor: 'text-orange-500 dark:text-orange-400',
  tags: ['PostgreSQL', 'Redis', 'ClickHouse', 'MongoDB']
}
```

---

## 5. 页面路由

新建 `src/app/storage/page.tsx`，展示存储技术列表。

页面结构与 `/tech-stack/` 类似，支持：
- Grid / List 视图切换
- 搜索功能
- 子分类筛选
- 排序（评分、名称、流行度等）

---

## 6. 待添加的存储技术（16 个）

**文件：** `src/data/tech/tech-database.ts`

### 6.1 关系型数据库（3 个）

| ID | 名称 | 子分类 | 描述 | 版本 |
|----|------|--------|------|------|
| `postgresql` | PostgreSQL | relational | 开源关系型数据库，强大的 SQL 支持和扩展性 | 16.x |
| `mysql` | MySQL | relational | 广泛使用的关系型数据库，高可靠性 | 8.0 |
| `tidb` | TiDB | relational | 分布式 NewSQL，兼容 MySQL 协议 | 8.0 |

### 6.2 列式存储（4 个）

| ID | 名称 | 子分类 | 描述 |
|----|------|--------|------|
| `clickhouse` | ClickHouse | columnar | 列式分析数据库，高速 OLAP |
| `hbase` | HBase | columnar | BigTable 类型列式存储，Hadoop 生态 |
| `druid` | Apache Druid | columnar | 实时分析列式存储，低延迟查询 |
| `starrocks` | StarRocks | columnar | 现代化向量化列式存储 |

### 6.3 文档数据库（1 个）

| ID | 名称 | 子分类 | 描述 |
|----|------|--------|------|
| `mongodb` | MongoDB | document | 文档数据库，灵活的 JSON 模型 |

### 6.4 键值存储（2 个）

| ID | 名称 | 子分类 | 描述 |
|----|------|--------|------|
| `redis` | Redis | key-value | 内存键值存储，高性能缓存 |
| `rocksdb` | RocksDB | key-value | 嵌入键值存储，LSM 树结构 |

### 6.5 时序数据库（2 个）

| ID | 名称 | 子分类 | 描述 |
|----|------|--------|------|
| `influxdb` | InfluxDB | timeseries | 时序数据库，监控和 IoT 场景 |
| `timescale` | TimescaleDB | timeseries | PostgreSQL 扩展，时序分析 |

### 6.6 向量数据库（1 个）

| ID | 名称 | 子分类 | 描述 |
|----|------|--------|------|
| `milvus` | Milvus | vector | 开源向量数据库，AI 应用 |

### 6.7 图数据库（2 个）

| ID | 名称 | 子分类 | 描述 |
|----|------|--------|------|
| `neo4j` | Neo4j | graph | 图数据库，属性图模型 |
| `tugraph` | TuGraph | graph | 蚂蚁图数据库，高性能 |

### 6.8 对象存储（1 个）

| ID | 名称 | 子分类 | 描述 |
|----|------|--------|------|
| `minio` | MinIO | object-storage | S3 兼容对象存储，Kubernetes 原生 |

---

## 7. 数据字段说明

每个存储技术的 `TechDetail` 包含以下字段：

| 字段 | 说明 | 示例 |
|------|------|------|
| `id` | 唯一标识 | `postgresql` |
| `name` | 技术名称 | `PostgreSQL` |
| `category` | 主分类 | `storage` |
| `subcategory` | 子分类 | `relational` |
| `description` | 简要描述 | `开源关系型数据库...` |
| `tagline` | 一句话介绍 | `功能强大的开源数据库` |
| `version` | 最新版本 | `16.x` |
| `pros` | 优点列表 | `['强大的SQL支持', '丰富的扩展']` |
| `cons` | 缺点列表 | `['配置复杂']` |
| `bestFor` | 最适合场景 | `['企业级应用', '复杂查询']` |
| `notFor` | 不适合场景 | `['简单的 KV 存储']` |
| `learningCurve` | 学习曲线 | `beginner` \| `intermediate` \| `advanced` |
| `ecosystemScore` | 生态评分 | `85` |
| `popularity.githubStars` | GitHub Stars | `10000` |
| `companyUsers` | 使用公司 | `['Google', 'Meta']` |
| `scores` | 评分数据 | 见 TechScores |
| `deepDive` | 深度内容 | 见 TechDeepDive |

---

## 8. ID 冲突检查

**验证结果：** 以下 ID 在 `tech-database.ts` 中不存在，可以直接使用：

```
postgresql、mysql、tidb、clickhouse、hbase、druid、starrocks
mongodb、redis、rocksdb、influxdb、timescale、milvus、neo4j、tugraph、minio
```

---

## 9. UI 组件复用

无需新增 UI 组件，复用：

| 组件 | 用途 |
|------|------|
| `TechCard` | 卡片展示 |
| `TechGrid` | 网格布局 |
| `ScoreBadge` | 评分展示 |
| `PaginationControl` | 分页控制 |
| `usePagination` | 分页逻辑 |

---

## 10. 实施步骤

### Phase 1：类型和数据基础

1. 更新 `src/data/tech/types.ts` - 添加 `storage` 到 category 联合类型
2. 在 `tech-database.ts` 中添加 16 个存储技术的基础数据（不含 deepDive）
3. 验证 TypeScript 编译无错误

### Phase 2：页面开发

4. 创建 `src/app/storage/page.tsx` 页面
5. 更新 `categoryLabels` 映射
6. 更新首页入口（在 `techModules` 中添加存储卡片）

### Phase 3：深度内容

7. 补充每个存储技术的 `deepDive` 内容（features、resources、bestPractices、comparisons、useCases）

---

## 11. 需更新的文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/data/tech/types.ts` | 修改 | 添加 `storage` 到 category |
| `src/data/tech/tech-database.ts` | 修改 | 添加 16 个存储技术 |
| `src/app/page.tsx` | 修改 | 添加存储入口卡片 |
| `src/app/storage/page.tsx` | 新建 | 存储列表页 |
| `src/app/tech-stack/page.tsx` | 修改 | 添加 `storage: '存储'` 到 categoryLabels |
| `docs/superpowers/specs/2026-04-21-storage-design.md` | 修改 | 本文档 |

---

## 12. 验收标准

- [ ] TypeScript 编译无错误
- [ ] 首页显示"存储技术栈"入口卡片
- [ ] `/storage` 页面正常显示 16 个存储技术
- [ ] `/tech-stack/` 页面的分类筛选包含"存储"
- [ ] 点击存储卡片进入详情页正常

---

## 13. 设计亮点

1. **分类合理** - 8 个子分类覆盖主流存储类型
2. **组件复用** - 正确复用现有组件，避免重复开发
3. **ID 无冲突** - 16 个新 ID 均未使用
4. **分步实施** - 先基础数据，后深度内容，降低风险