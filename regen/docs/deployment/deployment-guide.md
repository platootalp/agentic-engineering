# 部署文档

**版本**: v1.0
**日期**: 2026-02-24
**环境**: 开发环境 / 生产环境

---

## 目录

- [1. 部署架构](#1-部署架构)
  - [1.1 开发环境](#11-开发环境)
  - [1.2 生产环境](#12-生产环境)

- [2. 开发环境部署](#2-开发环境部署)
  - [2.1 前置要求](#21-前置要求)
  - [2.2 启动步骤](#22-启动步骤)
  - [2.3 常用命令](#23-常用命令)

- [3. 生产环境部署](#3-生产环境部署)
  - [3.1 阿里云资源配置](#31-阿里云资源配置)
  - [3.2 部署步骤](#32-部署步骤)

- [4. CI/CD配置](#4-cicd配置)
  - [4.1 GitHub Actions](#41-github-actions)

- [5. 备份与恢复](#5-备份与恢复)
  - [5.1 数据库备份](#51-数据库备份)
  - [5.2 数据库恢复](#52-数据库恢复)

- [6. 故障排查](#6-故障排查)
  - [6.1 常见问题](#61-常见问题)
  - [6.2 日志位置](#62-日志位置)

---

## 1. 部署架构

### 1.1 开发环境

```
┌─────────────────────────────────────────────┐
│           Docker Compose (本地)              │
├─────────────────────────────────────────────┤
│                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Backend │ │ Frontend│ │Extension│       │
│  │ :8000   │ │ :3000   │ │ (dev)   │       │
│  └────┬────┘ └─────────┘ └─────────┘       │
│       │                                      │
│  ┌────┴────┐ ┌─────────┐ ┌─────────┐       │
│  │Postgres │ │  Redis  │ │  MinIO  │       │
│  │  :5432  │ │  :6379  │ │ :9000   │       │
│  └─────────┘ └─────────┘ └─────────┘       │
│                                              │
└─────────────────────────────────────────────┘
```

### 1.2 生产环境

```
┌─────────────────────────────────────────────────────────────┐
│                         阿里云架构                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  用户 ───► CDN ───► SLB ───► ECS集群                        │
│                              │                               │
│  ┌───────────────────────────┼───────────────────────────┐  │
│  │                           │                           │  │
│  ▼                           ▼                           ▼  │
│ ┌─────┐                  ┌─────┐                      ┌─────┐│
│ │ECS 1│                  │ECS 2│                      │ECS N││
│ │API  │                  │API  │                      │API  ││
│ └─────┘                  └─────┘                      └─────┘│
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ RDS Postgres│  │ Redis       │  │ OSS                 │  │
│  │ (主从)      │  │ (主从)      │  │ (对象存储)          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 开发环境部署

### 2.1 前置要求

- Docker 24.0+
- Docker Compose 2.20+
- Git

### 2.2 启动步骤

```bash
# 1. 克隆代码
git clone <repository-url>
cd regen

# 2. 创建环境变量文件
cp .env.example .env

# 3. 编辑环境变量
vim .env
```

.env 文件示例:
```bash
# 数据库
DATABASE_URL=postgresql://user:pass@postgres:5432/regen_db

# Redis
REDIS_URL=redis://redis:6379/0

# MinIO
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=regen

# AI服务
KIMI_API_KEY=sk-your-kimi-key
DEEPSEEK_API_KEY=sk-your-deepseek-key
QWEN_API_KEY=sk-your-qwen-key

# JWT
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=120

# 环境
ENVIRONMENT=development
DEBUG=true
```

```bash
# 4. 启动服务
docker-compose up -d

# 5. 查看日志
docker-compose logs -f backend

# 6. 初始化数据库
docker-compose exec backend alembic upgrade head

# 7. 访问服务
# Backend API: http://localhost:8000
# Frontend: http://localhost:3000
# MinIO Console: http://localhost:9001
```

### 2.3 常用命令

```bash
# 停止服务
docker-compose down

# 重建服务
docker-compose up -d --build

# 查看特定服务日志
docker-compose logs -f backend

# 进入容器
docker-compose exec backend bash

# 数据库迁移
docker-compose exec backend alembic revision --autogenerate -m "description"
docker-compose exec backend alembic upgrade head
```

### 2.4 后端开发（使用 uv）

**uv 是本项目后端包管理工具，比 pip 快 10-100 倍。**

```bash
# 进入后端目录
cd backend

# 使用 uv 安装依赖（推荐）
uv pip install -r pyproject.toml

# 或使用 uv 同步环境
uv pip sync requirements.txt

# 添加新依赖
uv pip add <package-name>

# 导出 requirements.txt
uv pip compile pyproject.toml -o requirements.txt
```

---

## 3. 生产环境部署

### 3.1 阿里云资源配置

| 资源 | 规格 | 数量 | 预估月费 |
|------|------|------|----------|
| ECS | 2核4G | 2台 | 400元 |
| RDS PostgreSQL | 高可用版 2核4G | 1套 | 450元 |
| Redis | 主从版 2G | 1套 | 200元 |
| OSS | 标准存储 | - | 50元 |
| SLB | 标准型 | 1个 | 50元 |
| CDN | 流量包 | - | 100元 |

### 3.2 部署步骤

#### 步骤1: 准备服务器

```bash
# 登录阿里云ECS
ssh root@your-ecs-ip

# 安装Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# 安装Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

#### 步骤2: 配置RDS

1. 在阿里云控制台创建RDS PostgreSQL实例
2. 创建数据库: `regen_db`
3. 创建用户: `regen_db_user`
4. 配置白名单允许ECS访问
5. 记录连接地址

#### 步骤3: 配置Redis

1. 在阿里云控制台创建Redis实例
2. 配置白名单
3. 记录连接地址和密码

#### 步骤4: 配置OSS

1. 在阿里云控制台创建OSS Bucket
2. 记录Endpoint和AccessKey

#### 步骤5: 部署应用

```bash
# 克隆代码
git clone <repository-url>
cd regen

# 创建生产环境配置
cat > .env.production << 'ENVFILE'
# 数据库 (使用RDS)
DATABASE_URL=postgresql://regen_db_user:password@your-rds-endpoint.rds.aliyuncs.com:5432/regen_db

# Redis (使用阿里Redis)
REDIS_URL=redis://:password@your-redis-endpoint.redis.rds.aliyuncs.com:6379/0

# OSS (使用阿里云OSS)
OSS_ENDPOINT=your-oss-endpoint.oss-cn-beijing.aliyuncs.com
OSS_ACCESS_KEY_ID=your-access-key
OSS_ACCESS_KEY_SECRET=your-secret
OSS_BUCKET_NAME=regen-prod

# AI服务
KIMI_API_KEY=sk-your-kimi-key
DEEPSEEK_API_KEY=sk-your-deepseek-key
QWEN_API_KEY=sk-your-qwen-key

# JWT (生产环境使用强密钥)
JWT_SECRET_KEY=your-256-bit-secret-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=120

# 环境
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO

# Sentry错误监控 (可选)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
ENVFILE

# 使用docker-compose.prod.yml启动
docker-compose -f docker-compose.prod.yml up -d
```

docker-compose.prod.yml:
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    env_file:
      - .env.production
    environment:
      - WORKERS=4
    restart: always
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  celery-worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: celery -A app.celery worker --loglevel=info --concurrency=4
    env_file:
      - .env.production
    restart: always
    deploy:
      resources:
        limits:
          memory: 512M

  celery-beat:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: celery -A app.celery beat --loglevel=info
    env_file:
      - .env.production
    restart: always
```

#### 步骤6: 配置Nginx

```bash
# 在ECS上安装Nginx
apt-get update
apt-get install -y nginx

# 配置Nginx
cat > /etc/nginx/sites-available/regen << 'NGINXCONF'
upstream backend {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name your-domain.com;
    
    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL证书 (使用Certbot申请)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # API代理
    location /api/ {
        proxy_pass http://backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 60s;
    }
    
    # 前端静态文件 (如果使用独立部署)
    location / {
        root /var/www/regen-frontend;
        try_files $uri $uri/ /index.html;
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
NGINXCONF

ln -s /etc/nginx/sites-available/regen /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

#### 步骤7: 配置SSL证书

```bash
# 安装Certbot
apt-get install -y certbot python3-certbot-nginx

# 申请证书
certbot --nginx -d your-domain.com

# 自动续期
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

#### 步骤8: 配置监控

```bash
# 安装Node Exporter (Prometheus)
docker run -d \
  --name node-exporter \
  --restart always \
  -p 9100:9100 \
  prom/node-exporter

# 配置日志收集 (可选)
docker run -d \
  --name filebeat \
  --restart always \
  -v /var/log:/var/log \
  -v /path/to/filebeat.yml:/usr/share/filebeat/filebeat.yml \
  docker.elastic.co/beats/filebeat:8.11.0
```

---

## 4. CI/CD配置

### 4.1 GitHub Actions

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Alibaba Cloud Registry
      uses: docker/login-action@v2
      with:
        registry: registry.cn-beijing.aliyuncs.com
        username: ${{ secrets.ALIYUN_USERNAME }}
        password: ${{ secrets.ALIYUN_PASSWORD }}
    
    - name: Build and push backend
      uses: docker/build-push-action@v4
      with:
        context: ./backend
        push: true
        tags: |
          registry.cn-beijing.aliyuncs.com/your-namespace/regen-backend:${{ github.sha }}
          registry.cn-beijing.aliyuncs.com/your-namespace/regen-backend:latest
    
    - name: Deploy to ECS
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.ECS_HOST }}
        username: root
        key: ${{ secrets.ECS_SSH_KEY }}
        script: |
          cd /opt/regen
          docker-compose -f docker-compose.prod.yml pull
          docker-compose -f docker-compose.prod.yml up -d
          docker system prune -f
```

---

## 5. 备份与恢复

### 5.1 数据库备份

```bash
# 每日自动备份脚本
cat > /opt/backup/backup-db.sh << 'BACKUPSCRIPT'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/postgres”
mkdir -p $BACKUP_DIR

# 备份数据库
pg_dump $DATABASE_URL | gzip > "$BACKUP_DIR/regen_db_$DATE.sql.gz"

# 上传到OSS
ossutil cp "$BACKUP_DIR/regen_db_$DATE.sql.gz" oss://regen-backups/postgres/

# 保留本地最近7天
find $BACKUP_DIR -name "regen_db_*.sql.gz” -mtime +7 -delete
BACKUPSCRIPT

chmod +x /opt/backup/backup-db.sh

# 添加到定时任务
echo “0 2 * * * /opt/backup/backup-db.sh” | crontab -
```

### 5.2 数据库恢复

```bash
# 从备份恢复
gunzip < regen_db_20240224_020000.sql.gz | psql $DATABASE_URL
```

---

## 6. 故障排查

### 6.1 常见问题

| 问题 | 排查步骤 | 解决方案 |
|------|---------|---------|
| 服务无法启动 | 查看docker日志 | docker-compose logs |
| 数据库连接失败 | 检查RDS白名单 | 添加ECS IP到白名单 |
| AI调用失败 | 检查API Key | 更新.env中的Key |
| 内存不足 | 查看top/htop | 扩容ECS或优化代码 |

### 6.2 日志位置

```bash
# Docker日志
docker-compose logs -f --tail=100

# Nginx日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# 应用日志 (如果在容器内)
docker-compose exec backend cat /app/logs/app.log
```
