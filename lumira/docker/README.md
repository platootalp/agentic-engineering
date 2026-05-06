# Lumira Docker 环境管理

多环境 Docker 配置，支持本地开发和生产部署。

## 🚀 快速开始

### 方式一：一键启动（推荐）

在项目根目录直接启动基础设施：

```bash
./start-dev.sh    # 启动 PostgreSQL/Redis
```

然后在其他终端启动应用：
```bash
# 终端 1 - 后端
cd lumira-backend && npm run dev

# 终端 2 - 前端
npm run dev
```

停止基础设施：
```bash
./stop-dev.sh
```

### 方式二：手动启动（更多控制）

```bash
cd docker/local
./start.sh
```

### 方式三：生产部署

完整 Docker 部署：

```bash
cd docker/prod
cp .env.example .env  # 编辑配置
./start.sh
```

## 📁 目录结构

```
docker/
├── local/              # 本地开发（仅基础设施）
│   ├── docker-compose.yml
│   ├── .env.example
│   ├── start.sh
│   ├── stop.sh
│   └── restart.sh
├── prod/               # 生产环境（完整部署）
│   ├── docker-compose.yml
│   ├── .env.example
│   ├── start.sh
│   └── stop.sh
├── Dockerfile.backend  # 后端 Dockerfile
├── Dockerfile.frontend # 前端 Dockerfile
└── README.md
```

**项目根目录脚本：**
- `start-dev.sh` - 一键启动开发基础设施
- `stop-dev.sh` - 一键停止开发基础设施

## 🔧 环境对比

| 环境 | 启动命令 | 适用场景 | 特点 |
|------|---------|---------|------|
| **一键启动** | `./start-dev.sh` | 日常开发 | 最方便，自动检查依赖 |
| **手动启动** | `cd docker/local && ./start.sh` | 需要更多控制 | 灵活调试 |
| **生产环境** | `cd docker/prod && ./start.sh` | 生产部署 | 完整容器化 |

## 🌐 服务地址

### 本地开发
- 前端: http://localhost:3000
- 后端: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### 生产环境
- 前端: http://localhost:3000
- 后端: http://localhost:3001
- API Health: http://localhost:3001/health

## 📜 常用命令

```bash
# 一键启动/停止（项目根目录）
./start-dev.sh      # 启动基础设施
./stop-dev.sh       # 停止基础设施

# 本地开发（docker/local 目录）
cd docker/local
./start.sh          # 启动基础设施
./stop.sh           # 停止
./restart.sh        # 重启

# 生产环境（docker/prod 目录）
cd docker/prod
./start.sh          # 启动所有服务
./stop.sh           # 停止

# 查看日志
cd docker/local && docker-compose logs -f

# 完全重置（删除数据卷）
cd docker/local && docker-compose down -v
```

## ⚠️ 注意事项

1. **本地开发**：需要先在前端根目录和 `lumira-backend/` 目录分别运行 `npm install`
2. **前端构建**：生产部署前需要在项目根目录运行 `npm run build`
3. **后端构建**：生产部署前需要在 `lumira-backend/` 目录运行 `npm run build`
