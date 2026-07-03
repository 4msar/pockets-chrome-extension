/**
 * Settings Script
 * Handles the settings page logic and interactions
 */

// DOM Elements
let elements = {};
let manualConfigMode = false;

/**
 * Create a project object from a project ID
 * @param {string|number} projectId - The project ID
 * @returns {Object} - Project object with id and name
 */
function createProjectObject(projectId) {
    return { id: projectId, name: projectId };
}

/**
 * Initialize settings page
 */
document.addEventListener("DOMContentLoaded", async () => {
    initElements();
    setupEventListeners();
    await loadSettings();
});

/**
 * Initialize DOM element references
 */
function initElements() {
    elements = {
        registerSection: document.getElementById("registerSection"),
        configSection: document.getElementById("configSection"),
        registerEmail: document.getElementById("registerEmail"),
        registerProjectSlug: document.getElementById("registerProjectSlug"),
        registerBtn: document.getElementById("registerBtn"),
        registerMessage: document.getElementById("registerMessage"),
        registerMessageText: document.getElementById("registerMessageText"),
        showManualConfigBtn: document.getElementById("showManualConfigBtn"),
        apiToken: document.getElementById("apiToken"),
        projectId: document.getElementById("projectId"),
        testConnectionBtn: document.getElementById("testConnectionBtn"),
        connectionMessage: document.getElementById("connectionMessage"),
        connectionMessageText: document.getElementById("connectionMessageText"),
        saveSettingsBtn: document.getElementById("saveSettingsBtn"),
        clearSettingsBtn: document.getElementById("clearSettingsBtn"),
        saveMessage: document.getElementById("saveMessage"),
        saveMessageText: document.getElementById("saveMessageText"),
        actionsSection: document.getElementById("actionsSection"),
        footerTip: document.getElementById("footerTip"),
    };
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    elements.registerBtn.addEventListener("click", handleRegister);
    elements.showManualConfigBtn.addEventListener("click", handleShowManualConfig);
    elements.testConnectionBtn.addEventListener("click", handleTestConnection);
    elements.saveSettingsBtn.addEventListener("click", handleSaveSettings);
    elements.clearSettingsBtn.addEventListener("click", handleClearSettings);

    elements.apiToken.addEventListener("input", () => hideConnectionMessage());
    elements.projectId.addEventListener("input", () => hideConnectionMessage());
    elements.registerEmail.addEventListener("input", () => hideRegisterMessage());
    elements.registerProjectSlug.addEventListener("input", () =>
        hideRegisterMessage(),
    );
}

/**
 * Show register or config view based on configuration state
 * @param {boolean} isConfigured
 */
function updateViewVisibility(isConfigured) {
    const showRegister = !isConfigured && !manualConfigMode;

    elements.registerSection.style.display = showRegister ? "block" : "none";
    elements.configSection.style.display = showRegister ? "none" : "block";
    elements.actionsSection.style.display = showRegister ? "none" : "block";

    if (elements.footerTip) {
        elements.footerTip.style.display = showRegister ? "none" : "block";
    }
}

/**
 * Load existing settings
 */
async function loadSettings() {
    try {
        const settings = await StorageService.getAllSettings();
        const isConfigured = await StorageService.isConfigured();

        if (settings.apiToken) {
            elements.apiToken.value = settings.apiToken;
        }

        if (settings.selectedProject && settings.selectedProject.id) {
            elements.projectId.value = settings.selectedProject.id;
        }

        updateViewVisibility(isConfigured);
    } catch (error) {
        console.error("Error loading settings:", error);
        showSaveMessage("Error loading settings: " + error.message, "error");
    }
}

/**
 * Switch from register form to manual API configuration
 */
function handleShowManualConfig() {
    manualConfigMode = true;
    updateViewVisibility(false);
    hideRegisterMessage();
}

/**
 * Validate project slug format
 * @param {string} slug
 * @returns {string|null} - Error message or null if valid
 */
function validateProjectSlug(slug) {
    if (!/^[a-z0-9-]{3,40}$/.test(slug)) {
        return "Project slug must be 3–40 characters: lowercase letters, numbers, and hyphens only";
    }
    return null;
}

/**
 * Handle register button click
 */
async function handleRegister() {
    try {
        elements.registerBtn.disabled = true;
        elements.registerBtn.classList.add("loading");
        hideRegisterMessage();
        hideSaveMessage();

        const email = elements.registerEmail.value.trim();
        const projectSlug = elements.registerProjectSlug.value
            .trim()
            .toLowerCase();

        if (!email) {
            showRegisterMessage("Please enter your email address", "error");
            return;
        }

        if (!projectSlug) {
            showRegisterMessage("Please enter a project slug", "error");
            return;
        }

        const slugError = validateProjectSlug(projectSlug);
        if (slugError) {
            showRegisterMessage(slugError, "error");
            return;
        }

        const result = await ApiService.register(email, projectSlug);

        const success = await StorageService.saveAllSettings({
            apiToken: result.api_key,
            selectedProject: createProjectObject(result.project_slug),
        });

        if (!success) {
            showRegisterMessage("Failed to save registration data", "error");
            return;
        }

        elements.apiToken.value = result.api_key;
        elements.projectId.value = result.project_slug;
        elements.registerEmail.value = "";
        elements.registerProjectSlug.value = "";

        manualConfigMode = false;
        updateViewVisibility(true);

        showSaveMessage(
            "Project created! Your API key has been saved. " +
                (result.message || "Save your API key — it will not be shown again."),
            "success",
        );
    } catch (error) {
        console.error("Error registering:", error);
        showRegisterMessage(error.message, "error");
    } finally {
        elements.registerBtn.disabled = false;
        elements.registerBtn.classList.remove("loading");
    }
}

/**
 * Handle test connection button click
 */
async function handleTestConnection() {
    try {
        elements.testConnectionBtn.disabled = true;
        elements.testConnectionBtn.classList.add("loading");
        hideConnectionMessage();
        hideSaveMessage();

        const apiToken = elements.apiToken.value.trim();
        const projectId = elements.projectId.value.trim();

        if (!apiToken) {
            showConnectionMessage("Please enter API key", "error");
            return;
        }

        if (!projectId) {
            showConnectionMessage("Please enter Project ID", "error");
            return;
        }

        await StorageService.setApiToken(apiToken);
        await StorageService.setSelectedProject(createProjectObject(projectId));

        const result = await ApiService.testConnection();

        if (result.success) {
            showConnectionMessage(result.message, "success");
        } else {
            showConnectionMessage(result.message, "error");
        }
    } catch (error) {
        console.error("Error testing connection:", error);
        showConnectionMessage("Connection failed: " + error.message, "error");
    } finally {
        elements.testConnectionBtn.disabled = false;
        elements.testConnectionBtn.classList.remove("loading");
    }
}

/**
 * Handle save settings button click
 */
async function handleSaveSettings() {
    try {
        elements.saveSettingsBtn.disabled = true;
        elements.saveSettingsBtn.classList.add("loading");
        hideSaveMessage();

        const apiToken = elements.apiToken.value.trim();
        const projectId = elements.projectId.value.trim();

        if (!apiToken) {
            showSaveMessage("Please enter API key", "error");
            return;
        }

        if (!projectId) {
            showSaveMessage("Please enter Project ID", "error");
            return;
        }

        const success = await StorageService.saveAllSettings({
            apiToken,
            selectedProject: createProjectObject(projectId),
        });

        if (success) {
            manualConfigMode = false;
            updateViewVisibility(true);
            showSaveMessage("Settings saved successfully! ✅", "success");
        } else {
            showSaveMessage("Failed to save settings", "error");
        }
    } catch (error) {
        console.error("Error saving settings:", error);
        showSaveMessage("Error saving settings: " + error.message, "error");
    } finally {
        elements.saveSettingsBtn.disabled = false;
        elements.saveSettingsBtn.classList.remove("loading");
    }
}

/**
 * Handle clear settings button click
 */
async function handleClearSettings() {
    if (
        !confirm(
            "Are you sure you want to clear all settings? This action cannot be undone.",
        )
    ) {
        return;
    }

    try {
        const success = await StorageService.clearAllSettings();

        if (success) {
            elements.apiToken.value = "";
            elements.projectId.value = "";
            elements.registerEmail.value = "";
            elements.registerProjectSlug.value = "";

            manualConfigMode = false;
            hideConnectionMessage();
            hideSaveMessage();
            hideRegisterMessage();
            updateViewVisibility(false);

            showSaveMessage("Settings cleared successfully", "success");
        } else {
            showSaveMessage("Failed to clear settings", "error");
        }
    } catch (error) {
        console.error("Error clearing settings:", error);
        showSaveMessage("Error clearing settings: " + error.message, "error");
    }
}

/**
 * Show register message
 * @param {string} message
 * @param {string} type
 */
function showRegisterMessage(message, type = "info") {
    elements.registerMessageText.textContent = message;
    elements.registerMessage.className = `message ${type}`;
    elements.registerMessage.style.display = "block";
}

/**
 * Hide register message
 */
function hideRegisterMessage() {
    elements.registerMessage.style.display = "none";
}

/**
 * Show connection message
 * @param {string} message - Message to display
 * @param {string} type - Message type (success, error, info)
 */
function showConnectionMessage(message, type = "info") {
    elements.connectionMessageText.textContent = message;
    elements.connectionMessage.className = `message ${type}`;
    elements.connectionMessage.style.display = "block";
}

/**
 * Hide connection message
 */
function hideConnectionMessage() {
    elements.connectionMessage.style.display = "none";
}

/**
 * Show save message
 * @param {string} message - Message to display
 * @param {string} type - Message type (success, error, info)
 */
function showSaveMessage(message, type = "info") {
    elements.saveMessageText.textContent = message;
    elements.saveMessage.className = `message ${type}`;
    elements.saveMessage.style.display = "block";
}

/**
 * Hide save message
 */
function hideSaveMessage() {
    elements.saveMessage.style.display = "none";
}
