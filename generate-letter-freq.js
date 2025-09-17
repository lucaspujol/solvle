#!/usr/bin/env node

const fs = require('fs');

const content = fs.readFileSync('wordle-answers-alphabetical.js', 'utf-8');
const match = content.match(/const allWords = (\[[\s\S]*?\]);/);
const allWords = JSON.parse(match[1]);

function calculateLetterFrequencies(words) {
    
    // We calculate frequency of a letter on each position
    // A position is between 0 and 4, because our word set is all 5-letter words
    
    const wordCount = words.length;
    console.log('Processing', wordCount, 'words...');
    
    // Pre-init letterCounts
    const letterCounts = {};
    for (let i = 0; i < 26; i++) {
        const letter = String.fromCharCode(97 + i); // 'a' to 'z'
        letterCounts[letter] = [0, 0, 0, 0, 0]; // positions 0-4
    }

    // Populate counts
    for (const word of words) {
        for (let pos = 0; pos < word.length; pos++) {
            const letter = word[pos];
            letterCounts[letter][pos] += 1;
        }
    }

    // Convert counts to frequencies
    // Divide letter count by total word count

    const letterFreq = letterCounts; // To make letterFreq the same data structure
    for (const letter in letterFreq) {
        for (let pos = 0; pos < 5; pos++) {
            letterFreq[letter][pos] = letterFreq[letter][pos] / wordCount;
        }
    }

    const sortedFreq = {};
    Object.keys(letterFreq).sort().forEach(letter => {
        sortedFreq[letter] = letterFreq[letter];
    });

    return sortedFreq;
}

function generateFrequencyFile(frequencies) {
    const fileContent = `// Auto-generated letter frequencies for Wordle words
// Format: { letter: [freq_pos1, freq_pos2, freq_pos3, freq_pos4, freq_pos5] } where frequency is 0-1
const letterFrequencies = ${JSON.stringify(frequencies, null, 2)};
`;
    
    fs.writeFileSync('wordle-letter-freq.js', fileContent);
    console.log('Generated wordle-letter-freq.js with', Object.keys(frequencies).length, 'letter frequencies');
}

const frequencies = calculateLetterFrequencies(allWords);
generateFrequencyFile(frequencies);
