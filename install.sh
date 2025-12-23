#!/bin/bash

# 检查是否安装了 Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# 检查是否安装了 pnpm (如果没有，尝试使用 npm)
PKG_MANAGER="npm"
if command -v pnpm &> /dev/null; then
    PKG_MANAGER="pnpm"
fi

echo "Using package manager: $PKG_MANAGER"

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
COMFY_ROOT="$(dirname "$SCRIPT_DIR")"

echo "Web Source Directory: $SCRIPT_DIR"
echo "ComfyUI Root Directory: $COMFY_ROOT"

# 进入 web_source 目录
cd "$SCRIPT_DIR"

# 安装依赖
echo "Installing frontend dependencies..."
$PKG_MANAGER install

# 构建前端
echo "Building frontend..."
$PKG_MANAGER run build

# 检查构建结果
if [ ! -d "dist" ]; then
    echo "Error: Build failed. 'dist' directory not found."
    exit 1
fi

# 生成 start.py 到根目录 (基于当前的 main.py)
echo "Generating start.py from main.py..."
python3 "$SCRIPT_DIR/generate_start.py"
if [ ! -f "$COMFY_ROOT/start.py" ]; then
    echo "Error: Failed to generate start.py"
    exit 1
fi

# 部署 run_custom.sh 到根目录 (如果不存在)
if [ ! -f "$COMFY_ROOT/run_custom.sh" ]; then
    echo "Deploying run_custom.sh to ComfyUI root..."
    cp "$SCRIPT_DIR/run_custom.sh" "$COMFY_ROOT/run_custom.sh"
    chmod +x "$COMFY_ROOT/run_custom.sh"
else
    echo "run_custom.sh already exists in ComfyUI root. Skipping copy."
fi

# 检查 usersocket 目录是否存在
if [ ! -d "$SCRIPT_DIR/usersocket" ]; then
    echo "Warning: usersocket directory missing in web_source. Security features might not work."
fi

echo "Installation complete!"
echo "You can now start ComfyUI with the custom frontend using:"
echo "  cd $COMFY_ROOT"
echo "  ./run_custom.sh"
