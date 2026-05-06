# 系统功能模块总结

> 生成时间: 2026-04-15

## 模块概览

```
游戏市场分析 Agent 系统 (v2.0)
│
├── 1. 仪表盘模块 (Dashboard)
│   ├── KPI 指标卡片 (报告总数、品类数量、最新报告时间、平均耗时)
│   ├── 品类热度排名 (按 heat_index 降序)
│   ├── 趋势图表 (heat_index 时间序列)
│   └── 活动动态 (最近 10 条执行记录)
│
├── 2. 报告管理模块 (Reports)
│   ├── 报告列表 (分页、状态筛选)
│   ├── 报告详情 (完整 Markdown 内容、洞察、指标)
│   ├── 原始数据查看 (搜索结果来源)
│   ├── 报告生成 (后台 + SSE 流式)
│   └── 报告重新生成 (基于用户反馈迭代)
│
├── 3. 执行引擎模块 (Agent Engine)
│   ├── Planner (Step 1) - 制定搜索计划
│   ├── Searcher (Step 2) - 多数据源并行搜索
│   ├── Analyzer (Step 3) - LLM 流式分析
│   ├── Verifier (Step 4) - 质量验证
│   └── Reporter (Step 5) - 报告组装与保存
│
├── 4. 品类管理模块 (Categories)
│   ├── 品类列表 (支持 CRUD)
│   ├── 关键词预览 (预估搜索结果数)
│   └── 数据源配置 (Exa/AppStore/GooglePlay)
│
├── 5. 定时调度模块 (Scheduler)
│   ├── 每日自动执行 (9:00 北京时间)
│   ├── 手动触发执行
│   └── 迭代重新生成
│
└── 6. 数据源模块 (Data Sources)
    ├── Exa Search - 网络新闻/文章搜索
    ├── App Store - iOS 应用榜单
    └── Google Play - Android 应用榜单
```

## 功能特性清单

| 模块 | 功能 | 状态 | 说明 |
|------|------|------|------|
| Dashboard | KPI 展示 | ✅ | 报告总数/品类数/最新时间/平均耗时 |
| Dashboard | 热度排名 | ✅ | 按 heat_index 排序，含趋势百分比 |
| Dashboard | 趋势图表 | ✅ | 支持 1m/3m/6m/1y 时间范围 |
| Dashboard | 活动动态 | ✅ | 最近执行记录 |
| Reports | 报告列表 | ✅ | 分页 + 状态筛选 |
| Reports | 报告详情 | ✅ | Markdown 渲染 + 洞察展示 |
| Reports | SSE 流式生成 | ✅ | 实时展示 AI 分析过程 |
| Reports | 重新生成 | ✅ | 支持用户反馈 + 聚焦领域 |
| Reports | 原始数据 | ✅ | 查看各数据源搜索结果 |
| Categories | 品类 CRUD | ✅ | 需 admin 权限 |
| Categories | 关键词预览 | ✅ | 预估搜索结果数量 |
| Agent | 自动规划 | ✅ | LLM 驱动的搜索计划 |
| Agent | 多源搜索 | ✅ | Exa/AppStore/GooglePlay 并行 |
| Agent | 流式分析 | ✅ | Claude Sonnet 4 流式输出 |
| Agent | 质量验证 | ✅ | 4 维度验证检查 |
| Agent | 迭代优化 | ✅ | 最多 3 次迭代 |
| Scheduler | 定时任务 | ✅ | 每日 9:00 北京时间 |
| Scheduler | 手动触发 | ✅ | 并发控制 (Lock) |
| Auth | JWT 认证 | ✅ | 开发模式 bypass |
| Auth | 角色权限 | ✅ | user / admin 分级 |
| Rate | 速率限制 | ✅ | 报告生成 5/min |

## 数据模型关系

```
User ─(JWT)→ API Endpoints
         │
         ├─→ Reports ←──────────────────────┐
         │    │                             │
         │    ├─→ RawData (搜索原始结果)   │
         │    │                             │
         │    └─→ ReportMetrics (热度指标) │
         │                             │
         ├─→ Categories ←── 1:N ──────────┤
         │    │                             │
         │    └─→ ReportMetrics ───────────┤
         │                                   │
         └─→ Executions ───── 1:1 ──────────┘
              │ (FK: report_id)
              │
              └─→ Reports ←─ 1:N (iteration)
```

## API 端点统计

| 类别 | 端点数 | 说明 |
|------|--------|------|
| Health | 1 | 健康检查 |
| Reports | 6 | 报告 CRUD + 生成 |
| Categories | 5 | 品类 CRUD + 预览 |
| Dashboard | 2 | 摘要 + 趋势 |
| Executions | 3 | 执行状态 + 流式 |
| **总计** | **17** | |
