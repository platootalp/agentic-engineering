# AGENTS.md - Lumira 基金投资助手

**架构**: Next.js 14 (前端) + Express 4 (后端) + Prisma/PostgreSQL

## 子项目文档

| 目录 | 说明 |
|------|------|
| [`src/components/ui/`](src/components/ui/AGENTS.md) | UI 组件 (Radix + Tailwind) |
| [`src/lib/`](src/lib/AGENTS.md) | 工具库、API 客户端、IndexedDB |
| [`lumira-backend/`](lumira-backend/AGENTS.md) | Express API 服务端 |

## 快速开始
## 构建与开发命令

### 前端开发 (Next.js)

```bash
# 开发模式 (端口 3000)
npm run dev

# 构建
npm run build

# 生产启动
npm run start

# 类型检查
npm run typecheck

# 代码检查
npm run lint

# 运行测试
npm test
npm run test:watch
```

### 后端开发 (Express)

```bash
# 进入后端目录
cd lumira-backend

# 开发模式 (端口 3001)
npm run dev

# 构建
npm run build

# 生产启动
npm run start

# 数据库操作
npm run db:migrate      # 运行迁移
npm run db:generate     # 生成 Prisma Client
npm run db:seed         # 种子数据
npm run db:studio       # 打开 Prisma Studio

# 代码检查
npm run lint

# 运行测试
npm test
npm run test:watch
```

## Code Style Guidelines

### TypeScript & Types
- Use strict TypeScript (`strict: true` in tsconfig)
- Prefer interface over type for object definitions
- Use explicit return types on exported functions
- Use `Readonly<T>` for immutable props
- Avoid `any` - use `unknown` with type guards

### Imports & Exports
- Use `@/` path aliases for imports (configured in tsconfig)
- Group imports: React/Next → Third-party → Internal → Types
- Use named exports for utilities, default exports for pages/components
- Import types with `import type { ... }`

### Naming Conventions
- **Components**: PascalCase (e.g., `ConfirmDialog.tsx`)
- **Hooks**: camelCase starting with `use` (e.g., `useTheme.ts`)
- **Utilities**: camelCase (e.g., `formatNumber.ts`)
- **Types/Interfaces**: PascalCase with descriptive names
- **Constants**: UPPER_SNAKE_CASE for true constants

### Component Patterns
- Use `'use client'` directive for client components only when needed
- Prefer Server Components by default
- Props interface named with `Props` suffix (e.g., `ConfirmDialogProps`)
- Destructure props in function parameters
- Use Tailwind for styling with custom CSS variables for theming

### Error Handling
- Use try/catch with specific error types
- Log errors to console with context
- Return user-friendly error messages
- Use early returns to reduce nesting

### Backend (Express)
- Use async/await for async operations
- Return consistent JSON response format: `{ data?, error?, message? }`
- Use middleware for cross-cutting concerns
- Validate input with type guards

### Frontend State Management
- Use React Query for server state
- Use Dexie (IndexedDB) for local persistence
- Lift state up only when necessary
- Prefer composition over prop drilling

### Styling (Tailwind CSS v3)
 使用自定义主题变量: `bg-background`, `text-foreground`
 移动优先的响应式设计
 使用 `cn()` 工具函数处理条件类名
 通过 `dark:` 变体支持暗黑模式
 基金专用颜色: `fund.up` (上涨红 #F56C6C), `fund.down` (下跌绿 #67C23A)

### Git Workflow
- Main branch: `main`
- Feature branches: `feature/description`
- Commit message format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore

### Testing (when implemented)
```bash
# Unit tests (to be configured)
npm test

# Run single test file
npm test -- ComponentName.test.tsx

# E2E tests (to be configured)
npm run test:e2e
```

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
│   │   ├── auth-provider.tsx
│   │   ├── login-modal.tsx
│   │   └── register-modal.tsx
│   ├── charts/                   # 图表组件
│   │   ├── AssetDistribution.tsx
│   │   └── NavHistoryChart.tsx
│   ├── import/                   # 导入功能组件
│   │   ├── ExcelTab.tsx
│   │   ├── ManualTab.tsx
│   │   ├── OcrTab.tsx
│   │   ├── SearchTab.tsx
│   │   └── ImportPreview.tsx
│   ├── layout/                   # 布局组件
│   │   └── Sidebar.tsx
│   ├── ui/                       # 基础 UI 组件 → [详见 AGENTS.md](src/components/ui/AGENTS.md)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── tabs.tsx
│   │   ├── tooltip.tsx
│   │   ├── sheet.tsx
│   │   ├── toast.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── EmptyState.tsx
│   ├── add-holding-modal.tsx
│   ├── data-import-export.tsx
│   ├── fund-card.tsx
│   ├── portfolio-chart.tsx
│   ├── sip-calculator.tsx
│   ├── transaction-form.tsx
│   ├── error-boundary.tsx
│   ├── loading.tsx
│   └── query-client-provider.tsx
│
├── hooks/                        # 自定义 React Hooks
│   ├── use-auth.ts
│   ├── use-holdings.ts
│   ├── use-portfolio.ts
│   └── use-transactions.ts
│
├── lib/                          # 工具库 → [详见 AGENTS.md](src/lib/AGENTS.md)
│   ├── api.ts                    # API 客户端
│   ├── api-client.ts
│   ├── calculate.ts              # 收益计算 (XIRR/夏普/回撤)
│   ├── db.ts                     # IndexedDB (Dexie)
│   ├── eastmoney-api.ts          # 天天基金 API
│   ├── eastmoney-ranking-api.ts  # 基金排行 API
│   └── utils.ts                  # 通用工具
│
├── services/                     # 服务层
│   └── fund.ts                   # 基金数据服务
│
├── stores/                       # 状态管理
│   └── portfolio.ts              # 投资组合状态 (Zustand)
│
└── types/                        # TypeScript 类型
    ├── index.ts
    ├── api.ts
    └── import.ts
```

### 后端 (`lumira-backend/src/`) → [详见 AGENTS.md](lumira-backend/AGENTS.md)

```
lumira-backend/src/
├── app.ts                        # Express 应用入口
│
├── config/                       # 配置
│   ├── database.ts               # Prisma/数据库配置
│   ├── env.ts                    # 环境变量
│   └── redis.ts                  # Redis 配置
│
├── controllers/                  # 请求处理器
│   ├── auth.controller.ts
│   ├── fund.controller.ts
│   ├── holding.controller.ts
│   ├── portfolio.controller.ts
│   └── transaction.controller.ts
│
├── middleware/                   # Express 中间件
│   ├── auth.middleware.ts        # JWT 认证
│   ├── error.middleware.ts       # 错误处理
│   └── rateLimit.middleware.ts   # 速率限制
│
├── routes/                       # API 路由
│   ├── auth.routes.ts            # 认证路由
│   ├── fund.routes.ts            # 基金路由
│   ├── holding.routes.ts         # 持仓路由
│   ├── transaction.routes.ts     # 交易路由
│   ├── portfolio.routes.ts       # 投资组合路由
│   └── index.ts                  # 路由聚合
│
├── services/                     # 业务逻辑
│   ├── auth.service.ts
│   ├── fund.service.ts
│   ├── holding.service.ts
│   ├── portfolio.service.ts
│   ├── transaction.service.ts
│   └── external/
│       └── eastmoney.service.ts  # 天天基金 API 集成
│
└── utils/                        # 工具函数
    ├── logger.ts                 # Winston 日志
    ├── response.ts               # API 响应辅助
    └── validators.ts             # 输入验证
```

## 环境变量

### 前端 (`.env.local`)

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `NEXT_PUBLIC_APP_NAME` | Lumira | 应用名称 |
| `NEXT_PUBLIC_APP_VERSION` | 0.1.0 | 应用版本 |
| `NEXT_PUBLIC_API_URL` | http://localhost:3001/api | 后端 API 地址 |
| `NEXT_PUBLIC_API_TIMEOUT` | 30000 | API 超时时间 (毫秒) |
| `NEXT_PUBLIC_DB_NAME` | lumira_db | IndexedDB 名称 |
| `NEXT_PUBLIC_DB_VERSION` | 1 | IndexedDB 版本 |
| `NEXT_PUBLIC_ESTIMATE_CACHE_TTL` | 30 | 估值数据缓存时间 (秒) |
| `NEXT_PUBLIC_SEARCH_CACHE_TTL` | 300 | 搜索缓存时间 (秒) |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | false | 启用分析 |
| `NEXT_PUBLIC_DEBUG_MODE` | false | 调试模式 |
| `NEXT_PUBLIC_MOCK_API` | false | Mock API |
| `NEXT_PUBLIC_GA_ID` | - | Google Analytics ID (可选) |
| `NEXT_PUBLIC_SENTRY_DSN` | - | Sentry DSN (可选) |

### 后端 (`lumira-backend/.env`)

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | 3001 | 服务端口 |
| `NODE_ENV` | development | 环境模式 |
| `DATABASE_URL` | postgresql://... | PostgreSQL 连接字符串 |
| `REDIS_URL` | redis://localhost:6379 | Redis 连接字符串 |
| `JWT_SECRET` | - | JWT 签名密钥 |
| `JWT_ACCESS_EXPIRATION` | 15m | Access Token 过期时间 |
| `JWT_REFRESH_EXPIRATION` | 7d | Refresh Token 过期时间 |
| `EASTMONEY_API_BASE` | https://fundmobapi... | 天天基金 API 基础地址 |
| `RATE_LIMIT_WINDOW_MS` | 900000 | 速率限制窗口 (毫秒) |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | 每窗口最大请求数 |

## 主要依赖

### 前端
| 依赖 | 版本 | 用途 |
|------|------|------|
| next | 14.1.0 | Next.js 框架 |
| react | 18.2.0 | React 库 |
| react-dom | 18.2.0 | React DOM |
| typescript | 5.3.0 | TypeScript |
| tailwindcss | 3.4.0 | CSS 框架 |
| @tanstack/react-query | 5.90.21 | 服务端状态管理 |
| zustand | 4.5.0 | 客户端状态管理 |
| dexie | 3.2.4 | IndexedDB 封装 |
| echarts | 5.4.3 | 图表库 |
| recharts | 3.7.0 | React 图表库 |
| lucide-react | 0.330.0 | 图标库 |
| @radix-ui/* | latest | 无样式 UI 组件 |
| date-fns | 3.3.0 | 日期处理 |
| decimal.js | 10.4.3 | 精确计算 |
| xlsx | 0.18.5 | Excel 处理 |
| tesseract.js | 7.0.0 | OCR 文字识别 |

### 后端
| 依赖 | 版本 | 用途 |
|------|------|------|
| express | 4.18.3 | Web 框架 |
| typescript | 5.4.0 | TypeScript |
| @prisma/client | 5.10.0 | ORM |
| prisma | 5.10.0 | Prisma CLI |
| ioredis | 5.3.2 | Redis 客户端 |
| jsonwebtoken | 9.0.2 | JWT 认证 |
| bcrypt | 5.1.1 | 密码加密 |
| zod | 3.22.4 | 数据验证 |
| helmet | 7.1.0 | 安全头 |
| cors | 2.8.5 | 跨域处理 |
| morgan | 1.10.0 | HTTP 日志 |
| winston | 3.12.0 | 日志库 |
| express-rate-limit | 7.2.0 | 速率限制 |
| dotenv | 16.4.5 | 环境变量 |

## 开发注意事项

1. **前端端口**: 3000，**后端端口**: 3001
2. 后端 API 基础路径: `http://localhost:3001/api`
3. 数据库使用 Prisma 管理，修改 schema 后需运行 `npm run db:migrate`
4. 天天基金 API 有速率限制，注意缓存策略
5. IndexedDB 用于前端离线存储，支持 Holdings/Transactions/Funds
6. 基金颜色规范: 上涨红色 (`fund.up` #F56C6C)，下跌绿色 (`fund.down` #67C23A)
