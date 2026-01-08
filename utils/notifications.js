/**
 * Notifications Service
 * Handles browser notifications for the extension
 */

const NotificationsService = {
    /**
     * Show a notification
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info)
     */
    async show(title, message, type = "info") {
        try {
            // Check if browser notifications are enabled
            const notificationPermission = await chrome.permissions.contains({
                permissions: ["notifications"],
            });

            // Show browser notification
            const options = {
                type: "basic",
                iconUrl: this.getIcon(type),
                title: title,
                message: message,
                priority: type === "error" ? 2 : 1,
            };

            await chrome.notifications.create("", options);
            // Show toast notification in the current page as well
            await this.showToast(title, message, type);
        } catch (error) {
            console.error("Error showing notification:", error);
            // Fallback to toast if browser notification fails
            try {
                await this.showToast(title, message, type);
            } catch (toastError) {
                console.error("Error showing toast:", toastError);
            }
        }
    },

    /**
     * Show a toast notification in the current page
     * @param {string} title - Toast title
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, info)
     */
    async showToast(title, message, type = "info") {
        try {
            // Get the active tab
            const [tab] = await chrome.tabs.query({
                active: true,
                currentWindow: true,
            });

            if (!tab || !tab.id) {
                console.warn("No active tab found for toast notification");
                return;
            }

            // Inject the toast into the current page
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (title, message, type) => {
                    // Create toast container if it doesn't exist
                    let toastContainer = document.getElementById(
                        "pockets-toast-container"
                    );
                    if (!toastContainer) {
                        toastContainer = document.createElement("div");
                        toastContainer.id = "pockets-toast-container";
                        toastContainer.style.cssText = `
                            position: fixed;
                            top: 20px;
                            right: 20px;
                            z-index: 999999;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        `;
                        document.body.appendChild(toastContainer);
                    }

                    // Create toast element
                    const toast = document.createElement("div");
                    toast.style.cssText = `
                        background: ${
                            type === "error"
                                ? "#dc3545"
                                : type === "success"
                                ? "#28a745"
                                : "#17a2b8"
                        };
                        color: white;
                        padding: 16px 20px;
                        border-radius: 8px;
                        margin-bottom: 10px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                        min-width: 300px;
                        max-width: 400px;
                        animation: slideIn 0.3s ease-out;
                    `;

                    toast.innerHTML = `
                        <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
                        <div style="font-size: 14px; opacity: 0.95;">${message}</div>
                    `;

                    // Add animation styles
                    if (!document.getElementById("pockets-toast-styles")) {
                        const style = document.createElement("style");
                        style.id = "pockets-toast-styles";
                        style.textContent = `
                            @keyframes slideIn {
                                from {
                                    transform: translateX(400px);
                                    opacity: 0;
                                }
                                to {
                                    transform: translateX(0);
                                    opacity: 1;
                                }
                            }
                            @keyframes slideOut {
                                from {
                                    transform: translateX(0);
                                    opacity: 1;
                                }
                                to {
                                    transform: translateX(400px);
                                    opacity: 0;
                                }
                            }
                        `;
                        document.head.appendChild(style);
                    }

                    toastContainer.appendChild(toast);

                    // Remove toast after 5 seconds
                    setTimeout(() => {
                        toast.style.animation = "slideOut 0.3s ease-out";
                        setTimeout(() => {
                            toast.remove();
                            // Remove container if empty
                            if (toastContainer.children.length === 0) {
                                toastContainer.remove();
                            }
                        }, 300);
                    }, 5000);
                },
                args: [title, message, type],
            });
        } catch (error) {
            console.error("Error injecting toast notification:", error);
        }
    },

    /**
     * Show success notification
     * @param {string} message - Success message
     */
    async showSuccess(message) {
        await this.show("Success", message, "success");
    },

    /**
     * Show error notification
     * @param {string} message - Error message
     */
    async showError(message) {
        await this.show("Error", message, "error");
    },

    /**
     * Show info notification
     * @param {string} message - Info message
     */
    async showInfo(message) {
        await this.show("Info", message, "info");
    },

    /**
     * Get icon URL based on notification type
     * @param {string} type - Notification type
     * @returns {string}
     */
    getIcon(type) {
        // Use the extension's icons based on type
        return chrome.runtime.getURL("icons/icon128.png");
    },
};

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
    module.exports = NotificationsService;
}
