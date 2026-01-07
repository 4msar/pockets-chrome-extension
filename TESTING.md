# Testing the Pockets Chrome Extension

## How to Load the Extension in Chrome

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the extension directory: `/home/runner/work/pockets-chrome-extension/pockets-chrome-extension`

## Expected Results

### After Loading
- Extension should appear in the extensions list
- No errors should be shown
- Extension icon should appear in the toolbar

### Testing Steps

#### 1. Test Settings Page
- Click the extension icon
- Click "Go to Settings" (if not configured)
- OR Right-click extension icon → "Options"
- Settings page should open

#### 2. Configure Extension
- Enter API URL (e.g., `https://kv.fourorbit.com`)
- Enter API Token
- Click "Test Connection"
- Should show success or error message
- Select a project from dropdown
- Click "Save Settings"

#### 3. Test Popup
- Click the extension icon
- Should show current page title and URL
- Should show selected project
- Click "Save Link" to test saving

#### 4. Test Context Menu
- Right-click anywhere on a webpage
- Should see "Save to Pocket" option
- Click it to save the current page

## Files Created

```
pockets-chrome-extension/
├── manifest.json                  # Extension manifest (Manifest V3)
├── background/
│   └── service-worker.js         # Background service worker
├── popup/
│   ├── popup.html                # Popup UI
│   ├── popup.css                 # Popup styles
│   └── popup.js                  # Popup logic
├── settings/
│   ├── settings.html             # Settings page UI
│   ├── settings.css              # Settings styles
│   └── settings.js               # Settings logic
├── services/
│   ├── api.js                    # API service layer
│   └── storage.js                # Storage service layer
├── utils/
│   └── notifications.js          # Notification utilities
└── icons/
    ├── icon16.png                # 16x16 icon
    ├── icon48.png                # 48x48 icon
    └── icon128.png               # 128x128 icon
```

## Features Implemented

### Storage Service (`services/storage.js`)
- Get/Set API URL
- Get/Set API Token
- Get/Set Selected Project
- Get/Save all settings at once
- Clear all settings
- Configuration validation

### API Service (`services/api.js`)
- Authenticated API requests with Bearer token
- Test connection functionality
- Fetch projects from API
- Save links to projects
- Error handling (401, network errors, etc.)

### Background Service Worker (`background/service-worker.js`)
- Context menu creation ("Save to Pocket")
- Context menu click handling
- Message handling from popup
- Link saving orchestration
- Support for saving pages, links, and images

### Popup Interface
- Current page title and URL display
- Selected project badge
- Save link button with loading state
- Success/error messages
- Not configured state handling
- Settings navigation

### Settings Page
- Step-by-step configuration interface
- API URL and token input
- Connection testing
- Project loading and selection
- Selected project information display
- Save and clear settings functionality
- Professional gradient design

### Notifications
- Success notifications
- Error notifications
- Info notifications
- Browser native notifications

## API Integration

The extension integrates with Laravel API endpoints:

### Get Projects
```
GET /api/projects
Headers: Authorization: Bearer {token}
Response: { "data": [{ "id": 1, "name": "Project Name", ... }] }
```

### Save Link
```
POST /api/projects/{project_id}/items
Headers: Authorization: Bearer {token}
Body: { "title": "Page Title", "type": "url", "value": "https://example.com" }
Response: { "data": { ... } }
```

## Security Features

- API tokens stored securely in `chrome.storage.local`
- Password type input for token field
- Bearer token authentication
- 401 unauthorized handling
- Network error handling

## User Experience Features

- Loading states for all async operations
- Clear error messages
- Success feedback via notifications
- Professional, modern UI design
- Responsive layouts
- Smooth transitions and animations

## Notes

- Extension uses Manifest V3 (latest version)
- All services are modular and reusable
- Vanilla JavaScript (no external dependencies)
- Compatible with Chrome's latest extension APIs
- Follows Chrome extension best practices
