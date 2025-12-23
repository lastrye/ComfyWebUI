# ComfyUI 自定义安全前端安装指南

本文档介绍如何在官方 [ComfyUI](https://github.com/comfyanonymous/ComfyUI) 基础上安装和配置本自定义前端（集成 `usersocket` 安全模块）。

## 目录结构

本 `web_source` 目录包含：

*   **前端源码**: 基于 Vue/Vite 的 ComfyUI 前端修改版。
*   **usersocket**: 包含后端 Python 安全认证逻辑 (`server.py`) 和 SSL 证书。
*   **安装脚本**: `install.sh` 用于自动化构建和部署。
*   **启动脚本**: `run_custom.sh` 和 `start.py` 用于启动修改后的服务。

## 前置要求

在开始之前，请确保您的系统已安装：

1.  **Python 环境**: 建议使用 Conda 管理（已安装 ComfyUI 依赖）。
2.  **Node.js**: 用于构建前端（推荐 v18+）。
3.  **pnpm** (推荐) 或 **npm**: Node.js 包管理器。

## 快速安装

我们提供了一键安装脚本，自动完成依赖安装、前端构建和启动文件部署。

1.  进入 `web_source` 目录：
    ```bash
    cd web_source
    ```

2.  赋予脚本执行权限并运行：
    ```bash
    chmod +x install.sh
    ./install.sh
    ```

   **脚本将执行以下操作：**
   *   检查 Node.js 环境。
   *   安装前端依赖 (`pnpm install`)。
   *   构建前端产物 (`pnpm build` -> 生成 `dist` 目录)。
   *   **生成 `start.py`**: 运行 `web_source/generate_start.py`，基于当前 ComfyUI 的 `main.py` 动态生成带有安全模块注入的启动脚本。这确保了与 ComfyUI 版本的最大兼容性。
   *   将 `run_custom.sh` 复制到 ComfyUI 根目录。

## 启动服务

安装完成后，回到 ComfyUI 根目录，使用 `run_custom.sh` 启动服务：

```bash
cd ..
./run_custom.sh
```

或者手动运行：

```bash
python start.py --port 9999 --front-end-root web_source/dist --tls-keyfile web_source/usersocket/key.pem --tls-certfile web_source/usersocket/cert.pem --listen 0.0.0.0
```

## 手动安装步骤（如果不使用脚本）

如果您希望手动控制安装过程，请按照以下步骤操作：

1.  **构建前端**:
    ```bash
    cd web_source
    pnpm install
    pnpm run build
    ```
    确保 `web_source/dist` 目录生成成功。

2.  **生成启动文件**:
    *   运行生成脚本：
        ```bash
        python web_source/generate_start.py
        ```
    *   这将会在 ComfyUI 根目录生成 `start.py`，自动注入 `usersocket` 加载逻辑：
        ```python
        sys.path.insert(0, os.path.join(os.path.dirname(os.path.realpath(__file__)), "web_source", "usersocket"))
        # import server ...
        ```
        这确保了 ComfyUI 加载我们自定义的 `server.py`，同时保留官方 `main.py` 的其他逻辑。

3.  **准备 SSL 证书**:
    确保 `web_source/usersocket/` 目录下存在 `cert.pem` 和 `key.pem`。如果没有，您可以使用 openssl 生成自签名证书：
    ```bash
    openssl req -x509 -newkey rsa:4096 -keyout web_source/usersocket/key.pem -out web_source/usersocket/cert.pem -days 365 -nodes
    ```

4.  **启动**:
    参考“启动服务”一节的命令。

## 常见问题

*   **ModuleNotFoundError: No module named 'server'**:
    *   原因：`start.py` 没有正确加载 `web_source/usersocket`。
    *   解决：确保使用我们提供的 `start.py` 启动，并且 `web_source/usersocket` 目录存在。

*   **前端界面空白或加载失败**:
    *   原因：前端未构建或构建失败。
    *   解决：进入 `web_source` 重新运行 `pnpm run build`，并确保启动命令中 `--front-end-root` 指向正确的 `dist` 目录。

*   **SSL/HTTPS 错误**:
    *   原因：证书文件缺失或不匹配。
    *   解决：检查 `web_source/usersocket` 下的 `pem` 文件。

## 维护与更新

*   如果修改了前端代码（`web_source/src`），需要重新运行 `pnpm run build`。
*   如果更新了 ComfyUI 核心代码（例如 `git pull`），请重新运行 `web_source/install.sh` 或 `python web_source/generate_start.py` 以重新生成匹配最新版本的 `start.py`。
