#!/bin/bash
set -e

echo "🚀 游戏市场分析 Agent - 初始化"

if ! docker info &> /dev/null; then
    echo "❌ Docker 未运行"
    exit 1
fi

COMPOSE_CMD="docker-compose"
mkdir -p data backend/data

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env 2>/dev/null || true
    echo "⚠️  请编辑 backend/.env 填入 API Keys"
fi

echo "🔨 构建镜像..."
$COMPOSE_CMD build

echo "▶️  启动服务..."
$COMPOSE_CMD up -d

sleep 5
$COMPOSE_CMD ps

echo ""
echo "✅ 启动完成!"
echo "   Dashboard: http://localhost:3000"
echo "   API 文档:  http://localhost:8000/docs"
