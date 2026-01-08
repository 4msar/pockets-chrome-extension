/**
 * Background Service Worker
 * Handles context menu creation, message handling, and link saving
 */

// Import services (service worker requires importScripts)
importScripts("../services/storage.js");
importScripts("../services/api.js");
importScripts("../utils/notifications.js");

// Context menu ID
const CONTEXT_MENU_ID = "save-to-pocket";

/**
 * Initialize extension on installation
 */
chrome.runtime.onInstalled.addListener(async () => {
    console.log("Pockets extension installed");
    await createContextMenu();
});

/**
 * Create context menu
 */
async function createContextMenu() {
    try {
        // Remove existing menu if any
        await chrome.contextMenus.removeAll();

        // Create new context menu
        chrome.contextMenus.create({
            id: CONTEXT_MENU_ID,
            title: "Save to Pocket",
            contexts: ["page", "link", "image"],
        });

        console.log("Context menu created");
    } catch (error) {
        console.error("Error creating context menu:", error);
    }
}

/**
 * Handle context menu clicks
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === CONTEXT_MENU_ID) {
        await handleSaveLink(info, tab);
    }
});

/**
 * Handle saving a link from context menu
 * @param {Object} info - Context menu click info
 * @param {Object} tab - Current tab
 */
async function handleSaveLink(info, tab) {
    console.log({ info, tab });
    try {
        // Check if extension is configured
        const isConfigured = await StorageService.isConfigured();
        if (!isConfigured) {
            await NotificationsService.showError(
                "Please configure the extension in settings first."
            );
            return;
        }

        // Determine what to save based on context
        let title = "";
        let url = "";

        if (info.linkUrl) {
            // Right-clicked on a link
            url = info.linkUrl;
            title = info.selectionText || info.linkUrl;
        } else if (info.srcUrl) {
            // Right-clicked on an image
            url = info.srcUrl;
            title = `Image from ${tab.title}`;
        } else {
            // Right-clicked on page
            url = info.pageUrl || tab.url;
            title = tab.title;
        }

        // Save the link
        const result = await ApiService.saveCurrentPage(title, url);

        if (result.success) {
            await NotificationsService.showSuccess(result.message);
        } else {
            await NotificationsService.showError(result.message);
        }
    } catch (error) {
        console.error("Error handling save link:", error);
        await NotificationsService.showError(
            "Failed to save link: " + error.message
        );
    }
}

/**
 * Handle messages from popup or other parts of the extension
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveLink") {
        // Handle save link request
        handleSaveLinkMessage(request.data)
            .then((response) => sendResponse(response))
            .catch((error) =>
                sendResponse({ success: false, message: error.message })
            );

        // Return true to indicate we'll send response asynchronously
        return true;
    }

    if (request.action === "checkConfiguration") {
        // Check if extension is configured
        StorageService.isConfigured()
            .then((isConfigured) => sendResponse({ isConfigured }))
            .catch((error) =>
                sendResponse({ isConfigured: false, error: error.message })
            );

        return true;
    }
});

/**
 * Handle save link message from popup
 * @param {Object} data - Link data containing title and url
 * @returns {Promise<Object>}
 */
async function handleSaveLinkMessage(data) {
    try {
        const { title, url } = data;

        if (!url) {
            throw new Error("URL is required");
        }

        const result = await ApiService.saveCurrentPage(title, url);

        if (result.success) {
            await NotificationsService.showSuccess(result.message);
        }

        return result;
    } catch (error) {
        console.error("Error saving link from message:", error);
        return {
            success: false,
            message: error.message,
        };
    }
}

// Re-create context menu when service worker starts
createContextMenu();
