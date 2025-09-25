#!/usr/bin/env node

/**
 * Failure Analysis Tool
 * Logs detailed information about each failed test case
 */

const { WordLoader, FixedTestRunner } = require('./fixed-test-framework.js');
const { SolverWrapper } = require('./solver-wrapper.js');
const fs = require('fs');

class FailureAnalyzer {
  constructor(solver) {
    this.solver = solver;
    this.failureLog = [];
  }

  async analyzeSingleFailure(targetWord, startingWord = 'SLATE') {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 ANALYZING FAILURE: ${targetWord}`);
    console.log(`${'='.repeat(60)}`);

    const game = new (require('./fixed-test-framework.js').ImprovedWordleSimulator)(targetWord);
    const guessHistory = [];
    let currentGuess = startingWord;

    while (!game.gameOver) {
      console.log(`\n--- Turn ${game.guesses.length + 1} ---`);
      console.log(`🎯 Target: ${targetWord}`);
      console.log(`🎮 Guessing: ${currentGuess}`);

      const result = game.makeGuess(currentGuess);
      if (!result) break;

      guessHistory.push({ guess: currentGuess, result });

      // Show the tile results
      const tileDisplay = result.map(tile =>
        `${tile.letter}(${tile.status.charAt(0).toUpperCase()})`
      ).join(' ');
      console.log(`🎨 Result: ${tileDisplay}`);

      if (!game.gameOver) {
        // Generate constraints
        const constraints = require('./fixed-test-framework.js').ImprovedConstraintConverter
          .convertToExtensionFormat(guessHistory.map(h => h.result));

        console.log(`📋 Constraints:`);
        console.log(`   🟢 Green: ${JSON.stringify(constraints.greenConstraints)}`);
        console.log(`   🟡 Yellow: ${JSON.stringify(constraints.yellowConstraints)}`);
        console.log(`   ⬜ Gray: [${constraints.grayConstraints.join(', ')}]`);

        // Test if target word matches its own constraints
        const targetMatches = this.solver.testConstraintMatching(targetWord, constraints);
        console.log(`🎯 Does "${targetWord}" match constraints? ${JSON.stringify(targetMatches)}`);

        // Get suggestions
        const suggestions = this.solver.getSuggestions(constraints);
        console.log(`💡 Solver suggestions (${suggestions.length}): [${suggestions.slice(0, 10).join(', ')}]`);

        // Check if target is in suggestions
        const targetInSuggestions = suggestions.includes(targetWord.toLowerCase());
        console.log(`❓ Is "${targetWord}" in suggestions? ${targetInSuggestions}`);

        if (!targetInSuggestions && suggestions.length > 0) {
          console.log(`❌ Problem: Target should be in suggestions but isn't!`);

          // Debug why target is not matching
          this.debugWhyTargetExcluded(targetWord, constraints, suggestions.slice(0, 5));
        }

        if (suggestions.length === 0) {
          console.log(`❌ NO SUGGESTIONS - This shouldn't happen with fixed constraints!`);
          break;
        }

        currentGuess = suggestions[0];

        // Check for infinite loops
        const guessCount = guessHistory.filter(h => h.guess === currentGuess).length;
        if (guessCount >= 2) {
          console.log(`🔄 LOOP DETECTED: "${currentGuess}" suggested ${guessCount} times`);
          // Try second suggestion if available
          if (suggestions.length > 1) {
            currentGuess = suggestions[1];
            console.log(`🔀 Switching to: ${currentGuess}`);
          }
        }
      }
    }

    const analysis = {
      targetWord,
      won: game.won,
      guesses: game.guesses.length,
      finalGuesses: game.guesses,
      issue: game.won ? 'none' : this.categorizeFailure(guessHistory, targetWord)
    };

    this.failureLog.push(analysis);
    console.log(`\n📊 Final Result: ${game.won ? '✅ WON' : '❌ LOST'} in ${game.guesses.length} guesses`);
    console.log(`🏷️  Issue Category: ${analysis.issue}`);

    return analysis;
  }

  debugWhyTargetExcluded(targetWord, constraints, sampleSuggestions) {
    console.log(`\n🔬 DEBUGGING WHY "${targetWord}" IS EXCLUDED:`);

    // Test constraint matching step by step
    const testResult = this.solver.testConstraintMatching(targetWord, constraints);

    console.log(`   Green match: ${testResult.green}`);
    console.log(`   Yellow match: ${testResult.yellow}`);
    console.log(`   Gray match: ${testResult.gray}`);

    if (!testResult.green) {
      console.log(`   🟢 Green constraint failure - checking positions:`);
      Object.entries(constraints.greenConstraints).forEach(([pos, letter]) => {
        const targetLetter = targetWord[pos];
        console.log(`     Position ${pos}: expected "${letter}", got "${targetLetter}" - ${letter === targetLetter ? '✅' : '❌'}`);
      });
    }

    if (!testResult.yellow) {
      console.log(`   🟡 Yellow constraint failure - checking presence:`);
      Object.entries(constraints.yellowConstraints).forEach(([letter, positions]) => {
        const hasLetter = targetWord.includes(letter);
        const wrongPositions = positions.filter(pos => targetWord[pos] === letter);
        console.log(`     Letter "${letter}": in word? ${hasLetter}, wrong positions: [${wrongPositions.join(',')}] - ${hasLetter && wrongPositions.length === 0 ? '✅' : '❌'}`);
      });
    }

    if (!testResult.gray) {
      console.log(`   ⬜ Gray constraint failure - checking absence:`);
      constraints.grayConstraints.forEach(letter => {
        const hasLetter = targetWord.includes(letter);
        console.log(`     Letter "${letter}": should be absent, in word? ${hasLetter} - ${!hasLetter ? '✅' : '❌'}`);
      });
    }

    // Compare with sample suggestions that passed
    if (sampleSuggestions.length > 0) {
      console.log(`\n🔍 Comparing with suggestions that passed:`);
      sampleSuggestions.slice(0, 3).forEach(suggestion => {
        const suggResult = this.solver.testConstraintMatching(suggestion.toUpperCase(), constraints);
        console.log(`   "${suggestion}": G:${suggResult.green} Y:${suggResult.yellow} GR:${suggResult.gray}`);
      });
    }
  }

  categorizeFailure(guessHistory, targetWord) {
    const finalGuess = guessHistory[guessHistory.length - 1]?.guess;
    const guesses = guessHistory.map(h => h.guess);

    // Check for loops
    const uniqueGuesses = new Set(guesses);
    if (uniqueGuesses.size < guesses.length) {
      return 'infinite_loop';
    }

    // Check for double letters in target
    if (targetWord.match(/(.)\1/)) {
      return 'double_letters';
    }

    // Check if target has uncommon letters
    const uncommonLetters = 'JQXZVW';
    if (targetWord.split('').some(letter => uncommonLetters.includes(letter))) {
      return 'uncommon_letters';
    }

    // Check vowel count
    const vowels = targetWord.match(/[AEIOU]/g);
    if (!vowels || vowels.length <= 1) {
      return 'low_vowels';
    }

    return 'other';
  }

  generateFailureReport() {
    const categories = {};
    this.failureLog.forEach(failure => {
      const category = failure.issue;
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(failure);
    });

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 FAILURE ANALYSIS REPORT`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Total failures analyzed: ${this.failureLog.length}\n`);

    Object.entries(categories).forEach(([category, failures]) => {
      console.log(`🏷️  ${category.toUpperCase().replace('_', ' ')}: ${failures.length} cases`);
      failures.slice(0, 5).forEach(failure => {
        console.log(`   • ${failure.targetWord}: ${failure.finalGuesses.join(' -> ')}`);
      });
      if (failures.length > 5) {
        console.log(`   ... and ${failures.length - 5} more`);
      }
      console.log('');
    });

    return categories;
  }

  saveDetailedReport(filename) {
    const report = {
      timestamp: new Date().toISOString(),
      totalFailures: this.failureLog.length,
      failures: this.failureLog,
      categories: this.generateFailureReport()
    };

    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`📄 Detailed failure report saved to: ${filename}`);
  }
}

async function runFailureAnalysis() {
  console.log('🔬 Starting Failure Analysis...\n');

  try {
    const wordList = WordLoader.loadWords();
    const solver = new SolverWrapper();
    const analyzer = new FailureAnalyzer(solver);

    // Analyze specific failed words from your results
    const failedWords = [
      'smart', 'dimly', 'spilt', 'mouth', 'stalk',
      'bench', 'jerky', 'chili', 'dunce', 'utter',
      'wound', 'harem', 'roast', 'union', 'grave',
      'still' // Your example
    ];

    console.log(`Analyzing ${failedWords.length} failed words...`);

    for (let i = 0; i < failedWords.length; i++) {
      const word = failedWords[i];
      await analyzer.analyzeSingleFailure(word.toUpperCase());

      if (i < failedWords.length - 1) {
        console.log('\nPress Enter to continue to next failure...');
        // await new Promise(resolve => process.stdin.once('data', resolve));
      }
    }

    analyzer.generateFailureReport();
    analyzer.saveDetailedReport('failure-analysis.json');

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

if (require.main === module) {
  runFailureAnalysis().catch(console.error);
}