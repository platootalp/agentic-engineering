# 游戏市场分析 Agent — 完整设计文档（v2）

> 基于 MVP 版本的全面重构，采用模块化单体架构，支持 Agentic AI 工作流和完整 BI 仪表盘。

---

## 1. 项目概述

### 1.1 目标

为独立游戏开发者提供一款 **AI Agent 工具**，通过多数据源（Exa 搜索 + App Store/Google Play 排行榜）抓取休闲游戏品类的最新数据，采用 **Agentic AI 标准工作流**（Plan→Search→Analyze→Verify→Report）生成结构化分析报告，并通过 **BI 仪表盘** 展示趋势洞察。

### 1.2 核心价值

- **自动化**：定时 + 手动双模式执行，无需人工干预
- **可迭代**：支持对报告重新分析直到满意
- **可配置**：品类管理完全可定制
- **可视化**：完整 BI 仪表盘，支持数据对比

---

## 2. 系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              用户                                             │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │ HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Next.js Frontend                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  仪表盘首页   │  │  报告详情    │  │  品类管理    │  │  报告生成    │  │
│  │  Dashboard   │  │  Report      │  │  Categories  │  │  Generate    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │ HTTP/REST + WebSocket
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FastAPI Backend                                     │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                      API Gateway (FastAPI)                          │  │
│  │   /api/dashboard  /api/reports  /api/categories  /api/execute     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │  调度器模块      │  │  品类管理模块    │  │  报告管理模块    │         │
│  │  Scheduler      │  │  Category Svc   │  │  Report Svc     │         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    Agent 执行引擎 (Agentic Loop)                      │  │
│  │                                                                       │  │
│  │   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐         │  │
│  │   │  Plan   │───▶│ Search  │───▶│ Analyze │───▶│ Verify  │──┐      │  │
│  │   └─────────┘    └─────────┘    └─────────┘    └─────────┘  │      │  │
│  │       ▲                                              │        │      │  │
│  │       │           ┌─────────┐                       │        │      │  │
│  │       └───────────┤ Report  │◀──────────────────────┘        │      │  │
│  │                   └─────────┘        (迭代优化)                 │      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │  数据采集服务     │  │  分析服务        │  │  存储服务        │         │
│  │  ExaSearch       │  │  Claude LLM     │  │  SQLite + 文件   │         │
│  │  AppStore API    │  │                 │  │                  │         │
│  │  GP API          │  │                 │  │                  │         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
└───────────────────────────────────────────────────────────────────────────┘
```

### 2.2 模块职责边界

| 模块 | 职责 | 清晰边界 |
|------|------|----------|
| **API Gateway** | 路由分发、请求校验、CORS | 只做路由，不含业务逻辑 |
| **Scheduler** | 定时任务触发（每日 9:00）、手动触发入口 | 只负责"何时执行"，不负责"如何执行" |
| **Category Service** | 品类的 CRUD、关键词管理 | 只管理品类元数据，不涉及采集分析 |
| **Report Service** | 报告的存储、查询、版本管理 | 只管理报告生命周期，不负责生成 |
| **Agent Engine** | Agentic Loop 控制流（Plan→Search→Analyze→Verify→Report） | 纯流程编排，调用外部服务 |
| **ExaSearch Service** | 网页搜索 | 只负责搜索，不负责数据处理 |
| **AppStore/GP Service** | 榜单数据抓取 | 只负责抓取，不负责分析 |
| **LLM Service** | Claude API 调用 | 只负责推理，不负责提示管理 |
| **Storage Service** | SQLite 读写、文件存储 | 只负责存取，不负责业务规则 |

### 2.3 技术栈

| 组件 | 技术 | 说明 |
|------|------|------|
| 前端 | Next.js 14 (App Router) | SPA + Server Components |
| UI 组件 | Radix UI + Tailwind CSS | 无样式组件库 |
| 图表 | Recharts | 轻量图表库 |
| 后端 | FastAPI (Python 3.11+) | ASGI 高性能 |
| 数据库 | SQLite + SQLAlchemy | 本地持久化 |
| LLM | Claude API (Anthropic) | 分析引擎 |
| 搜索 | Exa API | 网页搜索 |
| 榜单 | App Store Connect API + Google Play Scraper | 结构化数据 |
| 调度 | APScheduler | 定时任务 |
| 部署 | Docker Compose | 一键启动 |

### 2.4 目录结构

```
game-market-agent/
├── backend/
│   ├── main.py                    # FastAPI 入口
│   ├── config.py                  # 配置管理（从 .env 加载）
│   ├── routers/
│   │   ├── dashboard.py           # 仪表盘 API
│   │   ├── reports.py             # 报告 API
│   │   ├── categories.py          # 品类 API
│   │   └── execute.py             # 执行触发 API
│   ├── services/
│   │   ├── scheduler.py           # 调度器服务
│   │   ├── agent/
│   │   │   ├── engine.py          # Agent 执行引擎
│   │   │   ├── planner.py         # Plan 步骤
│   │   │   ├── searcher.py        # Search 步骤
│   │   │   ├── analyzer.py        # Analyze 步骤
│   │   │   ├── verifier.py        # Verify 步骤
│   │   │   └── reporter.py        # Report 步骤
│   │   ├── data_sources/
│   │   │   ├── exa_search.py      # Exa 搜索服务
│   │   │   ├── appstore.py        # App Store 榜单
│   │   │   └── google_play.py      # Google Play 榜单
│   │   ├── llm/
│   │   │   └── claude.py          # Claude API 调用
│   │   └── storage/
│   │       ├── database.py         # SQLite 连接
│   │       └── file_storage.py    # 文件存储
│   ├── db/
│   │   ├── models.py              # SQLAlchemy ORM 模型
│   │   └── migrations/           # 数据库迁移
│   ├── schemas/                   # Pydantic 请求/响应模型
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # 仪表盘首页
│   │   ├── reports/
│   │   │   ├── page.tsx          # 报告列表
│   │   │   └── [id]/page.tsx     # 报告详情
│   │   ├── categories/
│   │   │   └── page.tsx          # 品类管理
│   │   └── execute/
│   │       └── page.tsx          # 手动执行页面
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── KPICard.tsx        # KPI 卡片
│   │   │   ├── TrendChart.tsx     # 趋势图表
│   │   │   ├── CategoryRanking.tsx # 品类排名
│   │   │   └── ActivityFeed.tsx   # 活动动态
│   │   ├── reports/
│   │   │   ├── ReportCard.tsx     # 报告卡片
│   │   │   ├── ReportDetail.tsx   # 报告详情
│   │   │   └── ReportCompare.tsx  # 报告对比
│   │   ├── categories/
│   │   │   ├── CategoryList.tsx   # 品类列表
│   │   │   └── CategoryForm.tsx   # 品类表单
│   │   └── ui/                    # 通用 UI 组件
│   ├── lib/
│   │   ├── api.ts                # API 客户端
│   │   └── utils.ts              # 工具函数
│   └── package.json
├── data/                          # 数据目录（SQLite + 上传文件）
├── docker-compose.yml
├── script/                        # 启动脚本目录
│   ├── setup.sh                    # Docker 环境初始化
│   ├── start_local.sh              # 本地开发启动（直接启动 uvicorn + next）
│   └── stop_local.sh               # 停止本地服务
└── README.md
```

---

## 3. Agentic AI 工作流设计

### 3.1 工作流状态机

```
┌─────────┐
│  IDLE   │◀──────────────────────────────────────────────┐
└────┬────┘                                              │
     │ 执行触发（定时 / 手动 / 迭代）                       │
     ▼                                                    │
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐ │
│  PLAN   │───▶│ SEARCH  │───▶│ ANALYZE │───▶│ VERIFY  │ │
└────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘ │
     │              │              │              │       │
     │ 失败          │ 失败          │ 失败          │ 失败   │
     ▼              ▼              ▼              ▼       │
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   │
│  ERROR  │   │  ERROR  │   │  ERROR  │   │  ERROR  │   │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   │
                                                           │
     │ 验证失败（迭代次数 < 3）        验证通过             │
     │      │                        │                    │
     └──────┴────────────────────────┘                    │
                         │                                  │
                         ▼                                  │
                   ┌─────────┐                              │
                   │ REPORT  │──────────────────────────────┘
                   └─────────┘  (最终报告)

状态转换说明：
- PLAN → SEARCH: 正常流程
- SEARCH → ANALYZE: 正常流程
- ANALYZE → VERIFY: 正常流程
- VERIFY → PLAN: 验证失败，迭代（最多 3 次，含初始执行）
- VERIFY → REPORT: 验证通过
- 任意步骤 → ERROR: 执行失败，记录错误信息

迭代控制：
- iteration_depth 字段跟踪当前迭代次数（0-3）
- 超过 3 次迭代后，强制进入 REPORT 步骤
- 最终报告中标记"数据可能不够完整，建议手动补充"
```

### 3.2 各步骤详细设计

#### Step 1: PLAN（规划）

**输入：** 用户触发、品类配置、执行上下文

**输出：** `ExecutionPlan` — 本次执行的搜索计划

**Prompt 模板：**
```
你是一个游戏市场分析师。根据以下品类配置，为本次数据采集制定搜索计划：

品类配置：
{categories}

历史报告摘要（用于避免重复）：
{last_report_summary}

请制定：
1. 每个品类的搜索关键词
2. 数据源优先级（Exa 搜索 / App Store / Google Play）
3. 重点关注的问题列表
```

**输出结构：**
```json
{
  "search_queries": [
    {
      "category": "casual_puzzle",
      "queries": ["casual puzzle games trending April 2026"],
      "data_source": "exa",
      "focus_areas": ["下载量趋势", "新游戏发布"]
    }
  ],
  "analysis_dimensions": [
    "市场热度变化",
    "Top 游戏分析",
    "新兴趋势识别"
  ],
  "expected_sources": ["exa", "appstore", "google_play"]
}
```

#### Step 2: SEARCH（搜索）

**输入：** `ExecutionPlan`

**输出：** `SearchResults` — 各数据源的原始结果

**执行逻辑：**
```python
async def search(execution_plan: ExecutionPlan) -> SearchResults:
    results = SearchResults()

    for query in execution_plan.search_queries:
        if query.data_source == "exa":
            results.exa_results = await exa_search(query)
        elif query.data_source == "appstore":
            results.appstore_results = await appstore_scrape(query)
        elif query.data_source == "google_play":
            results.gp_results = await google_play_scrape(query)

    return results
```

**数据保存：** 原始结果存入 `raw_data` 表，供后续步骤使用。

#### Step 3: ANALYZE（分析）

**输入：** `SearchResults` + `ExecutionPlan.analysis_dimensions`

**输出：** `AnalysisDraft` — 初版分析结果

**Prompt 模板：**
```
你是一个专业的游戏市场分析师。根据以下数据，生成结构化分析报告：

分析维度：
{analysis_dimensions}

数据来源：
{search_results}

请生成：
1. 市场概览（300字）
2. 各品类详细分析
3. 趋势洞察（5条）
4. 机会与风险
5. 数据可信度评估
```

**输出结构：**
```json
{
  "summary": "市场概览文本...",
  "category_analysis": {
    "casual_puzzle": {
      "heat_index": 85,
      "top_games": [...],
      "trends": [...],
      "opportunities": [...]
    }
  },
  "insights": [
    {
      "type": "trend",
      "title": "解谜品类热度上升",
      "evidence": [...],
      "confidence": 0.9
    }
  ],
  "risks": [...],
  "opportunities": [...],
  "data_quality": {
    "exa_coverage": 0.8,
    "appstore_coverage": 0.6,
    "overall_confidence": 0.75
  }
}
```

#### Step 4: VERIFY（验证）

**输入：** `AnalysisDraft`

**输出：** `VerificationResult` — 通过 / 不通过 + 原因

**验证规则：**
1. **数据完整性检查** — 是否覆盖所有品类？是否有数据缺失？
2. **可信度检查** — `data_quality.overall_confidence >= 0.6`
3. **洞察有效性检查** — 每条洞察是否有证据支撑？
4. **逻辑一致性检查** — 洞察之间是否矛盾？

**迭代限制：** 最多迭代 3 次（PLAN→SEARCH→ANALYZE→VERIFY 循环），超过后强制进入 REPORT 步骤，报告中标记"数据可能不够完整，建议手动补充"。

**如果验证不通过：** 返回 `VerificationResult.fail(reasons)`，触发迭代回到 PLAN。

```python
@dataclass
class VerificationResult:
    passed: bool
    reasons: list[str]
    suggested_fixes: list[str]
```

#### Step 5: REPORT（报告）

**输入：** `AnalysisDraft`（通过验证）

**输出：** `Report` — 最终报告，存入数据库

**生成步骤：**
1. 组装完整报告 JSON
2. 计算衍生指标（YoY/MoM 变化、品类排名）
3. 生成摘要版本（用于卡片展示）
4. **存入 `report_metrics` 表** — 从 `AnalysisDraft.category_analysis` 中提取各品类的 `heat_index`、`downloads`、`revenue` 等指标，按 `period` 归档
5. 存入 `reports` 表（包含 `metrics` JSON 字段）
6. 更新 `executions` 表的 `step_results` 和 `completed_at`
7. 释放执行锁（见 4.4 节）
8. 通知前端（WebSocket / 轮询）

**指标计算逻辑：**
```python
# 从 AnalysisDraft 提取指标存入 report_metrics
for category_slug, analysis in draft.category_analysis.items():
    await db.insert(report_metrics, {
        "report_id": report.id,
        "category_slug": category_slug,
        "metric_type": "heat_index",
        "value": analysis.heat_index,
        "period": current_period  # e.g., "2026-04"
    })
    # 同理处理 downloads, revenue, rating 等指标
```

---

## 4. 数据模型

### 4.1 ER 图

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│    categories    │     │     reports       │     │    raw_data      │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│ id (PK)          │     │ id (PK)          │     │ id (PK)          │
│ name             │     │ title            │     │ report_id (FK)   │──┐
│ slug             │     │ summary          │◀────│ source_type      │  │
│ keywords (JSON)  │     │ full_content     │     │ raw_results (JSON│  │
│ data_sources(JSON│     │ insights (JSON)   │     │ created_at       │  │
│ enabled          │     │ sources (JSON)    │     └──────────────────┘  │
│ priority         │     │ metrics (JSON)    │     ┌──────────────────┐  │
│ created_at       │     │ execution_id (FK) │     │ report_metrics   │  │
│ updated_at       │     │ status            │     ├──────────────────┤  │
└──────────────────┘     │ created_at        │     │ report_id (FK)  │──┘
                          │ version           │     │ category_slug    │
                          │ parent_id (FK,   │     │ metric_type      │
                          │   nullable)       │     │ value            │
                          │ iteration_depth   │     │ period           │
                          └──────────────────┘     │ created_at       │
                                                     └──────────────────┘
┌──────────────────┐
│  executions      │
├──────────────────┤
│ id (PK)          │
│ report_id (FK, nullable) │
│ status            │
│ trigger_type     │
│ plan_input (JSON) │
│ step_results(JSON│
│ started_at        │
│ completed_at      │
│ error_message     │
└──────────────────┘
```

### 4.2 表结构

#### categories 表

```sql
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,              -- "休闲解谜"
    slug TEXT UNIQUE NOT NULL,        -- "casual_puzzle"
    keywords TEXT NOT NULL,           -- JSON: ["puzzle games", "casual puzzle"]
    data_sources TEXT NOT NULL,       -- JSON: ["exa", "appstore", "google_play"]
    enabled BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,      -- 数字越大优先级越高
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_enabled ON categories(enabled);
```

#### reports 表

```sql
CREATE TABLE reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    summary TEXT,                     -- 卡片展示用（300字）
    full_content TEXT,                -- 完整报告（Markdown）
    insights TEXT,                    -- JSON array
    sources TEXT,                      -- JSON array
    metrics TEXT,                     -- JSON: {category_rankings, kpis, heat_index_trend}
    execution_id INTEGER,              -- 关联 executions.id
    status TEXT DEFAULT 'draft',      -- draft / published / archived
    version INTEGER DEFAULT 1,
    parent_id INTEGER,                -- 指向迭代前的 report id
    iteration_depth INTEGER DEFAULT 0 CHECK (iteration_depth <= 3),  -- 迭代深度限制
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES reports(id),
    FOREIGN KEY (execution_id) REFERENCES executions(id)
);

-- 索引
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_parent_id ON reports(parent_id);
CREATE INDEX idx_reports_execution_id ON reports(execution_id);
```

#### raw_data 表

```sql
CREATE TABLE raw_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER,
    category_slug TEXT NOT NULL,
    source_type TEXT NOT NULL,         -- 'exa' / 'appstore' / 'google_play'
    query TEXT,
    raw_results TEXT NOT NULL,        -- JSON array of results
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id)
);

-- 索引
CREATE INDEX idx_raw_data_report_id ON raw_data(report_id);
CREATE INDEX idx_raw_data_category_source ON raw_data(category_slug, source_type);
```

#### executions 表

```sql
CREATE TABLE executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER,                -- nullable: 执行失败时可能没有报告
    status TEXT NOT NULL,             -- idle / running / paused / completed / failed
    trigger_type TEXT NOT NULL,        -- 'scheduled' / 'manual' / 'iteration'
    plan_input TEXT,                   -- JSON
    step_results TEXT,                 -- JSON: {plan: {}, search: {}, ...}
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    FOREIGN KEY (report_id) REFERENCES reports(id)
);

-- 索引
CREATE INDEX idx_executions_report_id ON executions(report_id);
CREATE INDEX idx_executions_status ON executions(status);
CREATE INDEX idx_executions_started_at ON executions(started_at DESC);
```

#### report_metrics 表

```sql
CREATE TABLE report_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    category_slug TEXT NOT NULL,
    metric_type TEXT NOT NULL,        -- 'downloads' / 'revenue' / 'rating' / 'heat_index'
    value REAL NOT NULL,
    period TEXT NOT NULL,             -- '2026-04' / '2026-Q1'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id)
);

-- 索引
CREATE INDEX idx_report_metrics_report_id ON report_metrics(report_id);
CREATE INDEX idx_report_metrics_category_period ON report_metrics(category_slug, period);
CREATE INDEX idx_report_metrics_metric_type ON report_metrics(metric_type);
```

### 4.3 数据迁移策略

使用 **Alembic** 进行数据库版本管理。

```python
# migrations/env.py 配置
from alembic import context
from sqlalchemy import engine_from_config, pool
from alembic.config import Config

config = context.config
 alembic_config = Config("alembic.ini")
```

**迁移文件示例：** `migrations/001_initial_schema.py`

```python
"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-04-13
"""
from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # 创建所有表（见 4.2 节）
    # 创建索引
    op.execute("CREATE INDEX idx_categories_slug ON categories(slug)")
    # ...

def downgrade():
    op.drop_table('report_metrics')
    op.drop_table('executions')
    op.drop_table('raw_data')
    op.drop_table('reports')
    op.drop_table('categories')
```

**迁移注意事项：**
- 每次表结构变更必须创建新的迁移文件
- `downgrade()` 必须可逆
- JSON 字段变更后需编写数据迁移脚本
- 生产环境执行迁移前需备份数据库

### 4.4 SQLite 并发写入处理

SQLite 只支持单一写入进程，并发写入会触发 `database is locked` 错误。

**解决方案：执行锁机制**

```python
# services/scheduler.py
import asyncio
from fastapi import HTTPException

class ExecutionLock:
    """确保同时只有一个 Agent 执行在运行"""
    _lock: asyncio.Lock = None

    @classmethod
    def get_lock(cls) -> asyncio.Lock:
        if cls._lock is None:
            cls._lock = asyncio.Lock()
        return cls._lock

    @classmethod
    async def acquire(cls) -> bool:
        """尝试获取执行锁"""
        lock = cls.get_lock()
        if lock.locked():
            raise HTTPException(
                status_code=409,
                detail="Another execution is in progress"
            )
        await lock.acquire()
        return True

    @classmethod
    def release(cls):
        """释放执行锁"""
        lock = cls.get_lock()
        if lock.locked():
            lock.release()

class SchedulerService:
    async def trigger_manual(self):
        """手动触发，立即执行"""
        await ExecutionLock.acquire()
        try:
            asyncio.create_task(self.agent.execute(trigger_type="manual"))
        finally:
            # 执行完成后释放锁（在 agent 完成回调中）
            pass
```

**多用户并发读取：** SQLite 支持多读者并发，无限制。

**生产环境建议：** 如需支持真正并发写入，切换至 PostgreSQL（SQLite 仅适合单节点部署）。

---

## 5. API 设计

### 5.1 端点总览

> **安全说明：** 所有端点（除 `/api/health` 外）均需通过 JWT Bearer Token 认证。管理员操作（创建/更新/删除品类）需要 `admin` 角色。

| 方法 | 端点 | 说明 | 认证 | 权限 |
|------|------|------|------|------|
| GET | `/api/health` | 健康检查 | 否 | 公开 |
| GET | `/api/v1/dashboard/summary` | 仪表盘摘要（KPI + 最新报告） | 是 | user |
| GET | `/api/v1/dashboard/trends` | 趋势数据（图表用） | 是 | user |
| GET | `/api/v1/reports` | 报告列表（分页 + 筛选） | 是 | user |
| GET | `/api/v1/reports/{id}` | 报告详情 | 是 | user |
| POST | `/api/v1/reports/generate` | **手动触发执行** | 是 | user |
| POST | `/api/v1/reports/{id}/regenerate` | **迭代优化报告** | 是 | user |
| GET | `/api/v1/executions/{id}` | 执行状态查询 | 是 | user |
| GET | `/api/v1/categories` | 品类列表 | 是 | user |
| POST | `/api/v1/categories` | 创建品类 | 是 | **admin** |
| PUT | `/api/v1/categories/{id}` | 更新品类 | 是 | **admin** |
| DELETE | `/api/v1/categories/{id}` | 删除品类 | 是 | **admin** |
| GET | `/api/v1/categories/{id}/keywords` | 品类关键词预览 | 是 | user |

> **注意：** API 版本前缀为 `/api/v1/`，便于未来版本升级。

#### 5.1.1 认证机制

```python
# FastAPI 认证中间件示例
from fastapi import Security, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        role = payload.get("role", "user")
        if not user_id:
            raise HTTPException(401, "Invalid token")
        return {"id": user_id, "role": role}
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.JWTError:
        raise HTTPException(401, "Invalid token")

def require_role(required_role: str):
    async def wrapper(user = Depends(get_current_user)):
        if required_role == "admin" and user["role"] != "admin":
            raise HTTPException(403, "Admin access required")
        return user
    return wrapper
```

#### 5.1.2 CORS 配置

```python
# FastAPI CORS 配置
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 仅允许前端 origin
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

#### 5.1.3 速率限制

```python
# 速率限制配置（使用 slowapi）
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# 报告生成接口：每 IP 每分钟最多 5 次
@router.post("/api/v1/reports/generate")
@limiter.limit("5/minute")
async def generate_report(request: Request, ...):
    ...

# 品类管理接口：每 IP 每分钟最多 20 次
@router.post("/api/v1/categories")
@limiter.limit("20/minute")
async def create_category(request: Request, ...):
    ...
```

### 5.2 请求/响应详情

#### GET /api/dashboard/summary

```json
// Response
{
  "kpis": {
    "total_reports": 24,
    "latest_report_date": "2026-04-13T09:00:00Z",
    "categories_tracked": 5,
    "avg_generation_time_seconds": 45
  },
  "category_rankings": [
    {"slug": "casual_puzzle", "heat_index": 85, "trend": "+12%"},
    {"slug": "hypercasual", "heat_index": 72, "trend": "-5%"}
  ],
  // heat_index: 0-100 综合指数，由 Analyzer 基于搜索结果数量、
  //             App Store/GP 排名位置、社交讨论量计算得出
  // trend: 来自 report_metrics 表，对比上期 heat_index 计算得出的百分比变化
  "latest_report": {
    "id": 24,
    "title": "休闲游戏市场分析 2026-04-13",
    "summary": "本月休闲品类整体热度上升...",
    "created_at": "2026-04-13T09:00:00Z"
  },
  "recent_activities": [
    {"type": "report_generated", "message": "报告已生成", "timestamp": "..."}
  ]
}
```

#### GET /api/dashboard/trends

```json
// Query: ?period=3m&category=casual_puzzle
// Response
{
  "period": "3m",
  "category": "casual_puzzle",
  "heat_index_trend": [
    {"date": "2026-01", "value": 78},
    {"date": "2026-02", "value": 82},
    {"date": "2026-03", "value": 85}
  ],
  "top_games": [
    {"name": "Candy Crush", "downloads": "12M", "change": "+5%"}
  ]
}
```

**数据来源说明：**
- `heat_index_trend` 来自 `report_metrics` 表，按 `category_slug` + `metric_type='heat_index'` + `period` 聚合
- `trend` 百分比通过对比相邻月份 `value` 计算得出
- `top_games` 来自各报告 `reports.metrics` 字段中的 `top_games` 数据

#### POST /api/reports/generate

```json
// Request (optional - 无 body 时使用所有启用品类)
{
  "category_slugs": ["casual_puzzle", "hypercasual"],  // 可选
  "force_refresh": false                                 // 可选：是否强制重新采集
}

// Response (同步返回执行 ID，状态通过 GET /api/executions/{id} 查询)
{
  "execution_id": 42,
  "status": "running",
  "message": "报告生成中，预计 45 秒完成",
  "poll_url": "/api/executions/42"
}
```

#### POST /api/reports/{id}/regenerate

```json
// Request (带输入校验)
{
  "feedback": "第二部分的趋势分析不够深入，请补充更多数据支撑",  // 必填，1-5000 字符
  "focus_areas": ["加强趋势证据", "补充更多 App Store 数据"]     // 可选，最多 10 项
}

// Response
{
  "execution_id": 43,
  "status": "running",
  "parent_report_id": 24,
  "message": "正在根据反馈重新生成...",
  "poll_url": "/api/executions/43"
}
```

**Pydantic 校验模型：**
```python
from pydantic import BaseModel, Field, field_validator

class RegenerateRequest(BaseModel):
    feedback: str = Field(..., min_length=1, max_length=5000)
    focus_areas: list[str] = Field(default_factory=list, max_length=10)

    @field_validator("feedback")
    @classmethod
    def sanitize_feedback(cls, v: str) -> str:
        # 防止 Prompt 注入：移除模板注入风险字符
        v = v.replace("{{", "").replace("}}", "")
        return v.strip()
```

---

## 6. 前端页面结构

### 6.1 页面列表

| 路由 | 页面 | 功能 |
|------|------|------|
| `/` | 仪表盘首页 | KPI 卡片 + 品类排名 + 趋势图表 + 最新报告入口 |
| `/reports` | 报告列表 | 所有报告分页列表，支持按品类/时间筛选 |
| `/reports/[id]` | 报告详情 | 完整报告内容 + 原始数据 + JSON 导出 + 迭代按钮 |
| `/categories` | 品类管理 | 品类 CRUD + 关键词配置 + 数据源选择 |
| `/execute` | 执行记录 | 当前执行状态 + 历史执行日志 |

### 6.2 仪表盘首页布局

```
┌─────────────────────────────────────────────────────────────────┐
│  游戏市场分析 Agent                              [生成报告] [品类] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │ 报告总数 │  │ 品类数量 │  │ 最新报告 │  │ 平均耗时 │           │
│  │   24    │  │    5    │  │  2小时前 │  │   45s   │           │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘           │
│                                                                 │
│  ┌──────────────────────────┐  ┌────────────────────────────┐  │
│  │      品类热度排名         │  │       趋势图表              │  │
│  │                          │  │                            │  │
│  │  1. 休闲解谜      ▲ +12% │  │   [折线图: 热指数趋势]     │  │
│  │  2. 超休闲游戏    ▼ -5%  │  │                            │  │
│  │  3. 益智问答     ▲ +8%  │  │   [时间范围: 1M / 3M / 6M] │  │
│  │  4. 跑酷闯关     ─  0%  │  │                            │  │
│  │  5. 音乐节奏     ▲ +3%  │  └────────────────────────────┘  │
│  └──────────────────────────┘                                  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      最新报告                             │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────┐  │  │
│  │  │ 2026-04-13    │  │ 2026-04-12    │  │ 2026-04-11 │  │  │
│  │  │ 休闲游戏市场   │  │ 超休闲游戏分析 │  │ 益智品类周报│  │  │
│  │  │ [查看报告]     │  │ [查看报告]     │  │ [查看报告] │  │  │
│  │  └────────────────┘  └────────────────┘  └────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 品类管理页面布局

```
┌─────────────────────────────────────────────────────────────────┐
│  品类管理                                    [+ 添加品类]        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  休闲解谜 (casual_puzzle)                        [编辑] [删]│  │
│  │  关键词: puzzle games, casual puzzle, match-3            │  │
│  │  数据源: Exa ✓ | App Store ✓ | Google Play ✓            │  │
│  │  优先级: ★★★★★  |  启用状态: ✓                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  超休闲游戏 (hypercasual)                          [编辑] [删]│  │
│  │  关键词: hypercasual games, one-touch game              │  │
│  │  数据源: Exa ✓ | App Store ✓ | Google Play ✗           │  │
│  │  优先级: ★★★☆☆  |  启用状态: ✓                          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. 品类配置模块

### 7.1 品类数据结构

```python
class Category(BaseModel):
    id: int | None
    name: str                           # "休闲解谜"
    slug: str                           # "casual_puzzle" (唯一)
    keywords: list[str]                 # ["puzzle games", "casual puzzle"]
    data_sources: list[DataSource]      # ["exa", "appstore", "google_play"]
    enabled: bool = True
    priority: int = 0                   # 1-5 星
```

### 7.2 品类 CRUD API

```python
# GET /api/categories
# Response: list[Category]

# POST /api/categories
# Request: CreateCategory(name, slug, keywords, data_sources, priority)
# Response: Category

# PUT /api/categories/{id}
# Request: UpdateCategory(...) # 所有字段可选
# Response: Category

# DELETE /api/categories/{id}
# Response: 204 No Content

# GET /api/categories/{id}/preview
# Response: {"slug": "casual_puzzle", "estimated_results": 150}
```

### 7.3 关键词预览

用户在编辑品类时，提供"关键词预览"功能 — 输入关键词后，调用 Exa API 测试搜索，返回预估结果数量，帮助用户判断关键词是否有效。

---

## 8. 调度模块

### 8.1 定时任务配置

```python
# 每日 9:00 (北京时间) 执行
@scheduler.scheduled_job("cron", hour=9, minute=0, timezone="Asia/Shanghai")
async def daily_execution():
    await agent_engine.execute(trigger_type="scheduled")
```

### 8.2 调度器服务

```python
class SchedulerService:
    def __init__(self, agent_engine: AgentEngine):
        self.agent = agent_engine
        self.scheduler = APScheduler()

    def start(self):
        self.scheduler.add_job(
            self.agent.execute,
            "cron",
            hour=9,
            minute=0,
            timezone="Asia/Shanghai",
            id="daily_report",
            kwargs={"trigger_type": "scheduled"}
        )
        self.scheduler.start()

    def trigger_manual(self):
        """手动触发，立即执行"""
        asyncio.create_task(self.agent.execute(trigger_type="manual"))
```

### 8.3 执行状态查询

```python
# GET /api/executions/{id}
# Response
{
    "id": 42,
    "status": "running",           # idle / running / paused / completed / failed
    "current_step": "analyze",      # plan / search / analyze / verify / report
    "progress": 0.6,                 # 0.0 - 1.0
    "started_at": "2026-04-13T09:00:00Z",
    "estimated_completion": "2026-04-13T09:00:45Z",
    "report_id": null,              # 完成前为 null
    "error_message": null
}
```

---

## 9. 错误处理

### 9.1 错误分类与处理策略

#### 9.1.1 HTTP API 错误

| 错误类型 | HTTP 状态码 | 处理策略 |
|----------|-------------|----------|
| API Key 无效/缺失 | 401 | 返回通用错误信息，不泄露配置细节 |
| Token 过期 | 401 | 返回 "Token expired"，提示重新登录 |
| 无权限操作 | 403 | 返回 "Admin access required" |
| 资源未找到 | 404 | 返回 404 + 有效 ID 列表 |
| 验证不通过 | 422 | 返回验证原因，引导用户迭代 |
| 执行中重复触发 | 409 | 返回当前执行 ID，提示等待完成 |
| 速率限制触发 | 429 | 返回 "Rate limit exceeded, try again later" |
| 服务器错误 | 500 | 返回通用错误，记录详细日志（不返回给客户端） |

#### 9.1.2 Agent 步骤错误处理矩阵

| 步骤 | 错误类型 | 恢复策略 | 可重试 | 影响 |
|------|----------|----------|--------|------|
| **PLAN** | LLM 超时/格式错误 | 使用默认搜索计划模板，跳过 LLM 规划 | 是 | 降低搜索个性化程度 |
| **PLAN** | 品类配置无效 | 跳过无效品类，记录警告 | 否 | 部分品类缺失 |
| **SEARCH** | Exa API 错误 | 降级：标记数据源为不可用，使用缓存数据 | 是 | 该品类搜索结果减少 |
| **SEARCH** | AppStore/GP 抓取失败 | 降级：跳过该数据源，继续其他 | 是 | 榜单数据缺失 |
| **SEARCH** | 返回结果为空 | 标记低覆盖度，继续分析 | 是 | 可能影响分析质量 |
| **ANALYZE** | LLM 返回格式错误 | 重新请求（最多 2 次） | 是 | 轻微延迟 |
| **ANALYZE** | LLM 分析超时 | 保存原始搜索结果，生成简化报告 | 是 | 报告内容简化 |
| **VERIFY** | 置信度低于阈值 | 自动触发迭代回 PLAN | 否 | 增加一次迭代 |
| **VERIFY** | 洞察无证据支撑 | 标记低质量洞察，纳入报告警告 | 否 | 报告中标注警告 |
| **REPORT** | 数据库写入失败 | 重试 3 次后标记执行失败 | 是 | 报告未保存 |
| **REPORT** | WebSocket 通知失败 | 降级：前端通过轮询获取状态 | 否 | 无实时通知 |

### 9.2 Agent 错误恢复

```
Agent 执行过程中失败：
1. 保存当前执行状态（step_results）到 executions 表
2. 设置 status = 'failed'，记录 error_message
3. 如果已有 partial report，保存为 draft 状态
4. 释放执行锁（见 4.4 节）
5. 返回执行 ID，用户可通过 GET /api/executions/{id} 查看详情
6. 用户可选择基于 partial report 重新触发迭代

迭代控制：
- 每次触发迭代时，parent_id 指向当前报告，iteration_depth + 1
- 当 iteration_depth >= 3 时，强制进入 REPORT 步骤，不再迭代
- 数据库 CHECK 约束 iteration_depth <= 3 防止应用层 bug 导致超限
```

---

## 10. 配置管理

### 10.1 环境变量

```bash
# backend/.env

# API Keys（必填）
ANTHROPIC_API_KEY=sk-ant-...
EXA_API_KEY=...

# JWT 认证（必填，用于 API 安全）
JWT_SECRET_KEY=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# 数据库
DATABASE_URL=sqlite:///data/game_market.db
# 如切换 PostgreSQL: postgresql://user:pass@localhost:5432/gamemarket

# CORS（必填）
ALLOWED_ORIGINS=http://localhost:3000

# 调度器（可选）
SCHEDULER_ENABLED=true
SCHEDULER_HOUR=9
SCHEDULER_TIMEZONE=Asia/Shanghai

# 日志
LOG_LEVEL=INFO

# 速率限制
RATE_LIMIT_GENERATE=5/minute
RATE_LIMIT_CATEGORIES=20/minute
```

**安全注意事项：**
- `JWT_SECRET_KEY` 必须至少 32 字符，生产环境需使用强随机密钥
- 错误响应不返回内部路径、堆栈或配置文件细节
- API Key 不存储在数据库，仅从环境变量读取

### 10.2 品类配置示例

```json
// POST /api/categories 请求体示例
{
  "name": "休闲解谜",
  "slug": "casual_puzzle",
  "keywords": [
    "casual puzzle games",
    "match-3 puzzle",
    "casual puzzle 2026"
  ],
  "data_sources": ["exa", "appstore", "google_play"],
  "enabled": true,
  "priority": 5
}
```

---

## 11. Docker 部署

### 11.1 docker-compose.yml

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
    env_file:
      - ./backend/.env
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: unless-stopped
```

### 11.2 启动脚本

```bash
# script/setup.sh
#!/bin/bash
set -e

echo "🚀 游戏市场分析 Agent v2 - 初始化"

# 检查 Docker
docker info &> /dev/null || { echo "❌ Docker 未运行"; exit 1; }

mkdir -p data

# 初始化数据库（首次）
docker compose run --rm backend python -c "from db.database import init_db; init_db()"

# 构建并启动
docker compose build
docker compose up -d

echo "✅ 启动完成!"
echo "   Dashboard: http://localhost:3000"
echo "   API 文档:  http://localhost:8000/docs"
```

---

## 12. 验收标准

### 12.1 功能验收

| 功能 | 验收条件 |
|------|----------|
| 仪表盘 | 显示 KPI 卡片、品类排名、趋势图表、最新报告 |
| 报告生成 | 手动点击后，45-60 秒内生成完整报告 |
| 报告详情 | 显示完整分析 + 洞察列表 + 数据来源 |
| 迭代优化 | 输入反馈后，Agent 重新分析并生成新版报告 |
| 品类管理 | CRUD 操作正常，关键词预览有效 |
| 定时任务 | 每日 9:00 自动执行（Scheduler 启用时） |
| 数据导出 | 报告支持 JSON 导出 |

### 12.2 非功能验收

| 条件 | 标准 |
|------|------|
| 启动 | `docker compose up --build` 一键启动成功 |
| API 健康 | `/api/health` 返回 200 |
| 前端加载 | 首次加载 < 3 秒 |
| 报告生成 | 全流程 < 60 秒 |

---

## 13. MVP vs v2 对比

| 项目 | MVP | v2 |
|------|-----|-----|
| 执行模式 | 纯手动 | 定时 + 手动双模式 |
| 数据源 | 仅 Exa | Exa + App Store + Google Play |
| Agent 工作流 | 简单顺序 | Plan→Search→Analyze→Verify→Report |
| 迭代支持 | 无 | 支持反馈迭代优化（含深度约束 ≤3） |
| 品类管理 | 硬编码 | 完全可配置 CRUD |
| 前端 | 简单列表 | 完整 BI 仪表盘 |
| 报告内容 | 基础结构 | 章节化 + 洞察 + 风险 + 机会 |
| 数据库 | 1 张表 | 5 张表 + 索引，完整 ER 图 |
| 架构 | 单层 | 模块化分层（边界清晰） |
| **安全** | 无 | JWT 认证 + RBAC 权限 + CORS + 速率限制 |
| **可靠性** | 无 | Agent 错误矩阵 + SQLite 执行锁 + 数据迁移策略 |
