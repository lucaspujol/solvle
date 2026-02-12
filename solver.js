function cleanConstraints(constraints) {
  const greenLetters = new Set(Object.values(constraints.green));

  constraints.gray = constraints.gray.filter(letter => !greenLetters.has(letter));

  const cleanedYellows = {};
  for (const [letter, positions] of Object.entries(constraints.yellow)) {
    const greenPositions = Object.keys(constraints.green)
      .filter(pos => constraints.green[pos] === letter)
      .map(pos => parseInt(pos));

    const validYellowPositions = positions.filter(pos => !greenPositions.includes(pos));

    if (validYellowPositions.length > 0) {
      cleanedYellows[letter] = validYellowPositions;
    }
  }
  constraints.yellow = cleanedYellows;

  return constraints;
}

function matchesGreenConstraints(word, constraints) {
  const uppercaseWord = word.toUpperCase();
  for (const [position, letter] of Object.entries(constraints)) {
    if (uppercaseWord[position] !== letter) return false;
  }
  return true;
}

function matchesYellowConstraints(word, constraints) {
  const uppercaseWord = word.toUpperCase();
  for (const [letter, positions] of Object.entries(constraints)) {
    if (!uppercaseWord.includes(letter)) return false;
    for (const pos of positions) {
      if (uppercaseWord[pos] === letter) return false;
    }
  }
  return true;
}

function matchesGrayConstraints(word, constraints) {
  const uppercaseWord = word.toUpperCase();
  for (const letter of constraints) {
    if (uppercaseWord.includes(letter)) return false;
  }
  return true;
}

function filterWords(greenConstraints, yellowConstraints = {}, grayConstraints = []) {
  return allWords.filter(word => {
    return matchesGreenConstraints(word, greenConstraints)
      && matchesYellowConstraints(word, yellowConstraints)
      && matchesGrayConstraints(word, grayConstraints);
  });
}

function sortWords(words, greenConstraints, yellowConstraints) {
  const knownLetters = new Set(Object.values(greenConstraints));
  Object.keys(yellowConstraints).forEach(letter => knownLetters.add(letter));

  if (knownLetters.size === 5) return words;

  const scores = words.map(word => {
    let score = 0;
    for (let pos = 0; pos < word.length; pos++) {
      const letter = word[pos];
      if (!knownLetters.has(letter)) {
        score += letterFrequencies[letter.toLowerCase()][pos] || 0;
      }
    }
    return { word, score };
  });

  scores.sort((a, b) => b.score - a.score);
  return scores.map(item => item.word);
}
