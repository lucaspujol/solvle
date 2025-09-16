// Main Content Script
// Orchestrates the extension functionality

// Keyboard shortcut listeners
document.addEventListener('keydown', function(event) {
  if (event.key === '?' && !event.ctrlKey && !event.altKey && !event.metaKey) {
    // Only trigger if not typing in an input field
    if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA' && !event.target.isContentEditable) {
      event.preventDefault();
      toggleOverlay();
    }
  }
  if (event.key === '.' && !event.ctrlKey && !event.altKey && !event.metaKey) {
    // Only trigger if not typing in an input field
    if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA' && !event.target.isContentEditable) {
      event.preventDefault();
      logAllTiles();
    }
  }
});

// Autoplay state
let autoplayActive = true;

// Theme state
let currentTheme = 'light';

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggle') {
    toggleOverlay();
    sendResponse({ visible: overlayVisible });
  } else if (message.action === 'getState') {
    sendResponse({ visible: overlayVisible, autoplay: autoplayActive, theme: currentTheme });
  } else if (message.action === 'toggleAutoplay') {
    autoplayActive = !autoplayActive;
    sendResponse({ autoplay: autoplayActive });
  } else if (message.action === 'toggleTheme') {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    sendResponse({ theme: currentTheme });
  }
});

// Apply theme to the page
function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

// Initialize the extension
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    createOverlay();
    startAutoplay();
  });
} else {
  createOverlay();
  startAutoplay();
}