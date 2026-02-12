# Solvle Test Suite

Comprehensive testing framework for the Solvle Wordle solver extension.

## Features

- **Standalone Testing**: Tests your extension without modifying any existing files
- **Wordle Game Simulation**: Complete game simulation with constraint extraction
- **Success Rate Analysis**: Detailed win/loss statistics and performance metrics
- **Failure Pattern Analysis**: Identifies common failure modes for optimization
- **Flexible Sample Sizes**: Test from 10 words to all 2,315 valid Wordle answers

## Quick Start

```bash
# Test with 25 random words (quick test)
node test/run-tests.js --sample 25

# Test with 100 random words
node test/run-tests.js --sample 100

# Test all 2,315 words (full analysis)
node test/run-tests.js

# Save detailed results to file
node test/run-tests.js --sample 200 --output results.json
```

## Using npm Scripts

```bash
cd test/
npm run test:quick      # 25 words
npm run test:sample     # 100 words
npm run test:medium     # 200 words
npm run test:full       # All words + save results
```

## Output Metrics

- **Win Rate**: Percentage of games solved successfully
- **Average Guesses**: Mean number of guesses for successful games
- **Guess Distribution**: How many games solved in 1,2,3,4,5,6 guesses
- **Failed Words**: Specific words that couldn't be solved
- **Performance**: Games processed per second
- **Failure Analysis**: Common patterns in failed attempts

## Architecture

- `test-framework.js` - Core testing components and Wordle simulator
- `solver-wrapper.js` - Interfaces with your existing solver.js without modification
- `run-tests.js` - Main test runner and reporting system
- `package.json` - npm scripts for easy test execution

## How It Works

1. **Word Loading**: Reads from your existing `wordle-answers-alphabetical.js`
2. **Solver Integration**: Dynamically loads and executes your `solver.js` and `wordle-letter-freq.js`
3. **Game Simulation**: Simulates complete Wordle games with realistic constraint generation
4. **Statistics**: Measures success rates, guess distributions, and identifies failure patterns

Your extension files remain completely unchanged - the test suite only reads from them.