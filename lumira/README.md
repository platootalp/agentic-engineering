# Lumira - 基金投资助手

面向散户投资者的基金持仓管理应用。

## 技术栈

- **框架**: Next.js 14 + React 18 + TypeScript
- **样式**: Tailwind CSS 3.4 + Radix UI
- **状态**: Zustand + React Query (TanStack Query)
- **存储**: IndexedDB (Dexie.js) + PostgreSQL (Prisma)
- **图表**: ECharts 5 + Recharts
- **API**: 天天基金数据接口

## 核心功能

### 已实现功能

| 功能 | 描述 | 路径 |
|------|------|------|
| 资产总览 | 展示总资产、累计收益、今日收益、图表分析 | `/` |
| 持仓明细 | 基金列表展示、搜索、排序 | `/holdings` |
| 基金搜索 | 实时搜索基金名称和代码 | 弹窗 |
| 添加持仓 | 两步流程：搜索基金 → 填写持仓 | 弹窗 |
| 实时估值 | 从天天基金获取实时估值数据 | API |
| 收益图表 | 资产配置饼图/收益分布/走势 | `/` |
| 基金详情 | 净值、估值、收益分析、交易记录 | `/fund/[code]` |
| 交易记录 | 买入/卖出交易管理 | `/fund/[code]` |
| 定投计划 | 定期定额投资收益计算器 | `/sip` |
| 基金对比 | 最多5只基金对比分析 | `/compare` |
| 基金排行 | 涨幅榜/跌幅榜/热门榜 | `/rankings` |
| 数据导入 | 支持搜索添加/手动输入/Excel导入/截图识别 | `/import` |
| 用户认证 | 注册/登录/JWT认证 | 弹窗 |
| 数据导入导出 | JSON/CSV 格式导入导出 | 弹窗 |

### 开发中功能

| 功能 | 描述 | 路径 |
|------|------|------|
| 收益分析 | 收益趋势/收益日历 | `/analysis` |

## 项目结构

### 前端 (`src/`)

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API 路由
│   │   └── funds/
│   │       ├── [code]/estimate/route.ts
│   │       └── search/route.ts
│   ├── fund/[code]/              # 基金详情页
│   ├── holdings/                 # 持仓管理页
│   ├── compare/                  # 基金对比页
│   ├── rankings/                 # 基金排行榜
│   ├── import/                   # 数据导入页
│   ├── sip/                      # 定投计算器页
│   ├── analysis/                 # 收益分析页
│   ├── page.tsx                  # 首页(资产总览)
│   ├── layout.tsx                # 根布局
│   └── globals.css               # 全局样式
│
├── components/                   # React 组件
│   ├── auth/                     # 认证相关组件
│   ├── charts/                   # 图表组件
│   ├── import/                   # 导入功能组件
│   ├── layout/                   # 布局组件
│   ├── ui/                       # 基础 UI 组件
│   └── ...                       # 业务组件
│
├── hooks/                        # 自定义 React Hooks
├── lib/                          # 工具库
├── services/                     # 服务层
├── stores/                       # 状态管理 (Zustand)
└── types/                        # TypeScript 类型
```

### 后端 (`lumira-backend/src/`)

```
lumira-backend/src/
├── app.ts                        # Express 应用入口
├── config/                       # 配置
├── controllers/                  # 请求处理器
├── middleware/                   # Express 中间件
├── routes/                       # API 路由
├── services/                     # 业务逻辑
└── utils/                        # 工具函数
```

## 开发模式

本项目采用 OpenCode Agentic 开发模式，定义了三个核心 Agent:

- **fund-analyst**: 基金数据分析，负责收益计算和投资分析
- **ui-architect**: UI架构设计，负责 React 组件和页面
- **backend-engineer**: 后端开发，负责 API 和数据库

## 本地开发

### 前端开发

```bash
# 安装依赖
npm install

# 开发模式 (端口 3000)
npm run dev

# 类型检查
npm run typecheck

# 构建
npm run build

# 运行测试
npm test
```

### 后端开发

```bash
# 进入后端目录
cd lumira-backend

# 安装依赖
npm install

# 开发模式 (端口 3001)
npm run dev

# 数据库操作
npm run db:migrate      # 运行迁移
npm run db:generate     # 生成 Prisma Client
npm run db:studio       # 打开 Prisma Studio

# 运行测试
npm test
```

访问 http://localhost:3000

## API 接口

### 前端 API Routes (Next.js)

| 接口 | 描述 | 来源 |
|------|------|------|
| `/api/funds/search` | 搜索基金 | 天天基金 |
| `/api/funds/[code]/estimate` | 实时估值 | 天天基金 |

### 后端 API Routes (Express)

#### 认证接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/refresh` | 刷新 Token |
| POST | `/api/auth/logout` | 用户登出 |
| GET | `/api/auth/me` | 获取当前用户 |

#### 基金接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/funds/search` | 搜索基金 |
| GET | `/api/funds/:id` | 获取基金详情 |
| GET | `/api/funds/:id/estimate` | 获取实时估值 |
| GET | `/api/funds/:id/history` | 获取净值历史 |
| POST | `/api/funds/:id/sync` | 同步基金数据 |

#### 持仓接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/holdings` | 获取所有持仓 |
| POST | `/api/holdings` | 创建持仓 |
| GET | `/api/holdings/:id` | 获取持仓详情 |
| PUT | `/api/holdings/:id` | 更新持仓 |
| DELETE | `/api/holdings/:id` | 删除持仓 |

#### 交易接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/transactions` | 获取所有交易 |
| POST | `/api/transactions` | 创建交易 |
| GET | `/api/transactions/holding/:holdingId` | 获取持仓交易 |
| PUT | `/api/transactions/:id` | 更新交易 |
| DELETE | `/api/transactions/:id` | 删除交易 |

#### 投资组合接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/portfolio/summary` | 投资组合摘要 |
| GET | `/api/portfolio/allocation` | 资产配置 |
| GET | `/api/portfolio/top-holdings` | 收益最高持仓 |
| GET | `/api/portfolio/bottom-holdings` | 收益最低持仓 |
| GET | `/api/portfolio/profit-calendar` | 收益日历 |

## 数据存储

- **IndexedDB**: 本地离线存储，支持 Holdings/Transactions/Funds/Settings
- **PostgreSQL**: 后端数据库，通过 Prisma ORM 管理
- **Redis**: 缓存和会话存储
- **缓存策略**: 估值数据 30 秒 TTL，搜索数据 5 分钟 TTL

## 环境要求

- Node.js 18+
- npm 10+
- PostgreSQL 14+ (后端)
- Redis 6+ (后端)

## 环境变量

### 前端 (`.env.local`)

```bash
NEXT_PUBLIC_APP_NAME=Lumira
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_DB_NAME=lumira_db
NEXT_PUBLIC_ESTIMATE_CACHE_TTL=30
NEXT_PUBLIC_SEARCH_CACHE_TTL=300
```

### 后端 (`lumira-backend/.env`)

```bash
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/fundmanager"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
```

## 主要依赖

### 前端
- next: 14.1.0
- react: 18.2.0
- tailwindcss: 3.4.0
- @tanstack/react-query: 5.90.21
- zustand: 4.5.0
- dexie: 3.2.4
- echarts: 5.4.3
- recharts: 3.7.0

### 后端
- express: 4.18.3
- @prisma/client: 5.10.0
- jsonwebtoken: 9.0.2
- bcrypt: 5.1.1
- ioredis: 5.3.2

## 免责声明

本应用数据仅供参考，不构成投资建议。市场有风险，投资需谨慎。

## License

MIT
