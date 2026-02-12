# Solvle

A Firefox extension that helps you solve Wordle. It reads the game board, figures out what letters are confirmed/eliminated, and narrows down the remaining possible words.

Works on:
- [NY Times Wordle](https://www.nytimes.com/games/wordle/index.html)
- [Wordle Unlimited](https://wordleunlimited.org/)

## What it does

Solvle injects an overlay onto Wordle pages. It watches your guesses in real time, extracts the green/yellow/gray feedback from each row, and filters a 2,315-word list down to what's still possible. Words are ranked by positional letter frequency so the best guesses float to the top.

There are two modes:

- **Helper mode** — Shows how many words remain and gives you a random starting word. Good if you want a nudge without being spoiled.
- **Solver mode** — Shows the full filtered word list with pagination. Click any word to auto-type it into the game.

## Install

Install from the [Firefox Add-ons store](https://addons.mozilla.org/en-US/firefox/addon/solvle-wordle-helper/), then navigate to a supported Wordle site.

## Usage

- Press `?` to toggle the overlay
- Use the extension popup (toolbar icon) to control:
  - Overlay visibility
  - Auto-refresh (updates suggestions after each guess)
  - Dark/light theme
  - Helper/Solver mode
- In Solver mode, click any word to auto-type and submit it

The overlay is draggable — grab the header to reposition it. Position and theme persist across sessions via localStorage.

## How it works

### File structure

```
content.js        → Entry point. Keyboard shortcuts, message handling, initialization
game-state.js     → Reads the Wordle DOM to extract green/yellow/gray constraints
solver.js         → Filters and ranks the word list against constraints
ui.js             → Overlay creation, pagination, auto-typing, word display
popup.html/js     → Extension popup with toggle controls
overlay.css       → All styling, theme variables, mode-specific visibility
wordle-answers-alphabetical.js  → The 2,315 valid Wordle answers
wordle-letter-freq.js           → Positional letter frequencies for word ranking
```

### Constraint extraction

Each Wordle site uses a different DOM structure. NY Times uses CSS module classes and `data-state` attributes on tiles. Wordle Unlimited uses Shadow DOM with `game-app` → `game-row` → `game-tile` custom elements.

`game-state.js` detects which site you're on and extracts three types of constraints:
- **Green** — letter confirmed at a specific position
- **Yellow** — letter is in the word but not at this position
- **Gray** — letter is not in the word at all

There's a subtlety with gray: if you guess a word with duplicate letters (e.g., "LLAMA") and one L is green while the other is gray, the gray L shouldn't eliminate L entirely. The extraction handles this by checking each row for green/yellow letters before adding anything to the gray list.

### Word filtering

`solver.js` takes the constraints and filters the full word list. Each word is checked against all three constraint types. After filtering, words are scored by positional letter frequency — how often each undiscovered letter appears at each position across all Wordle answers. This pushes information-rich guesses to the top.

### Auto-refresh

MutationObservers watch for `data-state` changes on tiles (NY Times) or `evaluation` attribute changes (Wordle Unlimited). When a row is fully evaluated, the word list automatically re-filters.

### Auto-typing

Clicking a word dispatches synthetic `keydown`/`keyup` events with 100ms delays between letters, then submits with Enter. This works because both Wordle sites listen for keyboard events on the document.

## Development

This is a Manifest V3 Firefox extension. The only permission needed is `activeTab`. All scripts are injected as content scripts — there's no background service worker.

To iterate:
1. Make your changes
2. Go to `about:debugging#/runtime/this-firefox`
3. Click "Reload" on the extension
4. Refresh the Wordle page
