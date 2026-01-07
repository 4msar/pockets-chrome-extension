/**
 * Storage Service
 * Handles all chrome.storage.local operations for the extension
 */

const StorageService = {
  // Storage keys
  KEYS: {
    API_URL: 'apiUrl',
    API_TOKEN: 'apiToken',
    SELECTED_PROJECT: 'selectedProject',
    SETTINGS: 'settings'
  },

  /**
   * Get API URL from storage
   * @returns {Promise<string|null>}
   */
  async getApiUrl() {
    try {
      const result = await chrome.storage.local.get(this.KEYS.API_URL);
      return result[this.KEYS.API_URL] || null;
    } catch (error) {
      console.error('Error getting API URL:', error);
      return null;
    }
  },

  /**
   * Set API URL in storage
   * @param {string} url - The API URL to store
   * @returns {Promise<boolean>}
   */
  async setApiUrl(url) {
    try {
      await chrome.storage.local.set({ [this.KEYS.API_URL]: url });
      return true;
    } catch (error) {
      console.error('Error setting API URL:', error);
      return false;
    }
  },

  /**
   * Get API token from storage
   * @returns {Promise<string|null>}
   */
  async getApiToken() {
    try {
      const result = await chrome.storage.local.get(this.KEYS.API_TOKEN);
      return result[this.KEYS.API_TOKEN] || null;
    } catch (error) {
      console.error('Error getting API token:', error);
      return null;
    }
  },

  /**
   * Set API token in storage
   * @param {string} token - The API token to store
   * @returns {Promise<boolean>}
   */
  async setApiToken(token) {
    try {
      await chrome.storage.local.set({ [this.KEYS.API_TOKEN]: token });
      return true;
    } catch (error) {
      console.error('Error setting API token:', error);
      return false;
    }
  },

  /**
   * Get selected project from storage
   * @returns {Promise<Object|null>}
   */
  async getSelectedProject() {
    try {
      const result = await chrome.storage.local.get(this.KEYS.SELECTED_PROJECT);
      return result[this.KEYS.SELECTED_PROJECT] || null;
    } catch (error) {
      console.error('Error getting selected project:', error);
      return null;
    }
  },

  /**
   * Set selected project in storage
   * @param {Object} project - The project object to store
   * @returns {Promise<boolean>}
   */
  async setSelectedProject(project) {
    try {
      await chrome.storage.local.set({ [this.KEYS.SELECTED_PROJECT]: project });
      return true;
    } catch (error) {
      console.error('Error setting selected project:', error);
      return false;
    }
  },

  /**
   * Get all settings at once
   * @returns {Promise<Object>}
   */
  async getAllSettings() {
    try {
      const result = await chrome.storage.local.get([
        this.KEYS.API_URL,
        this.KEYS.API_TOKEN,
        this.KEYS.SELECTED_PROJECT
      ]);
      return {
        apiUrl: result[this.KEYS.API_URL] || null,
        apiToken: result[this.KEYS.API_TOKEN] || null,
        selectedProject: result[this.KEYS.SELECTED_PROJECT] || null
      };
    } catch (error) {
      console.error('Error getting all settings:', error);
      return {
        apiUrl: null,
        apiToken: null,
        selectedProject: null
      };
    }
  },

  /**
   * Save all settings at once
   * @param {Object} settings - Settings object containing apiUrl, apiToken, and selectedProject
   * @returns {Promise<boolean>}
   */
  async saveAllSettings(settings) {
    try {
      const data = {};
      if (settings.apiUrl) data[this.KEYS.API_URL] = settings.apiUrl;
      if (settings.apiToken) data[this.KEYS.API_TOKEN] = settings.apiToken;
      if (settings.selectedProject) data[this.KEYS.SELECTED_PROJECT] = settings.selectedProject;
      
      await chrome.storage.local.set(data);
      return true;
    } catch (error) {
      console.error('Error saving all settings:', error);
      return false;
    }
  },

  /**
   * Clear all settings
   * @returns {Promise<boolean>}
   */
  async clearAllSettings() {
    try {
      await chrome.storage.local.clear();
      return true;
    } catch (error) {
      console.error('Error clearing settings:', error);
      return false;
    }
  },

  /**
   * Check if extension is configured
   * @returns {Promise<boolean>}
   */
  async isConfigured() {
    try {
      const settings = await this.getAllSettings();
      return !!(settings.apiUrl && settings.apiToken && settings.selectedProject);
    } catch (error) {
      console.error('Error checking configuration:', error);
      return false;
    }
  },

  /**
   * Validate configuration
   * @returns {Promise<Object>} - Returns object with valid flag and missing fields
   */
  async validateConfiguration() {
    try {
      const settings = await this.getAllSettings();
      const missing = [];
      
      if (!settings.apiUrl) missing.push('API URL');
      if (!settings.apiToken) missing.push('API Token');
      if (!settings.selectedProject) missing.push('Selected Project');
      
      return {
        valid: missing.length === 0,
        missing: missing
      };
    } catch (error) {
      console.error('Error validating configuration:', error);
      return {
        valid: false,
        missing: ['Unknown error occurred']
      };
    }
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageService;
}
