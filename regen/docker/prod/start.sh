#!/bin/bash
# Production Environment Startup Script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Starting Production Environment..."

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Please copy .env.example to .env and configure it:"
    echo "   cp .env.example .env"
    exit 1
fi

# 检查关键配置
if grep -q "CHANGE_THIS" .env; then
    echo "⚠️  WARNING: You have placeholder values in .env!"
    echo "📝 Please update all CHANGE_THIS values before deploying to production."
    exit 1
fi

# 启动服务
docker-compose up -d

echo "✅ Production environment started!"
echo ""
echo "📊 Check status: docker-compose ps"
echo "📜 View logs:    docker-compose logs -f"
echo "🛑 Stop:         docker-compose down"
