#!/bin/bash

# 尝试激活 Conda 环境 (假设环境名为 comfyui 或 comfyanonymous，请根据实际情况修改)
# source ~/miniconda3/etc/profile.d/conda.sh 2>/dev/null
# conda activate comfyanonymous 2>/dev/null || conda activate comfyui 2>/dev/null

# 设置代理 (可选，用于模型下载)
# export http_proxy=socks5://127.0.0.1:1080
# export https_proxy=socks5://127.0.0.1:1080
# export all_proxy=socks5://127.0.0.1:1080

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

echo "Starting ComfyUI with Custom Frontend..."

# 检查 start.py 是否存在
if [ ! -f "start.py" ]; then
    echo "Error: start.py not found. Please run web_source/install.sh first."
    exit 1
fi

# 启动 ComfyUI
# 参数说明:
# --port 9999: 指定端口
# --front-end-root web_source/dist: 指定前端构建产物路径
# --tls-keyfile/--tls-certfile: 指定 SSL 证书路径
# --listen 0.0.0.0: 允许局域网访问
python start.py \
    --port 9999 \
    --front-end-root web_source/dist \
    --tls-keyfile web_source/usersocket/key.pem \
    --tls-certfile web_source/usersocket/cert.pem \
    --listen 0.0.0.0
