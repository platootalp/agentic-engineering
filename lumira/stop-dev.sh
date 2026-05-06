#!/bin/bash
# ============================================
# Lumira Development Stop Script
# 本地开发一键停止脚本
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Lumira 本地开发环境停止${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
print_info "正在停止前后端服务..."

# Stop frontend
if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID 2>/dev/null || true
        print_success "前端服务已停止 (PID: $FRONTEND_PID)"
    fi
    rm -f .frontend.pid
fi

# Stop backend
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID 2>/dev/null || true
        print_success "后端服务已停止 (PID: $BACKEND_PID)"
    fi
    rm -f .backend.pid
fi

# Kill any remaining node processes on ports 3000/3001
if lsof -i :3000 | grep -q "node"; then
    lsof -ti :3000 | xargs kill -9 2>/dev/null || true
    print_success "前端进程已清理"
fi

if lsof -i :3001 | grep -q "node"; then
    lsof -ti :3001 | xargs kill -9 2>/dev/null || true
    print_success "后端进程已清理"
fi

echo ""
print_info "正在停止基础设施..."
cd docker/local
./stop.sh
cd "$SCRIPT_DIR"

print_success "基础设施已停止"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  所有服务已停止${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "💡 如需完全重置（删除数据）:"
echo "  cd docker/local && docker-compose down -v"
echo ""
echo -e "${GREEN}========================================${NC}"
