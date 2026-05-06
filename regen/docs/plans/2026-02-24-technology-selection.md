# AI智能简历生成器 - 技术选型详细分析

**版本**: v1.0  
**日期**: 2026-02-24  
**状态**: 已确认

---

## 1. 后端框架选型 - 确认: FastAPI

### 1.1 对比分析

| 维度 | FastAPI | Django | Flask |
|------|---------|--------|-------|
| 性能 | 优秀 | 中等 | 中等 |
| 异步支持 | 原生支持 | 有限 | 不支持 |
| 开发效率 | 高 | 中 | 中 |
| 自动文档 | 内置 | 需配置 | 需配置 |
| 学习曲线 | 中等 | 陡峭 | 平缓 |

### 1.2 选择FastAPI的理由

1. **异步性能**: 项目需要大量异步操作（AI调用、PDF生成）
2. **自动文档**: 自动生成OpenAPI/Swagger，前后端协作方便
3. **类型安全**: Pydantic数据验证，减少运行时错误
4. **现代Python**: 团队规模小，需要快速开发

### 1.3 包管理工具 - 确认: uv

**选择 uv 的理由：**
1. **极速安装**: 比 pip 快 10-100 倍，大幅缩短依赖安装时间
2. **全局缓存**: 智能缓存机制，节省磁盘空间
3. **兼容 pip**: 完全兼容 requirements.txt 格式
4. **现代工具**: Astral 出品，Rust 编写，性能卓越

### 1.4 核心依赖

```toml
[project]
name = "regen"
version = "0.1.0"
dependencies = [
    "fastapi==0.109.0",
    "uvicorn[standard]==0.27.0",
    "sqlalchemy[asyncio]==2.0.25",
    "asyncpg==0.29.0",
    "redis==5.0.1",
    "celery==5.3.6",
    "pydantic-settings==2.1.0",
    "python-jose[cryptography]==3.3.0",
    "passlib[bcrypt]==1.7.4",
]
```

**uv 常用命令：**
```bash
# 安装依赖
uv pip install -r pyproject.toml

# 添加新依赖
uv pip add <package>

# 导出 requirements.txt
uv pip compile pyproject.toml -o requirements.txt

# 同步环境
uv pip sync requirements.txt
```

```
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy[asyncio]==2.0.25
asyncpg==0.29.0
redis==5.0.1
celery==5.3.6
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
```

---

## 2. 前端框架选型 - 确认: React + TypeScript

### 2.1 对比分析

| 维度 | React | Vue 3 | Angular |
|------|-------|-------|---------|
| 生态丰富度 | 最丰富 | 丰富 | 丰富 |
| 招聘难度 | 最容易 | 容易 | 较难 |
| 学习曲线 | 中等 | 平缓 | 陡峭 |
| TypeScript支持 | 优秀 | 良好 | 优秀 |

### 2.2 选择React的理由

1. **生态最丰富**: Ant Design等组件库选择多
2. **招聘容易**: 开发者最多，团队扩张方便
3. **企业级**: 适合后台管理系统
4. **未来扩展**: React Native/Electron生态成熟

### 2.3 技术栈

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "@tanstack/react-query": "^5.17.0",
    "zustand": "^4.4.7",
    "antd": "^5.12.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0"
  }
}
```

---

## 3. AI服务选型 - 确认: Kimi为主 + DeepSeek/Qwen/GLM备选

### 3.1 国产大模型价格对比

| 模型 | 输入价格 | 输出价格 | 上下文 | 推荐度 | 备注 |
|------|---------|---------|--------|--------|
| Kimi (Moonshot) | 12元/百万token | 12元/百万token | 200K | **首选** | 长文本支持好 |
| Qwen-Max | 20元/百万token | 20元/百万token | 32K | 备选2 | 阿里出品 |
| DeepSeek-V2 | 1元/百万token | 2元/百万token | 128K | 备选1 | 性价比最高 |
| GLM-4 | 10元/百万token | 10元/百万token | 128K | 备选3 | 清华系 |
| ERNIE-4 | 30元/百万token | 30元/百万token | 8K | 不考虑 | 价格过高 |
| ERNIE-4 | 30元/百万token | 30元/百万token | 8K | 不考虑 |

### 3.2 选择Kimi的理由

1. **长文本能力强**: 200K上下文，支持完整简历+JD分析
2. **中文理解优秀**: 中文简历生成效果好
3. **API兼容**: 兼容OpenAI格式
4. **稳定可靠**: 国内头部模型，服务保障好

### 3.3 成本估算

假设月活1000用户，每人每月生成20份简历：
- 单次生成约11000 tokens
- 月度调用: 20000次
- Token总数: 220M
- 月度成本: 约330元

### 3.4 AI服务架构

```
AI服务网关
    │
    ├──► Kimi (主) - 默认调用，200K上下文
    │
    ├──► DeepSeek (备选1) - 故障转移，高性价比
    ├──► GLM (备选3) - 清华系
    ├──► Qwen (备选2) - 阿里生态
    │
    │
    └──► 本地模型 (Premium) - 隐私模式
```

---

## 4. 数据库选型 - 确认: PostgreSQL 16

### 4.1 对比分析

| 维度 | PostgreSQL | MySQL | MongoDB |
|------|-----------|-------|---------|
| JSON支持 | 优秀 | 一般 | 原生 |
| 全文搜索 | 内置 | 需插件 | 支持 |
| 关系型 | 强 | 强 | 弱 |
| 扩展性 | 优秀 | 一般 | 良好 |

### 4.2 选择PostgreSQL的理由

1. **JSONB支持**: JD分析结果、简历内容适合JSON存储，PostgreSQL 16性能优化
2. **全文搜索**: 内置中文搜索，无需ES
3. **数据一致性**: 适合订阅、支付等财务场景
4. **阿里云支持**: RDS PostgreSQL成熟稳定

### 4.3 部署方案

- 开发/测试: Docker本地部署 (PostgreSQL 16)
- 生产初期: 阿里云RDS基础版
- 规模扩大: 阿里云RDS高可用版（主从）

---

## 5. 其他技术选型

### 5.1 缓存: Redis 7
用途: Session、限流、热点数据、任务队列

### 5.2 对象存储
- 开发: MinIO (Docker)
- 生产: 阿里云OSS

### 5.3 任务队列: Celery
优势: Python生态最成熟，支持定时任务

### 5.4 PDF生成: Playwright + Paged.js
优势: HTML/CSS模板灵活，支持现代CSS
- openpyxl: Excel文件读写
- pandas: DataFrame处理，数据清洗
用途: 批量JD导入
### 5.6 Excel解析: pandas + openpyxl

- 生产: 百度OCR API (准确率高，按量付费)
- 开发: PaddleOCR (开源，本地部署)
用途: JD图片识别（用户上传JD截图）
### 5.5 OCR服务: PaddleOCR / 百度OCR

---

## 6. 最终技术栈确认

### 6.1 完整技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 后端框架 | FastAPI | 0.109.0 |
| 后端语言 | Python | 3.11+ |
| 数据库 | PostgreSQL | 16 |
| ORM | SQLAlchemy | 2.0 |
| 缓存 | Redis | 7 |
| 任务队列 | Celery | 5.3 |
| 对象存储 | MinIO/OSS | Latest |
| 前端框架 | React | 18.2 |
| 前端语言 | TypeScript | 5.3 |
| 构建工具 | Vite | 5.0 |
| UI组件库 | Ant Design | 5.12 |
| 状态管理 | Zustand | 4.4 |
| 数据请求 | TanStack Query | 5.17 |
| AI服务 | Kimi + 多模型 | API |
| PDF生成 | Playwright | Latest |
| 插件 | Chrome Extension | V3 |

### 6.2 开发环境

Docker Compose一键启动：
- backend (Python 3.11)
- frontend (Node 20)
- postgres (15)
- redis (7)
- minio (latest)

### 6.3 生产环境

阿里云架构：
- ECS: 2核4G x 2台
- RDS PostgreSQL: 高可用版
- Redis: 主从版
- OSS: 标准存储
- SLB: 负载均衡
- CDN: 全站加速

### 6.4 成本估算（月度）

**云服务费用**: ~1000元/月
- ECS: 400元
- RDS: 300元
- Redis: 150元
- OSS: 50元
- 其他: 100元

**AI服务费用**: ~1200元/月
- Kimi调用: 800元 (长文本消耗token多)
- 备选模型: 300元
- 缓冲: 70元

**OCR服务费用**: ~200元/月

- 缓冲: 50元
- 百度OCR: 150元
**总计**: ~2400元/月（支持1000月活用户）
---

## 7. 技术选型总结

**已确认的技术栈**:

后端: FastAPI + PostgreSQL + Redis + Celery
前端: React + TypeScript + Vite + Ant Design
AI: Kimi (主) + DeepSeek/Qwen/GLM (备选)
部署: Docker + 阿里云

**优势**:
1. 性能优秀，支持高并发
2. 开发效率高，适合快速迭代
3. 成本可控，适合初创项目
4. 生态成熟，招聘容易
5. 可扩展性强，支持业务增长

**风险**:
1. FastAPI生态相对年轻
2. OCR服务需要权衡自研vs云服务成本
3. 需要自研Admin后台

**建议**:
技术选型已确认，可以开始MVP开发。建议优先实现核心功能：用户注册、JD提取、简历生成。

