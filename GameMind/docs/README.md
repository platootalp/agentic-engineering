# 文档目录

## 系统文档

| 文件 | 描述 | 行数 |
|------|------|------|
| [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) | 完整系统架构文档，包含架构图、API路由、数据库模型等 | 706 |
| [MODULES.md](./MODULES.md) | 8大功能模块详细文档，包含模块流程图、组件结构图、数据源架构图 | 595 |
| [SUMMARY.md](./SUMMARY.md) | 功能模块总结，包含特性清单、数据模型关系 | 102 |

## 文档生成时间

- 生成日期: 2026-04-15
- 系统版本: v2.0
- 生成工具: Claude Code (AI-assisted)
- 验证状态: ✅ 通过代码审查

## 文档结构

```
docs/
├── README.md                     # 本文档
├── SYSTEM_ARCHITECTURE.md        # 系统架构详细文档 (706行)
├── MODULES.md                    # 功能模块详细文档 (595行)
└── SUMMARY.md                   # 功能模块总结 (102行)
```

## 查看建议

1. **快速了解**: 阅读 `SUMMARY.md` → 整体结构和功能清单
2. **模块详情**: 阅读 `MODULES.md` → 8大模块的详细流程图和组件结构
3. **完整架构**: 阅读 `SYSTEM_ARCHITECTURE.md` → 端到端架构图、数据库模型、部署架构

## 文档覆盖内容

### SYSTEM_ARCHITECTURE.md (706行)
1. 系统概览总图
2. 技术栈 (Backend + Frontend)
3. 系统架构分层图
4. Agent 工作流 (5步)
5. 数据库 ER 图
6. API 路由 (17端点)
7. 前端路由 (7页面)
8. 数据流向图
9. 品类配置与数据源
10. 执行状态机
11. 关键文件索引
12. 环境变量配置
13. 部署架构

### MODULES.md (595行)
1. 模块总览图 (8模块)
2. Dashboard 模块 (KPI/图表/排名/活动)
3. Reports 模块 (列表/详情/SSE生成)
4. Execute 模块 (状态监控/历史)
5. Categories 模块 (CRUD/搜索)
6. Agent Engine (5步工作流详细图)
7. Scheduler 模块 (定时任务流程)
8. Auth & Security (JWT/限流)
9. Data Sources (3数据源架构)
10. API 端点总览表
11. 关键文件清单

### SUMMARY.md (102行)
1. 模块概览 (8大核心模块)
2. 功能特性清单 (22项)
3. 数据模型关系
4. API 端点统计
