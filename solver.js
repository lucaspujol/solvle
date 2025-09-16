// Wordle Solver Logic
// Handles word filtering, constraint matching, and suggestion algorithms

// Global word list reference (allWords is loaded from wordle-answers-alphabetical.js)

// loadWordList() removed - allWords is already available globally

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
  const uppercaseWord = word.toUpperCase();
  for (const letter of constraints) {
    if (uppercaseWord.includes(letter)) {
      return false;
    }  
  }
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