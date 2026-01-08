/**
 * API Service
 * Handles all API interactions with the Laravel backend
 */

const ApiService = {
  // Hardcoded API URL
  API_URL: 'https://pockets.fourorbit.com',

  /**
   * Get API configuration from storage
   * @returns {Promise<Object>}
   */
  async getConfig() {
    const apiUrl = this.API_URL;
    const apiToken = await StorageService.getApiToken();
    return { apiUrl, apiToken };
  },

  /**
   * Make an authenticated API request
   * @param {string} endpoint - API endpoint (e.g., '/api/projects')
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>}
   */
  async makeRequest(endpoint, options = {}) {
    const { apiUrl, apiToken } = await this.getConfig();
    
    if (!apiToken) {
      throw new Error('API not configured. Please configure in settings.');
    }

    // Ensure apiUrl doesn't end with slash and endpoint starts with slash
    const cleanUrl = apiUrl.replace(/\/$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    const url = cleanUrl + cleanEndpoint;

    const headers = {
      'Authorization': `Bearer ${apiToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        throw new Error('Authentication failed. Please check your API token in settings.');
      }

      // Handle other error statuses
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `API request failed with status ${response.status}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (e) {
          // If parsing fails, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Parse JSON response
      const data = await response.json();
      return data;
    } catch (error) {
      // Handle network errors
      if (error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  },

  /**
   * Test API connection
   * @returns {Promise<Object>} - Returns success flag and message
   */
  async testConnection() {
    try {
      const { apiUrl, apiToken } = await this.getConfig();
      
      if (!apiToken) {
        return {
          success: false,
          message: 'Please enter API key'
        };
      }

      // Try to fetch projects to test connection
      await this.getProjects();
      
      return {
        success: true,
        message: 'Connection successful!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  },

  /**
   * Get all projects from API
   * @returns {Promise<Array>}
   */
  async getProjects() {
    try {
      const response = await this.makeRequest('/api/projects', {
        method: 'GET'
      });
      
      // Laravel API typically returns data in a 'data' property
      return response.data || response;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  /**
   * Save a link to a project
   * @param {number} projectId - The project ID
   * @param {Object} linkData - Object containing title and value (URL)
   * @returns {Promise<Object>}
   */
  async saveLink(projectId, linkData) {
    try {
      if (!projectId) {
        throw new Error('No project selected. Please select a project in settings.');
      }

      const response = await this.makeRequest(`/api/projects/${projectId}/items`, {
        method: 'POST',
        body: JSON.stringify({
          title: linkData.title,
          type: 'url',
          value: linkData.value
        })
      });
      
      return response;
    } catch (error) {
      console.error('Error saving link:', error);
      throw error;
    }
  },

  /**
   * Save current page to selected project
   * @param {string} title - Page title
   * @param {string} url - Page URL
   * @returns {Promise<Object>}
   */
  async saveCurrentPage(title, url) {
    try {
      const selectedProject = await StorageService.getSelectedProject();
      
      if (!selectedProject || !selectedProject.id) {
        throw new Error('No project selected. Please select a project in settings.');
      }

      const result = await this.saveLink(selectedProject.id, {
        title: title || url,
        value: url
      });

      return {
        success: true,
        message: `Saved to ${selectedProject.name}`,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiService;
}
