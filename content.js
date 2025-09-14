let overlayVisible = true;

function createOverlay() {
  if (document.getElementById('hello-world-overlay')) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'hello-world-overlay';

  const text = document.createElement('div');
  text.textContent = 'Hello World!';

  const button = document.createElement('button');
  button.textContent = 'Log Message';
  button.id = 'log-button';
  button.addEventListener('click', function() {
    console.log('Button clicked from Firefox extension!');
    console.log('Current page:', window.location.href);
  });

  overlay.appendChild(text);
  overlay.appendChild(button);
  document.body.appendChild(overlay);
}

function toggleOverlay() {
  const overlay = document.getElementById('hello-world-overlay');
  if (overlay) {
    overlayVisible = !overlayVisible;
    overlay.style.display = overlayVisible ? 'flex' : 'none';
  }
}

// Keyboard shortcut listener
document.addEventListener('keydown', function(event) {
  if (event.key === '?' && !event.ctrlKey && !event.altKey && !event.metaKey) {
    // Only trigger if not typing in an input field
    if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA' && !event.target.isContentEditable) {
      event.preventDefault();
      toggleOverlay();
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createOverlay);
} else {
  createOverlay();
}