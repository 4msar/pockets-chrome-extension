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
  async show(title, message, type = 'info') {
    try {
      // Create notification options
      const options = {
        type: 'basic',
        iconUrl: this.getIcon(type),
        title: title,
        message: message,
        priority: type === 'error' ? 2 : 1
      };

      // Create notification
      await chrome.notifications.create('', options);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  },

  /**
   * Show success notification
   * @param {string} message - Success message
   */
  async showSuccess(message) {
    await this.show('Success', message, 'success');
  },

  /**
   * Show error notification
   * @param {string} message - Error message
   */
  async showError(message) {
    await this.show('Error', message, 'error');
  },

  /**
   * Show info notification
   * @param {string} message - Info message
   */
  async showInfo(message) {
    await this.show('Info', message, 'info');
  },

  /**
   * Get icon URL based on notification type
   * @param {string} type - Notification type
   * @returns {string}
   */
  getIcon(type) {
    // Use the extension's icon
    return 'icons/icon128.png';
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationsService;
}
