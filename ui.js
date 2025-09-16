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
  loadWordList();
  const greenConstraints = extractGreenConstraints();
  currentWords = allWords.filter(word => matchesGreenConstraints(word, greenConstraints));
  console.log('Word list loaded:', allWords);
  console.log('Green constraints:', greenConstraints);
  console.log('Filtered words:', currentWords.length);
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