let overlayVisible = true;

function logAllTiles() {
  // Access the game through shadow DOM
  const gameApp = document.querySelector('game-app');
  if (!gameApp || !gameApp.shadowRoot) {
    console.log('Game not loaded yet');
    return;
  }

  const shadowRoot = gameApp.shadowRoot;
  const gameRows = shadowRoot.querySelectorAll('game-row[letters]');

  console.log('=== CURRENT GAME STATE ===');
  gameRows.forEach((row, rowIndex) => {
    const word = row.getAttribute('letters');
    if (word && row.shadowRoot) {
      console.log(`Row ${rowIndex}: "${word.toUpperCase()}"`);

      const tiles = row.shadowRoot.querySelectorAll('game-tile');
      tiles.forEach((tile, colIndex) => {
        const letter = tile.getAttribute('letter');
        const evaluation = tile.getAttribute('evaluation');
        const stateIcon = evaluation === 'correct' ? '🟩' :
                         evaluation === 'present' ? '🟨' :
                         evaluation === 'absent' ? '⬜' : '⬛';
        console.log(`  [${rowIndex},${colIndex}] ${letter?.toUpperCase()} ${stateIcon} ${evaluation || 'empty'}`);
      });
    }
  });
  console.log('========================');
}

function extractGreenConstraints() {
  const gameApp = document.querySelector('game-app');
  if (!gameApp || !gameApp.shadowRoot) {
    console.log('Game not loaded yet');
    return {};
  }

  const shadowRoot = gameApp.shadowRoot;
  const gameRows = shadowRoot.querySelectorAll('game-row[letters]');
  const greenConstraints = {};

  gameRows.forEach((row, rowIndex) => {
    const word = row.getAttribute('letters');
    if (word && row.shadowRoot) {
      const tiles = row.shadowRoot.querySelectorAll('game-tile');
      tiles.forEach((tile, colIndex) => {
        const letter = tile.getAttribute('letter');
        const evaluation = tile.getAttribute('evaluation');
        if (evaluation === 'correct') {
          greenConstraints[colIndex] = letter.toUpperCase();
        }
      });
    }
  });
  return greenConstraints;
}

function getTileState(tile) {
  const bgColor = window.getComputedStyle(tile).backgroundColor;
  if (bgColor.includes('green') || bgColor.includes('83, 141, 78'))
    return 'correct';
  if (bgColor.includes('yellow') || bgColor.includes('181, 159, 56'))
    return 'present';
  return 'absent';
}

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

  const testButton = document.createElement('button');
  testButton.textContent = 'Test Tiles';
  testButton.id = 'test-button';
  testButton.addEventListener('click', function() {
    console.log('BUTTON CLICKED!');
    logAllTiles();

    const constraints = extractGreenConstraints();
    console.log('=== EXTRACTED GREEN CONSTRAINTS ===');
    console.log(constraints);
    console.log('===================================');
  });

  overlay.appendChild(text);
  overlay.appendChild(button);
  overlay.appendChild(testButton);
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createOverlay);
} else {
  createOverlay();
}
