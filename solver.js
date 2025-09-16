// Wordle Solver Logic
// Handles word filtering, constraint matching, and suggestion algorithms

function cleanConstraints(constraints) {
  const greenLetters = new Set(Object.values(constraints.green));

  // Remove grays that are green elsewhere
  constraints.gray = constraints.gray.filter(letter => !greenLetters.has(letter));

  // Remove yellows that are green elsewhere
  for (const greenLetter of greenLetters) {
    delete constraints.yellow[greenLetter];
  }

  return constraints;
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

function matchesYellowConstraints(word, constraints) {
  const uppercaseWord = word.toUpperCase();
  for (const [letter, positions] of Object.entries(constraints)) {
    if (!uppercaseWord.includes(letter)) {
      return false;
    }
    for (const pos of positions) {
      if (uppercaseWord[pos] === letter) {
        return false;
      }
    }
  }
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