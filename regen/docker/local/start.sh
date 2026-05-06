#!/bin/bash
# ============================================
# Local Development Infrastructure Startup Script
# 本地开发基础设施启动脚本
# 只启动 PostgreSQL/Redis/MinIO，前后端在本机运行
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

    # Docker check
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose 未安装"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker 守护进程未运行"
        exit 1
    fi

    print_success "Docker 检查通过"

    # Files check
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml 未找到"
        exit 1
    fi

    # Auto-create .env
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            print_warning ".env 未找到，从 .env.example 创建"
            cp .env.example .env
            print_success ".env 已创建"
        else
            print_error ".env.example 未找到"
            exit 1
        fi
    fi

    print_success "文件检查通过"

    # Port check
    check_ports

    # Resource check
    check_resources
}

check_ports() {
    local ports=(5432 6379 9000 9001)
    local occupied=()

    for port in "${ports[@]}"; do
        if lsof -Pi :"$port" -sTCP:LISTEN -t &>/dev/null || \
           netstat -tuln 2>/dev/null | grep -q ":$port " || \
           ss -tuln 2>/dev/null | grep -q ":$port "; then
            occupied+=("$port")
        fi
    done

    if [ ${#occupied[@]} -gt 0 ]; then
        print_warning "端口已被占用: ${occupied[*]}"
        print_info "如果服务已在运行，请先停止: ./stop.sh"
        read -p "是否继续? [y/N] " -n 1 -r
        echo
        [[ ! $REPLY =~ ^[Yy]$ ]] && exit 0
    else
        print_success "端口检查通过"
    fi
}

check_resources() {
    # Disk space check (need 2GB)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        local available=$(df -g . | awk 'NR==2 {print $4}')
    else
        local available=$(df -BG . | awk 'NR==2 {gsub(/G/,""); print $4}')
    fi

    if [ "$available" -lt 2 ]; then
        print_warning "磁盘空间不足: ${available}GB (建议 2GB+)"
        read -p "是否继续? [y/N] " -n 1 -r
        echo
        [[ ! $REPLY =~ ^[Yy]$ ]] && exit 0
    else
        print_success "磁盘空间充足: ${available}GB"
    fi
}

# ============ Health Checks ============

health_check() {
    local service=$1
    local max=30
    local attempt=1

    print_info "等待 $service 就绪..."

    case $service in
        "postgres")
            while [ $attempt -le $max ]; do
                if docker-compose exec -T postgres pg_isready -U user &>/dev/null; then
                    print_success "PostgreSQL 已就绪"
                    return 0
                fi
                sleep 2
                ((attempt++))
            done
            ;;
        "redis")
            while [ $attempt -le $max ]; do
                if docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
                    print_success "Redis 已就绪"
                    return 0
                fi
                sleep 1
                ((attempt++))
            done
            ;;
        "minio")
            while [ $attempt -le $max ]; do
                if curl -sf http://localhost:9000/minio/health/live &>/dev/null; then
                    print_success "MinIO 已就绪"
                    return 0
                fi
                sleep 2
                ((attempt++))
            done
            ;;
    esac

    print_warning "$service 在 ${max} 次尝试后仍未就绪"
    return 1
}

# ============ Main ============

echo "🚀 Regen 本地开发基础设施"
echo ""

check_prerequisites
echo ""

print_info "启动基础设施服务..."
docker-compose up -d

echo ""
print_info "运行健康检查..."
health_check "postgres"
health_check "redis"
health_check "minio"

echo ""
print_success "基础设施已就绪!"

echo ""
echo "📋 服务地址:"
echo "  PostgreSQL:  localhost:5432 (user/pass)"
echo "  Redis:       localhost:6379"
echo "  MinIO API:   localhost:9000"
echo "  MinIO UI:    http://localhost:9001 (minioadmin/minioadmin)"

echo ""
echo "💻 启动后端 (在另一个终端):"
echo "  cd ../../backend && uv run uvicorn app.main:app --reload"
echo ""
echo "💻 启动前端 (在另一个终端):"
echo "  cd ../../frontend && npm run dev"

echo ""
echo "📜 查看日志: docker-compose logs -f"
echo "🛑 停止服务:  ./stop.sh"
