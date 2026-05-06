#!/bin/bash
# ============================================
# Production Environment Startup Script
# 生产环境启动脚本
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
print_error() { echo -e "${RED}❌ $1${NC}"; }

# ============ Prerequisites ============

check_prerequisites() {
    print_info "检查前置条件..."

    if ! docker info &> /dev/null; then
        print_error "Docker 守护进程未运行"
        exit 1
    fi

    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            print_warning ".env 未找到，从 .env.example 创建"
            print_warning "⚠️  请修改 .env 中的配置后再运行!"
            cp .env.example .env
            exit 1
        else
            print_error ".env.example 未找到"
            exit 1
        fi
    fi

    print_success "检查通过"
}

# ============ Main ============

echo "🚀 Lumira 生产环境部署"
echo ""

check_prerequisites
echo ""

print_info "构建并启动生产服务..."
docker-compose up -d --build

echo ""
print_info "等待服务就绪..."
sleep 5

# 健康检查
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -sf http://localhost:3001/health &>/dev/null && \
       curl -sf http://localhost:3000 &>/dev/null; then
        print_success "所有服务已就绪!"
        break
    fi
    print_info "等待服务就绪... ($attempt/$max_attempts)"
    sleep 2
    ((attempt++))
done

if [ $attempt -gt $max_attempts ]; then
    print_warning "服务启动超时，请检查日志"
    echo ""
    docker-compose logs --tail=50
    exit 1
fi

echo ""
print_success "生产环境部署完成!"

echo ""
echo "📋 服务地址:"
echo "  Frontend: http://localhost:3000"
echo "  API:      http://localhost:3001"
echo "  Health:   http://localhost:3001/health"

echo ""
echo "📜 查看日志: docker-compose logs -f"
echo "🛑 停止服务:  ./stop.sh"
