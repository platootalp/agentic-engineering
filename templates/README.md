# create-project

交互式 CLI 脚手架，通过组合式模板一键生成前后端分离或全栈项目。

## 快速开始

```bash
cd templates
npm start
```

按提示依次选择，即可在当前目录下生成完整项目并自动安装依赖。

## 交互流程

```
? Project name: my-app
? Select frontend framework:
  ❯ React
    Vue
? Select backend framework:          # 选项随前端自动变化
  ❯ FastAPI (Python)                # React 可选
    Express (Node.js)               # React 可选
    Next.js (Full Stack)            # React 可选
? Select Python package manager:     # 仅 FastAPI 出现
  ❯ uv (default)
    poetry
? Select UI component library:       # 选项随前端自动变化
  ❯ shadcn/ui + Tailwind CSS (default)
    Ant Design
    Tailwind CSS only
    Other (manual config)
? Select database:
  ❯ SQLite (default)
    PostgreSQL
    MySQL
? Select capabilities:               # 空格切换，回车确认
  ❯◉ Authentication (JWT)
   ◉ Docker
   ◉ Code Standards (Lint)
```

## 可选组合

| 前端 | 后端 | 组合名 | 项目结构 |
|------|------|--------|----------|
| React | FastAPI | `react-fastapi` | `frontend/` + `backend/` |
| React | Express | `react-express` | `frontend/` + `backend/` |
| React | Next.js | `react-nextjs` | 根目录全栈应用 |
| Vue | FastAPI | `vue-fastapi` | `frontend/` + `backend/` |
| Vue | Nuxt 3 | `vue-nuxt3` | 根目录全栈应用 |

## 生成的项目包含

根据选择，自动组合以下模块：

| 模块 | 说明 | 生成内容 |
|------|------|----------|
| `frontend/react` | React + Vite + TypeScript + Tailwind | SPA 脚手架、路由、状态管理、API 客户端 |
| `frontend/vue` | Vue 3 + Vite + TypeScript + Tailwind | SPA 脚手架、路由、Pinia、API 客户端 |
| `frontend/nextjs` | Next.js App Router + Prisma | 全栈应用、API Routes、认证路由组 |
| `frontend/nuxt3` | Nuxt 3 + Prisma | 全栈应用、server API、自动导入 |
| `backend/fastapi` | FastAPI + SQLAlchemy + Alembic | 模块化后端、迁移、健康检查 |
| `backend/express` | Express + Prisma + TypeScript | 模块化后端、中间件、健康检查 |
| `auth-jwt` | JWT 认证 | 后端注册/登录路由 + 前端登录页 + 状态管理 |
| `db-sqlite` | SQLite 集成 | 数据库连接配置 + .env |
| `db-postgres` | PostgreSQL 集成 | 数据库连接配置 + Docker Compose |
| `db-mysql` | MySQL 集成 | 数据库连接配置 + Docker Compose |
| `docker` | 容器化 | Dockerfile + docker-compose (开发/生产) |
| `lint` | 代码规范 | pre-commit (Python) / ESLint + Prettier (JS/TS) |
| `shared` | 通用文件 | README、.gitignore、.env、脚本 |

## 生成后启动

### 前后端分离项目

```bash
cd my-app

# 启动后端
cd backend
source .venv/bin/activate   # FastAPI
uvicorn app.main:app --reload

# 启动前端（另一个终端）
cd frontend
npm run dev
```

### 全栈项目 (Next.js / Nuxt 3)

```bash
cd my-app
npm run dev
```

## 模板架构

```
_templates/
├── frontend/           # 前端原子模板
│   ├── react/          # React + Vite
│   ├── vue/            # Vue 3 + Vite
│   ├── nextjs/         # Next.js 全栈
│   └── nuxt3/          # Nuxt 3 全栈
├── backend/            # 后端原子模板
│   ├── fastapi/        # FastAPI + SQLAlchemy
│   └── express/        # Express + Prisma
├── auth-jwt/           # 能力模块 (内部按框架子目录 + skip_if)
├── db-mysql/
├── db-postgres/
├── db-sqlite/
├── docker/
├── lint/
└── shared/             # 通用项目文件
```

生成流程：

```
shared → frontend/{framework} → backend/{framework} → 各 capability
```

新增框架只需添加 `frontend/{name}/` 或 `backend/{name}/` 目录，能力模块内部添加对应子目录即可。

## 要求

- Node.js >= 18.0.0
- Python 3.11+ (FastAPI 后端)
- uv 或 poetry (FastAPI 依赖管理)
