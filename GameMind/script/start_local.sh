#!/bin/bash
set -e

# 切换到脚本所在目录（支持从任意位置运行）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 游戏市场分析 Agent - 本地启动脚本"
echo "========================================"

# ========================
# Node.js: 优先使用 /usr/local/brew/bin/node 避免系统 node@22 的 simdjson 库问题
# ========================
if [ -x "/usr/local/brew/bin/node" ]; then
    export PATH="/usr/local/brew/bin:$PATH"
fi

# 检查 Python 3
if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到 python3，请先安装 Python 3.11 或更高版本"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
echo "✅ Python 版本: $PYTHON_VERSION"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未找到 node，请先安装 Node.js 20 或更高版本"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js 版本: $NODE_VERSION"

# ========================
# Backend
# ========================
echo ""
echo "🔨 [1/4] 配置 Backend..."

cd backend

if [ ! -d ".venv" ]; then
    echo "  创建 Python 虚拟环境..."
    python3 -m venv .venv
fi

echo "  安装 Python 依赖..."
source .venv/bin/activate
pip install -q -r requirements.txt

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  请编辑 backend/.env 填入 API Keys 后再运行"
    exit 1
fi

echo "  ✅ Backend 准备就绪"

# ========================
# Frontend
# ========================
cd ../frontend

echo ""
echo "🔨 [2/4] 配置 Frontend..."

if [ ! -d "node_modules" ]; then
    echo "  安装 npm 依赖..."
    npm install
else
    echo "  node_modules 已存在，跳过安装"
fi

echo "  ✅ Frontend 准备就绪"

cd ..

# ========================
# 启动服务
# ========================
PID_FILE="/tmp/game_agent_pids.txt"
> "$PID_FILE"  # 清空 PID 文件

echo ""
echo "▶️  [3/4] 启动 Backend (http://localhost:8000)..."

# 检查 backend 是否已运行
if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "  ⚠️  Backend 已在运行，跳过启动"
else
    cd backend
    source .venv/bin/activate
    mkdir -p ../data
    DATABASE_URL="sqlite:///../data/game_agent.db" nohup uvicorn main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
    BACKEND_PID=$!
    echo "  Backend PID: $BACKEND_PID"
    echo "$BACKEND_PID uvicorn" >> "$PID_FILE"
    sleep 3
    cd ..
fi

echo ""
echo "▶️  [4/4] 启动 Frontend (http://localhost:3000)..."

# 检查 frontend 是否已运行
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "  ⚠️  Frontend 已在运行，跳过启动"
else
    cd frontend
    PATH="/usr/local/brew/bin:$PATH" nohup npm run dev > /tmp/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "  Frontend PID: $FRONTEND_PID"
    echo "$FRONTEND_PID next-server" >> "$PID_FILE"
    cd ..
fi

echo ""
echo "========================================"
echo "✅ 服务已启动!"
echo "   Dashboard: http://localhost:3000"
echo "   API 文档:  http://localhost:8000/docs"
echo ""
echo "📌 按 Ctrl+C 停止所有服务"
echo "========================================"

cleanup() {
    echo ""
    echo "🛑 停止服务..."
    pkill -f "uvicorn main:app" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    echo "✅ 已停止"
    exit 0
}
trap cleanup SIGINT SIGTERM

wait
