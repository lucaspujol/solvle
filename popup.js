document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('toggleBtn');
  const status = document.getElementById('status');

  // Get current state when popup opens
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'getState' }, function(response) {
      if (response) {
        updateStatus(response.visible);
      }
    });
  });

  // Handle toggle button click
  toggleBtn.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle' }, function(response) {
        if (response) {
          updateStatus(response.visible);
        }
      });
    });
  });

  function updateStatus(visible) {
    status.textContent = visible ? 'Visible' : 'Hidden';
    status.style.color = visible ? '#28a745' : '#dc3545';
  }
});