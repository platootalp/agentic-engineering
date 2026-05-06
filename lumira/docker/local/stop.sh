#!/bin/bash
# ============================================
# Local Development Infrastructure Stop Script
# 本地开发基础设施停止脚本
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

print_info "停止基础设施服务..."
docker-compose down

print_success "服务已停止"

echo ""
echo "💡 提示:"
echo "  保留数据卷:  docker-compose down"
echo "  删除数据卷:  docker-compose down -v"
