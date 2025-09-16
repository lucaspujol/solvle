// Wordle Solver Logic
// Handles word filtering, constraint matching, and suggestion algorithms

// Global word list reference (allWords is loaded from wordle-answers-alphabetical.js)

function loadWordList() {
  // Words are already loaded from the external JS file as const allWords
  // No need to reassign, just log for debugging
  console.log('Words loaded:', allWords.length);
}

function matchesGreenConstraints(word, constraints) {
  const uppercaseWord = word.toUpperCase();
  for (const [position, letter] of Object.entries(constraints)) {
    if (uppercaseWord[position] !== letter) {
      return false;
    }
  }
  return true;
}

// Future: Add functions for yellow/gray constraints
function matchesYellowConstraints(word, constraints) {
  // TODO: Implement yellow letter constraints
  return true;
}

function matchesGrayConstraints(word, constraints) {
  // TODO: Implement gray (absent) letter constraints
  return true;
}

function filterWords(greenConstraints, yellowConstraints = {}, grayConstraints = []) {
  return allWords.filter(word => {
    return matchesGreenConstraints(word, greenConstraints) &&
           matchesYellowConstraints(word, yellowConstraints) &&
           matchesGrayConstraints(word, grayConstraints);
  });
}

// Future: Add word scoring/ranking
function scoreWords(validWords) {
  // TODO: Implement word scoring based on:
  // - Letter frequency
  // - Information gain
  // - Word commonality
  return validWords;
}