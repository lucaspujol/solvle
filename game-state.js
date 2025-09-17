// Wordle Game State Management
// Handles interaction with the Wordle game DOM and extracting game constraints

function detectWordleVariant() {
  const hostname = window.location.hostname;
  
  if (hostname.includes('wordleunlimited')) {
    return 'wordleunlimited';
  } else if (hostname.includes('nytimes')){
    return 'nytimes';
  } else {
    return 'unkown';
  }
}

function logAllTiles() {
  const variant = detectWordleVariant();

  switch (variant) {
    case 'nytimes':
      return logAllTilesNY();
    case 'wordleunlimited':
      return logAllTilesWU();
    default:
      console.log('Unexpected error: unknown Wordle variant');
      return;
  }
}

function extractConstraintsNY() {
  const greenConstraints = {};
  const yellowConstraints = {};
  const grayConstraints = [];

  const gameRows = document.querySelectorAll('[class*="Row-module_row"]');

  gameRows.forEach((row, rowIndex) => {
    const tiles = row.querySelectorAll('[data-testid="tile"]');

    tiles.forEach((tile, colIndex) => {
      const state = tile.getAttribute('data-state');
      const label = tile.getAttribute('aria-label');
      const letter = label?.match(/letter, ([A-Z])/)?.[1];

      if (!letter) {
        return;
      }
      switch (state) {
        case 'correct':
        case 'closed':
          greenConstraints[colIndex] = letter;
          break;
        case 'present':
          if (!yellowConstraints[letter]) {
            yellowConstraints[letter] = [];
          }
          yellowConstraints[letter].push(colIndex);
          break;
        case 'absent':
          if (!grayConstraints.includes(letter)) {
            grayConstraints.push(letter);
          }
          break;
        default:
          break;
      }
    });
  });
  return { green: greenConstraints, yellow: yellowConstraints, gray: grayConstraints };
}

function logAllTilesNY() {
  const gameRows = document.querySelectorAll('[class*="Row-module_row"]');

  console.log('=== NY TIMES WORDLE STATE ===');
  gameRows.forEach((row, rowIndex) => {
    const tiles = row.querySelectorAll('[data-testid="tile"]');
    const rowLetters = [];
    let hasEvaluatedTiles = false;

    tiles.forEach((tile, colIndex) => {
      const state = tile.getAttribute('data-state');
      const label = tile.getAttribute('aria-label');
      const letter = label?.match(/letter, ([A-Z])/)?.[1];

      // Only process tiles with evaluated states (skip empty, tbd, etc.)
      if (letter && (state === 'correct' || state === 'closed' || state === 'present' || state === 'absent')) {
        hasEvaluatedTiles = true;

        const stateIcon = state === 'correct' || state === 'closed' ? '🟩' :
                         state === 'present' ? '🟨' :
                         state === 'absent' ? '⬜' : '⬛';

        rowLetters.push(`${letter}${stateIcon}`);
        console.log(`  [${rowIndex},${colIndex}] ${letter} ${stateIcon} ${state}`);
      }
    });

    // Only show row summary if it has evaluated tiles
    if (hasEvaluatedTiles && rowLetters.length > 0) {
      console.log(`Row ${rowIndex}: ${rowLetters.join(' ')}`);
    }
  });
  console.log('========================');
}

function logAllTilesWU() {
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

function extractConstraints() {
  const variant = detectWordleVariant();

  switch (variant) {
    case 'nytimes':
      return extractConstraintsNY();
    case 'wordleunlimited':
      return extractConstraintsWU();
    default:
      return { green: {}, yellow: {}, gray: [] };
  }
}

function extractConstraintsWU() {
  const gameApp = document.querySelector('game-app');
  if (!gameApp || !gameApp.shadowRoot) {
    console.log('Game not loaded yet');
    return {};
  }

  const shadowRoot = gameApp.shadowRoot;
  const gameRows = shadowRoot.querySelectorAll('game-row[letters]');
  const greenConstraints = {};
  const yellowConstraints = {};
  const grayConstraints = [];

  gameRows.forEach((row, rowIndex) => {
    const word = row.getAttribute('letters');
    if (word && row.shadowRoot) {
      const tiles = row.shadowRoot.querySelectorAll('game-tile');
      tiles.forEach((tile, colIndex) => {
        const letter = tile.getAttribute('letter');
        const evaluation = tile.getAttribute('evaluation');

        switch (evaluation) {
          case 'correct':
            greenConstraints[colIndex] = letter.toUpperCase();
            break;
          case 'present':
            if (!yellowConstraints[letter.toUpperCase()]) {
              yellowConstraints[letter.toUpperCase()] = [];
            }
            yellowConstraints[letter.toUpperCase()].push(colIndex);
            break;          
          case 'absent':
            grayConstraints.push(letter.toUpperCase());
            break;
          default:
            break;
        }
      });
    }
  });
  return { green: greenConstraints, yellow: yellowConstraints, gray: grayConstraints };
}

function startAutoplay() {
  const variant = detectWordleVariant();

  switch (variant) {
    case 'nytimes':
      return startAutoplayNY();
    case 'wordleunlimited':
      return startAutoplayWU();
    default:
      console.log('Autoplay not supported for this Wordle variant');
      return;
  }
}

function startAutoplayNY() {
  let previousCompletedRows = 0;
  let tileObservers = [];

  function checkForNewCompletedRows() {
    const gameRows = document.querySelectorAll('[class*="Row-module_row"]');
    let completedRows = 0;

    gameRows.forEach(row => {
      const tiles = row.querySelectorAll('[data-testid="tile"]');
      let evaluatedTiles = 0;

      tiles.forEach(tile => {
        const state = tile.getAttribute('data-state');
        if (state === 'correct' || state === 'closed' || state === 'present' || state === 'absent') {
          evaluatedTiles++;
        }
      });

      if (evaluatedTiles === 5) {
        completedRows++;
      }
    });

    if (completedRows > previousCompletedRows) {
      console.log(`Row ${completedRows} completed! Updating constraints...`);
      previousCompletedRows = completedRows;

      // Only auto-update if autoplay is active
      if (typeof autoplayActive === 'undefined' || autoplayActive) {
        setTimeout(() => {
          filterAndDisplay();
        }, 300);
      }
    }
  }

  function setupTileObservers() {
    // Clear existing observers
    tileObservers.forEach(obs => obs.disconnect());
    tileObservers = [];

    const gameRows = document.querySelectorAll('[class*="Row-module_row"]');

    gameRows.forEach(row => {
      const tiles = row.querySelectorAll('[data-testid="tile"]');

      tiles.forEach(tile => {
        const tileObserver = new MutationObserver(() => {
          checkForNewCompletedRows();
        });

        tileObserver.observe(tile, {
          attributes: true,
          attributeFilter: ['data-state']
        });

        tileObservers.push(tileObserver);
      });
    });
  }

  setupTileObservers();
  console.log('NY Times tile observers started - now play a word!');
}

function startAutoplayWU() {
  const gameApp = document.querySelector('game-app');
  if (!gameApp || !gameApp.shadowRoot) {
    console.log('WordleUnlimited game not loaded yet');
    return;
  }

  let previousCompletedRows = 0;
  let tileObservers = [];

  function checkForNewCompletedRows() {
    const gameRows = gameApp.shadowRoot.querySelectorAll('game-row[letters]');
    let completedRows = 0;

    gameRows.forEach(row => {
      if (row.shadowRoot) {
        const tiles = row.shadowRoot.querySelectorAll('game-tile');
        let evaluatedTiles = 0;

        tiles.forEach(tile => {
          if (tile.getAttribute('evaluation')) {
            evaluatedTiles++;
          }
        });

        if (evaluatedTiles === 5) {
          completedRows++;
        }
      }
    });

    if (completedRows > previousCompletedRows) {
      console.log(`Row ${completedRows} completed! Updating constraints...`);
      previousCompletedRows = completedRows;

      // Only auto-update if autoplay is active
      if (typeof autoplayActive === 'undefined' || autoplayActive) {
        setTimeout(() => {
          filterAndDisplay();
        }, 300);
      }
    }
  }

  function setupTileObservers() {
    // Clear existing observers
    tileObservers.forEach(obs => obs.disconnect());
    tileObservers = [];

    const gameRows = gameApp.shadowRoot.querySelectorAll('game-row');

    gameRows.forEach(row => {
      if (row.shadowRoot) {
        const tiles = row.shadowRoot.querySelectorAll('game-tile');

        tiles.forEach(tile => {
          const tileObserver = new MutationObserver(() => {
            checkForNewCompletedRows();
          });

          tileObserver.observe(tile, {
            attributes: true,
            attributeFilter: ['evaluation']
          });

          tileObservers.push(tileObserver);
        });
      }
    });
  }

  setupTileObservers();

  // Also watch for new rows being added (in case game structure changes)
  const structureObserver = new MutationObserver(() => {
    setupTileObservers(); // Re-setup observers when structure changes
  });

  structureObserver.observe(gameApp.shadowRoot, {
    childList: true,
    subtree: true
  });

  console.log('WordleUnlimited tile observers started - now play a word!');
}