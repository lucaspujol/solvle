#!/usr/bin/env node

const fs = require('fs');

const content = fs.readFileSync('wordle-answers-alphabetical.js', 'utf-8');
const match = content.match(/const allWords = (\[[\s\S]*?\]);/);
const allWords = JSON.parse(match[1]);

function calculateLetterFrequencies(words) {
    const letterCounts = {};

    // Information theory tells us to count each letter once per word
    // This will let us calculate how many words contain each letter
    // This way, letterFreq represents the chance of a letter appearing in a word

    const wordCount = words.length;
    console.log('Processing', wordCount, 'words...');

    for (const word of words) {
        const uniqueLetters = new Set(word);
        for (const letter of uniqueLetters) {
            if (!letterCounts[letter]) {
                letterCounts[letter] = 0
            }
            letterCounts[letter] += 1;
        }
    }

    // Convert counts to frequencies
    // Divide letter count by total word count

    const letterFreq = {}
    Object.keys(letterCounts).forEach(letter => {
        letterFreq[letter] = letterCounts[letter] / wordCount;
    });

    const sortedFreq = {};
    Object.keys(letterFreq).sort().forEach(letter => {
        sortedFreq[letter] = letterFreq[letter];
    });

    return sortedFreq;
}

function generateFrequencyFile(frequencies) {
    const fileContent = `// Auto-generated letter frequencies for Wordle words
// Format: { letter: frequency } where frequency is 0-1
const letterFrequencies = ${JSON.stringify(frequencies, null, 2)};
`;
    
    fs.writeFileSync('wordle-letter-freq.js', fileContent);
    console.log('Generated wordle-letter-freq.js with', Object.keys(frequencies).length, 'letter frequencies');
}

const frequencies = calculateLetterFrequencies(allWords);
generateFrequencyFile(frequencies);
