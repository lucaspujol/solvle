/**
 * Fixed Test Framework
 * Addresses the early stopping bug and adds fallback strategies
 */

const fs = require('fs');
const path = require('path');

// Load word list from existing extension file
class WordLoader {
  static loadWords() {
    try {
      const filePath = path.join(__dirname, '..', 'wordle-answers-alphabetical.js');
      const content = fs.readFileSync(filePath, 'utf8');

      // Extract the allWords array from the JavaScript file
      const match = content.match(/const\s+allWords\s*=\s*(\[[\s\S]*?\]);/);
      if (match) {
        // Parse the JavaScript array
        const wordsArray = eval(match[1]);
        return wordsArray;
      }
      throw new Error('Could not parse word list from extension file');
    } catch (error) {
      console.error('Error loading words:', error.message);
      throw error;
    }
  }
}

// Wordle game simulator with better logging
class ImprovedWordleSimulator {
  constructor(targetWord) {
    this.targetWord = targetWord.toUpperCase();
    this.guesses = [];
    this.maxGuesses = 6;
    this.gameOver = false;
    this.won = false;
  }

  makeGuess(guess) {
    if (this.gameOver || this.guesses.length >= this.maxGuesses) {
      return null;
    }

    guess = guess.toUpperCase();
    this.guesses.push(guess);

    // Generate constraints for this guess
    const result = this.evaluateGuess(guess);

    // Check win condition
    if (guess === this.targetWord) {
      this.won = true;
      this.gameOver = true;
    } else if (this.guesses.length >= this.maxGuesses) {
      this.gameOver = true;
    }

    return result;
  }

  evaluateGuess(guess) {
    const result = [];
    const targetLetters = [...this.targetWord];
    const guessLetters = [...guess];

    // First pass: mark exact matches (green)
    for (let i = 0; i < 5; i++) {
      if (guessLetters[i] === targetLetters[i]) {
        result[i] = { letter: guessLetters[i], status: 'green' };
        targetLetters[i] = null;
        guessLetters[i] = null;
      }
    }

    // Second pass: mark present but wrong position (yellow)
    for (let i = 0; i < 5; i++) {
      if (guessLetters[i] !== null) {
        const targetIndex = targetLetters.indexOf(guessLetters[i]);
        if (targetIndex !== -1) {
          result[i] = { letter: guessLetters[i], status: 'yellow' };
          targetLetters[targetIndex] = null;
        } else {
          result[i] = { letter: guessLetters[i], status: 'gray' };
        }
      }
    }

    return result;
  }

  getGameState() {
    return {
      guesses: this.guesses,
      gameOver: this.gameOver,
      won: this.won,
      attemptsUsed: this.guesses.length
    };
  }
}

// Improved constraint converter with proper conflict resolution
class ImprovedConstraintConverter {
  static convertToExtensionFormat(guessResults) {
    const greenConstraints = {};
    const yellowConstraints = {};
    const grayConstraints = [];

    // Track all letter statuses to resolve conflicts
    const letterStatuses = new Map(); // letter -> Set of statuses

    // First pass: collect all statuses for each letter
    guessResults.forEach(result => {
      result.forEach((tile, position) => {
        const letter = tile.letter.toUpperCase();
        if (!letterStatuses.has(letter)) {
          letterStatuses.set(letter, new Set());
        }
        letterStatuses.get(letter).add(tile.status);

        switch (tile.status) {
          case 'green':
            greenConstraints[position] = letter;
            break;
          case 'yellow':
            if (!yellowConstraints[letter]) {
              yellowConstraints[letter] = [];
            }
            yellowConstraints[letter].push(position);
            break;
          case 'gray':
            // Don't add to gray immediately - resolve conflicts first
            break;
        }
      });
    });

    // Second pass: resolve conflicts by applying priority rules
    // Priority: green > yellow > gray
    letterStatuses.forEach((statuses, letter) => {
      if (statuses.has('green') || statuses.has('yellow')) {
        // If letter has been green or yellow, it's NOT gray
        // Remove it from gray constraints (don't add it)
      } else if (statuses.has('gray')) {
        // Only add to gray if it's NEVER been green or yellow
        grayConstraints.push(letter);
      }
    });

    // Clean up yellow constraints for letters that are also green
    const greenLetters = new Set(Object.values(greenConstraints));
    Object.keys(yellowConstraints).forEach(letter => {
      if (greenLetters.has(letter)) {
        // Keep yellow constraints but they represent different instances
        // This is valid in Wordle (e.g., "ABBEY" where B appears twice)
      }
    });

    // Final validation
    const cleaned = this.cleanConstraints({ greenConstraints, yellowConstraints, grayConstraints });
    return cleaned;
  }

  static cleanConstraints(constraints) {
    const { greenConstraints, yellowConstraints, grayConstraints } = constraints;

    // Remove grays that are green elsewhere
    const greenLetters = new Set(Object.values(greenConstraints));
    const cleanedGrays = grayConstraints.filter(letter => !greenLetters.has(letter));

    // FIXED: Handle yellow constraints properly for duplicate letters
    const cleanedYellows = {};
    Object.keys(yellowConstraints).forEach(letter => {
      // Find green positions for this letter
      const greenPositions = Object.keys(greenConstraints)
        .filter(pos => greenConstraints[pos] === letter)
        .map(pos => parseInt(pos));

      // Only keep yellow positions that don't conflict with green positions
      const validYellowPositions = yellowConstraints[letter]
        .filter(pos => !greenPositions.includes(pos));

      // Keep yellow constraint if there are still valid positions
      // This allows duplicate letters where one is green and another is yellow
      if (validYellowPositions.length > 0) {
        cleanedYellows[letter] = validYellowPositions;
      }
    });

    return {
      greenConstraints,
      yellowConstraints: cleanedYellows,
      grayConstraints: cleanedGrays
    };
  }

  static validateConstraints(green, yellow, gray) {
    // Check for conflicts between green and gray
    const greenLetters = new Set(Object.values(green));
    const grayLetters = new Set(gray);
    const conflictingLetters = [...greenLetters].filter(letter => grayLetters.has(letter));

    if (conflictingLetters.length > 0) {
      console.log('Constraint conflict: letters marked both green and gray:', conflictingLetters);
      return false;
    }

    // Check for conflicts between yellow and gray
    const yellowLetters = new Set(Object.keys(yellow));
    const conflictingYellowGray = [...yellowLetters].filter(letter => grayLetters.has(letter));

    if (conflictingYellowGray.length > 0) {
      console.log('Constraint conflict: letters marked both yellow and gray:', conflictingYellowGray);
      return false;
    }

    return true;
  }
}

// Fixed test runner with proper fallback strategies
class FixedTestRunner {
  constructor(wordList, solver) {
    this.wordList = wordList;
    this.solver = solver;
    this.results = {
      totalGames: 0,
      wins: 0,
      losses: 0,
      averageGuesses: 0,
      guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      failedWords: [],
      debugInfo: {
        noSuggestionsCases: 0,
        solverErrors: 0,
        fallbacksUsed: 0
      }
    };
  }

  // Fallback strategy when solver returns no suggestions
  getFallbackGuess(constraints, targetWord, previousGuesses) {
    console.log(`Using fallback strategy for ${targetWord}`);

    // Simple strategy: pick a random word from remaining word list that hasn't been guessed
    const unusedWords = this.wordList.filter(word =>
      !previousGuesses.includes(word.toUpperCase()) &&
      word.length === 5
    );

    if (unusedWords.length > 0) {
      this.results.debugInfo.fallbacksUsed++;
      const randomWord = unusedWords[Math.floor(Math.random() * unusedWords.length)];
      console.log(`Fallback selected: ${randomWord} from ${unusedWords.length} remaining words`);
      return randomWord;
    }

    // Last resort: return a common word
    const commonWords = ['AUDIO', 'MOIST', 'STERN', 'CHUNK', 'BRINE'];
    const availableCommon = commonWords.filter(word => !previousGuesses.includes(word));

    if (availableCommon.length > 0) {
      console.log(`Using common word fallback: ${availableCommon[0]}`);
      return availableCommon[0];
    }

    return null; // Complete failure
  }

  async runSingleGame(targetWord, startingWord = 'SLATE') {
    const game = new ImprovedWordleSimulator(targetWord);
    const guessHistory = [];
    let currentGuess = startingWord;

    while (!game.gameOver) {
      const result = game.makeGuess(currentGuess);
      if (!result) break; // Game returned null (shouldn't happen but safety check)

      guessHistory.push({ guess: currentGuess, result });

      if (!game.gameOver) {
        // Generate constraints from all previous guesses
        const constraints = ImprovedConstraintConverter.convertToExtensionFormat(
          guessHistory.map(h => h.result)
        );

        // Get next suggestion from solver
        try {
          const suggestions = this.solver.getSuggestions(constraints);

          if (!suggestions || suggestions.length === 0) {
            console.log(`No suggestions available for ${targetWord} after ${currentGuess}`);
            this.results.debugInfo.noSuggestionsCases++;

            // Try fallback strategy instead of giving up
            const fallbackGuess = this.getFallbackGuess(
              constraints,
              targetWord,
              guessHistory.map(h => h.guess)
            );

            if (fallbackGuess) {
              currentGuess = fallbackGuess;
              console.log(`Continuing with fallback guess: ${fallbackGuess}`);
            } else {
              console.log(`Complete failure - no fallback available for ${targetWord}`);
              break; // Only break when all strategies exhausted
            }
          } else {
            // FIXED: Add infinite loop prevention with proper case handling
            const previousGuesses = guessHistory.map(h => h.guess.toUpperCase());
            let selectedGuess = suggestions[0]; // Default to best suggestion

            // Check if we've already tried the top suggestions
            for (let i = 0; i < Math.min(suggestions.length, 5); i++) {
              if (!previousGuesses.includes(suggestions[i].toUpperCase())) {
                selectedGuess = suggestions[i];
                break;
              }
            }

            // If all top suggestions have been tried, this indicates a possible algorithm issue
            if (previousGuesses.includes(selectedGuess.toUpperCase())) {
              console.log(`Warning: All top suggestions for ${targetWord} have been tried. Using fallback.`);
              const fallbackGuess = this.getFallbackGuess(
                constraints,
                targetWord,
                previousGuesses
              );
              currentGuess = fallbackGuess || selectedGuess;
            } else {
              currentGuess = selectedGuess;
            }
          }

        } catch (error) {
          console.log(`Solver error for ${targetWord}: ${error.message}`);
          this.results.debugInfo.solverErrors++;

          // Try fallback even on solver error
          const fallbackGuess = this.getFallbackGuess(
            constraints,
            targetWord,
            guessHistory.map(h => h.guess)
          );

          if (fallbackGuess) {
            currentGuess = fallbackGuess;
          } else {
            break;
          }
        }
      }
    }

    return {
      targetWord,
      won: game.won,
      guesses: game.guesses.length,
      guessHistory,
      finalState: game.getGameState()
    };
  }

  // Run test suite with proper statistics
  async runFullTestSuite(sampleSize = null) {
    console.log('🚀 Starting Fixed Solvle Test Suite...\n');

    const testWords = sampleSize ?
      this.shuffleArray([...this.wordList]).slice(0, sampleSize) :
      this.wordList;

    console.log(`Testing ${testWords.length} words...`);

    for (let i = 0; i < testWords.length; i++) {
      const word = testWords[i];
      const gameResult = await this.runSingleGame(word);

      this.updateResults(gameResult);

      // Progress logging
      if ((i + 1) % 50 === 0 || testWords.length <= 20) {
        const progress = ((i + 1) / testWords.length * 100).toFixed(1);
        const currentWinRate = (this.results.wins / this.results.totalGames * 100).toFixed(1);
        console.log(`Progress: ${progress}% - Win rate: ${currentWinRate}%`);
      }
    }

    this.finalizeResults();
    return this.results;
  }

  updateResults(gameResult) {
    this.results.totalGames++;

    if (gameResult.won) {
      this.results.wins++;
      this.results.guessDistribution[gameResult.guesses]++;
    } else {
      this.results.losses++;
      this.results.failedWords.push({
        word: gameResult.targetWord,
        guesses: gameResult.guessHistory.map(h => h.guess)
      });
    }
  }

  finalizeResults() {
    this.results.winRate = (this.results.wins / this.results.totalGames * 100).toFixed(2);
    this.results.averageGuesses = this.results.totalGames > 0 ?
      (Object.keys(this.results.guessDistribution).reduce((sum, key) =>
        sum + (key * this.results.guessDistribution[key]), 0) / this.results.wins).toFixed(2) : 0;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  generateReport() {
    const report = `
=== FIXED SOLVLE SUCCESS RATE ANALYSIS ===
Total Games: ${this.results.totalGames}
Wins: ${this.results.wins}
Losses: ${this.results.losses}
Win Rate: ${this.results.winRate}%
Average Guesses (when won): ${this.results.averageGuesses}

Guess Distribution:
1 guess: ${this.results.guessDistribution[1]} games
2 guesses: ${this.results.guessDistribution[2]} games
3 guesses: ${this.results.guessDistribution[3]} games
4 guesses: ${this.results.guessDistribution[4]} games
5 guesses: ${this.results.guessDistribution[5]} games
6 guesses: ${this.results.guessDistribution[6]} games

Debug Info:
No suggestions cases: ${this.results.debugInfo.noSuggestionsCases}
Solver errors: ${this.results.debugInfo.solverErrors}
Fallbacks used: ${this.results.debugInfo.fallbacksUsed}

Failed Words (all ${this.results.failedWords.length}):
${this.results.failedWords.map(f =>
  `${f.word}: ${f.guesses.join(' -> ')}`).join('\n')}
`;
    return report;
  }
}

module.exports = {
  WordLoader,
  ImprovedWordleSimulator,
  ImprovedConstraintConverter,
  FixedTestRunner
};