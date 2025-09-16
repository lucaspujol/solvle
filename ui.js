// UI Management
// Handles overlay creation, word display, and pagination

let overlayVisible = true;

// Pagination state
let currentWords = [];
let currentPage = 0;
const wordsPerPage = 10;

function displayWords(words, page) {
  const startIndex = page * wordsPerPage;
  const endIndex = startIndex + wordsPerPage;
  const pagesWords = words.slice(startIndex, endIndex);
  const wordListDiv = document.getElementById('word-list');
  if (pagesWords.length > 0) {
    wordListDiv.innerHTML = pagesWords.join('<br>');
  } else {
    wordListDiv.innerHTML = 'No words found.';
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
  const constraints = extractConstraints();
  currentWords = filterWords(constraints.green, constraints.yellow, constraints.gray);
  console.log('Green constraints:', constraints.green);
  console.log('Yellow constraints:', constraints.yellow);
  console.log('Gray constraints:', constraints.gray);
  console.log('Filtered words:', currentWords.length);
  if (currentWords.length > 0) {
    const firstTenWords = currentWords.slice(0, 10);
    console.log('First 10 filtered words:', firstTenWords);
  }
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
  text.textContent = 'Solvle!';

  const logTilesButton = document.createElement('button');
  logTilesButton.textContent = 'Log all tiles'
  logTilesButton.id = 'log-tiles-button';
  logTilesButton.addEventListener('click', function() {
    logAllTiles();
  });

  // Word suggestion button
  const suggestButton = document.createElement('button');
  suggestButton.textContent = 'Find Words';
  suggestButton.id = 'suggest-button';
  suggestButton.addEventListener('click', function() {
    filterAndDisplay();
  });

  // Word list display area
  const wordListDiv = document.createElement('div');
  wordListDiv.id = 'word-list';
  wordListDiv.style.cssText = 'margin: 10px 0; min-height: 200px; border: 1px solid #ccc; padding: 10px;';

  // Navigation controls
  const navDiv = document.createElement('div');
  navDiv.id = 'navigation';
  navDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-top: 10px;';

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
  overlay.appendChild(logTilesButton);
  overlay.appendChild(wordListDiv);
  overlay.appendChild(navDiv);
  document.body.appendChild(overlay);
}

function toggleOverlay() {
  const overlay = document.getElementById('hello-world-overlay');
  if (overlay) {
    overlayVisible = !overlayVisible;
    overlay.style.display = overlayVisible ? 'flex' : 'none';
  }
}