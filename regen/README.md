# Regen - AI智能简历生成器

基于岗位JD + 用户个人经历，利用AI智能生成针对性优化简历的工具。

## 项目简介

Regen是一款帮助求职者快速生成针对性简历的AI工具。通过分析岗位JD（职位描述）和用户的个人经历，AI能够自动匹配最相关的经历，并生成符合岗位要求的简历。

### 核心功能

- **JD智能解析**: 支持Chrome插件自动提取、Web端手动输入、OCR图片识别、Excel批量导入
- **经历库管理**: 统一管理教育经历、工作经历、项目经验
- **AI简历生成**: 基于JD要求自动匹配最佳经历，AI优化描述
- **多模板支持**: 现代简约、经典商务、创意设计等多种简历模板
- **一键导出**: 支持PDF、Word、Markdown格式导出

## 技术架构

### 后端技术栈
- **框架**: FastAPI (Python 3.11+)
- **ORM**: SQLAlchemy 2.0 (异步)
- **数据库**: PostgreSQL 16
- **缓存**: Redis 7
- **对象存储**: MinIO
- **任务队列**: Celery + Redis
- **AI服务**: Kimi(主) + DeepSeek/Qwen/GLM(备选)
- **包管理**: uv (Astral)

### 前端技术栈
- **框架**: React 18 + TypeScript
- **构建**: Vite
- **UI库**: shadcn/ui + TailwindCSS
- **状态管理**: Zustand
- **数据请求**: TanStack Query

### Chrome插件
- **Manifest**: V3
- **适配器模式**: 支持Boss直聘、脉脉、拉勾、智联招聘、前程无忧等

## 项目结构

```
regen/
├── backend/              # FastAPI后端服务
│   ├── app/
│   │   ├── domain/       # 领域层 (Entities, Value Objects)
│   │   ├── use_cases/    # 用例层 (业务逻辑)
│   │   ├── adapters/     # 适配器层 (Controllers, Repositories)
│   │   └── infrastructure/ # 基础设施层 (DB, Config, Security)
│   ├── tests/
│   ├── alembic/          # 数据库迁移
│   └── pyproject.toml
├── frontend/             # React前端
│   ├── src/
│   │   ├── components/   # UI组件
│   │   ├── pages/        # 页面
│   │   ├── services/     # API服务
│   │   └── stores/       # 状态管理
│   └── package.json
├── extension/            # Chrome插件
│   ├── src/
│   │   ├── content/      # Content Script
│   │   ├── background/   # Service Worker
│   │   └── popup/        # 弹出页面
│   └── manifest.json
├── docker/               # Docker配置
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
└── docs/                 # 项目文档
    ├── architecture/     # 架构设计文档
    ├── deployment/       # 部署文档
    └── plans/            # 产品规划文档
```

## 快速开始

### 环境要求
- Python 3.11+
- Node.js 18+
- PostgreSQL 16
- Redis 7
- Docker & Docker Compose (可选)

### 1. 克隆项目

```bash
git clone <repository-url>
cd regen
```

### 2. 使用Docker启动(推荐)

```bash
cd docker
cp .env.example .env
docker-compose up -d
```

服务启动后访问:
- 前端: http://localhost:3000
- 后端API: http://localhost:8000
- API文档: http://localhost:8000/docs
- MinIO控制台: http://localhost:9001

### 3. 本地开发

#### 后端开发

```bash
cd backend

# 使用uv安装依赖
uv sync

# 复制环境变量
cp .env.example .env
# 编辑 .env 配置数据库连接

# 运行数据库迁移
uv run alembic upgrade head

# 启动开发服务器
uv run uvicorn app.main:app --reload
```

#### 前端开发

```bash
cd frontend
npm install
npm run dev
```

#### Chrome插件开发

```bash
cd extension
npm install
npm run build:dev

# 在Chrome中加载扩展:
# 1. 打开 chrome://extensions/
# 2. 开启"开发者模式"
# 3. 点击"加载已解压的扩展程序"
# 4. 选择 extension/dist 目录
```

## 数据库

### 表结构

所有表名使用 `regen_` 前缀:

- `regen_users` - 用户表
- `regen_subscriptions` - 订阅表
- `regen_quota_records` - 配额记录表
- `regen_experiences` - 经历表
- `regen_job_descriptions` - 职位描述表
- `regen_resumes` - 简历表
- `regen_resume_versions` - 简历版本表
- `regen_templates` - 模板表
- `regen_ai_logs` - AI调用日志表

### 数据库迁移

```bash
cd backend

# 创建新迁移
uv run alembic revision --autogenerate -m "description"

# 升级到最新版本
uv run alembic upgrade head

# 回滚一级
uv run alembic downgrade -1
```

## 部署

详见 [部署指南](docs/deployment/deployment-guide.md)

### Docker容器

所有Docker容器使用 `regen` 前缀:

- `regen-postgres` - PostgreSQL数据库
- `regen-redis` - Redis缓存
- `regen-minio` - MinIO对象存储
- `regen-backend` - FastAPI后端
- `regen-frontend` - React前端
- `regen-celery-worker` - Celery任务队列
- `regen-celery-beat` - Celery定时任务

## 文档

- [系统架构设计](docs/architecture/system-architecture.md)
- [数据库设计](docs/architecture/database-design.md)
- [API设计](docs/architecture/api-design.md)
- [AI服务设计](docs/architecture/ai-service-design.md)
- [Chrome插件设计](docs/architecture/chrome-extension-design.md)
- [部署指南](docs/deployment/deployment-guide.md)

## 技术选型

详见 [技术选型文档](docs/plans/2026-02-24-technology-selection.md)

## 开发路线

详见 [开发路线图](docs/plans/2026-02-24-development-roadmap.md)

## 许可证

MIT License
