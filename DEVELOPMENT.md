# Pockets Chrome Extension - Development Guide

## Project Overview

This is a Manifest V3 Chrome extension that integrates with a Laravel application to save web links and bookmarks securely.

## Architecture

### Directory Structure
```
pockets-chrome-extension/
├── manifest.json              # Extension manifest (Manifest V3)
├── background/
│   └── service-worker.js     # Background service worker
├── popup/
│   ├── popup.html            # Popup UI
│   ├── popup.css             # Popup styles
│   └── popup.js              # Popup logic
├── settings/
│   ├── settings.html         # Settings page UI
│   ├── settings.css          # Settings styles
│   └── settings.js           # Settings logic
├── services/
│   ├── api.js                # API service layer
│   └── storage.js            # Storage service layer
├── utils/
│   └── notifications.js      # Notification utilities
└── icons/
    ├── icon16.png            # 16x16 icon
    ├── icon48.png            # 48x48 icon
    └── icon128.png           # 128x128 icon
```

## Components

### 1. Manifest (manifest.json)
- **Version**: Manifest V3
- **Permissions**: storage, activeTab, contextMenus, notifications
- **Host Permissions**: All HTTP/HTTPS URLs
- **Background**: Service worker (background/service-worker.js)
- **Action**: Popup (popup/popup.html)
- **Options**: Settings page (settings/settings.html)

### 2. Services Layer

#### storage.js
Handles all Chrome storage operations:
- `getApiUrl()` - Retrieve API URL
- `setApiUrl(url)` - Store API URL
- `getApiToken()` - Retrieve API token
- `setApiToken(token)` - Store API token
- `getSelectedProject()` - Retrieve selected project
- `setSelectedProject(project)` - Store selected project
- `getAllSettings()` - Get all settings at once
- `saveAllSettings(settings)` - Save all settings
- `clearAllSettings()` - Clear all settings
- `isConfigured()` - Check if extension is configured
- `validateConfiguration()` - Validate configuration completeness

#### api.js
Handles all API interactions:
- `getConfig()` - Get API configuration from storage
- `makeRequest(endpoint, options)` - Make authenticated API request
- `testConnection()` - Test API connection
- `getProjects()` - Fetch projects from API
- `saveLink(projectId, linkData)` - Save link to project
- `saveCurrentPage(title, url)` - Save current page to selected project

### 3. Background Service Worker

**File**: background/service-worker.js

**Responsibilities**:
- Context menu creation
- Context menu click handling
- Message handling from popup
- Link saving orchestration

**Context Menu**:
- ID: `save-to-pocket`
- Title: "Save to Pocket"
- Contexts: page, link, image

**Message Handlers**:
- `saveLink` - Save a link to the API
- `checkConfiguration` - Check if extension is configured

### 4. Popup Interface

**Files**: popup/popup.html, popup/popup.css, popup/popup.js

**Features**:
- Display current page title (readonly)
- Display current page URL (readonly)
- Show selected project badge
- Save button with loading state
- Success/error messages
- Not configured state
- Settings navigation

**UI States**:
1. Loading - While initializing
2. Not Configured - When settings are missing
3. Form - Main save interface

### 5. Settings Page

**Files**: settings/settings.html, settings/settings.css, settings/settings.js

**Features**:
- Step 1: API Configuration
  - API URL input
  - API Token input (password type)
  - Test connection button
  - Connection status messages
- Step 2: Project Selection
  - Project dropdown (loaded after connection test)
  - Selected project info card
  - Loading states
  - No projects alert
- Actions
  - Save settings button
  - Clear settings button
- Professional gradient header design

### 6. Utilities

#### notifications.js
Browser notification service:
- `show(title, message, type)` - Show notification
- `showSuccess(message)` - Show success notification
- `showError(message)` - Show error notification
- `showInfo(message)` - Show info notification

## API Integration

### Authentication
- **Method**: Bearer Token (Laravel Sanctum)
- **Header**: `Authorization: Bearer {token}`

### Endpoints

#### Get Projects
```
GET /api/projects
Headers: Authorization: Bearer {token}
Response: {
  "data": [
    { "id": 1, "name": "Project Name", ... }
  ]
}
```

#### Save Link
```
POST /api/projects/{project_id}/items
Headers: Authorization: Bearer {token}
Body: {
  "title": "Page Title",
  "type": "url",
  "value": "https://example.com"
}
Response: {
  "data": { ... }
}
```

## Security Features

1. **Secure Storage**
   - API tokens stored in `chrome.storage.local`
   - Password type input for token field
   - No sensitive data in URLs or logs

2. **Authentication**
   - Bearer token authentication
   - Token sent in Authorization header
   - 401 response handling

3. **Error Handling**
   - Network errors
   - Authentication failures
   - API errors
   - User-friendly error messages

4. **Permissions**
   - Minimal required permissions
   - Host permissions for API calls
   - No unnecessary data collection

## Development

### Prerequisites
- Google Chrome browser
- Code editor
- (Optional) Laravel Pockets API for testing

### Loading Extension Locally

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the extension directory

### Testing

1. **Settings Configuration**
   - Enter API URL
   - Enter API token
   - Test connection
   - Select project
   - Save settings

2. **Popup Functionality**
   - Click extension icon
   - Verify page info loads
   - Click "Save Link"
   - Verify success message

3. **Context Menu**
   - Right-click on page
   - Click "Save to Pocket"
   - Verify notification

### Debugging

1. **Service Worker**
   - Go to `chrome://extensions/`
   - Click "service worker" under extension
   - Check console for errors

2. **Popup**
   - Right-click extension icon → "Inspect popup"
   - Check console for errors

3. **Settings Page**
   - Open settings page
   - Right-click → "Inspect"
   - Check console for errors

## Code Style

- Modern ES6+ JavaScript
- Async/await for asynchronous operations
- Comprehensive error handling
- Clear, descriptive variable names
- JSDoc comments for functions
- Modular, reusable code

## Best Practices Followed

1. **Manifest V3**
   - Service worker instead of background page
   - Proper permission declarations
   - Host permissions for API calls

2. **Security**
   - Secure token storage
   - No hardcoded credentials
   - Proper CORS handling

3. **User Experience**
   - Loading states for all async operations
   - Clear error messages
   - Success feedback
   - Professional UI design

4. **Code Quality**
   - No external dependencies
   - Vanilla JavaScript
   - Modular architecture
   - Comprehensive error handling

## Browser Compatibility

- Chrome (primary target)
- Edge (Chromium-based)
- Other Chromium-based browsers

## Known Limitations

1. Requires active Laravel Pockets API
2. Requires manual token generation from API
3. Chrome/Chromium-based browsers only
4. No offline support

## Future Enhancements

Potential improvements for future versions:

1. Automatic token refresh
2. Multiple project quick-save
3. Tags/categories support
4. Link preview before saving
5. Save history/recent saves
6. Keyboard shortcuts
7. Dark mode support
8. Bulk save operations
9. Export/import settings
10. OAuth integration

## Support

For issues or questions:
1. Check TESTING.md for testing procedures
2. Review browser console for errors
3. Verify API endpoint connectivity
4. Check Chrome extension permissions

## License

MIT License - See LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Changelog

### Version 1.0.0 (Initial Release)
- Manifest V3 implementation
- Context menu integration
- Popup interface
- Settings page
- API integration with Laravel
- Secure token storage
- Browser notifications
- Project selection
- Professional UI design
