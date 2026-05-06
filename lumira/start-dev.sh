#!/bin/bash
# ============================================
# Lumira Development Startup Script
# 本地开发一键启动脚本
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Lumira 本地开发环境启动${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Step 1: Start infrastructure
print_info "步骤 1/3: 启动基础设施 (PostgreSQL/Redis)..."
cd docker/local
./start.sh
cd "$SCRIPT_DIR"
echo ""

# Step 2: Check if npm dependencies are installed
print_info "步骤 2/3: 检查依赖..."

if [ ! -d "node_modules" ]; then
    print_warning "前端依赖未安装，正在安装..."
    npm install
fi

if [ ! -d "lumira-backend/node_modules" ]; then
    print_warning "后端依赖未安装，正在安装..."
    cd lumira-backend && npm install && cd "$SCRIPT_DIR"
fi

print_success "依赖检查完成"
echo ""

# Step 3: Start applications
print_info "步骤 3/3: 启动前后端服务..."
echo ""

# Check if services already running
BACKEND_PID=""
FRONTEND_PID=""

if lsof -i :3001 | grep -q LISTEN; then
    print_warning "后端端口 3001 已被占用，跳过启动"
else
    print_info "启动后端服务 (端口 3001)..."
    cd lumira-backend
    nohup npm run dev > ../backend.log 2>&1 &
    BACKEND_PID=$!
    cd "$SCRIPT_DIR"
    echo $BACKEND_PID > .backend.pid
    print_success "后端已启动 (PID: $BACKEND_PID)"
fi

if lsof -i :3000 | grep -q LISTEN; then
    print_warning "前端端口 3000 已被占用，跳过启动"
else
    print_info "启动前端服务 (端口 3000)..."
    nohup npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > .frontend.pid
    print_success "前端已启动 (PID: $FRONTEND_PID)"
fi

echo ""
print_success "所有服务启动完成！"
echo ""

# Wait for services to be ready
print_info "等待服务就绪..."
sleep 3

# Check health
if curl -s 'http://localhost:3001/api/funds/search?q=test' > /dev/null 2>&1; then
    print_success "后端 API 响应正常"
else
    print_warning "后端 API 尚未就绪，可能需要更多时间"
fi

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "前端服务响应正常"
else
    print_warning "前端服务尚未就绪，可能需要更多时间"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Lumira 开发环境已就绪！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📋 服务状态:"
echo "  PostgreSQL:  localhost:5432"
echo "  Redis:       localhost:6379"
echo "  后端 API:    http://localhost:3001"
echo "  前端页面:    http://localhost:3000"
echo ""
echo "📝 日志文件:"
echo "  后端日志:    tail -f backend.log"
echo "  前端日志:    tail -f frontend.log"
echo ""
echo "🛑 停止服务:"
echo "  前后端:      ./stop-dev.sh"
echo "  基础设施:    cd docker/local && ./stop.sh"
echo ""
echo -e "${GREEN}========================================${NC}"
