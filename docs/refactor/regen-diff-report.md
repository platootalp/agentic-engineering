# Regen vs Template 差异对照报告

> 生成日期: 2026-05-06
> 项目: regen (React + FastAPI + PostgreSQL)
> 模板: templates/_templates/ (react-fastapi combo + auth-jwt + db-postgres + docker + lint)

---

## 一、后端架构差异对照

### 1.1 目录结构对比

| 层次 | regen (Clean Architecture) | 模板 (Domain-Modular) | 处置 |
|------|---------------------------|----------------------|------|
| 实体/模型 | `app/domain/entities/user.py` (dataclass) | `app/modules/users/model.py` (SQLAlchemy Model) | **适配** |
| 仓库接口 | `app/domain/repositories/user_repository.py` (ABC) | 无（service 直接操作 SQLAlchemy session） | **保留** |
| 仓库实现 | `app/adapters/repositories/postgres_user_repository.py` | 无（model.py 即为 ORM 映射） | **统一** |
| 用例 | `app/use_cases/user/register_user.py` + `login_user.py` + `get_current_user.py` | `app/modules/users/service.py` (UserService 静态方法) | **统一** |
| 控制器/路由 | `app/adapters/controllers/auth_controller.py` | `app/modules/users/router.py` | **统一** |
| Schema | 内嵌在 `auth_controller.py` 中 (Pydantic BaseModel) | `app/modules/users/schema.py` (独立文件) | **统一** |
| 安全 | `app/infrastructure/security.py` | `app/core/security.py` | **统一** |
| 依赖注入 | `app/infrastructure/deps.py` + `app/dependencies.py` (两个文件) | `app/core/dependencies.py` (单一文件) | **统一** |
| 配置 | `app/config.py` | `app/core/config.py` | **统一** |
| 数据库 | `app/database.py` | `app/core/database.py` | **统一** |
| 异常 | 内联在 main.py | `app/core/exceptions.py` (AppException) | **统一** |
| 日志 | `app/infrastructure/logging.py` | `app/middleware/logging.py` | **适配** |
| 中间件 | 内联在 main.py (`add_request_timing`) | `app/middleware/logging.py` | **统一** |

### 1.2 关键设计模式差异

#### 1.2.1 实体定义方式

**regen**: 使用 Python dataclass 作为领域实体，ORM 映射在 repository 层内部定义（`_get_model()` 动态创建）
```python
# app/domain/entities/user.py
@dataclass
class User:
    id: UUID = field(default_factory=uuid4)
    email: str = ""
    hashed_password: str = ""
    ...
```

**模板**: 使用 SQLAlchemy Declarative Base 作为模型，直接映射数据库
```python
# app/modules/users/model.py
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    ...
```

| 差异点 | regen | 模板 |
|--------|-------|------|
| 实体类型 | dataclass (纯领域对象) | SQLAlchemy Model (ORM 映射) |
| 主键类型 | UUID | int (自增) |
| 字段 | email, hashed_password, first_name, last_name, is_active, is_verified, created_at, updated_at | id, username, email, hashed_password, is_active |
| username | 无 (使用 email 登录) | 有 (使用 username 登录) |
| ORM 映射 | 在 repository 中动态定义 UserTable | 在 model.py 中直接定义 |
| 领域方法 | `create()`, `update()`, `deactivate()`, `verify()` | 无 |
| DTO 层 | UserDTO / TokensDTO (use_cases 中) | 无 (schema.py 中 UserResponse 替代) |

**处置: 适配** -- 重构时将 dataclass 实体合并到 SQLAlchemy Model 中，但保留领域方法（如 `create()`, `deactivate()`），使 model.py 同时承担 ORM 映射和领域逻辑。regen 的 email-only 登录方式更适合现代应用，需在模板中增加支持。

---

#### 1.2.2 认证流程差异

| 认证特性 | regen | 模板 |
|----------|-------|------|
| 登录凭证 | email + password | username + password (OAuth2PasswordRequestForm) |
| Token 类型 | access_token + refresh_token | 仅 access_token |
| Token 载荷 | `{sub, email, type, exp}` | `{sub, exp}` |
| Token 端点 | `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/me` | `/api/v1/users/register`, `/api/v1/users/login` |
| 响应格式 | `{success, data: {user, tokens}, message, error}` | 直接返回 UserResponse 或 Token |
| 依赖注入方式 | `infrastructure/deps.py` (get_current_active_user -> GetCurrentUserOutput) | `core/dependencies.py` (get_current_user -> username: str) |
| 认证 Scheme | HTTPBearer | OAuth2PasswordBearer |

**处置: 适配** -- regen 的 refresh token 机制、email 登录、结构化响应格式更完善，值得保留。模板应增强为支持 refresh token + email 登录。路由前缀统一为 `/api/v1/auth/` (regen 风格更语义化)。

---

#### 1.2.3 Repository 模式 vs 直接 Service

**regen** 使用经典的 Repository 模式:
- `domain/repositories/user_repository.py` -- 抽象接口 (ABC)
- `adapters/repositories/postgres_user_repository.py` -- 具体实现
- `use_cases/user/*.py` -- 业务逻辑通过接口操作

**模板** 使用简化的 Service 直接操作数据库:
- `modules/users/service.py` -- UserService 静态方法直接用 SQLAlchemy session
- 无 repository 层，无抽象接口

**处置: 统一** -- 将 regen 的 repository 抽象 + 实现合并到 service.py 中。对于 regen 当前阶段，repository 接口增加的抽象层价值有限（只有 PostgreSQL 一种实现），但应保留接口作为扩展点。最终方案：service.py 中包含 UserService 类，内部直接操作 SQLAlchemy Model，不再单独维护 repository 层。

---

#### 1.2.4 双依赖注入文件

**regen** 存在两个 DI 文件:
- `app/dependencies.py` -- 定义 `SettingsDep`, `DBSessionDep`, `TokenDep`, `CurrentUserDep`, `ActiveUserDep`, `PaginationParams`，使用 `Annotated` 类型别名
- `app/infrastructure/deps.py` -- 定义 `get_user_repository`, `get_current_user_id`, `get_current_active_user`, `get_optional_current_user`，返回领域对象

**模板** 只有:
- `app/core/dependencies.py` -- 定义 `get_current_user`，返回 username 字符串

**处置: 统一** -- 合并为单一的 `app/core/dependencies.py`，保留 regen 的 `Annotated` 类型别名模式（更符合 FastAPI 最佳实践），但整合所有依赖到一个文件。

---

#### 1.2.5 项目特有基础设施

| 模块 | 路径 | 说明 | 处置 |
|------|------|------|------|
| AI 服务 | `app/infrastructure/ai/` (gateway, kimi_adapter, deepseek_adapter, router, prompts/) | AI 简历生成/分析核心 | **保留** |
| PDF 导出 | `app/infrastructure/pdf/` (export_service, templates/) | 简历 PDF 生成 | **保留** |
| 日志 | `app/infrastructure/logging.py` | 结构化日志 (loguru) | **适配** (迁移到 `app/middleware/logging.py`) |
| 数据库迁移 | `alembic/` | 已有 2 个 migration | **保留** |
| 额外领域 | `domain/entities/{jd,resume,experience}.py`, `use_cases/{jd,resume}/`, `adapters/controllers/{jd,resume,experience}_controller.py` | 项目核心业务 | **保留** |

---

### 1.3 测试结构差异

| 方面 | regen | 模板 |
|------|-------|------|
| 目录结构 | `tests/controllers/`, `tests/domain/`, `tests/infrastructure/`, `tests/repositories/`, `tests/use_cases/` | `tests/modules/users/`, `tests/core/` |
| 组织方式 | 按架构层 (controller/domain/infrastructure/repository/use_case) | 按业务模块 (modules/{domain}/) |
| conftest | 丰富的 fixtures (db_session, client, authenticated_client, mock_ai_gateway, mock_pdf_service) | 基础 conftest + 简单 client/db_session |
| 测试覆盖 | 全层次测试 (entities, repositories, use cases, controllers, infrastructure) | 仅 service 和 router 层测试 |

**处置: 统一** -- 测试目录从按层组织改为按模块组织 (`tests/modules/users/`, `tests/modules/jd/` 等)。但 regen 的 infrastructure 测试 (`tests/infrastructure/`) 应保留为 `tests/infrastructure/`，因为 AI/PDF 等是跨模块的基础设施。

---

## 二、前端结构差异对照

### 2.1 目录结构对比

| 模块 | regen | 模板 | 处置 |
|------|-------|------|------|
| 状态管理 | `src/stores/auth.store.ts` + `src/stores/index.ts` | `src/stores/authStore.ts` | **统一** |
| API 客户端 | `src/services/api.ts` | `src/api/client.ts` | **统一** |
| 认证服务 | `src/services/auth.service.ts` (独立) | 无 (authStore 内直接调 API) | **适配** |
| 登录页 | `src/pages/Login.tsx` + `src/components/auth/LoginForm.tsx` | `src/pages/LoginPage.tsx` | **适配** |
| 注册页 | `src/pages/Register.tsx` + `src/components/auth/RegisterForm.tsx` | `src/pages/RegisterPage.tsx` | **适配** |
| 受保护路由 | `src/components/common/ProtectedRoute.tsx` | `src/router/protected.tsx` | **统一** |
| 认证 Hook | `src/hooks/useAuth.ts` | 无 (直接用 useAuthStore) | **适配** |
| 类型定义 | `src/types/auth.ts` | `src/types/auth.ts` | **统一** |
| 表单验证 | `src/lib/validations/auth.ts` (zod) | 无 (无前端验证) | **适配** |
| 路由定义 | `src/App.tsx` (Routes/Route) | `src/router/index.tsx` (createBrowserRouter) | **统一** |

### 2.2 关键前端差异

#### 2.2.1 认证状态管理

**regen**: `auth.store.ts` (zustand + persist) + `auth.service.ts` + `useAuth.ts` hook
- 三层分离: store (状态) -> service (API) -> hook (业务逻辑)
- persist 中间件持久化 token/user 到 localStorage
- 支持 refresh token 机制
- store 命名: `useAuthStore`

**模板**: `authStore.ts` (zustand)
- 单文件: store 中直接调 apiClient
- 手动 localStorage.setItem/getItem 管理 token
- 仅 access_token
- store 命名: `useAuthStore`

**处置: 适配** -- 统一文件命名和路径 (`src/stores/authStore.ts`, `src/api/client.ts`)，保留 regen 的 service 层分离模式 (auth.service.ts)，但 useAuth hook 可简化合并到 authStore 中。refresh token 逻辑保留。

---

#### 2.2.2 API 客户端

**regen** (`src/services/api.ts`):
- axios 实例，baseURL `/api/v1`
- 请求拦截器: 从 localStorage 读取 token
- 响应拦截器: 解包 `{success, data}` 格式，401 时跳转登录
- 导出 `api` 对象 (get/post/put/patch/delete)

**模板** (`src/api/client.ts`):
- axios 实例，baseURL 从 `VITE_API_URL` 环境变量
- 请求拦截器: 从 localStorage 读取 token
- 响应拦截器: 401 时清除 token 并跳转
- 导出默认 apiClient

**处置: 统一** -- 统一路径为 `src/api/client.ts`，保留 regen 的 API wrapper 格式解包逻辑 (regen 的 `{success, data}` 响应格式需在后端重构时一并处理)。环境变量方式更灵活，采用模板的 `VITE_API_URL`。

---

#### 2.2.3 路由与页面组织

**regen**:
- 路由定义在 `App.tsx`，使用 `<Routes>/<Route>` 声明式
- 页面目录按业务分: `pages/jobs/`, `pages/experiences/`, `pages/resumes/`, `pages/Dashboard.tsx`, `pages/Login.tsx`, `pages/Register.tsx`
- 认证组件: `components/auth/LoginForm.tsx` + `components/auth/RegisterForm.tsx`
- `ProtectedRoute` 在 `components/common/ProtectedRoute.tsx`
- `PublicRoute` 内联在 App.tsx

**模板**:
- 路由定义在 `src/router/index.tsx`，使用 `createBrowserRouter`
- 页面扁平: `pages/HomePage.tsx`, `pages/LoginPage.tsx`, `pages/RegisterPage.tsx`
- `ProtectedRoute` 在 `src/router/protected.tsx`，使用 `<Outlet>`

**处置: 统一** -- 路由定义迁移到 `src/router/index.tsx`，`ProtectedRoute` 迁移到 `src/router/protected.tsx`。页面文件保留在 `src/pages/` 目录下，命名统一为 `LoginPage.tsx` / `RegisterPage.tsx`。业务页面目录结构 (jobs/, experiences/, resumes/) 保留。

---

#### 2.2.4 表单验证

**regen**: 使用 `react-hook-form` + `zod` + `@hookform/resolvers`
- `src/lib/validations/auth.ts` 中定义 loginSchema, registerSchema 等
- LoginForm/RegisterForm 使用 `<Form>` + `<FormField>` Radix UI 组件

**模板**: 无前端表单验证，使用原生 `<form>` + `<input>`

**处置: 适配** -- 保留 regen 的表单验证方案（更健壮），但 schema 文件从 `src/lib/validations/auth.ts` 移到 `src/types/auth.ts` 中统一管理，减少文件分散。

---

#### 2.2.5 UI 组件库

**regen**: 大量自定义 UI 组件
- `components/ui/`: glass-card, gradient-button, fade-in, form, tabs, badge, checkbox, select, textarea, alert-dialog 等
- 使用 Radix UI + CVA (class-variance-authority)
- 使用 framer-motion 动画
- 使用 lucide-react 图标

**模板**: 仅占位 `components/ui/.gitkeep`, `components/layout/.gitkeep`

**处置: 保留** -- UI 组件库完全项目特有，不纳入模板统一范围。

---

#### 2.2.6 前端额外依赖

| 依赖 | regen | 模板 | 处置 |
|------|-------|------|------|
| react-hook-form | 有 | 无 | **保留** |
| @hookform/resolvers | 有 | 无 | **保留** |
| zod | 有 | 无 | **保留** |
| @tanstack/react-query | 有 | 无 | **保留** |
| framer-motion | 有 | 无 | **保留** |
| @radix-ui/* | 有 | 无 | **保留** |
| @playwright/test | 有 (e2e 测试) | 无 | **保留** |

---

## 三、项目顶层结构差异

### 3.1 Docker 配置

| 方面 | regen | 模板 |
|------|-------|------|
| 目录结构 | `docker/local/` + `docker/prod/` (子目录分离) | `docker/docker-compose.local.yml` + `docker/docker-compose.prod.yml` (同目录) |
| Local 内容 | PostgreSQL + Redis + MinIO + minio-init | PostgreSQL + frontend + backend |
| Prod 内容 | PostgreSQL + Redis + MinIO + backend(2 replicas) + nginx | frontend + backend |
| Nginx | `docker/prod/nginx.conf` (SSL, 反向代理, 负载均衡) | 无 |
| Dockerfile | `docker/Dockerfile.backend` + `docker/Dockerfile.frontend` | `docker/Dockerfile.backend` + `docker/Dockerfile.frontend` |
| Init scripts | `docker/init-scripts/init-postgres.sql` | 无 |

**处置: 适配** -- 统一为模板的扁平文件结构 (`docker/docker-compose.local.yml`)，但 regen 的基础设施更丰富 (Redis, MinIO, Nginx)，这些应作为项目特有扩展保留在 local/prod compose 文件中。Nginx 配置保留。

---

### 3.2 开发脚本

| 方面 | regen | 模板 |
|------|-------|------|
| 启动脚本 | `start-dev.sh` (根目录) | `script/dev.sh` |
| 停止脚本 | `stop-dev.sh` (根目录) | 无 (trap in dev.sh) |
| 部署脚本 | `script/deploy.sh` | `script/deploy.sh` |
| 设置脚本 | `script/setup.sh` | `script/setup.sh` |
| 脚本功能 | 启动 Docker 基建 + 后端 + 前端，含健康检查等待 | 简单启动后端 + 前端 |

**处置: 统一** -- 移除根目录的 `start-dev.sh` / `stop-dev.sh`，统一使用 `script/dev.sh`，增强模板的 dev.sh 加入 Docker 基建启动。

---

### 3.3 项目特有目录

| 目录 | 说明 | 处置 |
|------|------|------|
| `extension/` | Chrome 扩展 (Vite + React + TypeScript) | **保留** |
| `boss-jd-extractor/` | Boss 直聘 JD 提取器 (原生 JS Chrome 扩展) | **保留** |
| `docs/` | 架构文档、数据库设计、PRD、开发路线图 | **保留** |
| `frontend/design-system/` | 设计系统文档 | **保留** |
| `frontend/e2e/` | Playwright e2e 测试 | **保留** |
| `backend/alembic/` | 数据库迁移 | **保留** |

---

### 3.4 配置文件差异

| 配置 | regen | 模板 | 处置 |
|------|-------|------|------|
| Python 包管理 | uv (pyproject.toml + uv.lock) | uv (pyproject.toml) | **统一** |
| 前端包管理 | npm (package-lock.json) | npm | **统一** |
| pre-commit | `backend/.pre-commit-config.yaml` (ruff + mypy) | `backend/.pre-commit-config.yaml` (ruff + mypy) | **统一** |
| .env.example | 根目录 + backend/ + frontend/ + docker/local/ + docker/prod/ | 根目录 | **适配** |
| .gitignore | 根目录 + frontend/.gitignore | 根目录 | **适配** |

---

## 四、差异汇总与处置矩阵

### 4.1 统一 (Unify) -- 应改为匹配模板

| # | 差异项 | regen 现状 | 模板目标 | 影响范围 | 风险 |
|---|--------|-----------|---------|---------|------|
| U1 | 配置文件路径 | `app/config.py` | `app/core/config.py` | 低 (移动文件+修改 import) | 低 |
| U2 | 数据库配置路径 | `app/database.py` | `app/core/database.py` | 中 (多处 import) | 低 |
| U3 | 安全模块路径 | `app/infrastructure/security.py` | `app/core/security.py` | 中 (use_cases + deps 引用) | 低 |
| U4 | 依赖注入合并 | `dependencies.py` + `infrastructure/deps.py` | `app/core/dependencies.py` | 高 (所有 controller 引用) | 中 |
| U5 | 路由文件命名 | `adapters/controllers/auth_controller.py` | `modules/users/router.py` | 高 (需重构整个路由层) | 中 |
| U6 | Schema 独立 | 内嵌在 controller 中 | `modules/users/schema.py` | 低 (提取) | 低 |
| U7 | Repository 合并到 Service | 独立 repository 层 | service.py 直接操作 | 高 (删除 ABC + 实现) | 中 |
| U8 | 测试目录结构 | 按架构层 | 按业务模块 | 中 (重命名目录) | 低 |
| U9 | 前端 API 客户端路径 | `src/services/api.ts` | `src/api/client.ts` | 低 (移动+修改 import) | 低 |
| U10 | 前端 store 命名 | `auth.store.ts` | `authStore.ts` | 低 (重命名) | 低 |
| U11 | 前端路由定义 | `App.tsx` 内联 | `src/router/index.tsx` | 中 (重构) | 低 |
| U12 | 前端 ProtectedRoute 路径 | `components/common/ProtectedRoute.tsx` | `src/router/protected.tsx` | 低 (移动) | 低 |
| U13 | 开发脚本 | `start-dev.sh` / `stop-dev.sh` (根目录) | `script/dev.sh` | 低 (删除+合并) | 低 |
| U14 | Docker 目录结构 | `docker/local/` + `docker/prod/` 子目录 | `docker/` 扁平文件 | 中 (移动文件) | 中 |

### 4.2 保留 (Keep) -- 项目特有，保持现状

| # | 差异项 | 原因 |
|---|--------|------|
| K1 | AI 基础设施 (`infrastructure/ai/`) | 项目核心功能，非通用 |
| K2 | PDF 导出服务 (`infrastructure/pdf/`) | 项目核心功能 |
| K3 | Chrome 扩展 (`extension/`) | 项目特有组件 |
| K4 | Boss JD 提取器 (`boss-jd-extractor/`) | 项目特有组件 |
| K5 | 额外业务域 (jd, resume, experience) | 项目核心业务 |
| K6 | 自定义 UI 组件库 | 项目设计系统 |
| K7 | Playwright e2e 测试 | 项目质量保障 |
| K8 | Alembic 迁移历史 | 数据库版本管理 |
| K9 | 设计系统文档 (`frontend/design-system/`) | 项目设计规范 |
| K10 | 前端额外依赖 (react-hook-form, zod, framer-motion 等) | 项目 UI 需求 |
| K11 | Nginx 配置 (prod) | 生产部署需求 |
| K12 | Redis / MinIO (Docker) | 项目基础设施需求 |

### 4.3 适配 (Adapt) -- 部分对齐模板，保留项目扩展

| # | 差异项 | regen 现状 | 适配方案 | 影响范围 | 风险 |
|---|--------|-----------|---------|---------|------|
| A1 | 实体定义 | dataclass + 动态 ORM 映射 | SQLAlchemy Model + 领域方法，保留 email/UUID/refresh_token 字段 | 高 | 中 |
| A2 | 认证模式 | email+password, access+refresh token | 保留 email 登录和 refresh token，路由迁移到 modules/users/ | 高 | 中 |
| A3 | 响应格式 | `{success, data, message, error}` | 保留结构化响应（更好的 API 设计），service 层抛 AppException | 中 | 低 |
| A4 | 认证服务分层 | service + store + hook 三层 | 保留 service 层独立，hook 合并到 store | 中 | 低 |
| A5 | 表单验证 | zod schema 独立文件 | 保留验证逻辑，考虑合并到 types/auth.ts | 低 | 低 |
| A6 | 日志模块 | `infrastructure/logging.py` | 迁移到 `middleware/logging.py`，保留 loguru 集成 | 低 | 低 |
| A7 | Docker compose | 分层目录 + 丰富基础设施 | 统一为扁平文件，保留 Redis/MinIO/Nginx 扩展 | 中 | 低 |
| A8 | .env 分散 | 多个 .env.example | 保留各子目录 .env（更灵活），但根目录也需有统一入口 | 低 | 低 |

---

## 五、重构影响范围评估

### 5.1 后端重构影响

| 变更 | 涉及文件数 | 影响程度 | 预估工时 |
|------|-----------|---------|---------|
| 目录结构迁移 (config/database/security/dependencies -> core/) | ~15 | 中 | 1h |
| 合并 repositories 到 service (users 模块) | ~6 | 高 | 2h |
| 重命名 controllers -> modules (auth + 其他) | ~10 | 高 | 2h |
| 提取 schema 到独立文件 | ~4 | 低 | 0.5h |
| 合并双 dependencies.py | ~8 | 中 | 1h |
| 测试目录重组 | ~12 | 中 | 1h |
| **后端小计** | **~55** | - | **~7.5h** |

### 5.2 前端重构影响

| 变更 | 涉及文件数 | 影响程度 | 预估工时 |
|------|-----------|---------|---------|
| API 客户端路径迁移 | ~8 | 低 | 0.5h |
| Store 重命名 + 路径 | ~5 | 低 | 0.5h |
| 路由抽取到独立文件 | ~3 | 中 | 1h |
| ProtectedRoute 迁移 | ~3 | 低 | 0.5h |
| **前端小计** | **~19** | - | **~2.5h** |

### 5.3 项目配置重构影响

| 变更 | 涉及文件数 | 影响程度 | 预估工时 |
|------|-----------|---------|---------|
| Docker 目录调整 | ~6 | 中 | 1h |
| 开发脚本合并 | ~3 | 低 | 0.5h |
| .env 文件整理 | ~4 | 低 | 0.5h |
| **配置小计** | **~13** | - | **~2h** |

### 5.4 总体评估

| 维度 | 评估 |
|------|------|
| 涉及文件总数 | ~87 个 |
| 预估总工时 | ~12h |
| 最大风险点 | 合并 repository 层到 service (A1+U7) |
| 测试回归风险 | 中 (目录结构变化导致 import 路径全面更新) |
| 建议策略 | 按模块分批重构: 先 users 模块 -> 验证 -> 再推广到 jd/resume/experience |

---

## 六、风险点

### 6.1 高风险

1. **Repository 模式移除**: regen 的 Clean Architecture 将 repository 作为抽象层，移除后 use case 的依赖注入链需全部重写。建议保留 interface 但简化实现。

2. **ORM 映射方式变更**: regen 在 repository 内动态定义 `UserTable` (含 `__table_args__ = {'extend_existing': True}`)，迁移到 model.py 后需确保与 Alembic 迁移历史兼容。

3. **响应格式变更**: regen 前端 API 客户端依赖 `{success, data}` 格式解包，后端响应格式变更需同步修改前端。

### 6.2 中风险

4. **双 dependencies.py 合并**: `app/dependencies.py` 和 `app/infrastructure/deps.py` 有功能重叠但接口不同，合并时需确保所有 controller 的 import 正确。

5. **认证流程差异**: regen 使用 `HTTPBearer` + refresh token，模板使用 `OAuth2PasswordBearer`，前端表单提交方式不同 (JSON vs form-data)，需统一。

6. **config.py 结构**: regen 的 Settings 类有 AI 相关配置字段 (KIMI_API_KEY 等) 放在 `get_settings()` 函数之后（可能是代码错误），迁移时需整理。

### 6.3 低风险

7. **文件路径变更**: 大量 import 路径需更新，但 IDE 的重构工具可自动处理。

8. **测试目录重组**: 测试文件移动不影响测试逻辑，仅需修正 conftest.py 中的 import。

9. **前端 store 命名**: `auth.store.ts` -> `authStore.ts` 纯重命名，影响面小。

---

## 七、建议重构顺序

1. **Phase 2a: 后端目录结构对齐** -- 移动 config/database/security/dependencies 到 `app/core/`，合并双 deps 文件
2. **Phase 2b: 认证模块重构** -- 创建 `app/modules/users/` (model.py + schema.py + service.py + router.py)，迁移 auth 逻辑
3. **Phase 2c: 前端认证对齐** -- 统一 store 命名、API 客户端路径、路由定义
4. **Phase 2d: 项目配置对齐** -- Docker 目录、开发脚本、.env 文件
5. **Phase 2e: 其他业务模块推广** -- 将 jd/resume/experience 也迁移到 modules/ 结构
6. **Phase 2f: 测试重组** -- 按模块重新组织测试目录

---

## 八、文件对照速查表

### 后端核心文件映射 (regen -> 模板目标)

```
app/config.py                              -> app/core/config.py
app/database.py                            -> app/core/database.py
app/dependencies.py                        -> (合并到 app/core/dependencies.py)
app/infrastructure/security.py             -> app/core/security.py
app/infrastructure/deps.py                 -> (合并到 app/core/dependencies.py)
app/infrastructure/logging.py              -> app/middleware/logging.py
app/domain/entities/user.py                -> app/modules/users/model.py (合并)
app/domain/repositories/user_repository.py -> (删除，合并到 service.py)
app/adapters/repositories/postgres_user_repository.py -> (删除，合并到 service.py)
app/use_cases/user/register_user.py        -> app/modules/users/service.py (合并)
app/use_cases/user/login_user.py           -> app/modules/users/service.py (合并)
app/use_cases/user/get_current_user.py     -> app/modules/users/service.py (合并)
app/adapters/controllers/auth_controller.py -> app/modules/users/router.py + schema.py
```

### 前端核心文件映射 (regen -> 模板目标)

```
src/services/api.ts                -> src/api/client.ts
src/services/auth.service.ts       -> src/api/auth.service.ts (保留独立)
src/stores/auth.store.ts           -> src/stores/authStore.ts
src/stores/index.ts                -> (删除，各 store 独立 export)
src/hooks/useAuth.ts               -> (合并到 authStore.ts 或保留)
src/components/common/ProtectedRoute.tsx -> src/router/protected.tsx
src/pages/Login.tsx                -> src/pages/LoginPage.tsx
src/pages/Register.tsx             -> src/pages/RegisterPage.tsx
src/components/auth/LoginForm.tsx  -> (保留在 components/auth/)
src/components/auth/RegisterForm.tsx -> (保留在 components/auth/)
src/types/auth.ts                  -> src/types/auth.ts (保留，增强)
src/lib/validations/auth.ts        -> (合并到 src/types/auth.ts 或保留)
```

### 项目配置映射 (regen -> 模板目标)

```
start-dev.sh                       -> (删除，合并到 script/dev.sh)
stop-dev.sh                        -> (删除，合并到 script/dev.sh)
docker/local/docker-compose.yml    -> docker/docker-compose.local.yml
docker/prod/docker-compose.yml     -> docker/docker-compose.prod.yml
docker/prod/nginx.conf             -> docker/nginx.conf (保留)
docker/Dockerfile.backend          -> docker/Dockerfile.backend (保留)
docker/Dockerfile.frontend         -> docker/Dockerfile.frontend (保留)
```

---

## 九、模板修正记录 (Phase 2 重构后)

基于 regen 认证模块重构经验，对模板进行了以下改进：

### 9.1 auth-jwt 后端模板改进

| 改进项 | 原模板 | 修正后 |
|--------|--------|--------|
| Refresh token | 无 | `create_refresh_token()` + `decode_token()` in security.py，`REFRESH_TOKEN_EXPIRE_DAYS` in config.py |
| `/users/refresh` 端点 | 无 | `POST /users/refresh` — 接收 refresh_token，返回新的 access_token + refresh_token |
| `/users/me` 端点 | 无 | `GET /users/me` — 需认证，返回当前用户信息 |
| Token 载荷 | `{sub, exp}` | `{sub, exp, type}` — type 区分 access/refresh |
| Schema | Token 只有 access_token | Token 增加 refresh_token 字段；新增 RefreshRequest, UserMeResponse |
| Service | 仅 register + login | 增加 `refresh_access_token()` 和 `get_current_user()` |

### 9.2 auth-jwt 前端模板改进 (React)

| 改进项 | 原模板 | 修正后 |
|--------|--------|--------|
| Store 持久化 | 手动 `localStorage.setItem/getItem` | `zustand/persist` 中间件 + 独立 localStorage 键同步 |
| Refresh token 状态 | 无 | `refreshToken` 状态 + localStorage 键 |
| Auth types | 仅 AuthResponse | 增加 RefreshRequest, AuthResponse.refresh_token |
| Logout 清理 | 仅清除 token | 同时清除 token + refreshToken |

### 9.3 auth-jwt 前端模板改进 (Vue)

| 改进项 | 原模板 | 修正后 |
|--------|--------|--------|
| Refresh token 状态 | 无 | `refreshToken` ref + localStorage 键 |
| Logout 清理 | 仅清除 token | 同时清除 token + refreshToken |
| Auth types | 仅 AuthResponse | 增加 RefreshRequest, AuthResponse.refresh_token |

### 9.4 已知遗留项

- **API 客户端自动 token refresh**: 当前模板的前端 API client 不含自动 refresh 逻辑（401 时自动用 refresh_token 获取新 access_token）。regen 项目有此功能，但实现较复杂（请求队列），暂不纳入模板默认行为。
- **Docker Nginx/Redis/MinIO**: regen 的 docker-compose 包含 Nginx 反向代理、Redis 缓存、MinIO 对象存储，暂不纳入 docker 能力模块。
- **Email 登录**: regen 使用 email 登录，模板仍使用 username 登录。email 登录可作为未来模板选项。
