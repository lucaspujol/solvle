function detectWordleVariant() {
  const hostname = window.location.hostname;

  if (hostname.includes('wordleunlimited')) {
    return 'wordleunlimited';
  } else if (hostname.includes('nytimes')) {
    return 'nytimes';
  } else {
    return 'unknown';
  }
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

function extractConstraintsNY() {
  const greenConstraints = {};
  const yellowConstraints = {};
  const grayConstraints = [];

  const gameRows = document.querySelectorAll('[class*="Row-module_row"]');

  gameRows.forEach((row) => {
    const tiles = row.querySelectorAll('[data-testid="tile"]');

    const rowGreenLetters = new Set();
    const rowYellowLetters = new Set();

    tiles.forEach((tile) => {
      const state = tile.getAttribute('data-state');
      const label = tile.getAttribute('aria-label');
      const letter = label?.match(/letter, ([A-Z])/)?.[1];
      if (!letter) return;

      if (state === 'correct' || state === 'closed') {
        rowGreenLetters.add(letter);
      } else if (state === 'present') {
        rowYellowLetters.add(letter);
      }
    });

    tiles.forEach((tile, colIndex) => {
      const state = tile.getAttribute('data-state');
      const label = tile.getAttribute('aria-label');
      const letter = label?.match(/letter, ([A-Z])/)?.[1];
      if (!letter) return;

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
          if (!rowGreenLetters.has(letter) && !rowYellowLetters.has(letter)) {
            if (!grayConstraints.includes(letter)) {
              grayConstraints.push(letter);
            }
          }
          break;
      }
    });
  });

  return { green: greenConstraints, yellow: yellowConstraints, gray: grayConstraints };
}

function extractConstraintsWU() {
  const gameApp = document.querySelector('game-app');
  if (!gameApp || !gameApp.shadowRoot) {
    return {};
  }

  const shadowRoot = gameApp.shadowRoot;
  const gameRows = shadowRoot.querySelectorAll('game-row[letters]');
  const greenConstraints = {};
  const yellowConstraints = {};
  const grayConstraints = [];

  gameRows.forEach((row) => {
    const word = row.getAttribute('letters');
    if (!word || !row.shadowRoot) return;

    const tiles = row.shadowRoot.querySelectorAll('game-tile');

    const rowGreenLetters = new Set();
    const rowYellowLetters = new Set();

    tiles.forEach((tile) => {
      const letter = tile.getAttribute('letter');
      const evaluation = tile.getAttribute('evaluation');

      if (evaluation === 'correct') {
        rowGreenLetters.add(letter.toUpperCase());
      } else if (evaluation === 'present') {
        rowYellowLetters.add(letter.toUpperCase());
      }
    });

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
          const upperLetter = letter.toUpperCase();
          if (!rowGreenLetters.has(upperLetter) && !rowYellowLetters.has(upperLetter)) {
            if (!grayConstraints.includes(upperLetter)) {
              grayConstraints.push(upperLetter);
            }
          }
          break;
      }
    });
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

      if (evaluatedTiles === 5) completedRows++;
    });

    if (completedRows > previousCompletedRows) {
      previousCompletedRows = completedRows;
      setTimeout(() => {
        filterAndDisplay();
        if (typeof currentMode !== 'undefined' && currentMode === 'helper') {
          showWordCount();
        }
      }, 300);
    }
  }

  function setupTileObservers() {
    tileObservers.forEach(obs => obs.disconnect());
    tileObservers = [];

    const gameRows = document.querySelectorAll('[class*="Row-module_row"]');

    gameRows.forEach(row => {
      const tiles = row.querySelectorAll('[data-testid="tile"]');
      tiles.forEach(tile => {
        const observer = new MutationObserver(() => checkForNewCompletedRows());
        observer.observe(tile, { attributes: true, attributeFilter: ['data-state'] });
        tileObservers.push(observer);
      });
    });
  }

  setupTileObservers();
}

function startAutoplayWU() {
  const gameApp = document.querySelector('game-app');
  if (!gameApp || !gameApp.shadowRoot) return;

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
          if (tile.getAttribute('evaluation')) evaluatedTiles++;
        });

        if (evaluatedTiles === 5) completedRows++;
      }
    });

    if (completedRows > previousCompletedRows) {
      previousCompletedRows = completedRows;
      setTimeout(() => {
        filterAndDisplay();
        if (typeof currentMode !== 'undefined' && currentMode === 'helper') {
          showWordCount();
        }
      }, 300);
    }
  }

  function setupTileObservers() {
    tileObservers.forEach(obs => obs.disconnect());
    tileObservers = [];

    const gameRows = gameApp.shadowRoot.querySelectorAll('game-row');

    gameRows.forEach(row => {
      if (row.shadowRoot) {
        const tiles = row.shadowRoot.querySelectorAll('game-tile');
        tiles.forEach(tile => {
          const observer = new MutationObserver(() => checkForNewCompletedRows());
          observer.observe(tile, { attributes: true, attributeFilter: ['evaluation'] });
          tileObservers.push(observer);
        });
      }
    });
  }

  setupTileObservers();

  const structureObserver = new MutationObserver(() => setupTileObservers());
  structureObserver.observe(gameApp.shadowRoot, { childList: true, subtree: true });
}
