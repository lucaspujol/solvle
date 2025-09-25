/**
 * Solver Wrapper for Testing
 * Interfaces with the existing Solvle solver without modifying it
 */

const fs = require('fs');
const path = require('path');
const { WordLoader } = require('./test-framework');

class SolverWrapper {
  constructor() {
    this.allWords = WordLoader.loadWords();
    this.solver = this.loadSolverLogic();
  }

  loadSolverLogic() {
    try {
      // Read the solver.js file
      const solverPath = path.join(__dirname, '..', 'solver.js');
      const solverCode = fs.readFileSync(solverPath, 'utf8');

      // Read the letter frequency file
      const letterFreqPath = path.join(__dirname, '..', 'wordle-letter-freq.js');
      const letterFreqCode = fs.readFileSync(letterFreqPath, 'utf8');

      // Create a safe execution context
      const context = {
        allWords: this.allWords,
        console: { log: () => {} }, // Suppress debug logs during testing
        Object, Array, Set, Map // Standard objects
      };

      // Extract letterFrequencies directly from the file
      const letterFreqMatch = letterFreqCode.match(/const\s+letterFrequencies\s*=\s*({[\s\S]*?});/);
      if (letterFreqMatch) {
        context.letterFrequencies = eval('(' + letterFreqMatch[1] + ')');
      }

      // Execute the solver code in our context
      const solverFunc = new Function(
        'allWords', 'letterFrequencies', 'console', 'Object', 'Array', 'Set', 'Map',
        solverCode + `
        return {
          filterWords: typeof filterWords !== 'undefined' ? filterWords : null,
          sortWords: typeof sortWords !== 'undefined' ? sortWords : null,
          cleanConstraints: typeof cleanConstraints !== 'undefined' ? cleanConstraints : null,
          matchesGreenConstraints: typeof matchesGreenConstraints !== 'undefined' ? matchesGreenConstraints : null,
          matchesYellowConstraints: typeof matchesYellowConstraints !== 'undefined' ? matchesYellowConstraints : null,
          matchesGrayConstraints: typeof matchesGrayConstraints !== 'undefined' ? matchesGrayConstraints : null
        };
        `
      );

      return solverFunc.call(
        context,
        context.allWords,
        context.letterFrequencies,
        context.console,
        Object, Array, Set, Map
      );
    } catch (error) {
      console.error('Error loading solver logic:', error.message);
      throw error;
    }
  }

  // Main interface for the test runner
  getSuggestions(constraints) {
    try {
      const { greenConstraints, yellowConstraints, grayConstraints } = constraints;

      // Use the loaded solver functions
      const filteredWords = this.solver.filterWords(greenConstraints, yellowConstraints, grayConstraints);

      if (!filteredWords || filteredWords.length === 0) {
        return [];
      }

      // Sort the words if sort function is available
      if (this.solver.sortWords) {
        const sortedWords = this.solver.sortWords(filteredWords, greenConstraints, yellowConstraints);
        return sortedWords;
      }

      return filteredWords;
    } catch (error) {
      console.error('Error getting suggestions:', error.message);
      return [];
    }
  }

  // Test specific constraint matching functions
  testConstraintMatching(word, constraints) {
    try {
      const { greenConstraints, yellowConstraints, grayConstraints } = constraints;

      return {
        green: this.solver.matchesGreenConstraints ?
          this.solver.matchesGreenConstraints(word, greenConstraints) : true,
        yellow: this.solver.matchesYellowConstraints ?
          this.solver.matchesYellowConstraints(word, yellowConstraints) : true,
        gray: this.solver.matchesGrayConstraints ?
          this.solver.matchesGrayConstraints(word, grayConstraints) : true
      };
    } catch (error) {
      console.error('Error testing constraint matching:', error.message);
      return { green: false, yellow: false, gray: false };
    }
  }

  // Get solver statistics
  getStats() {
    return {
      totalWords: this.allWords.length,
      hasFilterWords: !!this.solver.filterWords,
      hasSortWords: !!this.solver.sortWords,
      hasConstraintMatching: !!(this.solver.matchesGreenConstraints &&
                               this.solver.matchesYellowConstraints &&
                               this.solver.matchesGrayConstraints)
    };
  }
}

module.exports = { SolverWrapper };