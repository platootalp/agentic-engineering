#!/bin/bash
# ============================================
# Local Development Infrastructure Restart Script
# 重启本地开发基础设施
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔄 重启基础设施服务..."

# Parse arguments
BUILD_FLAG=""
if [[ "$*" == *"--build"* ]]; then
    BUILD_FLAG="--build"
fi

# Stop first
./stop.sh

# Start with optional build
if [ -n "$BUILD_FLAG" ]; then
    echo "🔨 重新构建镜像..."
    docker-compose up -d --build
else
    ./start.sh
fi
