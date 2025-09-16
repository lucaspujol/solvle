document.addEventListener('DOMContentLoaded', function() {
  const showHideBtn = document.getElementById('showHideBtn');
  const autoplayBtn = document.getElementById('autoplayBtn');
  const overlayLabel = document.getElementById('overlayLabel');
  const autoplayLabel = document.getElementById('autoplayLabel');

  // Get current state when popup opens
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'getState' }, function(response) {
      if (response) {
        updateOverlayButton(response.visible);
        updateAutoplayButton(response.autoplay);
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

  // Handle autoplay button click
  autoplayBtn.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleAutoplay' }, function(response) {
        if (response) {
          updateAutoplayButton(response.autoplay);
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

  function updateAutoplayButton(active) {
    if (active) {
      autoplayLabel.textContent = 'Autoplay';
      autoplayBtn.textContent = 'Autoplay On';
      autoplayBtn.classList.add('active-state');
    } else {
      autoplayLabel.textContent = 'Autoplay';
      autoplayBtn.textContent = 'Autoplay Off';
      autoplayBtn.classList.remove('active-state');
    }
  }
});