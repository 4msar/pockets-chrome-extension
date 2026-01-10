/**
 * Popup Script
 * Handles the popup UI logic and interactions
 */

// DOM Elements
let elements = {};

// State
let currentTab = null;
let isConfigured = false;

/**
 * Initialize popup
 */
document.addEventListener("DOMContentLoaded", async () => {
    // Get DOM elements
    initElements();

    // Set up event listeners
    setupEventListeners();

    // Initialize UI
    await initializeUI();
});

/**
 * Initialize DOM element references
 */
function initElements() {
    elements = {
        mainContainer: document.getElementById("mainContainer"),
        notConfigured: document.getElementById("notConfigured"),
        mainContent: document.getElementById("mainContent"),
        loadingState: document.getElementById("loadingState"),
        formContent: document.getElementById("formContent"),
        linksBtn: document.getElementById("linksBtn"),
        settingsBtn: document.getElementById("settingsBtn"),
        goToSettingsBtn: document.getElementById("goToSettingsBtn"),
        pageTitle: document.getElementById("pageTitle"),
        pageUrl: document.getElementById("pageUrl"),
        projectName: document.getElementById("projectName"),
        saveBtn: document.getElementById("saveBtn"),
        messageArea: document.getElementById("messageArea"),
        messageText: document.getElementById("messageText"),
    };
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Links button
    elements.linksBtn.addEventListener("click", openLinks);

    // Settings button
    elements.settingsBtn.addEventListener("click", openSettings);
    elements.goToSettingsBtn.addEventListener("click", openSettings);

    // Save button
    elements.saveBtn.addEventListener("click", handleSave);
}

/**
 * Initialize the UI
 */
async function initializeUI() {
    try {
        // Show loading state
        showLoading();

        // Check if extension is configured
        isConfigured = await StorageService.isConfigured();

        if (!isConfigured) {
            showNotConfigured();
            return;
        }

        // Get current tab information
        await loadCurrentTab();

        // Load selected project
        await loadSelectedProject();

        // Show form
        showForm();
    } catch (error) {
        console.error("Error initializing UI:", error);
        showMessage("Failed to initialize: " + error.message, "error");
    }
}

/**
 * Load current tab information
 */
async function loadCurrentTab() {
    try {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        currentTab = tab;

        if (tab) {
            elements.pageTitle.value = tab.title || "";
            elements.pageUrl.value = tab.url || "";
        }
    } catch (error) {
        console.error("Error loading current tab:", error);
        throw error;
    }
}

/**
 * Load selected project
 */
async function loadSelectedProject() {
    try {
        const project = await StorageService.getSelectedProject();

        if (project) {
            elements.projectName.textContent = project.name;
        } else {
            elements.projectName.textContent = "None selected";
        }
    } catch (error) {
        console.error("Error loading selected project:", error);
        elements.projectName.textContent = "Error loading project";
    }
}

/**
 * Handle save button click
 */
async function handleSave() {
    try {
        // Disable button and show loading
        elements.saveBtn.disabled = true;
        elements.saveBtn.classList.add("loading");
        hideMessage();

        // Get current page data
        const title = elements.pageTitle.value;
        const url = elements.pageUrl.value;

        if (!url) {
            throw new Error("No URL to save");
        }

        // Send message to background script to save
        const response = await chrome.runtime.sendMessage({
            action: "saveLink",
            data: { title, url },
        });

        if (response.success) {
            showMessage(response.message, "success");

            // Close popup after a short delay
            setTimeout(() => {
                window.close();
            }, 1500);
        } else {
            showMessage(response.message, "error");
        }
    } catch (error) {
        console.error("Error saving link:", error);
        showMessage("Failed to save: " + error.message, "error");
    } finally {
        // Re-enable button
        elements.saveBtn.disabled = false;
        elements.saveBtn.classList.remove("loading");
    }
}

/**
 * links page
 */
function openLinks() {
    chrome.tabs.create({
        url: chrome.runtime.getURL("links/links.html"),
    });
}

/**
 * Open settings page
 */
function openSettings() {
    chrome.runtime.openOptionsPage();
}

/**
 * Show loading state
 */
function showLoading() {
    elements.notConfigured.style.display = "none";
    elements.formContent.style.display = "none";
    elements.loadingState.style.display = "block";
}

/**
 * Show not configured state
 */
function showNotConfigured() {
    elements.loadingState.style.display = "none";
    elements.formContent.style.display = "none";
    elements.mainContent.style.display = "none";
    elements.notConfigured.style.display = "block";
}

/**
 * Show form
 */
function showForm() {
    elements.loadingState.style.display = "none";
    elements.notConfigured.style.display = "none";
    elements.formContent.style.display = "flex";
}

/**
 * Show message
 * @param {string} message - Message to display
 * @param {string} type - Message type (success or error)
 */
function showMessage(message, type = "success") {
    elements.messageText.textContent = message;
    elements.messageArea.className = `message ${type}`;
    elements.messageArea.style.display = "block";
}

/**
 * Hide message
 */
function hideMessage() {
    elements.messageArea.style.display = "none";
}
