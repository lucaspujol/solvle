document.addEventListener('DOMContentLoaded', function() {
  const showHideBtn = document.getElementById('showHideBtn');
  const autorefreshBtn = document.getElementById('autorefreshBtn');
  const themeBtn = document.getElementById('themeBtn');
  const overlayLabel = document.getElementById('overlayLabel');
  const autorefreshLabel = document.getElementById('autorefreshLabel');
  const themeLabel = document.getElementById('themeLabel');

  // Get current state when popup opens
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'getState' }, function(response) {
      if (response) {
        updateOverlayButton(response.visible);
        updateAutorefreshButton(response.autoplay);
        updateThemeButton(response.theme);
      }
    });
  });

  // Handle show/hide button click
  showHideBtn.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle' }, function(response) {
        if (response) {
          updateOverlayButton(response.visible);
        }
      });
    });
  });

  // Handle autorefresh button click
  autorefreshBtn.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleAutoplay' }, function(response) {
        if (response) {
          updateAutorefreshButton(response.autoplay);
        }
      });
    });
  });

  themeBtn.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleTheme' }, function(response) {
        if (response) {
          updateThemeButton(response.theme);
        }
      });
    });
  });

  function updateOverlayButton(visible) {
    if (visible) {
      overlayLabel.textContent = 'Overlay';
      showHideBtn.textContent = 'Visible';
      showHideBtn.classList.add('active-state');
    } else {
      overlayLabel.textContent = 'Overlay';
      showHideBtn.textContent = 'Hidden';
      showHideBtn.classList.remove('active-state');
    }
  }

  function updateAutorefreshButton(active) {
    if (active) {
      autorefreshLabel.textContent = 'Auto Refresh';
      autorefreshBtn.textContent = 'On';
      autorefreshBtn.classList.add('active-state');
    } else {
      autorefreshLabel.textContent = 'Auto Refresh';
      autorefreshBtn.textContent = 'Off';
      autorefreshBtn.classList.remove('active-state');
    }
  }

  function updateThemeButton(theme) {
    if (theme === 'dark') {
      themeLabel.textContent = 'Color Theme';
      themeBtn.textContent = 'Dark Theme';
      themeBtn.classList.add('active-state');
    } else {
      themeLabel.textContent = 'Color Theme';
      themeBtn.textContent = 'Light Theme';
      themeBtn.classList.remove('active-state');
    }
  }
});