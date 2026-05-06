#!/bin/bash
# 创建简单的图标文件（使用ImageMagick）
# 如果没有ImageMagick，可以用emoji替代

for size in 16 48 128; do
  # 创建一个简单的SVG图标
  cat > icon${size}.svg << SVGEOF
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="20" fill="url(#grad${size})"/>
  <text x="50" y="65" font-size="50" text-anchor="middle" fill="white">JD</text>
</svg>
SVGEOF
done

echo "SVG图标已创建！"
echo ""
echo "如果你想转换为PNG图标，可以使用以下方法："
echo ""
echo "方法1：使用ImageMagick（如果已安装）"
echo "  for size in 16 48 128; do"
echo "    convert -background none icon\${size}.svg -resize \${size}x\${size} icon\${size}.png"
echo "  done"
echo ""
echo "方法2：使用在线转换工具"
echo "  1. 访问 https://convertio.co/zh/svg-png/"
echo "  2. 上传 icon16.svg, icon48.svg, icon128.svg"
echo "  3. 下载转换后的PNG文件"
echo "  4. 放到 boss-jd-extractor 文件夹中"
echo ""
echo "方法3：手动使用Figma/Sketch导出"
echo "  将SVG导入设计工具，导出PNG"
