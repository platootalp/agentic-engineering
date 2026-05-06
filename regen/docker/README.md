# Regen Docker 环境管理

多环境 Docker 配置，支持本地开发、测试和生产部署。

## 🚀 推荐：一键启动开发环境

项目根目录提供了一键启动脚本，自动启动所有服务：

```bash
# 在项目根目录执行
./start-dev.sh
```

这会按顺序启动：
1. **Docker 基础设施** (PostgreSQL/Redis/MinIO)
2. **后端服务** (FastAPI + 数据库迁移)
3. **前端服务** (Vite dev server)

**访问地址：**
- 🌐 前端: http://localhost:7000
- 🔧 后端: http://localhost:8000
- 📚 API 文档: http://localhost:8000/docs
- 🗄️ MinIO: http://localhost:9001 (minioadmin/minioadmin)

**停止服务：**
```bash
./stop-dev.sh
```

或按 `Ctrl+C` 停止所有服务。

---

## 目录结构

```
docker/
├── local/              # 本地开发基础设施（仅Docker）
│   ├── docker-compose.yml
│   ├── .env.example
│   ├── start.sh
│   ├── stop.sh
│   └── restart.sh
├── test/               # 测试环境（完整服务）
├── prod/               # 生产环境（完整服务）
├── Dockerfile.backend
├── Dockerfile.frontend
└── init-scripts/
```

## 使用方式

### 方式一：一键启动（推荐）

```bash
./start-dev.sh    # 启动所有服务
./stop-dev.sh     # 停止所有服务
```

### 方式二：分步启动（灵活控制）

如果你需要更灵活的控制（比如只改前端代码）：

**终端 1 - 基础设施：**
```bash
cd docker/local
./start.sh        # 启动 PostgreSQL/Redis/MinIO
```

**终端 2 - 后端：**
```bash
cd backend
uv run uvicorn app.main:app --reload
```

**终端 3 - 前端：**
```bash
cd frontend
npm run dev
```

## 环境对比

| 方式 | 启动命令 | 适用场景 | 特点 |
|------|---------|---------|------|
| **一键启动** | `./start-dev.sh` | 日常开发 | 最方便，自动处理依赖 |
| **分步启动** | 多个终端 | 调试特定服务 | 灵活，独立控制 |
| **仅基础设施** | `docker/local/start.sh` | 只用数据库 | 最轻量 |

## 常用命令

```bash
# 查看所有服务状态
docker ps

# 查看基础设施日志
cd docker/local && docker-compose logs -f

# 查看后端日志
tail -f logs/backend.log

# 查看前端日志
tail -f logs/frontend.log

# 重启基础设施
cd docker/local && ./restart.sh

# 完全重置数据库（谨慎！）
cd docker/local && docker-compose down -v
```

## 故障排除

**端口冲突**
```bash
# 修改 docker/local/.env 中的端口
POSTGRES_PORT=5433
REDIS_PORT=6380
MINIO_PORT=9002
```

**依赖未安装**
```bash
# 一键脚本会自动安装，如失败可手动：
cd backend && uv sync
cd frontend && npm install
```

**数据库连接失败**
```bash
# 检查 PostgreSQL 是否运行
cd docker/local && docker-compose ps
```

**权限问题**
```bash
chmod +x start-dev.sh stop-dev.sh
chmod +x docker/local/*.sh
```

---

## 测试环境

用于 CI/CD：

```bash
cd docker/test
./start.sh
```

## 生产环境

```bash
cd docker/prod
cp .env.example .env  # 修改所有配置
./start.sh
```
