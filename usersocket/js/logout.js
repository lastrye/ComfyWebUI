import { app } from "../../scripts/app.js";

app.registerExtension({
	name: "Comfy.Logout",
	async setup() {
        console.log("%c[Comfy.Logout] Extension Loaded!", "color: green; font-weight: bold; font-size: 14px;");
        
        // 15 minutes in milliseconds
        const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
        let inactivityTimer;

        function resetInactivityTimer() {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(logout, INACTIVITY_TIMEOUT);
        }

        const logout = async () => {
            console.log("[Comfy.Logout] Triggering logout...");
            try {
                await fetch('/logout', { method: 'POST' });
                window.location.href = '/login.html';
            } catch (e) {
                console.error('Logout failed:', e);
                window.location.href = '/login.html';
            }
        }

        // Monitor user activity
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetInactivityTimer, true);
        });

        // Initialize timer
        resetInactivityTimer();

        // Add Logout Button to the Menu
        const addLogoutItem = () => {
            console.log("[Comfy.Logout] Attempting to add logout button...");
            // ComfyUI v1.x menu structure
            // Try different selectors as the menu might have changed structure or class
            const menus = document.querySelectorAll(".comfy-menu, .comfy-context-menu");
            
            menus.forEach(menu => {
                if (!menu.querySelector('#custom-logout-btn')) {
                    console.log("[Comfy.Logout] Menu found, injecting button");
                    
                    // Separator
                    const separator = document.createElement("hr");
                    separator.style.cssText = "border-color: #444; margin: 5px 0;";
                    
                    const logoutBtn = document.createElement('button');
                    logoutBtn.id = 'custom-logout-btn';
                    logoutBtn.textContent = 'Logout / Lock';
                    // Match ComfyUI menu button style - try to copy classes from siblings if possible
                    logoutBtn.className = "comfy-list-button"; 
                    logoutBtn.style.cssText = "background: #660000 !important; color: white !important; margin-top: 5px; width: 100%; cursor: pointer; display: block; padding: 8px; border-radius: 4px; text-align: center; border: 1px solid #aa0000;";
                    
                    logoutBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        logout();
                    };
                    
                    menu.appendChild(separator);
                    menu.appendChild(logoutBtn);
                }
            });

            // Debugging: Check what we found
            console.log(`[Comfy.Logout] Check run. Menus found: ${menus.length}. Fixed btn exists: ${!!document.querySelector('#custom-logout-btn-fixed')}`);

            // Handle new frontend top-left menu (if exists)
            // Attempt to find the new frontend's hamburger menu trigger or menu container
            // Since we can't easily inspect the DOM of the new frontend (Vue/React app), we'll try a generic approach
            // targeting likely class names for the top bar or menu area.
            
            // Try to find the top bar to inject a logout button directly if the menu is hard to access
            const topBar = document.querySelector(".comfy-menu-hamburger"); // Example selector, adjust if known
            if (topBar && !document.querySelector('#custom-logout-btn-top')) {
                 // For now, let's stick to the .comfy-menu selector which covers the legacy UI
                 // The new frontend might need a specific extension API or different DOM structure.
                 // Given the prompt asks for "left top corner menu trigger module", we'll try to hook into that.
            }
            
            // Specific handling for "ComfyUI-Manager" or other common top-bars if standard menu fails
            // But standard .comfy-menu injection above is the most reliable for standard ComfyUI.
            
            // Let's add a fixed button in the top-left corner as a fallback if no menu is found, 
            // but only if we are sure we are logged in (which this script implies).
            if (menus.length === 0 && !document.querySelector('#custom-logout-btn-fixed')) {
                console.log("[Comfy.Logout] No standard menu found, injecting fixed fallback button");
                // If no standard menu found, it might be the new UI without legacy mode.
                // Create a floating logout button in top-left.
                const fixedBtn = document.createElement('button');
                fixedBtn.id = 'custom-logout-btn-fixed';
                fixedBtn.textContent = '🔒 Logout';
                fixedBtn.style.cssText = "position: fixed; top: 10px; left: 10px; z-index: 9999; background: rgba(0,0,0,0.7); color: white; border: 1px solid #444; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;";
                fixedBtn.onclick = logout;
                document.body.appendChild(fixedBtn);
            }
        };

        // Try to add immediately
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', addLogoutItem);
        } else {
            addLogoutItem();
        }

        // Watch for menu changes (e.g. if it's re-rendered)
        const observer = new MutationObserver((mutations) => {
            addLogoutItem();
        });
        
        // Observe body for when .comfy-menu might be added
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Also fallback to interval just in case
        setInterval(addLogoutItem, 2000);
	}
});
