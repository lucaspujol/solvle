document.addEventListener('DOMContentLoaded', function() {
  const showHideBtn = document.getElementById('showHideBtn');
  const autorefreshBtn = document.getElementById('autorefreshBtn');
  const themeBtn = document.getElementById('themeBtn');
  const modeBtn = document.getElementById('modeBtn');
  const overlayLabel = document.getElementById('overlayLabel');
  const autorefreshLabel = document.getElementById('autorefreshLabel');
  const themeLabel = document.getElementById('themeLabel');
  const modeLabel = document.getElementById('modeLabel');

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'getState' }, function(response) {
      if (response) {
        updateOverlayButton(response.visible);
        updateAutorefreshButton(response.autoplay);
        updateThemeButton(response.theme);
        updateModeButton(response.mode);
      }
    });
  });

  showHideBtn.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle' }, function(response) {
        if (response) updateOverlayButton(response.visible);
      });
    });
  });

  autorefreshBtn.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleAutoplay' }, function(response) {
        if (response) updateAutorefreshButton(response.autoplay);
      });
    });
  });

  themeBtn.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleTheme' }, function(response) {
        if (response) updateThemeButton(response.theme);
      });
    });
  });

  modeBtn.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleMode' }, function(response) {
        if (response) updateModeButton(response.mode);
      });
    });
  });

  function updateOverlayButton(visible) {
    overlayLabel.textContent = 'Overlay';
    showHideBtn.textContent = visible ? 'Visible' : 'Hidden';
    showHideBtn.classList.toggle('active-state', visible);
  }

  function updateAutorefreshButton(active) {
    autorefreshLabel.textContent = 'Auto Refresh';
    autorefreshBtn.textContent = active ? 'On' : 'Off';
    autorefreshBtn.classList.toggle('active-state', active);
  }

  function updateThemeButton(theme) {
    themeLabel.textContent = 'Color Theme';
    themeBtn.textContent = theme === 'dark' ? 'Dark Theme' : 'Light Theme';
    themeBtn.classList.toggle('active-state', theme === 'dark');
  }

  function updateModeButton(mode) {
    modeLabel.textContent = 'Mode';
    modeBtn.textContent = mode === 'solver' ? 'Solver Mode' : 'Helper Mode';
    modeBtn.classList.toggle('active-state', mode === 'solver');
  }
});
