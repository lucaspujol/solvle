// Wordle Game State Management
// Handles interaction with the Wordle game DOM and extracting game constraints

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

function extractConstraints() {
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