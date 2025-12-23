# ComfyUI Frontend with Usersocket Integration

This is the official front-end implementation of [ComfyUI](https://github.com/comfyanonymous/ComfyUI) with additional `usersocket` integration for enhanced security and session management.

## Features

- **Usersocket Integration**: Core communication module ported to frontend source.
- **HTTPS Support**: Full TLS/SSL encryption support.
- **User Authentication**:
  - **Login**: Secure cookie-based authentication.
  - **Logout**: Fully clears session and redirects.
  - **Screen Lock**: Locks the interface (password protected) while keeping the session active to preserve work.
- **Startup Scripts**: Integrated scripts for one-click startup.

## Usersocket Integration

The `usersocket` module has been migrated to `web_source/usersocket` to provide a unified structure. It includes:
- `server.py`: Handles authentication middleware, login/logout endpoints, and SSL context creation.
- `login.html`: The login page served to unauthenticated users.
- `js/logout.js`: Frontend extension for logout functionality.
- `cert.pem` & `key.pem`: TLS certificates for HTTPS.

## How to Run

Use the provided `run_comfyui.sh` script to start the server with the custom frontend and enabled security features:

```bash
./run_comfyui.sh
```

This script will:
1. Activate the ComfyUI environment.
2. Set up proxy settings (if configured).
3. Launch `start.py` with:
   - `--front-end-root web_source/dist`: Pointing to the custom frontend build.
   - `--tls-keyfile web_source/usersocket/key.pem`: Path to the private key.
   - `--tls-certfile web_source/usersocket/cert.pem`: Path to the certificate.

## Manual Startup

If you prefer running it manually:

```bash
python start.py --port 8188 --front-end-root web_source/dist --tls-keyfile web_source/usersocket/key.pem --tls-certfile web_source/usersocket/cert.pem
```

## Security Note

- Ensure `cert.pem` and `key.pem` are kept secure.
- The default login credentials (if any hardcoded) should be changed for production use.
- Communication encryption relies on the validity of the provided certificates.

---
[Original ComfyUI Frontend README follows below]
