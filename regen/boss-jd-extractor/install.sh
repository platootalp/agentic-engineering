#!/bin/bash
echo "🚀 Boss直聘JD提取器安装向导"
echo "===================================="
echo ""

# 检查是否安装了ImageMagick
if command -v convert &> /dev/null; then
    echo "✅ ImageMagick已安装，正在生成PNG图标..."
    for size in 16 48 128; do
        if [ -f "icon${size}.svg" ]; then
            convert -background none "icon${size}.svg" -resize "${size}x${size}" "icon${size}.png"
            echo "  ✓ icon${size}.png 已创建"
        fi
    done
else
    echo "⚠️ 未安装ImageMagick，跳过PNG图标生成"
    echo "   你可以手动转换SVG图标，或使用在线工具"
fi

echo ""
echo "✅ 安装准备完成！"
echo ""
echo "📋 下一步操作："
echo "1. 打开Chrome浏览器"
echo "2. 访问 chrome://extensions/"
echo "3. 打开右上角「开发者模式」"
echo "4. 点击「加载已解压的扩展程序」"
echo "5. 选择此文件夹：$(pwd)"
echo ""
echo "🎯 使用方法："
echo "1. 打开Boss直聘职位详情页"
echo "2. 点击浏览器工具栏的插件图标"
echo "3. 点击「提取当前JD」"
echo "4. 自动复制Markdown格式到剪贴板"
echo ""
