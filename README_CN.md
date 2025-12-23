# ComfyUI 前端 (集成 Usersocket)

这是 [ComfyUI](https://github.com/comfyanonymous/ComfyUI) 的官方前端实现，并额外集成了 `usersocket` 以增强安全性和会话管理。

## 功能特性

- **Usersocket 集成**: 核心通信模块已移植到前端源码中。
- **HTTPS 支持**: 完整支持 TLS/SSL 加密通信。
- **用户认证**: 
  - **登录**: 基于 Cookie 的安全认证。
  - **登出**: 完全清除会话并重定向。
  - **屏幕锁定**: 在保持会话活动的同时锁定界面（带密码保护），防止未授权访问。
- **启动脚本**: 集成化启动脚本，一键运行。

## Usersocket 集成

`usersocket` 模块已迁移至 `web_source/usersocket` 以提供统一的结构。它包含：
- `server.py`：处理认证中间件、登录/登出端点和 SSL 上下文创建。
- `login.html`：向未认证用户提供的登录页面。
- `js/logout.js`：用于登出功能的前端扩展。
- `cert.pem` & `key.pem`：用于 HTTPS 的 TLS 证书。

## 如何运行

使用提供的 `run_comfyui.sh` 脚本启动带有自定义前端和启用安全功能的服务器：

```bash
./run_comfyui.sh
```

该脚本将：
1. 激活 ComfyUI 环境。
2. 设置代理设置（如果已配置）。
3. 启动 `start.py` 并带有以下参数：
   - `--front-end-root web_source/dist`：指向自定义前端构建目录。
   - `--tls-keyfile web_source/usersocket/key.pem`：私钥路径。
   - `--tls-certfile web_source/usersocket/cert.pem`：证书路径。

## 手动启动

如果您喜欢手动运行：

```bash
python start.py --port 8188 --front-end-root web_source/dist --tls-keyfile web_source/usersocket/key.pem --tls-certfile web_source/usersocket/cert.pem
```

## 安全提示

- 确保 `cert.pem` 和 `key.pem` 的安全。
- 默认的登录凭据（如果有硬编码）应在生产环境中更改。
- 通信加密依赖于所提供证书的有效性。

---

[原始 ComfyUI 前端 README 如下]
