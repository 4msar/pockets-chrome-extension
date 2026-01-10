/**
 * Links Page Script
 * Displays all saved bookmarked links
 */

// DOM Elements
let elements = {};

// State
let currentPage = 1;
let hasMorePages = false;
let isLoading = false;

/**
 * Initialize links page
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
        notConfigured: document.getElementById("notConfigured"),
        mainContent: document.getElementById("mainContent"),
        loadingState: document.getElementById("loadingState"),
        linksContainer: document.getElementById("linksContainer"),
        emptyState: document.getElementById("emptyState"),
        loadMoreContainer: document.getElementById("loadMoreContainer"),
        loadMoreBtn: document.getElementById("loadMoreBtn"),
        goToSettingsBtn: document.getElementById("goToSettingsBtn"),
    };
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Settings button
    elements.goToSettingsBtn.addEventListener("click", openSettings);

    // Load more button
    elements.loadMoreBtn.addEventListener("click", loadMoreLinks);
}

/**
 * Initialize the UI
 */
async function initializeUI() {
    try {
        // Show loading state
        showLoading();

        // Check if extension is configured
        const isConfigured = await StorageService.isConfigured();

        if (!isConfigured) {
            showNotConfigured();
            return;
        }

        // Load links
        await loadLinks();
    } catch (error) {
        console.error("Error initializing UI:", error);
        showError(error.message);
    }
}

/**
 * Load links from API
 */
async function loadLinks(page = 1) {
    try {
        if (isLoading) return;
        isLoading = true;

        if (page === 1) {
            showLoading();
        } else {
            elements.loadMoreBtn.disabled = true;
            elements.loadMoreBtn.textContent = "Loading...";
        }

        // Get links from API
        const response = await ApiService.getProjectsData(page);

        console.log("Links Response:", response);

        // Check if response has data
        const links = Array.isArray(response) ? response : response.data || [];

        // Filter or transform only URL type items
        const urlLinks = links;

        if (page === 1) {
            // Clear existing links for first page
            elements.linksContainer.innerHTML = "";
        }

        if (urlLinks.length === 0 && page === 1) {
            showEmptyState();
            return;
        }

        // Render links
        renderLinks(urlLinks);

        // Show links container
        showLinks();

        // Handle pagination (if API supports it in the future)
        // For now, we'll load all links at once
        hasMorePages = response.next_page_url ? true : false;
        elements.loadMoreContainer.style.display = response.next_page_url
            ? "block"
            : "none";
    } catch (error) {
        console.error("Error loading links:", error);
        if (page === 1) {
            showError(error.message);
        }
    } finally {
        isLoading = false;
        elements.loadMoreBtn.disabled = false;
        elements.loadMoreBtn.textContent = "Load More";
    }
}

/**
 * Load more links
 */
async function loadMoreLinks() {
    currentPage++;
    await loadLinks(currentPage);
}

/**
 * Render links to the DOM
 * @param {Array} links - Array of link objects
 */
function renderLinks(links) {
    links.forEach((link) => {
        try {
            const linkCard = createLinkCard(link);
            elements.linksContainer.appendChild(linkCard);
        } catch (error) {
            console.error("Error creating link card:", error, link);
        }
    });
}

/**
 * Create a link card element
 * @param {Object} link - Link object with name and value (URL)
 * @returns {HTMLElement}
 */
function createLinkCard(link) {
    const card = document.createElement("a");
    card.className = "link-card";
    card.href = link.value || "#";
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    const title = document.createElement("div");
    title.className = "link-title";
    title.textContent = link.name || link.value || "Untitled";
    title.title = title.textContent;

    const url = document.createElement("div");
    url.className = "link-url";
    url.textContent = link.value || "";

    const svgIcon = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    );
    svgIcon.setAttribute("width", "24");
    svgIcon.setAttribute("height", "24");
    svgIcon.setAttribute("viewBox", "0 0 24 24");
    svgIcon.setAttribute("fill", "none");
    svgIcon.setAttribute("stroke", "currentColor");
    svgIcon.setAttribute("stroke-width", "2");
    svgIcon.setAttribute("stroke-linecap", "round");
    svgIcon.setAttribute("stroke-linejoin", "round");
    svgIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgIcon.innerHTML = `
        <path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    `;

    const svgBox = document.createElement("div");
    svgBox.className = "link-icon";
    svgBox.appendChild(svgIcon);

    const linkBox = document.createElement("div");
    linkBox.className = "link-items";

    linkBox.appendChild(title);
    linkBox.appendChild(url);

    card.appendChild(svgBox);
    card.appendChild(linkBox);

    return card;
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
    elements.linksContainer.style.display = "none";
    elements.emptyState.style.display = "none";
    elements.loadMoreContainer.style.display = "none";
    elements.loadingState.style.display = "block";
}

/**
 * Show not configured state
 */
function showNotConfigured() {
    elements.loadingState.style.display = "none";
    elements.mainContent.style.display = "none";
    elements.notConfigured.style.display = "block";
}

/**
 * Show links
 */
function showLinks() {
    elements.loadingState.style.display = "none";
    elements.emptyState.style.display = "none";
    elements.linksContainer.style.display = "flex";

    if (hasMorePages) {
        elements.loadMoreContainer.style.display = "block";
    }
}

/**
 * Show empty state
 */
function showEmptyState() {
    elements.loadingState.style.display = "none";
    elements.linksContainer.style.display = "none";
    elements.loadMoreContainer.style.display = "none";
    elements.emptyState.style.display = "block";
}

/**
 * Show error state
 * @param {string} message - Error message
 */
function showError(message) {
    elements.loadingState.style.display = "none";
    elements.linksContainer.style.display = "none";
    elements.loadMoreContainer.style.display = "none";

    elements.emptyState.style.display = "block";
    elements.emptyState.innerHTML = `
        <div class="empty-icon">❌</div>
        <p>Error loading links</p>
        <p class="empty-text">${message}</p>
    `;
}
