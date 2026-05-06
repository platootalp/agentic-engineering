#!/bin/bash
echo "🛑 停止本地服务..."

PID_FILE="/tmp/game_agent_pids.txt"

# 优先使用 PID 文件精确杀进程
if [ -f "$PID_FILE" ]; then
    while read -r pid cmd; do
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            echo "  停止 $cmd (PID $pid)..."
            kill "$pid" 2>/dev/null || true
        fi
    done < "$PID_FILE"
    rm -f "$PID_FILE"
fi

# 回退：按名称 pattern 清理残留
pkill -f "uvicorn main:app" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

# 验证
sleep 1
if curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "⚠️  Backend 仍在运行"
else
    echo "  ✅ Backend 已停止"
fi
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "⚠️  Frontend 仍在运行"
else
    echo "  ✅ Frontend 已停止"
fi
