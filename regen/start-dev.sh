#!/bin/bash
# ============================================
# One-Click Development Startup Script
# 一键启动开发环境
# 自动启动: Docker基础设施 + 本机后端 + 本机前端
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_step() { echo -e "${CYAN}▶ $1${NC}"; }

# 后台进程记录
BACKEND_PID=""
FRONTEND_PID=""

# 清理函数
cleanup() {
    echo ""
    print_warning "Shutting down development environment..."

    # 停止后端
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        print_info "Stopping backend (PID: $BACKEND_PID)..."
        kill "$BACKEND_PID" 2>/dev/null || true
    fi

    # 停止前端
    if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        print_info "Stopping frontend (PID: $FRONTEND_PID)..."
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi

    # 询问是否停止 Docker
    read -t 5 -p "Stop Docker infrastructure too? [y/N] " -n 1 -r || true
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd docker/local && docker-compose down
    else
        print_info "Docker infrastructure still running. Stop manually: cd docker/local && ./stop.sh"
    fi

    exit 0
}

# 捕获中断信号
trap cleanup SIGINT SIGTERM

# ============ Step 1: Docker Infrastructure ============

start_infrastructure() {
    print_step "Step 1/3: Starting Docker infrastructure..."
    cd docker/local

    # 检查 .env
    if [ ! -f .env ]; then
        print_warning ".env not found, creating from .env.example"
        cp .env.example .env
    fi

    # 启动
    docker-compose up -d

    # 等待健康检查
    print_info "Waiting for PostgreSQL..."
    for i in {1..30}; do
        if docker-compose exec -T postgres pg_isready -U user &>/dev/null; then
            break
        fi
        sleep 1
    done

    print_info "Waiting for Redis..."
    for i in {1..30}; do
        if docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
            break
        fi
        sleep 1
    done

    print_info "Waiting for MinIO..."
    for i in {1..30}; do
        if curl -sf http://localhost:9000/minio/health/live &>/dev/null; then
            break
        fi
        sleep 1
    done

    print_success "Infrastructure ready!"
    cd ../..
}

# ============ Step 2: Backend ============

start_backend() {
    print_step "Step 2/3: Starting backend..."
    cd backend

    # 检查虚拟环境
    if [ ! -d ".venv" ]; then
        print_info "Setting up Python virtual environment..."
        uv sync
    fi

    # 检查 .env
    if [ ! -f .env ]; then
        print_warning "backend/.env not found, creating from .env.example"
        cp .env.example .env
        print_info "Please review backend/.env configuration"
    fi

    # 数据库迁移
    print_info "Running database migrations..."
    uv run alembic upgrade head || print_warning "Migration failed or none to run"

    # 后台启动后端
    print_info "Starting FastAPI server..."
    nohup uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!

    # 等待后端启动
    for i in {1..30}; do
        if curl -sf http://localhost:8000/health &>/dev/null || \
           curl -sf http://localhost:8000/docs &>/dev/null; then
            break
        fi
        sleep 1
    done

    print_success "Backend started (PID: $BACKEND_PID)"
    cd ..
}

# ============ Step 3: Frontend ============

start_frontend() {
    print_step "Step 3/3: Starting frontend..."
    cd frontend

    # 检查 node_modules
    if [ ! -d "node_modules" ]; then
        print_info "Installing frontend dependencies..."
        npm install
    fi

    # 检查 .env
    if [ ! -f .env ]; then
        print_warning "frontend/.env not found, creating from .env.example"
        cp .env.example .env
    fi

    # 后台启动前端
    print_info "Starting Vite dev server on port 7000..."
    nohup npm run dev -- --host --port 7000 > ../logs/frontend.log 2>&1 &
    nohup npm run dev -- --host > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!

    # 等待前端启动
    for i in {1..30}; do
        if curl -sf http://localhost:7000 &>/dev/null || \
           grep -q "Local:" ../logs/frontend.log 2>/dev/null; then
            break
        fi
        sleep 1
    done

    print_success "Frontend started (PID: $FRONTEND_PID)"
    cd ..
}

# ============ Main ============

main() {
    echo "🚀 Regen One-Click Development Startup"
    echo "======================================"
    echo ""

    # 创建日志目录
    mkdir -p logs

    # 检查依赖
    if ! command -v docker &> /dev/null; then
        print_error "Docker not installed"
        exit 1
    fi

    if ! command -v uv &> /dev/null; then
        print_error "uv not installed. Install: curl -LsSf https://astral.sh/uv/install.sh | sh"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm not installed"
        exit 1
    fi

    # 启动所有服务
    start_infrastructure
    echo ""
    start_backend
    echo ""
    start_frontend

    # 显示状态
    echo ""
    echo "======================================"
    print_success "All services started!"
    echo ""
    echo "🌐 Access URLs:"
    echo "   Frontend:    http://localhost:7000"
    echo "   Backend:     http://localhost:8000"
    echo "   API Docs:    http://localhost:8000/docs"
    echo "   MinIO UI:    http://localhost:9001"
    echo ""
    echo "📜 Logs:"
    echo "   Backend:     tail -f logs/backend.log"
    echo "   Frontend:    tail -f logs/frontend.log"
    echo "   Docker:      cd docker/local && docker-compose logs -f"
    echo ""
    echo "🛑 Stop: Press Ctrl+C or run ./stop-dev.sh"
    echo ""

    # 保持脚本运行
    while true; do
        sleep 1
    done
}

main "$@"
