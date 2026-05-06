#!/bin/bash
# ============================================
# Stop Development Environment
# 停止开发环境
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

echo "🛑 Stopping development environment..."
echo ""

# 停止后端
print_info "Stopping backend..."
if pgrep -f "uvicorn app.main:app" > /dev/null; then
    pkill -f "uvicorn app.main:app" || true
    print_success "Backend stopped"
else
    print_warning "Backend not running"
fi

# 停止前端
print_info "Stopping frontend..."
if pgrep -f "vite" > /dev/null; then
    pkill -f "vite" || true
    print_success "Frontend stopped"
else
    print_warning "Frontend not running"
fi

echo ""
read -p "Stop Docker infrastructure too? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd docker/local && docker-compose down
    print_success "Docker infrastructure stopped"
else
    print_info "Docker infrastructure still running"
    print_info "To stop later: cd docker/local && ./stop.sh"
fi

echo ""
print_success "Development environment stopped!"
