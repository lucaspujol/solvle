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

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggle') {
    toggleOverlay();
    sendResponse({ visible: overlayVisible });
  } else if (message.action === 'getState') {
    sendResponse({ visible: overlayVisible });
  }
});

// Initialize the extension
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createOverlay);
} else {
  createOverlay();
}