// UI Management
// Handles overlay creation, word display, and pagination

let overlayVisible = true;

function updateUIForMode(mode) {
  const overlay = document.getElementById('hello-world-overlay');
  const randomButton = document.getElementById('random-button');

  if (mode === 'helper') {
    // Apply helper mode styling
    if (overlay) {
      overlay.className = 'helper-mode';
    }

    if (randomButton) {
      randomButton.textContent = 'Random Start Word';
      randomButton.onclick = () => getRandomWord();
    }

    // Update word count by running filter but only showing count
    filterAndDisplay();
    showWordCount();
  } else {
    // Apply solver mode styling
    if (overlay) {
      overlay.className = 'solver-mode';
    }

    if (randomButton) {
      randomButton.textContent = 'Random Word';
      randomButton.onclick = () => getRandomFilteredWord();
    }

    hideWordCount();
    if (currentWords.length > 0) {
      displayWords(currentWords, currentPage);
      updatePagination();
    }
  }
}

// Pagination state
let currentWords = [];
let currentPage = 0;
const wordsPerPage = 5;

function displayWords(words, page) {
  const startIndex = page * wordsPerPage;
  const endIndex = startIndex + wordsPerPage;
  const pagesWords = words.slice(startIndex, endIndex);
  const wordListDiv = document.getElementById('word-list');
  if (pagesWords.length > 0) {
    wordListDiv.innerHTML = pagesWords
      .map(word => `<div class="word-entry clickable-word" data-word="${word}">${word.toUpperCase()}</div>`)
      .join('');

    // Add click listeners to words
    const wordEntries = wordListDiv.querySelectorAll('.clickable-word');
    wordEntries.forEach(entry => {
      entry.addEventListener('click', function() {
        const word = this.getAttribute('data-word');
        autoTypeWord(word);
      });
    });
  } else {
    wordListDiv.innerHTML = '';
  }
}

function updatePagination() {
  const totalPages = Math.ceil(currentWords.length / wordsPerPage);
  const pageInfo = document.getElementById('page-info');
  if (totalPages === 0) {
    pageInfo.textContent = `Page ${currentPage + 1} out of ${totalPages + 1}`;
  } else {
    pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages}`;
  }
  document.getElementById('prev-button').disabled = currentPage === 0;
  document.getElementById('next-button').disabled = currentPage >= totalPages - 1;
}

function filterAndDisplay() {
  const rawConstraints = extractConstraints();
  const constraints = cleanConstraints(rawConstraints);
  currentWords = filterWords(constraints.green, constraints.yellow, constraints.gray);
  currentWords = sortWords(currentWords, constraints.green, constraints.yellow);
  currentPage = 0;
  displayWords(currentWords, currentPage);
  updatePagination();
}

function createOverlay() {
  if (document.getElementById('hello-world-overlay')) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'hello-world-overlay';

  const text = document.createElement('div');
  // Create colored header tiles for "SOLVLE"
  const headerLetters = [
    { letter: 'S', color: 'green' },
    { letter: 'O', color: 'yellow' },
    { letter: 'L', color: 'gray' },
    { letter: 'V', color: 'green' },
    { letter: 'L', color: 'yellow' },
    { letter: 'E', color: 'green' }
  ];

  text.innerHTML = headerLetters
    .map(({ letter, color }) => `<div class="header-tile ${color}">${letter}</div>`)
    .join('');

  // Word suggestion button
  const suggestButton = document.createElement('button');
  suggestButton.textContent = 'Find Words';
  suggestButton.id = 'suggest-button';
  suggestButton.className = 'solvle-button';
  suggestButton.addEventListener('click', function() {
    filterAndDisplay();
  });

  // Random word button
  const randomButton = document.createElement('button');
  randomButton.textContent = 'Random Word';
  randomButton.id = 'random-button';
  randomButton.className = 'solvle-button';
  randomButton.addEventListener('click', function() {
    if (currentWords.length > 0) {
      const randomWord = currentWords[Math.floor(Math.random() * currentWords.length)];
      highlightRandomWord(randomWord);
    }
  });

  // Word list display area
  const wordListDiv = document.createElement('div');
  wordListDiv.id = 'word-list';

  // Random word display area
  const randomWordDiv = document.createElement('div');
  randomWordDiv.id = 'random-word-display';
  randomWordDiv.innerHTML = '<div class="random-word-label">Random Suggestion:</div><div class="random-word-text">Click "Random Word" for suggestion</div>';

  // Navigation controls
  const navDiv = document.createElement('div');
  navDiv.id = 'navigation';

  const prevButton = document.createElement('button');
  prevButton.textContent = '< Prev';
  prevButton.id = 'prev-button';
  prevButton.addEventListener('click', function() {
    if (currentPage > 0) {
      currentPage--;
      displayWords(currentWords, currentPage);
      updatePagination();
    }
  });

  const pageInfo = document.createElement('span');
  pageInfo.id = 'page-info';
  pageInfo.textContent = 'Page 0 of 0';

  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next >';
  nextButton.id = 'next-button';
  nextButton.addEventListener('click', function() {
    const totalPages = Math.ceil(currentWords.length / wordsPerPage);
    if (currentPage < totalPages - 1) {
      currentPage++;
      displayWords(currentWords, currentPage);
      updatePagination();
    }
  });

  navDiv.appendChild(prevButton);
  navDiv.appendChild(pageInfo);
  navDiv.appendChild(nextButton);

  overlay.appendChild(text);
  overlay.appendChild(suggestButton);
  overlay.appendChild(wordListDiv);
  overlay.appendChild(navDiv);
  overlay.appendChild(randomButton);
  overlay.appendChild(randomWordDiv);
  document.body.appendChild(overlay);
}

function toggleOverlay() {
  const overlay = document.getElementById('hello-world-overlay');
  if (overlay) {
    overlayVisible = !overlayVisible;
    overlay.style.display = overlayVisible ? 'flex' : 'none';
  }
}

// Auto-type functionality
function simulateKeyPress(key) {
  const keyEvent = new KeyboardEvent('keydown', {
    key: key,
    code: `Key${key.toUpperCase()}`,
    keyCode: key.toUpperCase().charCodeAt(0),
    which: key.toUpperCase().charCodeAt(0),
    bubbles: true,
    cancelable: true
  });
  document.dispatchEvent(keyEvent);

  const keyUpEvent = new KeyboardEvent('keyup', {
    key: key,
    code: `Key${key.toUpperCase()}`,
    keyCode: key.toUpperCase().charCodeAt(0),
    which: key.toUpperCase().charCodeAt(0),
    bubbles: true,
    cancelable: true
  });
  document.dispatchEvent(keyUpEvent);
}

function simulateEnterKey() {
  const enterEvent = new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    which: 13,
    bubbles: true,
    cancelable: true
  });
  document.dispatchEvent(enterEvent);

  const enterUpEvent = new KeyboardEvent('keyup', {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    which: 13,
    bubbles: true,
    cancelable: true
  });
  document.dispatchEvent(enterUpEvent);
}

function autoTypeWord(word) {
  const letters = word.toUpperCase().split('');
  let index = 0;

  function typeNextLetter() {
    if (index < letters.length) {
      simulateKeyPress(letters[index]);
      index++;
      setTimeout(typeNextLetter, 100); // 100ms delay between letters
    } else {
      // Submit the word after typing
      setTimeout(() => {
        simulateEnterKey();
      }, 200);
    }
  }

  typeNextLetter();
}

function highlightRandomWord(randomWord, clickable = true) {
  const randomWordTextDiv = document.querySelector('.random-word-text');
  if (randomWordTextDiv) {
    // Display the random word in the dedicated area
    randomWordTextDiv.textContent = randomWord.toUpperCase();

    if (clickable) {
      randomWordTextDiv.classList.add('clickable-word');
      // Make it clickable to auto-type
      randomWordTextDiv.onclick = () => autoTypeWord(randomWord);
    } else {
      randomWordTextDiv.classList.remove('clickable-word');
      // Remove click handler
      randomWordTextDiv.onclick = null;
    }

    // Add flash animation
    randomWordTextDiv.classList.add('random-word-highlight');
    setTimeout(() => {
      randomWordTextDiv.classList.remove('random-word-highlight');
    }, 1000);
  }
}

// TODO(human): Add the four helper functions here:
// showWordCount(), hideWordCount(), getRandomStartWord(), getRandomFilteredWord()
function showWordCount() {
  let wordCountDiv = document.getElementById('word-count');
  if (!wordCountDiv) {
    wordCountDiv = document.createElement('div');
    wordCountDiv.id = 'word-count';
    const overlay = document.getElementById('hello-world-overlay');
    overlay.appendChild(wordCountDiv);
  }

  const totalWords = currentWords.length;
  wordCountDiv.textContent = `${totalWords} possible words`;
  wordCountDiv.style.display = 'block';
}

function hideWordCount() {
  const wordCountDiv = document.getElementById('word-count');
  if (wordCountDiv) {
    wordCountDiv.style.display = 'none';
  }
}

function getRandomWord() {
  const randomWord = allWords[Math.floor(Math.random() * allWords.length)]
  highlightRandomWord(randomWord, false); // Non-clickable in Helper mode
}

function getRandomFilteredWord() {
  if (currentWords.length > 0) {
    const randomWord = currentWords[Math.floor(Math.random() * currentWords.length)];
    highlightRandomWord(randomWord, true); // Clickable in Solver mode
  }
}