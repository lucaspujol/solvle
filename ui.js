let overlayVisible = true;
let currentWords = [];
let currentPage = 0;
const wordsPerPage = 5;

function updateUIForMode(mode) {
  const overlay = document.getElementById('hello-world-overlay');
  const randomButton = document.getElementById('random-button');

  if (mode === 'helper') {
    if (overlay) overlay.className = 'helper-mode';

    if (randomButton) {
      randomButton.textContent = 'Random Start Word';
      randomButton.onclick = () => getRandomWord();
    }

    filterAndDisplay();
    showWordCount();
  } else {
    if (overlay) overlay.className = 'solver-mode';

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

function displayWords(words, page) {
  const startIndex = page * wordsPerPage;
  const pagesWords = words.slice(startIndex, startIndex + wordsPerPage);
  const wordListDiv = document.getElementById('word-list');

  wordListDiv.textContent = '';

  pagesWords.forEach(word => {
    const wordDiv = document.createElement('div');
    wordDiv.className = 'word-entry clickable-word';
    wordDiv.dataset.word = word;
    wordDiv.textContent = word.toUpperCase();
    wordListDiv.appendChild(wordDiv);
  });

  wordListDiv.querySelectorAll('.clickable-word').forEach(entry => {
    entry.addEventListener('click', function() {
      autoTypeWord(this.dataset.word);
    });
  });
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
  if (document.getElementById('hello-world-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'hello-world-overlay';

  const savedPosition = localStorage.getItem('solvle-overlay-position');
  if (savedPosition) {
    try {
      const position = JSON.parse(savedPosition);
      const maxLeft = window.innerWidth - 350;
      const maxTop = window.innerHeight - 200;

      if (position.left >= 0 && position.left <= maxLeft &&
          position.top >= 0 && position.top <= maxTop) {
        overlay.style.top = position.top + 'px';
        overlay.style.left = position.left + 'px';
        overlay.style.right = 'auto';
      }
    } catch (e) {
      // Use default position
    }
  }

  const header = document.createElement('div');
  header.className = 'solvle-header';
  header.id = 'solvle-header';

  const text = document.createElement('div');
  text.className = 'header-content';

  const headerLetters = [
    { letter: 'S', color: 'green' },
    { letter: 'O', color: 'yellow' },
    { letter: 'L', color: 'gray' },
    { letter: 'V', color: 'green' },
    { letter: 'L', color: 'yellow' },
    { letter: 'E', color: 'green' }
  ];

  headerLetters.forEach(({ letter, color }) => {
    const tile = document.createElement('div');
    tile.className = `header-tile ${color}`;
    tile.textContent = letter;
    text.appendChild(tile);
  });

  header.appendChild(text);

  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };

  header.addEventListener('mousedown', (e) => {
    isDragging = true;
    const rect = overlay.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    overlay.style.left = (e.clientX - dragOffset.x) + 'px';
    overlay.style.top = (e.clientY - dragOffset.y) + 'px';
    overlay.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      const rect = overlay.getBoundingClientRect();
      localStorage.setItem('solvle-overlay-position', JSON.stringify({
        top: rect.top,
        left: rect.left
      }));
    }
  });

  const suggestButton = document.createElement('button');
  suggestButton.textContent = 'Find Words';
  suggestButton.id = 'suggest-button';
  suggestButton.className = 'solvle-button';
  suggestButton.addEventListener('click', () => filterAndDisplay());

  const randomButton = document.createElement('button');
  randomButton.textContent = 'Random Word';
  randomButton.id = 'random-button';
  randomButton.className = 'solvle-button';
  randomButton.addEventListener('click', () => {
    if (currentWords.length > 0) {
      const randomWord = currentWords[Math.floor(Math.random() * currentWords.length)];
      highlightRandomWord(randomWord);
    }
  });

  const wordListDiv = document.createElement('div');
  wordListDiv.id = 'word-list';

  const randomWordDiv = document.createElement('div');
  randomWordDiv.id = 'random-word-display';
  randomWordDiv.innerHTML = '<div class="random-word-label">Random Suggestion:</div><div class="random-word-text">Click "Random Word" for suggestion</div>';

  const navDiv = document.createElement('div');
  navDiv.id = 'navigation';

  const prevButton = document.createElement('button');
  prevButton.textContent = '< Prev';
  prevButton.id = 'prev-button';
  prevButton.addEventListener('click', () => {
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
  nextButton.addEventListener('click', () => {
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

  overlay.appendChild(header);
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
      setTimeout(typeNextLetter, 100);
    } else {
      setTimeout(() => simulateEnterKey(), 200);
    }
  }

  typeNextLetter();
}

function highlightRandomWord(randomWord, clickable = true) {
  const randomWordTextDiv = document.querySelector('.random-word-text');
  if (!randomWordTextDiv) return;

  randomWordTextDiv.textContent = randomWord.toUpperCase();

  if (clickable) {
    randomWordTextDiv.classList.add('clickable-word');
    randomWordTextDiv.onclick = () => autoTypeWord(randomWord);
  } else {
    randomWordTextDiv.classList.remove('clickable-word');
    randomWordTextDiv.onclick = null;
  }

  randomWordTextDiv.classList.add('random-word-highlight');
  setTimeout(() => randomWordTextDiv.classList.remove('random-word-highlight'), 1000);
}

function showWordCount() {
  let wordCountDiv = document.getElementById('word-count');
  if (!wordCountDiv) {
    wordCountDiv = document.createElement('div');
    wordCountDiv.id = 'word-count';
    document.getElementById('hello-world-overlay').appendChild(wordCountDiv);
  }

  wordCountDiv.textContent = `${currentWords.length} possible words`;
  wordCountDiv.style.display = 'block';
}

function hideWordCount() {
  const wordCountDiv = document.getElementById('word-count');
  if (wordCountDiv) wordCountDiv.style.display = 'none';
}

function getRandomWord() {
  const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
  highlightRandomWord(randomWord, false);
}

function getRandomFilteredWord() {
  if (currentWords.length > 0) {
    const randomWord = currentWords[Math.floor(Math.random() * currentWords.length)];
    highlightRandomWord(randomWord, true);
  }
}
