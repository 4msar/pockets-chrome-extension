/**
 * Settings Script
 * Handles the settings page logic and interactions
 */

// DOM Elements
let elements = {};

// State
let projects = [];
let selectedProject = null;

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
    apiUrl: document.getElementById('apiUrl'),
    apiToken: document.getElementById('apiToken'),
    testConnectionBtn: document.getElementById('testConnectionBtn'),
    connectionMessage: document.getElementById('connectionMessage'),
    connectionMessageText: document.getElementById('connectionMessageText'),
    projectSelect: document.getElementById('projectSelect'),
    loadingProjects: document.getElementById('loadingProjects'),
    noProjectsAlert: document.getElementById('noProjectsAlert'),
    projectInfo: document.getElementById('projectInfo'),
    selectedProjectName: document.getElementById('selectedProjectName'),
    selectedProjectId: document.getElementById('selectedProjectId'),
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
  
  // Project select
  elements.projectSelect.addEventListener('change', handleProjectChange);
  
  // Save settings button
  elements.saveSettingsBtn.addEventListener('click', handleSaveSettings);
  
  // Clear settings button
  elements.clearSettingsBtn.addEventListener('click', handleClearSettings);
  
  // Enable test button when inputs change
  elements.apiUrl.addEventListener('input', () => hideConnectionMessage());
  elements.apiToken.addEventListener('input', () => hideConnectionMessage());
}

/**
 * Load existing settings
 */
async function loadSettings() {
  try {
    const settings = await StorageService.getAllSettings();
    
    if (settings.apiUrl) {
      elements.apiUrl.value = settings.apiUrl;
    }
    
    if (settings.apiToken) {
      elements.apiToken.value = settings.apiToken;
    }
    
    if (settings.selectedProject) {
      selectedProject = settings.selectedProject;
      showProjectInfo(selectedProject);
    }
    
    // If we have API credentials, automatically test connection and load projects
    if (settings.apiUrl && settings.apiToken) {
      await handleTestConnection();
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
    
    // Save current values temporarily
    const apiUrl = elements.apiUrl.value.trim();
    const apiToken = elements.apiToken.value.trim();
    
    if (!apiUrl || !apiToken) {
      showConnectionMessage('Please enter both API URL and token', 'error');
      return;
    }
    
    // Temporarily save to storage for API call
    await StorageService.setApiUrl(apiUrl);
    await StorageService.setApiToken(apiToken);
    
    // Test connection
    const result = await ApiService.testConnection();
    
    if (result.success) {
      showConnectionMessage(result.message, 'success');
      
      // Load projects
      await loadProjects();
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
 * Load projects from API
 */
async function loadProjects() {
  try {
    // Show loading state
    elements.loadingProjects.style.display = 'flex';
    elements.noProjectsAlert.style.display = 'none';
    elements.projectSelect.disabled = true;
    
    // Fetch projects
    projects = await ApiService.getProjects();
    
    // Hide loading state
    elements.loadingProjects.style.display = 'none';
    
    if (projects.length === 0) {
      elements.noProjectsAlert.style.display = 'block';
      return;
    }
    
    // Populate dropdown
    populateProjectDropdown();
    
    // Enable dropdown
    elements.projectSelect.disabled = false;
  } catch (error) {
    console.error('Error loading projects:', error);
    elements.loadingProjects.style.display = 'none';
    showConnectionMessage('Failed to load projects: ' + error.message, 'error');
  }
}

/**
 * Populate project dropdown
 */
function populateProjectDropdown() {
  // Clear existing options except the first one
  elements.projectSelect.innerHTML = '<option value="">-- Select a project --</option>';
  
  // Add project options
  projects.forEach(project => {
    const option = document.createElement('option');
    option.value = project.id;
    option.textContent = project.name;
    
    // Select if this was the previously selected project
    if (selectedProject && selectedProject.id === project.id) {
      option.selected = true;
    }
    
    elements.projectSelect.appendChild(option);
  });
  
  // If we have a selected project, show it
  if (selectedProject) {
    showProjectInfo(selectedProject);
  }
}

/**
 * Handle project selection change
 */
function handleProjectChange() {
  const projectId = parseInt(elements.projectSelect.value);
  
  if (!projectId) {
    hideProjectInfo();
    selectedProject = null;
    return;
  }
  
  // Find selected project
  const project = projects.find(p => p.id === projectId);
  
  if (project) {
    selectedProject = project;
    showProjectInfo(project);
  }
}

/**
 * Show project info
 * @param {Object} project - Project object
 */
function showProjectInfo(project) {
  elements.selectedProjectName.textContent = project.name;
  elements.selectedProjectId.textContent = project.id;
  elements.projectInfo.style.display = 'block';
}

/**
 * Hide project info
 */
function hideProjectInfo() {
  elements.projectInfo.style.display = 'none';
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
    const apiUrl = elements.apiUrl.value.trim();
    const apiToken = elements.apiToken.value.trim();
    
    if (!apiUrl) {
      showSaveMessage('Please enter API URL', 'error');
      return;
    }
    
    if (!apiToken) {
      showSaveMessage('Please enter API token', 'error');
      return;
    }
    
    if (!selectedProject) {
      showSaveMessage('Please select a project', 'error');
      return;
    }
    
    // Save settings
    const success = await StorageService.saveAllSettings({
      apiUrl,
      apiToken,
      selectedProject
    });
    
    if (success) {
      showSaveMessage('Settings saved successfully! ✅', 'success');
      
      // Show success for a moment then could close
      setTimeout(() => {
        // Settings saved, user can continue using the extension
      }, 2000);
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
      elements.apiUrl.value = '';
      elements.apiToken.value = '';
      elements.projectSelect.innerHTML = '<option value="">-- Select a project --</option>';
      elements.projectSelect.disabled = true;
      
      // Hide messages and info
      hideConnectionMessage();
      hideProjectInfo();
      hideSaveMessage();
      
      // Reset state
      projects = [];
      selectedProject = null;
      
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
