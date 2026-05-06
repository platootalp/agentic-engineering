# Engineering Template Design

## 概述

CLI 工程模板生成器，支持选择前端+后端技术组合，一键生成包含最佳实践的项目骨架。同时用于重构现有项目（regen, GameMind, lumira, techstack）使其结构一致。

## 技术选型

- **模板引擎**: Hygen — 模板组合模式天然适配多组合×多能力的矩阵
- **CLI 交互**: inquirer.js — 动态 prompt，选项根据之前选择变化
- **入口**: `npx create-project`

## 支持的技术组合（5种）

| # | 前端 | 后端 | 状态管理 | UI 默认 |
|---|------|------|----------|---------|
| 1 | React + Vite | FastAPI (Python) | Zustand | shadcn/ui + Tailwind |
| 2 | React + Vite | Express (Node.js) | Zustand | shadcn/ui + Tailwind |
| 3 | React | Next.js (全栈) | Zustand | shadcn/ui + Tailwind |
| 4 | Vue 3 + Vite | FastAPI (Python) | Pinia | Naive UI + Tailwind |
| 5 | Vue 3 | Nuxt 3 (全栈) | Pinia | Naive UI + Tailwind |

**注意**: Vue + Next.js 在技术上不可行，Vue 全栈框架用 Nuxt 3。Vue + Express 跳过（少见组合）。

## Python 包管理

- **默认**: uv
- **可选**: poetry

CLI 交互中增加 Python 包管理选择项，仅在后端选 FastAPI 时出现。

## 项目顶层结构

每个组合的顶层目录统一包含：

```
project-name/
├── frontend/           # 前端代码（或 src/，全栈项目）
├── backend/            # 后端代码（全栈项目无此目录）
├── docs/               # 项目文档
│   ├── architecture.md
│   ├── api.md
│   └── deployment.md
├── docker/             # Docker 配置
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend   # 前后端分离项目
│   ├── docker-compose.local.yml
│   └── docker-compose.prod.yml
├── script/             # 开发脚本
│   ├── setup.sh
│   ├── dev.sh
│   └── deploy.sh
├── .env.example
├── .gitignore
└── README.md
```

## 各组合详细结构

### 1. React + FastAPI

```
project-name/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/              # UI组件库
│   │   ├── hooks/
│   │   ├── lib/                 # API client, 工具函数
│   │   ├── pages/
│   │   ├── stores/              # Zustand
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   ├── core/                # 配置、安全、依赖注入
│   │   ├── models/              # SQLAlchemy 模型
│   │   ├── schemas/             # Pydantic schema
│   │   ├── services/
│   │   └── main.py
│   ├── alembic/                 # 数据库迁移
│   ├── tests/
│   ├── pyproject.toml           # uv (默认) 或 poetry
│   └── Dockerfile
├── docs/
├── docker/
├── script/
├── .env.example
├── .gitignore
└── README.md
```

### 2. React + Express

```
project-name/
├── frontend/                    # 同 React+FastAPI 的 frontend
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/          # auth, error, cors
│   │   ├── models/              # Prisma 模型
│   │   ├── services/
│   │   ├── config/
│   │   ├── types/
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── tests/
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
├── docs/
├── docker/
├── script/
└── ...
```

### 3. React + Next.js

```
project-name/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/ui/
│   ├── hooks/
│   ├── lib/
│   ├── stores/                  # Zustand
│   └── types/
├── prisma/
│   └── schema.prisma
├── docs/
├── docker/
├── script/
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── Dockerfile
```

### 4. Vue + FastAPI

```
project-name/
├── frontend/
│   ├── src/
│   │   ├── components/ui/
│   │   ├── composables/         # Vue 组合式函数
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── stores/              # Pinia
│   │   ├── types/
│   │   ├── App.vue
│   │   └── main.ts
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
├── backend/                     # 同 React+FastAPI 的 backend
├── docs/
├── docker/
├── script/
└── ...
```

### 5. Vue + Nuxt 3

遵循 Nuxt 4 的 `app/` 目录标准（`srcDir: "app/"`），将前端代码与 server/config 分离。

```
project-name/
├── app/                          # srcDir: "app/" (Nuxt 4 标准)
│   ├── assets/                   # 构建工具处理的静态资源
│   ├── components/ui/            # UI 组件库
│   ├── composables/              # Vue 组合式函数
│   ├── layouts/                  # 布局组件
│   ├── pages/                    # 基于文件的路由
│   ├── plugins/                  # Vue 插件
│   ├── stores/                   # Pinia
│   ├── utils/                    # 工具函数
│   ├── types/                    # TypeScript 类型
│   ├── app.vue                   # 根组件
│   ├── app.config.ts             # 应用运行时配置
│   └── error.vue                 # 错误页面
├── server/                       # 服务端代码
│   ├── api/                      # API 路由
│   ├── middleware/                # 服务端中间件
│   ├── plugins/                  # Nitro 插件
│   └── utils/                    # 服务端工具函数
├── public/                       # 不经构建处理的静态文件
├── shared/                       # 前后端共享代码
├── docs/
├── docker/
├── script/
├── nuxt.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 能力模块

每个能力模块是独立的 Hygen generator，生成后叠加到基础模板上。

### auth-jwt

| 层 | React/Vue 前端 | FastAPI 后端 | Express 后端 | Next.js/Nuxt |
|---|---|---|---|---|
| 登录注册页 | Login/Register 组件 | `/api/v1/auth/*` | `/routes/auth.ts` | `app/(auth)/*` 或 `server/api/auth/*` |
| Token 管理 | Zustand/Pinia store | `core/security.py` | `middleware/auth.ts` | middleware |
| 路由守卫 | ProtectedRoute 组件 | 依赖注入 | Express 中间件 | Next middleware |
| 类型 | Auth types | Pydantic schemas | TypeScript types | 同左 |

### 数据库层 (db-sqlite / db-postgres / db-mysql)

| 层 | FastAPI | Express / Next.js / Nuxt |
|---|---|---|
| ORM | SQLAlchemy 2.0 async | Prisma |
| 迁移 | Alembic | `prisma migrate` |
| 配置 | `core/database.py` | `lib/db.ts` |
| 连接串 | `.env` 中 `DATABASE_URL` | `.env` 中 `DATABASE_URL` |

- **SQLite**: 文件数据库，开箱即用，适合开发阶段
- **PostgreSQL**: 生产级，docker-compose 包含 postgres 服务
- **MySQL**: 生产级，docker-compose 包含 mysql 服务

### docker

- 基础 Dockerfile 已内置在组合模板中
- 能力模块额外提供: docker-compose.prod.yml, 健康检查, 多阶段构建优化

### lint

| 层 | 前端 (React/Vue) | FastAPI 后端 | Express/Next.js |
|---|---|---|---|
| Linter | ESLint + Prettier | Ruff | ESLint + Prettier |
| 类型检查 | TypeScript strict | mypy | TypeScript strict |
| Git hooks | lint-staged + husky | pre-commit | lint-staged + husky |

## UI 组件库

支持自由选择，带默认值：

| 前端 | 默认 | 可选 |
|------|------|------|
| React | shadcn/ui + Tailwind CSS | Ant Design, 无UI库(仅Tailwind), 其他(手动配置) |
| Vue | Naive UI + Tailwind CSS | Element Plus, 无UI库(仅Tailwind), 其他(手动配置) |

## CLI 交互流程

```
$ npx create-project

? 项目名称: my-project
? 选择前端框架:
  ❯ React
    Vue
? 选择后端框架:                    # 选项根据前端动态变化
  ❯ FastAPI (Python)               # React/Vue 都有
    Express (Node.js)              # 仅 React
    Next.js (全栈)                 # 仅 React
    Nuxt 3 (全栈)                 # 仅 Vue
? 选择 Python 包管理:              # 仅 FastAPI 后端时出现
  ❯ uv (默认)
    poetry
? 选择UI组件库:                    # 选项根据前端动态变化
  ❯ shadcn/ui + Tailwind CSS (默认)
    ...
? 选择数据库:
  ❯ SQLite (默认)
    PostgreSQL
    MySQL
? 选择预置能力: (空格多选)
  ◉ 认证系统 (JWT)
  ◉ Docker化
  ◉ 代码规范
  ◯ 初始数据库迁移文件
? 正在生成项目...
  ✓ 基础模板: react-fastapi
  ✓ 能力模块: auth-jwt
  ✓ 能力模块: docker
  ✓ 能力模块: lint
  ✓ 安装依赖...
  ✓ 项目 my-project 已就绪!
```

## 模板仓库结构

```
templates/
├── _shared/                     # 共享片段
│   ├── .gitignore.hbs
│   ├── .env.example.hbs
│   └── README.md.hbs
├── react-fastapi/               # 完整组合模板
├── react-express/
├── react-nextjs/
├── vue-fastapi/
└── vue-nuxt3/
capabilities/
├── auth-jwt/
├── db-sqlite/
├── db-postgres/
├── db-mysql/
├── docker/
└── lint/
bin/
└── create-project.js            # CLI 入口
package.json
```

## 验证计划

### Phase 1: 基础模板
1. 实现 `react-fastapi` 基础模板
2. 实现 `auth-jwt`、`db-sqlite`、`docker`、`lint` 4 个能力模块
3. 用模板生成一个新项目，验证完整性

### Phase 2: 重构验证
4. 用模板重构 regen 项目的一个子模块（如认证模块）
5. 对比重构前后差异，修正模板

### Phase 3: 扩展组合
6. 实现 `react-express`、`react-nextjs`
7. 实现 `vue-fastapi`、`vue-nuxt3`
8. 实现 `db-postgres`、`db-mysql`

### Phase 4: 推广重构
9. 依次用模板重构现有项目: regen → GameMind → lumira → techstack
