/**
 * Settings Script
 * Handles the settings page logic and interactions
 */

// DOM Elements
let elements = {};

/**
 * Create a project object from a project ID
 * @param {string|number} projectId - The project ID
 * @returns {Object} - Project object with id and name
 */
function createProjectObject(projectId) {
  const id = parseInt(projectId);
  return { id, name: `Project ${id}` };
}

/**
 * Initialize settings page
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM elements
  initElements();
  
  // Set up event listeners
  setupEventListeners();
  
  // Load existing settings
  await loadSettings();
});

/**
 * Initialize DOM element references
 */
function initElements() {
  elements = {
    apiToken: document.getElementById('apiToken'),
    projectId: document.getElementById('projectId'),
    testConnectionBtn: document.getElementById('testConnectionBtn'),
    connectionMessage: document.getElementById('connectionMessage'),
    connectionMessageText: document.getElementById('connectionMessageText'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),
    clearSettingsBtn: document.getElementById('clearSettingsBtn'),
    saveMessage: document.getElementById('saveMessage'),
    saveMessageText: document.getElementById('saveMessageText')
  };
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Test connection button
  elements.testConnectionBtn.addEventListener('click', handleTestConnection);
  
  // Save settings button
  elements.saveSettingsBtn.addEventListener('click', handleSaveSettings);
  
  // Clear settings button
  elements.clearSettingsBtn.addEventListener('click', handleClearSettings);
  
  // Enable test button when inputs change
  elements.apiToken.addEventListener('input', () => hideConnectionMessage());
  elements.projectId.addEventListener('input', () => hideConnectionMessage());
}

/**
 * Load existing settings
 */
async function loadSettings() {
  try {
    const settings = await StorageService.getAllSettings();
    
    if (settings.apiToken) {
      elements.apiToken.value = settings.apiToken;
    }
    
    if (settings.selectedProject && settings.selectedProject.id) {
      elements.projectId.value = settings.selectedProject.id;
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    showSaveMessage('Error loading settings: ' + error.message, 'error');
  }
}

/**
 * Handle test connection button click
 */
async function handleTestConnection() {
  try {
    // Disable button and show loading
    elements.testConnectionBtn.disabled = true;
    elements.testConnectionBtn.classList.add('loading');
    hideConnectionMessage();
    hideSaveMessage();
    
    const apiToken = elements.apiToken.value.trim();
    const projectId = elements.projectId.value.trim();
    
    if (!apiToken) {
      showConnectionMessage('Please enter API key', 'error');
      return;
    }
    
    if (!projectId) {
      showConnectionMessage('Please enter Project ID', 'error');
      return;
    }
    
    // Temporarily save to storage for API call
    await StorageService.setApiToken(apiToken);
    await StorageService.setSelectedProject(createProjectObject(projectId));
    
    // Test connection
    const result = await ApiService.testConnection();
    
    if (result.success) {
      showConnectionMessage(result.message, 'success');
    } else {
      showConnectionMessage(result.message, 'error');
    }
  } catch (error) {
    console.error('Error testing connection:', error);
    showConnectionMessage('Connection failed: ' + error.message, 'error');
  } finally {
    // Re-enable button
    elements.testConnectionBtn.disabled = false;
    elements.testConnectionBtn.classList.remove('loading');
  }
}

/**
 * Handle save settings button click
 */
async function handleSaveSettings() {
  try {
    // Disable button and show loading
    elements.saveSettingsBtn.disabled = true;
    elements.saveSettingsBtn.classList.add('loading');
    hideSaveMessage();
    
    // Validate inputs
    const apiToken = elements.apiToken.value.trim();
    const projectId = elements.projectId.value.trim();
    
    if (!apiToken) {
      showSaveMessage('Please enter API key', 'error');
      return;
    }
    
    if (!projectId) {
      showSaveMessage('Please enter Project ID', 'error');
      return;
    }
    
    // Save settings
    const success = await StorageService.saveAllSettings({
      apiToken,
      selectedProject: createProjectObject(projectId)
    });
    
    if (success) {
      showSaveMessage('Settings saved successfully! ✅', 'success');
    } else {
      showSaveMessage('Failed to save settings', 'error');
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    showSaveMessage('Error saving settings: ' + error.message, 'error');
  } finally {
    // Re-enable button
    elements.saveSettingsBtn.disabled = false;
    elements.saveSettingsBtn.classList.remove('loading');
  }
}

/**
 * Handle clear settings button click
 */
async function handleClearSettings() {
  if (!confirm('Are you sure you want to clear all settings? This action cannot be undone.')) {
    return;
  }
  
  try {
    const success = await StorageService.clearAllSettings();
    
    if (success) {
      // Clear form
      elements.apiToken.value = '';
      elements.projectId.value = '';
      
      // Hide messages
      hideConnectionMessage();
      hideSaveMessage();
      
      showSaveMessage('Settings cleared successfully', 'success');
    } else {
      showSaveMessage('Failed to clear settings', 'error');
    }
  } catch (error) {
    console.error('Error clearing settings:', error);
    showSaveMessage('Error clearing settings: ' + error.message, 'error');
  }
}

/**
 * Show connection message
 * @param {string} message - Message to display
 * @param {string} type - Message type (success, error, info)
 */
function showConnectionMessage(message, type = 'info') {
  elements.connectionMessageText.textContent = message;
  elements.connectionMessage.className = `message ${type}`;
  elements.connectionMessage.style.display = 'block';
}

/**
 * Hide connection message
 */
function hideConnectionMessage() {
  elements.connectionMessage.style.display = 'none';
}

/**
 * Show save message
 * @param {string} message - Message to display
 * @param {string} type - Message type (success, error, info)
 */
function showSaveMessage(message, type = 'info') {
  elements.saveMessageText.textContent = message;
  elements.saveMessage.className = `message ${type}`;
  elements.saveMessage.style.display = 'block';
}

/**
 * Hide save message
 */
function hideSaveMessage() {
  elements.saveMessage.style.display = 'none';
}
