#!/bin/bash
# ============================================
# Local Development Infrastructure Restart Script
# 本地开发基础设施重启脚本
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔄 重启基础设施服务..."
echo ""

./stop.sh
echo ""
./start.sh
