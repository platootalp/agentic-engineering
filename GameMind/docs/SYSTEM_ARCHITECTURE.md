# 游戏市场分析 Agent 系统架构文档

> 生成时间: 2026-04-15
> 系统版本: v2.0

---

## 1. 系统概览

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           游戏市场分析 Agent 系统                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────┐    ┌──────────────────────────────────────┤
│  │        Frontend            │    │           Backend                      │
│  │   (Next.js + TypeScript)  │────│    (FastAPI + Python 3.14)            │
│  │                             │ HTTP/SSE │                                   │
│  │  ┌──────────────────────┐  │    │  ┌────────────────────────────────┐  │
│  │  │   Dashboard Page     │  │    │  │   API Routes Layer              │  │
│  │  │   Reports Page       │  │    │  │  ├── /api/v1/reports            │  │
│  │  │   Generate Page      │  │    │  │  ├── /api/v1/categories         │  │
│  │  │   Execute Page       │  │    │  │  ├── /api/v1/dashboard          │  │
│  │  │   Categories Page    │  │    │  │  └── /api/v1/executions        │  │
│  │  └──────────────────────┘  │    │  └────────────────────────────────┘  │
│  │                             │    │              │                          │
│  │  ┌──────────────────────┐  │    │              ▼                          │
│  │  │   Shared Components   │  │    │  ┌────────────────────────────────┐  │
│  │  │  ├── Header           │  │    │  │   Agent Engine                 │  │
│  │  │  ├── ThemeProvider    │  │    │  │  ┌─────┐ ┌─────┐ ┌─────────┐  │  │
│  │  │  ├── ReportCard       │  │    │  │  │Plan │→│Search│→│Analyze │  │  │
│  │  │  └── Dashboard/*      │  │    │  │  └─────┘ └─────┘ └────┬────┘  │  │
│  │  └──────────────────────┘  │    │  │                         ↓       │  │
│  │                             │    │  │  ┌─────────┐  ┌──────┐  ┌────┐ │  │
│  │  ┌──────────────────────┐  │    │  │  │Verify  │←│Data  │  │LLM │ │  │
│  │  │   UI Components       │  │    │  │  └───┬───┘  └──────┘  └────┘ │  │
│  │  │   (Radix UI + Tailwind)│  │    │  │      ↓                        │  │
│  │  └──────────────────────┘  │    │  │  ┌─────┐                         │  │
│  │                             │    │  │  │Report│                        │  │
│  └─────────────────────────────┘    │  └─────┘                          │  │
│                                      └──────────────────────────────────────┤
│                                                                             │
│                                      ┌──────────────────────────────────────┤
│                                      │   Data Sources                       │
│                                      │  ┌──────────┐ ┌──────────┐ ┌───────┐ │
│                                      │  │  Exa     │ │ AppStore │ │ Google │ │
│                                      │  │  Search  │ │ Charts   │ │  Play  │ │
│                                      │  └──────────┘ └──────────┘ └───────┘ │
│                                      └──────────────────────────────────────┤
│                                                                             │
│                                      ┌──────────────────────────────────────┤
│                                      │   Database (SQLite)                  │
│                                      │  ┌──────────┐ ┌──────────┐ ┌───────┐ │
│                                      │  │ Reports  │ │ Categories│ │RawData│ │
│                                      │  └──────────┘ └──────────┘ └───────┘ │
│                                      │  ┌──────────┐ ┌──────────┐          │
│                                      │  │Executions│ │Metrics   │          │
│                                      │  └──────────┘ └──────────┘          │
│                                      └──────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 技术栈

### Backend
```
┌─────────────────────────────────────────────────────────────────┐
│                      Backend Stack                               │
├─────────────────────────────────────────────────────────────────┤
│  Runtime:       Python 3.14                                     │
│  Framework:     FastAPI 0.115+                                  │
│  ORM:           SQLAlchemy 2.0 (async + sync)                  │
│  Database:      SQLite (development) / PostgreSQL (production) │
│  Scheduler:     APScheduler (AsyncIOScheduler)                   │
│  Auth:          JWT (PyJWT)                                     │
│  Rate Limit:    SlowAPI                                          │
│  LLM:           Anthropic Claude API                           │
│  Web Search:    Exa API                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Frontend
```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend Stack                              │
├─────────────────────────────────────────────────────────────────┤
│  Framework:     Next.js 15 (App Router)                        │
│  Language:      TypeScript 5.x                                  │
│  UI Library:    Radix UI primitives                             │
│  Styling:       Tailwind CSS + CSS Variables                   │
│  Icons:         Lucide React                                    │
│  HTTP Client:   Native fetch with custom caching                │
│  State:         React hooks (useState, useEffect, useCallback)  │
│  Charts:        Victory (D3-based)                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 系统架构分层

```
┌────────────────────────────────────────────────────────────────────────┐
│                           Frontend (Next.js)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │  Dashboard   │  │   Reports    │  │   Generate   │  │Categories  ││
│  │   (/)        │  │ (/reports)   │  │ (/generate)   │  │(/categories)│
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘│
│                              │                                      │
│                              ▼                                      │
│                    ┌──────────────────┐                              │
│                    │  lib/api.ts     │                              │
│                    │  - HTTP Cache    │                              │
│                    │  - Request Queue │                              │
│                    │  - SSE Streaming │                              │
│                    └──────────────────┘                              │
└────────────────────────────────────────────────────────────────────────┘
                               │ HTTP/SSE
                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         API Gateway (FastAPI)                         │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                    Middleware Stack                               │ │
│  │  CORS → Rate Limiting → JWT Auth → Error Handler                 │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                │                                     │
│  ┌────────────────┬────────────────┬────────────────┬──────────────┐ │
│  │ /api/v1/reports│/api/v1/categories│/api/v1/dashboard│/api/v1/exec│ │
│  └───────┬────────┴───────┬─────────┴───────┬────────┴──────┬───────┘ │
│          │                │                 │               │         │
└──────────┼────────────────┼─────────────────┼───────────────┼─────────┘
           │                │                 │               │
           ▼                ▼                 ▼               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Service Layer                                   │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                     Agent Engine                                  │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐  │  │
│  │  │ Planner │→│ Searcher│→│ Analyzer│→│ Verifier│→│Reporter│  │  │
│  │  │ (Step1) │  │ (Step2) │  │ (Step3) │  │ (Step4) │  │(Step5) │  │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └────────┘  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────────────────────┐  │
│  │   Scheduler   │  │   Fetcher    │  │      Data Sources          │  │
│  │  (APScheduler)│  │  (Exa/Store) │  │  (Exa/AS/GPlay)            │  │
│  └───────────────┘  └──────────────┘  └─────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Database Layer (SQLAlchemy)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Category │  │  Report  │  │ RawData  │  │Execution │  │ Metrics │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Agent 执行引擎工作流

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Agent Engine 工作流                                  │
└─────────────────────────────────────────────────────────────────────────┘

                         ┌─────────────────┐
                         │   IDLE State    │
                         └────────┬────────┘
                                  │
                                  ▼
              ┌─────────────────────────────────────────┐
              │          Step 1: PLAN                    │
              │  ┌───────────────────────────────────┐  │
              │  │ - 加载启用的品类配置                │  │
              │  │ - 生成搜索查询计划                  │  │
              │  │ - 确定分析维度                      │  │
              │  │ - 可选：使用 LLM 智能规划           │  │
              │  └───────────────────────────────────┘  │
              │              Output: ExecutionPlan      │
              └───────────────────────┬───────────────────┘
                                     │
                                     ▼
              ┌─────────────────────────────────────────┐
              │         Step 2: SEARCH                  │
              │  ┌───────────────────────────────────┐  │
              │  │ - 并行执行所有数据源搜索            │  │
              │  │ - Exa Web Search (15条/品类)       │  │
              │  │ - App Store Charts                 │  │
              │  │ - Google Play Charts                │  │
              │  └───────────────────────────────────┘  │
              │              Output: SearchResults       │
              └───────────────────────┬───────────────────┘
                                     │
                                     ▼
              ┌─────────────────────────────────────────┐
              │        Step 3: ANALYZE (Streaming)       │
              │  ┌───────────────────────────────────┐  │
              │  │ - 构建分析上下文                   │  │
              │  │ - 调用 Claude Sonnet 4 LLM        │  │
              │  │ - 流式返回分析内容                 │  │
              │  │ - 解析 JSON 生成 AnalysisDraft    │  │
              │  └───────────────────────────────────┘  │
              │              Output: AnalysisDraft       │
              └───────────────────────┬───────────────────┘
                                     │
                                     ▼
              ┌─────────────────────────────────────────┐
              │         Step 4: VERIFY                  │
              │  ┌───────────────────────────────────┐  │
              │  │ - 数据完整性检查                   │  │
              │  │ - 可信度验证 (≥0.6)               │  │
              │  │ - 洞察有效性检查                   │  │
              │  │ - 逻辑一致性检查                   │  │
              │  └───────────────────────────────────┘  │
              │         Output: VerificationResult      │
              └───────┬─────────────────────────────┬───┘
                      │                             │
            ┌─────────┴─────────┐         ┌─────────┴─────────┐
            │   Verification    │         │   Verification   │
            │     PASSED        │         │     FAILED       │
            └─────────┬─────────┘         └─────────┬─────────┘
                      │                             │
                      │                             ▼
                      │              ┌───────────────────────────────┐
                      │              │     Iteration Loop (max 3x)     │
                      │              │  - 扩展搜索范围               │
                      │              │  - 重新分析                    │
                      │              │  - 再次验证                    │
                      │              └───────────────────────────────┘
                      │                             │
                      ▼                             │
              ┌─────────────────────────────────────────┐
              │          Step 5: REPORT                │
              │  ┌───────────────────────────────────┐  │
              │  │ - 组装 Markdown 报告             │  │
              │  │ - 保存报告到数据库                 │  │
              │  │ - 保存品类热度指标                 │  │
              │  │ - 更新执行记录状态                 │  │
              │  └───────────────────────────────────┘  │
              │              Output: Report ID          │
              └───────────────────────┬───────────────────┘
                                     │
                                     ▼
                         ┌─────────────────┐
                         │  COMPLETED      │
                         └─────────────────┘
```

---

## 5. 数据库模型

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Database Schema                                   │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────┐
│        categories            │
├─────────────────────────────┤
│ id: PK (int, auto)         │
│ name: str (not null)       │
│ slug: str (unique)          │
│ keywords: JSON list         │
│ data_sources: JSON list     │
│ enabled: bool               │
│ priority: int               │
│ created_at: datetime        │
│ updated_at: datetime        │
└─────────────────────────────┘
          │
          │ 1:N
          ▼
┌─────────────────────────────┐
│          reports             │
├─────────────────────────────┤
│ id: PK (int, auto)         │
│ title: str                  │
│ summary: str                 │
│ full_content: str (Markdown)│
│ insights: JSON array         │
│ sources: JSON array          │
│ metrics: JSON object         │
│ execution_id: FK → executions│
│ status: str (draft/published)│
│ version: int                 │
│ parent_id: FK → reports      │
│ iteration_depth: int (≤3)    │
│ created_at: datetime         │
└─────────────────────────────┘
          │
          │ 1:N
          ▼
┌─────────────────────────────┐     ┌─────────────────────────────┐
│         raw_data            │     │      report_metrics         │
├─────────────────────────────┤     ├─────────────────────────────┤
│ id: PK (int, auto)         │     │ id: PK (int, auto)          │
│ report_id: FK → reports     │     │ report_id: FK → reports     │
│ category_slug: str          │     │ category_slug: str          │
│ source_type: str            │     │ metric_type: str            │
│ query: str                  │     │ value: float                │
│ raw_results: JSON array      │     │ period: str (YYYY-MM)       │
│ created_at: datetime         │     │ created_at: datetime        │
└─────────────────────────────┘     └─────────────────────────────┘

┌─────────────────────────────┐
│         executions          │
├─────────────────────────────┤
│ id: PK (int, auto)         │
│ report_id: FK → reports     │
│ status: str                 │
│   (idle/running/paused/     │
│    completed/failed)        │
│ trigger_type: str            │
│   (scheduled/manual/        │
│    iteration)                │
│ plan_input: JSON             │
│ step_results: JSON           │
│ started_at: datetime         │
│ completed_at: datetime       │
│ error_message: str          │
└─────────────────────────────┘
```

---

## 6. API 路由架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         API Routes Structure                             │
└─────────────────────────────────────────────────────────────────────────┘

/api
├── /health                          GET  (public) 健康检查
│
/api/v1
├── /reports
│   ├── GET    /                     报告列表 (分页)
│   ├── GET    /{report_id}           报告详情
│   ├── GET    /{report_id}/raw-data 原始数据
│   ├── POST   /generate              触发报告生成 (后台)
│   ├── POST   /generate/stream       SSE流式生成
│   └── POST   /{report_id}/regenerate 重新生成 (带反馈)
│
├── /categories
│   ├── GET    /                      品类列表
│   ├── POST   /                      创建品类 (admin)
│   ├── PUT    /{category_id}         更新品类 (admin)
│   ├── DELETE /{category_id}         删除品类 (admin)
│   ├── GET    /{category_id}/preview 关键词预览
│   └── GET    /{category_id}/keywords 品类关键词搜索
│
├── /dashboard
│   ├── GET    /summary               仪表盘摘要
│   └── GET    /trends                趋势数据
│
└── /executions
    ├── GET    /                      执行历史列表
    ├── GET    /{execution_id}        执行状态
    └── POST   /{execution_id}/stream SSE流式状态
```

---

## 7. 前端页面路由

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Frontend Routes Structure                           │
└─────────────────────────────────────────────────────────────────────────┘

/                           → DashboardPage (首页仪表盘)
/reports                     → ReportsPage (报告列表)
/reports/[id]                → ReportDetailPage (报告详情)
/generate                    → GeneratePage (SSE流式生成)
/execute                     → ExecutePage (执行监控)
/execute/[id]                → ExecuteDetailPage (执行详情)
/categories                  → CategoriesPage (品类管理)

Layout Components:
├── Header                    (导航栏 + 主题切换)
└── ThemeProvider             (Next-themes)
```

---

## 8. 数据流向图

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        数据流向图                                         │
└──────────────────────────────────────────────────────────────────────────┘

 用户操作                    系统处理                      数据存储
    │                         │                             │
    │  点击"生成报告"           │                             │
    ▼                         │                             │
┌─────────┐                   │                             │
│Dashboard│ ─── POST ────────→│                             │
│ Page    │   /reports/generate│                             │
└─────────┘                   │                             │
    │                         ▼                             │
    │              ┌─────────────────────┐                  │
    │              │  ExecutionLock.acquire│                │
    │              └─────────────────────┘                  │
    │                         │                             │
    │                         ▼                             │
    │              ┌─────────────────────┐                  │
    │              │ 创建 Execution 记录   │ ───────────────→ │
    │              └─────────────────────┘   INSERT         │
    │                         │                             │
    │                         ▼                             │
    │              ┌─────────────────────┐                  │
    │              │ AgentEngine.execute │                  │
    │              │     (5步流程)        │                  │
    │              └─────────────────────┘                  │
    │                    │     │     │     │               │
    │                    ▼     ▼     ▼     ▼               │
    │              ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐         │
    │              │Plan │ │Search│ │Analy│ │Verify│        │
    │              └─────┘ └─────┘ └─────┘ └─────┘         │
    │                                        │               │
    │                         ┌──────────────┴──────────┐  │
    │                         │                          │  │
    │                         ▼                          ▼  │
    │              ┌─────────────────┐      ┌─────────────────┐
    │              │ Step 3: ANALYZE │      │  Step 5: REPORT │
    │              │ (SSE Streaming) │      │   保存报告      │
    │              └────────┬────────┘      └────────┬────────┘
    │                       │                        │         │
    │                       │  SSE events           │ INSERT  │
    │                       │  "data: {...}"        │         │
    │                       ▼                        ▼         │
    │  ┌──────────────────────────────────────────────────────┐ │
    │  │  Frontend SSE Client                                │ │
    │  │  EventSource → readStream → updateState → render   │ │
    │  └──────────────────────────────────────────────────────┘ │
    │          │                           │                    │
    │          ▼                           ▼                    │
    │    ┌─────────────────┐       ┌─────────────────┐          │
    │    │  Generate Page  │       │  ReportDetail   │          │
    │    │  (实时日志)      │       │   (最终报告)     │          │
    │    └─────────────────┘       └─────────────────┘          │
    │                                                             │
    ▼                                                             │
┌─────────┐                                                        │
│Dashboard│ ←─── redirect ───────────────────────────────────────┘
│ Page    │
└─────────┘
```

---

## 9. 品类配置与数据源

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Category & Data Source Architecture                   │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  Category Configuration (数据库)                                        │
├─────────────────────────────────────────────────────────────────────────┤
│  {                                                                       │
│    "name": "休闲益智",                                                  │
│    "slug": "casual_puzzle",                                             │
│    "keywords": [                                                         │
│      "casual puzzle games 2026",                                        │
│      "match-3 games trending",                                          │
│      "mobile puzzle market"                                              │
│    ],                                                                    │
│    "data_sources": ["exa", "appstore", "google_play"],                │
│    "enabled": true,                                                      │
│    "priority": 5                                                         │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Data Sources Integration                                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐  │
│  │     Exa API    │     │   App Store     │     │  Google Play    │  │
│  │  (Web Search)  │     │   Charts API     │     │   Charts API    │  │
│  ├─────────────────┤     ├─────────────────┤     ├─────────────────┤  │
│  │ Search Type:    │     │ Category:        │     │ Category:       │  │
│  │ - news          │     │ - Puzzle         │     │ - PUZZLE       │  │
│  │ - article       │     │ - Board          │     │ - CASUAL       │  │
│  │ - blog          │     │ - Casual         │     │ - ARCADE       │  │
│  │                 │     │                 │     │                │  │
│  │ Returns:        │     │ Returns:         │     │ Returns:       │  │
│  │ - title         │     │ - name           │     │ - title       │  │
│  │ - url           │     │ - developer       │     │ - author      │  │
│  │ - text          │     │ - rating         │     │ - rating      │  │
│  │ - publishedDate │     │ - genre          │     │ - content     │  │
│  │ - score         │     │ - releasedate    │     │ - genre       │  │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘  │
│          │                       │                      │              │
│          └───────────────────────┼──────────────────────┘              │
│                                  ▼                                     │
│                    ┌─────────────────────────┐                        │
│                    │   SearchResults Aggregator │                       │
│                    │  { exa_results: [],      │                        │
│                    │    appstore_results: [],  │                        │
│                    │    gp_results: [] }        │                        │
│                    └─────────────────────────┘                        │
│                                  │                                     │
│                                  ▼                                     │
│                    ┌─────────────────────────┐                        │
│                    │   Analyzer (LLM)         │                        │
│                    │  - 生成市场洞察           │                        │
│                    │  - 识别趋势               │                        │
│                    │  - 评估机会与风险         │                        │
│                    └─────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 10. 执行状态机

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Execution State Machine                           │
└─────────────────────────────────────────────────────────────────────────┘

                    ┌────────────────────────────────────────┐
                    │                                         │
                    │   ExecutionLock 确保同时只有一个执行     │
                    │   (asyncio.Lock based)                  │
                    │                                         │
                    └────────────────────────────────────────┘
                                      │
                                      ▼
        ┌───────────────────────────────────────────────────────┐
        │                                                        │
        │    ┌─────────┐    ┌─────────┐    ┌───────────────┐   │
        │    │  idle   │───→│ running │───→│  completed    │   │
        │    └─────────┘    └────┬────┘    └───────────────┘   │
        │                        │                             │
        │                        │ (error)                     │
        │                        ▼                             │
        │                   ┌─────────┐                        │
        │                   │  failed │                        │
        │                   └─────────┘                        │
        │                        │                             │
        │                        │ (manual restart)            │
        │                        └─────────────────────────────┘
        │                                                        │
        └───────────────────────────────────────────────────────┘

    Running State Step Tracking:
    ┌──────────────────────────────────────────────────────────────┐
    │  step_results JSON:                                          │
    │  {                                                            │
    │    "plan":     { "completed_at": "...", "queries": 5 },       │
    │    "search":   { "completed_at": "...", "exa": 15, "as": 20 },│
    │    "analyze":  { "completed_at": "...", "content": "..." },  │
    │    "verify":   { "completed_at": "...", "passed": true },    │
    │    "report":   { "completed_at": "...", "report_id": 42 }    │
    │  }                                                            │
    └──────────────────────────────────────────────────────────────┘
```

---

## 11. 关键文件索引

```
/Users/lijunyi/road/tmp/
├── backend/
│   ├── main.py                          # FastAPI 应用入口
│   ├── config.py                        # 配置管理 (Pydantic Settings)
│   │
│   ├── db/
│   │   ├── database.py                   # 数据库连接、会话、CRUD helpers
│   │   └── models.py                     # SQLAlchemy ORM 模型
│   │
│   ├── routers/
│   │   ├── reports.py                    # 报告相关 API
│   │   ├── categories.py                 # 品类管理 API
│   │   ├── dashboard.py                  # 仪表盘 API
│   │   └── execute.py                    # 执行管理 API
│   │
│   ├── services/
│   │   ├── agent/
│   │   │   ├── engine.py                 # Agent 引擎核心
│   │   │   ├── planner.py                 # Step 1: 规划器
│   │   │   ├── searcher.py                # Step 2: 搜索引擎
│   │   │   ├── analyzer.py                # Step 3: 分析器 (LLM)
│   │   │   ├── verifier.py                # Step 4: 验证器
│   │   │   ├── reporter.py                # Step 5: 报告生成器
│   │   │   └── types.py                   # 数据类型定义
│   │   ├── scheduler.py                   # APScheduler 调度器
│   │   ├── fetcher.py                     # Exa API fetcher
│   │   └── data_sources/
│   │       ├── exa_search.py             # Exa 搜索服务
│   │       ├── appstore.py               # App Store 服务
│   │       └── google_play.py             # Google Play 服务
│   │
│   └── middleware/
│       ├── auth.py                        # JWT 认证中间件
│       └── rate_limit.py                  # 速率限制中间件
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                      # 首页仪表盘
│   │   ├── layout.tsx                     # 根布局
│   │   ├── reports/
│   │   │   ├── page.tsx                   # 报告列表页
│   │   │   └── [id]/page.tsx             # 报告详情页
│   │   ├── generate/page.tsx              # SSE 流式生成页
│   │   ├── execute/
│   │   │   ├── page.tsx                   # 执行监控页
│   │   │   └── [id]/page.tsx             # 执行详情页
│   │   └── categories/page.tsx            # 品类管理页
│   │
│   ├── components/
│   │   ├── Header.tsx                     # 导航头部
│   │   ├── theme-provider.tsx             # 主题提供者
│   │   ├── ReportCard.tsx                 # 报告卡片 (legacy)
│   │   ├── ReportsContent.tsx             # 报告列表内容组件
│   │   ├── ReportDetailContent.tsx        # 报告详情内容组件
│   │   ├── dashboard/
│   │   │   ├── KPICard.tsx               # KPI 卡片
│   │   │   ├── TrendChart.tsx            # 趋势图表
│   │   │   ├── CategoryRanking.tsx       # 品类排名
│   │   │   └── ActivityFeed.tsx          # 活动动态
│   │   ├── reports/
│   │   │   ├── ReportCard.tsx            # 报告卡片
│   │   │   ├── ReportDetail.tsx          # 报告详情
│   │   │   └── ReportCompare.tsx         # 报告对比
│   │   ├── categories/
│   │   │   ├── CategoryList.tsx         # 品类列表
│   │   │   └── CategoryForm.tsx         # 品类表单
│   │   └── ui/                            # Radix UI 基础组件
│   │       ├── button.tsx, card.tsx, dialog.tsx
│   │       ├── input.tsx, select.tsx, textarea.tsx
│   │       ├── badge.tsx, switch.tsx, tabs.tsx
│   │       ├── label.tsx, progress.tsx, skeleton.tsx
│   │
│   └── lib/
│       └── api.ts                         # API 客户端 (缓存+去重)
│
└── docs/
    └── SYSTEM_ARCHITECTURE.md            # 本文档
```

---

## 12. 环境变量配置

```bash
# Backend (.env)
ANTHROPIC_API_KEY=sk-ant-...          # Claude API 密钥
EXA_API_KEY=...                        # Exa 搜索 API 密钥
JWT_SECRET_KEY=your-secret-key-min-32  # JWT 签名密钥
DATABASE_URL=sqlite:///./data/...     # 数据库连接
SCHEDULER_ENABLED=true                 # 启用定时任务
SCHEDULER_HOUR=9                       # 每日执行时间 (北京时间)
SCHEDULER_TIMEZONE=Asia/Shanghai        # 时区配置
DEV_AUTH_BYPASS=true                   # 开发模式跳过认证

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 13. 部署架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Production Deployment                               │
└─────────────────────────────────────────────────────────────────────────┘

                         ┌─────────────────┐
                         │   Nginx/CDN      │
                         │   (Reverse Proxy)│
                         └────────┬─────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
          ┌─────────────────┐         ┌─────────────────┐
          │  Frontend      │         │   Backend       │
          │  (Next.js)      │         │   (FastAPI)     │
          │                 │         │                 │
          │  Port: 3000     │  HTTP   │   Port: 8000    │
          │  (Node.js)      │◄────────│   (uvicorn)     │
          └─────────────────┘         └────────┬─────────┘
                                               │
                              ┌────────────────┼────────────────┐
                              │                │                │
                              ▼                ▼                ▼
                    ┌─────────────────┐ ┌─────────────────┐ ┌───────────┐
                    │  PostgreSQL     │ │  Exa API        │ │Claude API │
                    │  (Database)     │ │  (Web Search)   │ │  (LLM)    │
                    └─────────────────┘ └─────────────────┘ └───────────┘
```
