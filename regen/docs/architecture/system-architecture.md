# AI智能简历生成器 - 系统架构设计文档

**版本**: v1.0  
**日期**: 2026-02-24  
**文档类型**: System Architecture Design

---

## 目录

- [1. 架构设计原则](#1-架构设计原则)
  - [1.1 核心设计原则](#11-核心设计原则)
  - [1.2 质量属性目标](#12-质量属性目标)

- [2. 业务架构](#2-业务架构)
  - [2.1 领域划分（DDD Bounded Contexts）](#21-领域划分ddd-bounded-contexts)
  - [2.2 领域依赖关系](#22-领域依赖关系)
  - [2.3 核心业务流程](#23-核心业务流程)

- [3. 技术架构](#3-技术架构)
  - [3.1 分层架构（Clean Architecture）](#31-分层架构clean-architecture)
  - [3.2 技术栈选型](#32-技术栈选型)
  - [3.3 Chrome插件多网站架构](#33-chrome插件多网站架构)

- [4. 功能模块划分](#4-功能模块划分)
  - [4.1 模块依赖图](#41-模块依赖图)
  - [4.2 模块详细设计](#42-模块详细设计)
  - [4.3 模块间通信](#43-模块间通信)

- [5. 部署架构](#5-部署架构)
  - [5.1 生产环境部署拓扑](#51-生产环境部署拓扑)
  - [5.2 Docker Compose 开发环境](#52-docker-compose-开发环境)
  - [5.3 Kubernetes 生产部署](#53-kubernetes-生产部署)

- [6. 数据架构](#6-数据架构)
  - [6.1 数据库优化策略](#61-数据库优化策略)

- [7. 安全架构](#7-安全架构)
  - [7.1 安全设计原则](#71-安全设计原则)
  - [7.2 安全措施矩阵](#72-安全措施矩阵)
  - [7.3 敏感数据处理示例](#73-敏感数据处理示例)

- [8. 接口设计原则](#8-接口设计原则)
  - [8.1 REST API设计规范](#81-rest-api设计规范)
  - [8.2 API版本控制策略](#82-api版本控制策略)
  - [8.3 限流策略](#83-限流策略)

- [9. 监控与日志架构](#9-监控与日志架构)
  - [9.1 监控体系](#91-监控体系)
  - [9.2 关键监控指标](#92-关键监控指标)

- [10. 扩展性设计](#10-扩展性设计)
  - [10.1 水平扩展策略](#101-水平扩展策略)
  - [10.2 微服务拆分路线图](#102-微服务拆分路线图)

- [11. 灾难恢复与备份](#11-灾难恢复与备份)
  - [11.1 备份策略](#111-备份策略)
  - [11.2 故障恢复流程](#112-故障恢复流程)

- [12. 架构决策记录(ADR)](#12-架构决策记录adr)
  - [ADR-001: 采用Clean Architecture分层](#adr-001-采用clean-architecture分层)
  - [ADR-002: 采用PostgreSQL作为主数据库](#adr-002-采用postgresql作为主数据库)
  - [ADR-003: 采用FastAPI作为Web框架](#adr-003-采用fastapi作为web框架)

---

## 1. 架构设计原则

### 1.1 核心设计原则

| 原则 | 说明 | 实践 |
|------|------|------|
| 单一职责 | 每个模块只负责一个功能领域 | 按领域划分微服务/模块 |
| 开闭原则 | 对扩展开放，对修改关闭 | 使用策略模式、插件机制 |
| 依赖倒置 | 依赖抽象而非具体实现 | 接口隔离，依赖注入 |
| 领域驱动 | 以业务领域为核心组织代码 | DDD分层，富领域模型 |
| 可测试性 | 核心业务逻辑可独立测试 | 依赖注入，Mock支持 |

### 1.2 质量属性目标

| 质量属性 | 目标值 | 实现策略 |
|----------|--------|----------|
| 可用性 | 99.5% | 多实例部署，健康检查 |
| 性能 | P99 < 500ms | 缓存，异步处理 |
| 可扩展性 | 支持10x增长 | 水平扩展，无状态服务 |
| 安全性 | 等保2.0二级 | 加密，审计，访问控制 |
| 可维护性 | 圈复杂度<10 | Clean Code，单元测试>80% |

---

## 2. 业务架构

### 2.1 领域划分（DDD Bounded Contexts）

```
AI智能简历生成器
│
├── 用户域 (User Context)
│   ├── 用户管理子域
│   ├── 认证授权子域
│   └── 订阅管理子域
│
├── 经历域 (Experience Context)
│   ├── 教育经历子域
│   ├── 工作经历子域
│   ├── 项目经验子域
│   ├── 技能管理子域
│   └── 经历采集子域
│
├── JD域 (JD Context)
│   ├── JD解析子域
│   ├── JD管理子域
│   └── JD匹配子域
│
├── 简历域 (Resume Context)
│   ├── 简历生成子域
│   ├── 模板管理子域
│   ├── 版本管理子域
│   └── 导出服务子域
│
├── AI域 (AI Context)
│   ├── 文本分析子域
│   ├── 内容生成子域
│   └── 对话服务子域
│
└── 通知域 (Notification Context)
    ├── 邮件通知子域
    └── 系统消息子域
```

### 2.2 领域依赖关系

```
用户域
  │
  ▼ (依赖)
经历域 ────────┐
  │            │
  ▼            │
简历域 ◄────── AI域
  ▲            │
  │            │
JD域 ──────────┘
       │
       ▼
   通知域
```

### 2.3 核心业务流程

**流程1: 用户注册与首次使用**
1. 用户访问Web端注册页
2. 提交信息，后端创建用户，返回JWT Token
3. 用户安装Chrome插件
4. 插件配置Token
5. 浏览招聘网站，插件自动提取JD（支持Boss直聘、脉脉、拉勾等）
6. 推送JD到后端分析
7. 显示预览卡片
8. 用户点击生成简历
9. 后端生成简历，返回结果
10. 跳转到Web端查看

**流程2: 简历生成（核心流程）**
1. 接收请求（JD ID + User ID + Template ID）
2. 查询JD详情和分析结果
3. 查询用户所有经历
4. 检查并扣减用户配额
5. 计算经历与JD的匹配度
6. 按匹配度排序，选择Top N条经历
7. 调用AI服务重写经历描述
8. 加载模板，填充数据
9. 生成PDF文件
10. 上传到MinIO，生成下载链接
11. 保存Resume对象到数据库
12. 返回结果

**流程3: JD多源输入**

JD可以通过以下4种方式进入系统：

1. **Chrome插件提取**（自动）
   - 用户浏览招聘网站
   - 插件识别页面结构，提取JD内容
   - 支持网站：Boss直聘、脉脉、拉勾、智联招聘、前程无忧等
   - 通过API推送到后端

2. **Web端手动输入**（手动）
   - 用户在Web端打开JD录入页面
   - 复制粘贴JD文本到表单
   - 提交后后端进行解析分析

3. **OCR图片识别**（手动+AI）
   - 用户上传JD截图（支持jpg/png/pdf）
   - 后端调用OCR服务识别文字
   - AI提取结构化JD信息

4. **Excel批量导入**（批量）
   - 用户上传Excel文件（多行JD）
   - 后端解析Excel，批量创建JD记录
   - 每行JD独立分析处理
---

## 3. 技术架构

### 3.1 分层架构（Clean Architecture）

**Layer 1 - 领域层（Domain Layer）**
- Entities: User, Experience, JD, Resume
- Value Objects: Email, DateRange
- Domain Services: MatchingAlgorithm, ResumeGenerator
- Repository Interfaces: IUserRepository, IExperienceRepository
- Domain Events: ResumeGeneratedEvent

**Layer 2 - 用例层（Use Case Layer）**
- UserUseCases: RegisterUser, LoginUser, Subscribe
- ExperienceUseCases: CreateExperience, ParseResume
- JDUseCases: AnalyzeJD, GetJDList
- ResumeUseCases: GenerateResume, ExportResume

**Layer 3 - 适配器层（Adapter Layer）**
- Controllers: REST API路由处理
- Repositories: PostgreSQL实现
- Gateways: AI服务适配器、邮件网关
- Presenters: 响应DTO格式化

**Layer 4 - 基础设施层（Infrastructure Layer）**
- FastAPI框架
- PostgreSQL数据库
- Redis缓存
- MinIO对象存储
- Celery任务队列
- AI服务客户端

### 3.2 技术栈选型

**后端技术栈：**
- 框架: FastAPI (Python 3.11+)
- ORM: SQLAlchemy 2.0 (异步)
- 数据库: PostgreSQL 16
- 缓存: Redis 7
- 对象存储: MinIO
- 任务队列: Celery + Redis
- AI服务: Kimi(主) + DeepSeek/Qwen/GLM(备选)
- PDF生成: Playwright + Paged.js
- 日志: Loguru
- 配置: Pydantic Settings

**前端技术栈：**
- 框架: React 18 + TypeScript
- 构建: Vite
- UI库: Ant Design 或 shadcn/ui
- 状态管理: Zustand
- 数据请求: TanStack Query
- 路由: React Router v6
- 样式: TailwindCSS

**插件技术栈：**
- 语言: Vanilla JavaScript (ES6+)
- 打包: Webpack/Vite
- API: Chrome Extension Manifest V3

### 3.3 Chrome插件多网站架构

**适配器模式设计**：

```
┌─────────────────────────────────────────────────────────┐
│                    Chrome插件架构                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Content Script (注入页面)            │  │
│  │                                                  │  │
│  │  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │ SiteDetector │  │ JDExtractor  │             │  │
│  │  │   (检测网站)  │  │  (提取数据)  │             │  │
│  │  └──────┬───────┘  └──────┬───────┘             │  │
│  │         │                 │                      │  │
│  │         └────────┬────────┘                      │  │
│  │                  │                               │  │
│  │  ┌───────────────▼───────────────┐              │  │
│  │  │      SiteAdapter (适配器)      │              │  │
│  │  │  ┌──────┬──────┬──────┬──────┐│              │  │
│  │  │  │ Boss │ 脉脉 │ 拉勾 │ 智联 ││              │  │
│  │  │  └──────┴──────┴──────┴──────┘│              │  │
│  │  └───────────────┬───────────────┘              │  │
│  └──────────────────┼──────────────────────────────┘  │
│                     │                                  │
│  ┌──────────────────┼──────────────────────────────┐  │
│  │  Background      ▼      Service Worker         │  │
│  │                                                  │  │
│  │  ┌──────────────┐    ┌──────────────────┐       │  │
│  │  │  API Client  │───►│ Backend API      │       │  │
│  │  │  (统一格式)  │    │ (HTTPS)          │       │  │
│  │  └──────────────┘    └──────────────────┘       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**支持的招聘网站**：

| 网站 | 域名 | 状态 | 优先级 |
|------|------|------|--------|
| Boss直聘 | zhipin.com | 已支持 | P0 |
| 脉脉 | maimai.cn | 待开发 | P1 |
| 拉勾 | lagou.com | 待开发 | P1 |
| 智联招聘 | zhaopin.com | 待开发 | P2 |
| 前程无忧 | 51job.com | 待开发 | P2 |
| 猎聘 | liepin.com | 待开发 | P2 |

**统一JD数据结构**：

```typescript
interface JDData {
  source: 'zhipin' | 'maimai' | 'lagou' | 'zhaopin' | '51job' | 'liepin';
  sourceUrl: string;
  company: string;
  position: string;
  salary?: string;
  location?: string;
  requirements: string;      // 原始JD文本
  extractedAt: string;       // ISO时间戳
}
```
### 3.3 项目目录结构

```
regen/
├── backend/                          # 后端服务
│   ├── app/
│   │   ├── domain/                   # 领域层
│   │   │   ├── entities/             # 实体
│   │   │   │   ├── user.py
│   │   │   │   ├── experience.py
│   │   │   │   ├── jd.py
│   │   │   │   └── resume.py
│   │   │   ├── value_objects/        # 值对象
│   │   │   │   ├── email.py
│   │   │   │   └── date_range.py
│   │   │   ├── repositories/         # 仓库接口
│   │   │   │   ├── user_repository.py
│   │   │   │   └── experience_repository.py
│   │   │   └── services/             # 领域服务
│   │   │       ├── matching_service.py
│   │   │       └── resume_generator.py
│   │   ├── use_cases/                # 用例层
│   │   │   ├── user/
│   │   │   │   ├── register_user.py
│   │   │   │   ├── login_user.py
│   │   │   │   └── subscribe.py
│   │   │   ├── experience/
│   │   │   │   ├── create_experience.py
│   │   │   │   ├── parse_resume.py
│   │   │   │   └── collect_via_chat.py
│   │   │   ├── jd/
│   │   │   │   ├── analyze_jd.py
│   │   │   │   └── get_jd_list.py
│   │   │   └── resume/
│   │   │       ├── generate_resume.py
│   │   │       ├── edit_resume.py
│   │   │       └── export_resume.py
│   │   ├── adapters/                 # 适配器层
│   │   │   ├── controllers/          # API控制器
│   │   │   │   ├── user_controller.py
│   │   │   │   ├── experience_controller.py
│   │   │   │   ├── jd_controller.py
│   │   │   │   └── resume_controller.py
│   │   │   ├── repositories/         # 仓库实现
│   │   │   │   ├── postgres_user_repository.py
│   │   │   │   └── minio_file_repository.py
│   │   │   └── gateways/             # 外部服务适配器
|       ├── ai_gateway.py
│   │   │       └── sendgrid_email_gateway.py
│   │   └── infrastructure/           # 基础设施层
│   │       ├── database.py
│   │       ├── config.py
│   │       ├── security.py
│   │       └── logging.py
│   ├── tests/
│   ├── alembic/                      # 数据库迁移
│   ├── requirements.txt
│   └── main.py
│
├── frontend/                         # Web前端
│   ├── src/
│   │   ├── components/               # 组件
│   │   ├── pages/                    # 页面
│   │   ├── hooks/                    # 自定义Hooks
│   │   ├── services/                 # API服务
│   │   ├── stores/                   # 状态管理
│   │   └── utils/                    # 工具函数
│   ├── public/
│   └── package.json
│
├── extension/                        # Chrome插件
│   ├── src/
│   │   ├── content/                  # Content Script
│   │   ├── background/               # Service Worker
│   │   └── popup/                    # 弹出页面
│   ├── manifest.json
│   └── package.json
│
├── docs/                             # 文档
│   ├── architecture/                 # 架构文档
│   ├── api/                          # API文档
│   └── deployment/                   # 部署文档
│
├── docker/                           # Docker配置
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
└── scripts/                          # 脚本
    ├── setup.sh
    └── deploy.sh
```


---

## 4. 功能模块划分

### 4.1 模块依赖图

```
┌─────────────────────────────────────────────────────────────────┐
│                        功能模块架构                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────┐                                          │
│  │   API Gateway     │                                          │
│  │   (统一入口)      │                                          │
│  └─────────┬─────────┘                                          │
│            │                                                    │
│  ┌─────────┴─────────┬─────────────────┬─────────────────┐      │
│  │                   │                 │                 │      │
│  ▼                   ▼                 ▼                 ▼      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ 用户模块 │  │ 经历模块 │  │ JD模块   │  │ 简历模块 │       │
│  │          │  │          │  │          │  │          │       │
│  │ •注册    │  │ •CRUD    │  │ •提取    │  │ •生成    │       │
│  │ •登录    │  │ •解析    │  │ •分析    │  │ •编辑    │       │
│  │ •订阅    │  │ •采集    │  │ •匹配    │  │ •导出    │       │
│  │ •配额    │  │          │  │ •管理    │  │ •版本    │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │             │             │              │
│       └─────────────┴──────┬──────┴─────────────┘              │
│                            │                                   │
│                            ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                      基础设施模块                         │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │ │
│  │  │ 数据库   │ │ 缓存     │ │ 对象存储 │ │ AI服务   │    │ │
|  │  │  │  │  │ MinIO    │ │ Kimi +   │    │ |
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
|  │  │  │  │  │          │ │ 多模型   │    │ |
```

### 4.2 模块详细设计

#### 4.2.1 用户模块（User Module）

**职责**：用户生命周期管理、认证授权、订阅管理

**子模块**：
1. **认证服务（Auth Service）**
   - JWT Token生成与验证
   - 密码加密（bcrypt）
   - 登录状态管理

2. **用户服务（User Service）**
   - 用户信息CRUD
   - 头像上传
   - 个人资料管理

3. **订阅服务（Subscription Service）**
   - 套餐管理
   - 配额计算
   - 使用统计

**接口**：
```python
class IUserService:
    async def register(self, email: str, password: str) -> User
    async def login(self, email: str, password: str) -> Token
    async def get_profile(self, user_id: str) -> UserProfile
    async def update_subscription(self, user_id: str, tier: str)
    async def check_quota(self, user_id: str, action: str) -> bool
    async def deduct_quota(self, user_id: str, action: str)
```

#### 4.2.2 经历模块（Experience Module）

**职责**：用户经历的增删改查、简历解析、AI对话采集

**子模块**：
1. **经历管理服务（Experience Management Service）**
   - 教育经历CRUD
   - 工作经历CRUD
   - 项目经验CRUD
   - 技能管理CRUD

2. **简历解析服务（Resume Parser Service）**
   - PDF/Word简历解析
   - 结构化提取
   - 经历入库

3. **对话采集服务（Chat Collection Service）**
   - AI对话管理
   - 经历信息提取
   - 结构化存储

**接口**：
```python
class IExperienceService:
    async def create_education(self, user_id: str, data: EducationDTO) -> Education
    async def create_work(self, user_id: str, data: WorkDTO) -> WorkExperience
    async def parse_resume(self, user_id: str, file: UploadFile) -> ParseResult
    async def start_chat_collection(self, user_id: str, context: str) -> ChatSession
    async def chat_message(self, session_id: str, message: str) -> ChatResponse
```

#### 4.2.3 JD模块（JD Module）

**职责**：JD多源输入、解析、分析、管理、匹配

**子模块**：
1. **JD输入服务（JD Input Service）**
   - Chrome插件提取（支持多网站：Boss直聘、脉脉、拉勾、智联、前程无忧）
   - Web端手动输入（表单录入）
   - OCR图片识别（JD截图识别）
   - Excel批量导入（多JD批量上传）
   - 输入源统一抽象（适配器模式）
   - 接收插件推送的JD数据
   - 原始数据存储

2. **JD分析服务（JD Analysis Service）**
   - AI文本分析
   - 关键词提取
   - 要求结构化

3. **JD匹配服务（JD Matching Service）**
   - 经历匹配算法
   - 匹配度计算
   - 推荐排序

**接口**：
```python
class IJDService:
    # 多源JD输入
    async def extract_from_plugin(self, user_id: str, site_type: str, jd_data: JDData) -> JD
    async def create_manual_jd(self, user_id: str, jd_text: str, source: str) -> JD
    async def parse_jd_image(self, user_id: str, image: UploadFile) -> JD
    async def import_jd_excel(self, user_id: str, excel: UploadFile) -> List[JD]
    async def extract_from_plugin(self, user_id: str, jd_data: JDData) -> JD
    async def analyze_jd(self, jd_id: str) -> JDAnalysis
    async def get_jd_list(self, user_id: str, filters: Filters) -> List[JD]
    async def calculate_match_score(self, jd_id: str, experiences: List[Experience]) -> MatchResult
    async def update_jd_status(self, jd_id: str, status: JDStatus)
```

#### 4.2.4 简历模块（Resume Module）

**职责**：简历生成、编辑、导出、版本管理

**子模块**：
1. **简历生成服务（Resume Generation Service）**
   - 经历选择
   - AI内容优化
   - 模板渲染

2. **简历编辑服务（Resume Editing Service）**
   - 在线编辑
   - 实时预览
   - 自动保存

3. **导出服务（Export Service）**
   - PDF生成
   - Word生成
   - Markdown生成

4. **版本管理服务（Version Management Service）**
   - 版本创建
   - 版本对比
   - 版本恢复

**接口**：
```python
class IResumeService:
    async def generate_resume(self, user_id: str, jd_id: str, template_id: str) -> Resume
    async def edit_resume(self, resume_id: str, changes: ResumeChanges) -> Resume
    async def export_resume(self, resume_id: str, format: str) -> FileURL
    async def create_version(self, resume_id: str) -> ResumeVersion
    async def compare_versions(self, version_id1: str, version_id2: str) -> DiffResult
```

### 4.3 模块间通信

**同步调用（HTTP REST API）**：
- 用户模块 ◄── 其他模块（获取用户信息、检查权限）
- 简历模块 ◄── 经历模块（获取经历数据）
- 简历模块 ◄── JD模块（获取JD数据）

**异步消息（Redis/Celery）**：
- 简历生成任务：发送任务到队列，异步处理
- AI分析任务：大量AI调用使用队列限流
- 邮件通知：非紧急通知使用队列

---

## 5. 部署架构

### 5.1 生产环境部署拓扑

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户访问层                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                CDN (静态资源加速)                         │  │
│  │            Cloudflare / 阿里云CDN                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         负载均衡层                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Nginx / Traefik                         │  │
│  │           SSL终止 + 反向代理 + 限流                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         应用服务层                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   FastAPI    │  │   FastAPI    │  │   FastAPI    │          │
│  │   Instance 1 │  │   Instance 2 │  │   Instance N │          │
│  │   (Docker)   │  │   (Docker)   │  │   (Docker)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Celery     │  │   Celery     │  │   Celery     │          │
│  │   Worker 1   │  │   Worker 2   │  │   Worker N   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         数据存储层                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   PostgreSQL     │  │   Redis          │  │   MinIO      │  │
│  │   主从复制        │  │   主从 + Cluster │  │   分布式      │  │
│  │                  │  │                  │  │              │  │
│  │  Master ───► Slave│  │  Master ───► Slave│  │  Node 1,2,3  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Docker Compose 开发环境

```yaml
version: '3.8'

services:
  # 后端API服务
  backend:
    container_name: regen-backend
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/regen_db
      - REDIS_URL=redis://redis:6379
      - MINIO_ENDPOINT=minio:9000
    depends_on:
      - postgres
      - redis
      - minio
    volumes:
      - ./backend:/app
    command: uvicorn main:app --host 0.0.0.0 --reload

  # 前端开发服务器
  frontend:
    container_name: regen-frontend
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:8000
    command: npm run dev

  # Celery Worker
  celery-worker:
    container_name: regen-celery-worker
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/regen_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    command: celery -A app.celery worker --loglevel=info

  # Celery Beat (定时任务)
  celery-beat:
    container_name: regen-celery-beat
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/regen_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    command: celery -A app.celery beat --loglevel=info

  # PostgreSQL数据库
  postgres:
    container_name: regen-postgres
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=regen_db
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Redis缓存
  redis:
    container_name: regen-redis
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # MinIO对象存储
  minio:
    container_name: regen-minio
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### 5.3 Kubernetes 生产部署

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: regen-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: regen-backend
  template:
    metadata:
      labels:
        app: regen-backend
    spec:
      containers:
      - name: backend
        image: regen/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: regen-backend-service
spec:
  selector:
    app: regen-backend
  ports:
  - port: 80
    targetPort: 8000
  type: ClusterIP
```


---

## 6. 数据架构

### 6.1 数据库优化策略

#### 6.1.1 索引策略

```sql
-- 复合索引示例
CREATE INDEX idx_jds_user_status ON jds(user_id, status);
CREATE INDEX idx_resumes_user_status ON resumes(user_id, status);
CREATE INDEX idx_work_exp_user_dates ON work_experiences(user_id, start_date DESC);

-- 全文搜索索引（用于JD内容搜索）
CREATE INDEX idx_jds_content_search ON jds USING gin(to_tsvector('chinese', raw_content));
```

#### 6.1.2 分区策略（未来扩展）

```sql
-- JD表按月份分区（当日志量很大时）
CREATE TABLE jds (
    -- 列定义
) PARTITION BY RANGE (created_at);

CREATE TABLE jds_2024_01 PARTITION OF jds
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

#### 6.1.3 读写分离配置

```
主库（写操作）: postgresql://master:pass@master-host:5432/regen_db
从库（读操作）: postgresql://replica:pass@replica-host:5432/regen_db
```

---

## 7. 安全架构

### 7.1 安全设计原则

1. 纵深防御：多层安全防护
2. 最小权限：服务只拥有必要权限
3. 零信任：不信任任何请求，始终验证
4. 加密传输：所有通信HTTPS
5. 审计追踪：所有操作可审计

### 7.2 安全措施矩阵

| 层级 | 措施 | 实现 |
|------|------|------|
| 传输层 | TLS 1.3 | Nginx/Traefik配置 |
| 认证层 | JWT + Refresh Token | FastAPI + Redis |
| 接口层 | 限流 + 防重放 | Redis + 时间戳验证 |
| 数据层 | 字段加密 + 脱敏 | SQLAlchemy + 自定义脱敏 |
| 存储层 | 文件加密 + 签名 | MinIO SSE + URL签名 |
| 运维层 | 审计日志 + 监控 | ELK Stack + Prometheus |

### 7.3 敏感数据处理示例

```python
# 密码：bcrypt加密
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed_password = pwd_context.hash(password)

# 手机号：AES加密存储
from cryptography.fernet import Fernet
cipher = Fernet(ENCRYPTION_KEY)
encrypted_phone = cipher.encrypt(phone.encode())

# 日志脱敏示例
# 原始: "用户13812345678登录成功"
# 脱敏: "用户138****5678登录成功"
```

---

## 8. 接口设计原则

### 8.1 REST API设计规范

```
基础URL: https://api.regen.com/v1
认证: Bearer Token (JWT)
Content-Type: application/json
```

**响应格式标准**:
```json
{
  "success": true,
  "data": { },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100
  },
  "message": "操作成功"
}
```

**错误响应格式**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMS",
    "message": "参数错误",
    "details": { }
  }
}
```

### 8.2 API版本控制策略

- URL版本: /api/v1/users
- Header版本: Accept: application/vnd.api+json;version=1
- 向后兼容: 旧版本API保持3个月

### 8.3 限流策略

| 端点类型 | 限流规则 | 实现 |
|----------|----------|------|
| 认证接口 | 5次/分钟 | Redis滑动窗口 |
| 普通接口 | 100次/分钟 | Redis令牌桶 |
| AI生成接口 | 根据套餐 | 配额系统 |

---

## 9. 监控与日志架构

### 9.1 监控体系

```
┌─────────────────────────────────────────────────┐
│              监控体系架构                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  应用层 ──► Prometheus ──► Grafana (Dashboard) │
│  日志层 ──► Loki ───────► Grafana (日志查询)   │
│  链路层 ──► Jaeger ─────► 分布式追踪           │
│  告警层 ──► Alertmanager ─► 邮件/短信/钉钉     │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 9.2 关键监控指标

**业务指标**:
- 日活跃用户(DAU)
- 简历生成成功率
- AI调用成功率
- 付费转化率

**技术指标**:
- API响应时间(P50/P95/P99)
- 数据库连接池使用率
- Redis命中率
- 错误率(4xx/5xx)

**资源指标**:
- CPU使用率
- 内存使用率
- 磁盘I/O
- 网络带宽

---

## 10. 扩展性设计

### 10.1 水平扩展策略

**无状态服务扩展**:
```
负载均衡器 ──► FastAPI实例1
            ──► FastAPI实例2
            ──► FastAPI实例3
            ──► ...
```

**数据库扩展**:
- 读扩展：主从复制，读写分离
- 写扩展：分库分表（按user_id哈希）

**缓存扩展**:
- Redis Cluster模式
- 热点数据本地缓存(Caffeine)

### 10.2 微服务拆分路线图

**Phase 1: 单体应用** (当前)
- 所有服务在一个代码库
- 部署简单，开发效率高

**Phase 2: 拆分AI服务** (用户数>1万)
- AI服务独立部署
- 独立扩缩容，降低成本

**Phase 3: 核心业务拆分** (用户数>10万)
- 用户服务、经历服务、JD服务、简历服务独立
- 每个服务独立数据库

---

## 11. 灾难恢复与备份

### 11.1 备份策略

| 数据类型 | 备份频率 | 保留期限 | 存储位置 |
|----------|----------|----------|----------|
| 数据库 | 每日全量+实时WAL | 30天 | 异地存储 |
| 文件存储 | 实时同步 | 90天 | 跨区域复制 |
| 配置文件 | 每次变更 | 永久 | Git+对象存储 |

### 11.2 故障恢复流程

**场景1: 单实例故障**
1. 健康检查检测到故障
2. 自动将流量切换到健康实例
3. 自动重启故障实例
4. 通知运维人员

**场景2: 数据库主库故障**
1. 监控告警触发
2. 手动/自动提升从库为主库
3. 更新应用数据库连接配置
4. 启动新从库实例
5. 事后修复原主库

**场景3: 数据中心故障**
1. 切换到备用数据中心
2. 通知用户服务降级
3. 修复主数据中心
4. 数据同步验证
5. 切回主数据中心

---

## 12. 架构决策记录(ADR)

### ADR-001: 采用Clean Architecture分层

**决策**: 使用Clean Architecture四层架构

**原因**:
- 业务逻辑独立于框架
- 便于单元测试
- 支持技术栈演进

**影响**:
- 增加初期开发成本
- 长期维护成本降低

### ADR-002: 采用PostgreSQL作为主数据库

**决策**: 使用PostgreSQL而非MySQL或MongoDB

**原因**:
- 强一致性要求
- 复杂查询支持好
- JSONB支持半结构化数据

**影响**:
- 需要DBA技能
- 扩展性需要分库分表

### ADR-003: 采用FastAPI作为Web框架

**决策**: 使用FastAPI而非Django或Flask

**原因**:
- 异步支持好，性能高
- 自动API文档生成
- 类型提示支持

**影响**:
- 团队需要学习成本
- 生态不如Django成熟

---

**文档结束**

**变更历史**:
- v1.0 (2026-02-24): 初始版本，合并数据库架构补充
