document.addEventListener('keydown', function(event) {
  if (event.key === '?' && !event.ctrlKey && !event.altKey && !event.metaKey) {
    if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA' && !event.target.isContentEditable) {
      event.preventDefault();
      toggleOverlay();
    }
  }
});

let autoplayActive = true;
let currentTheme = localStorage.getItem('solvle-theme') || 'light';
applyTheme(currentTheme);
let currentMode = localStorage.getItem('solvle-mode') || 'helper';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggle') {
    toggleOverlay();
    sendResponse({ visible: overlayVisible });
  } else if (message.action === 'getState') {
    sendResponse({ visible: overlayVisible, autoplay: autoplayActive, theme: currentTheme, mode: currentMode });
  } else if (message.action === 'toggleAutoplay') {
    autoplayActive = !autoplayActive;
    sendResponse({ autoplay: autoplayActive });
  } else if (message.action === 'toggleTheme') {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    localStorage.setItem('solvle-theme', currentTheme);
    sendResponse({ theme: currentTheme });
  } else if (message.action === 'toggleMode') {
    currentMode = currentMode === 'helper' ? 'solver' : 'helper';
    updateUIForMode(currentMode);
    localStorage.setItem('solvle-mode', currentMode);
    sendResponse({ mode: currentMode });
  }
});

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    createOverlay();
    updateUIForMode(currentMode);
    startAutoplay();
  });
} else {
  createOverlay();
  updateUIForMode(currentMode);
  startAutoplay();
}
