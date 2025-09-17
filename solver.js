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
    // Debug yellow constraint checking
    if (word === 'ABOUT' || word === 'BOARD' || word === 'PROBE') {
      console.log(`Checking yellow for "${word}": letter=${letter}, positions=${positions}`);
      console.log(`  Word contains ${letter}:`, uppercaseWord.includes(letter));
    }

    if (!uppercaseWord.includes(letter)) {
      return false;
    }
    for (const pos of positions) {
      if (uppercaseWord[pos] === letter) {
        if (word === 'ABOUT' || word === 'BOARD' || word === 'PROBE') {
          console.log(`  ${letter} found at forbidden position ${pos}`);
        }
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
  console.log('=== WORD FILTERING DEBUG ===');
  console.log('Input constraints:');
  console.log('  Green:', greenConstraints);
  console.log('  Yellow:', yellowConstraints);
  console.log('  Gray:', grayConstraints);
  console.log('Total words to filter:', allWords.length);

  const filteredWords = allWords.filter(word => {
    const greenMatch = matchesGreenConstraints(word, greenConstraints);
    const yellowMatch = matchesYellowConstraints(word, yellowConstraints);
    const grayMatch = matchesGrayConstraints(word, grayConstraints);

    // Debug first few words that fail
    if (!greenMatch || !yellowMatch || !grayMatch) {
      if (allWords.indexOf(word) < 5) {
        console.log(`Word "${word}" failed:`, {
          green: greenMatch,
          yellow: yellowMatch,
          gray: grayMatch
        });
      }
    }

    return greenMatch && yellowMatch && grayMatch;
  });

  console.log('Filtered words count:', filteredWords.length);
  console.log('First 10 filtered words:', filteredWords.slice(0, 10));
  console.log('===========================');

  return filteredWords;
}

function sortWords(words, greenConstraints, yellowConstraints) {
  // 1. Find already-discovered letters
  const knownLetters = new Set(Object.values(greenConstraints));
  const yellowLetters = new Set(Object.keys(yellowConstraints))
  yellowLetters.forEach(letter => {
    knownLetters.add(letter);
  })

  if (knownLetters.size === 5) {
    return words;
  }

  // 2. Score words by letter frequency of new letters
  const scores = [];
  for (const word of words) {
    const newLetters = new Set([...word].filter(letter => !knownLetters.has(letter)));
    let score = 0;
    for (const letter of newLetters) {
      score += letterFrequencies[letter.toLowerCase()] || 0;
    }
    scores.push({ word, score });
  }

  // 3. Sort by score descending
  scores.sort((a, b) => b.score - a.score);
  const sortedWords = scores.map(item => item.word);

  return sortedWords;
}