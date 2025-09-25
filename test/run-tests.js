#!/usr/bin/env node

/**
 * Fixed Test Runner
 * Tests with proper fallback strategies and no early stopping bugs
 */

const { WordLoader, FixedTestRunner } = require('./fixed-test-framework.js');
const { SolverWrapper } = require('./solver-wrapper.js');

async function runFixedTests() {
  console.log('🔧 Running FIXED Solvle Tests...\n');

  try {
    // Load components
    const wordList = WordLoader.loadWords();
    console.log(`📚 Loaded ${wordList.length} valid Wordle answers`);

    const solverWrapper = new SolverWrapper();
    const stats = solverWrapper.getStats();

    console.log('🔧 Solver Status:');
    console.log(`   • Total Words: ${stats.totalWords}`);
    console.log(`   • Filter Function: ${stats.hasFilterWords ? '✓' : '✗'}`);
    console.log(`   • Sort Function: ${stats.hasSortWords ? '✓' : '✗'}`);
    console.log(`   • Constraint Matching: ${stats.hasConstraintMatching ? '✓' : '✗'}\n`);

    // Create fixed test runner
    const testRunner = new FixedTestRunner(wordList, solverWrapper);

    // Parse command line arguments
    const args = process.argv.slice(2);
    let sampleSize = 30; // Default to 30 for quick testing
    let outputFile = null;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--sample' && i + 1 < args.length) {
        sampleSize = parseInt(args[i + 1]);
      }
      if (args[i] === '--output' && i + 1 < args.length) {
        outputFile = args[i + 1];
      }
      if (args[i] === '--full') {
        sampleSize = null; // Test all words
      }
    }

    // Run fixed test suite
    const startTime = Date.now();
    const results = await testRunner.runFullTestSuite(sampleSize);
    const endTime = Date.now();

    // Generate and display report
    console.log('\n' + '='.repeat(60));
    console.log(testRunner.generateReport());
    console.log(`\n⏱️  Test completed in ${((endTime - startTime) / 1000).toFixed(1)} seconds`);

    // Performance analysis
    const gamesPerSecond = (results.totalGames / ((endTime - startTime) / 1000)).toFixed(1);
    console.log(`🏃 Performance: ${gamesPerSecond} games per second`);

    // Success rate analysis with fixed expectations
    console.log('\n📊 Analysis (FIXED VERSION):');
    if (results.winRate >= 90) {
      console.log('🎉 Excellent! Your solver performs at elite level.');
    } else if (results.winRate >= 85) {
      console.log('👍 Very good success rate! Your solver is working well.');
    } else if (results.winRate >= 80) {
      console.log('✅ Good success rate. Some room for optimization.');
    } else if (results.winRate >= 70) {
      console.log('⚠️  Moderate success rate. Consider algorithm improvements.');
    } else {
      console.log('🔧 Lower success rate. May need fallback strategy improvements.');
    }

    // Debug information
    if (results.debugInfo.noSuggestionsCases > 0 || results.debugInfo.solverErrors > 0) {
      console.log('\n🔍 Debug Insights:');
      console.log(`   • No suggestions cases: ${results.debugInfo.noSuggestionsCases}`);
      console.log(`   • Solver errors: ${results.debugInfo.solverErrors}`);
      console.log(`   • Fallbacks used: ${results.debugInfo.fallbacksUsed}`);
    }

    // Save results if requested
    if (outputFile) {
      const detailedResults = {
        metadata: {
          timestamp: new Date().toISOString(),
          testDuration: endTime - startTime,
          sampleSize: sampleSize || wordList.length,
          version: 'Solvle Fixed Tests v1.0',
          solverStats: stats
        },
        summary: results,
        report: testRunner.generateReport()
      };

      const fs = require('fs');
      fs.writeFileSync(outputFile, JSON.stringify(detailedResults, null, 2));
      console.log(`📄 Detailed results saved to ${outputFile}`);
    }

    console.log('\n🎯 Key Improvements in Fixed Version:');
    console.log('   • No more premature stopping when solver returns empty arrays');
    console.log('   • Fallback strategies when primary solver fails');
    console.log('   • Better constraint validation and error handling');
    console.log('   • Proper 6-guess win condition (not early failure)');

  } catch (error) {
    console.error('❌ Fixed test failed:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  runFixedTests().catch(console.error);
}

module.exports = { runFixedTests };