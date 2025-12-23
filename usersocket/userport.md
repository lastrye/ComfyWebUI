# UserSocket & ComfyUI Logout 功能实现文档

## 1. 概述
本文档详细描述了如何在 ComfyUI 中集成 `usersocket` 组件，实现基于 Session 的登录/登出功能，并在前端菜单中添加“退出/锁定”按钮。

## 2. 核心功能
- **登录验证**：简单的用户名/密码验证（当前硬编码为 admin/password）。
- **会话管理**：基于 Cookie (`comfy_auth`) 和服务器端内存 (`auth_sessions`) 的会话超时管理（15分钟无操作自动登出）。
- **前端扩展**：自动在 ComfyUI 的菜单栏注入 "Logout / Lock" 按钮。
- **兼容性**：同时支持 ComfyUI 传统界面（Legacy UI）和新版界面（通过悬浮按钮兜底）。

## 3. 实现步骤与代码位置

### 3.1 后端实现 (`usersocket/server.py`)

后端主要负责处理登录、登出请求，以及静态文件的服务。

**关键代码位置**: `usersocket/server.py` (PromptServer 类中)

1.  **中间件配置 (Middleware)**:
    -   `auth_middleware`: 拦截请求，检查 `comfy_auth` Cookie。
    -   验证 Token 有效性及最后活动时间（超时自动登出）。
    -   排除静态资源（如 `/login.html`, `/assets/`, `/extensions/`）的验证。

2.  **路由注册 (Routes)**:
    -   `GET /login.html`: 服务登录页面。
    -   `POST /login`: 接收用户名/密码，验证成功后设置 Cookie 并记录 Session。
    -   `POST /logout`: 清除 Cookie 和服务器端 Session。
    -   `GET /extensions/Comfy.Logout/logout.js`: 提供前端扩展脚本。

```python
# usersocket/server.py 示例片段

# 登录处理器
async def login_handler(request):
    data = await request.json()
    # ... 验证逻辑 ...
    if username == "admin" and password == "password":
        # ... 设置 Cookie ...
        return web.json_response({"status": "success"})

# 登出处理器
async def logout_handler(request):
    response = web.json_response({"status": "success"})
    response.del_cookie("comfy_auth")
    # ... 清除 Session ...
    return response

# 路由注册
self.app.router.add_get('/login.html', login_page)
self.app.router.add_post('/login', login_handler)
self.app.router.add_post('/logout', logout_handler)
self.app.router.add_get('/extensions/Comfy.Logout/logout.js', logout_js_handler)
```

### 3.2 前端扩展 (`usersocket/js/logout.js`)

前端脚本作为一个 ComfyUI Extension 运行，负责监控用户活动和注入 UI 元素。

**关键代码位置**: `usersocket/js/logout.js`

1.  **扩展注册**: 使用 `app.registerExtension` 注册 `Comfy.Logout`。
2.  **自动超时**: 监听鼠标、键盘等事件，重置不活动计时器。超时后自动调用登出接口。
3.  **UI 注入**:
    -   **Legacy UI**: 查找 `.comfy-menu` 或 `.comfy-context-menu`，追加 "Logout / Lock" 按钮。
    -   **New UI / Fallback**: 如果未找到标准菜单，创建一个固定定位（左上角）的悬浮按钮 `🔒 Logout`，确保在新版界面中也能正常登出。

```javascript
// usersocket/js/logout.js 示例片段

app.registerExtension({
    name: "Comfy.Logout",
    async setup() {
        // ... 超时逻辑 ...

        const addLogoutItem = () => {
            const menus = document.querySelectorAll(".comfy-menu, .comfy-context-menu");
            
            // 策略 1: 注入到标准菜单
            menus.forEach(menu => {
                // ... 创建并添加 button ...
            });

            // 策略 2: 兜底悬浮按钮 (针对新版 UI)
            if (menus.length === 0 && !document.querySelector('#custom-logout-btn-fixed')) {
                const fixedBtn = document.createElement('button');
                // ... 样式设置 (position: fixed; top: 10px; ...) ...
                fixedBtn.onclick = logout;
                document.body.appendChild(fixedBtn);
            }
        };
        
        // 持续监控 DOM 变化以确保按钮存在
        setInterval(addLogoutItem, 1000);
    }
});
```

## 4. 部署说明

1.  确保 `usersocket` 目录包含 `server.py`, `login.html`, `js/logout.js` 以及 SSL 证书 (`cert.pem`, `key.pem`)。
2.  启动 ComfyUI 时，`server.py` 会自动加载这些组件（假设已被集成到 `main.py` 或作为模块加载）。
3.  访问 ComfyUI 根地址将重定向到登录页。

## 5. 待优化项
-   当前认证使用硬编码凭证，建议对接数据库或配置文件。
-   Token 生成应使用更安全的随机算法。
-   针对新版前端（ComfyUI Frontend v1+）的菜单注入可以进一步适配其原生组件结构，而非仅依赖兜底按钮。
