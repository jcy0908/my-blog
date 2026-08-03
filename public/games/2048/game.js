const SIZE = 4;
const STORAGE_KEY = 'game-2048-best';

const boardEl = document.getElementById('board');
const tileLayer = document.getElementById('tile-layer');
const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('best-score');
const overlayEl = document.getElementById('game-overlay');
const overlayTextEl = document.getElementById('game-overlay-text');
const newGameBtn = document.getElementById('new-game');
const overlayRetryBtn = document.getElementById('overlay-retry');

let grid = [];
let score = 0;
let bestScore = 0;
let gameOver = false;

function loadBestScore() {
  try {
    return Number(localStorage.getItem(STORAGE_KEY)) || 0;
  } catch (e) {
    return 0;
  }
}

function saveBestScore(value) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch (e) {
    /* localStorage unavailable */
  }
}

function createEmptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function emptyCells() {
  const cells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) cells.push([r, c]);
    }
  }
  return cells;
}

function addRandomTile() {
  const cells = emptyCells();
  if (cells.length === 0) return;
  const [r, c] = cells[Math.floor(Math.random() * cells.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function slideAndMerge(line) {
  const values = line.filter((v) => v !== 0);
  const merged = [];
  let gained = 0;

  for (let i = 0; i < values.length; i++) {
    if (values[i] === values[i + 1]) {
      const mergedValue = values[i] * 2;
      merged.push(mergedValue);
      gained += mergedValue;
      i++;
    } else {
      merged.push(values[i]);
    }
  }

  while (merged.length < SIZE) merged.push(0);
  return { line: merged, gained };
}

function getColumn(c) {
  return [0, 1, 2, 3].map((r) => grid[r][c]);
}

function setColumn(c, values) {
  for (let r = 0; r < SIZE; r++) grid[r][c] = values[r];
}

function move(direction) {
  if (gameOver) return false;

  let moved = false;
  let gainedTotal = 0;

  const process = (line, reverse) => {
    const input = reverse ? [...line].reverse() : line;
    const { line: result, gained } = slideAndMerge(input);
    gainedTotal += gained;
    const output = reverse ? [...result].reverse() : result;
    if (output.some((v, i) => v !== line[i])) moved = true;
    return output;
  };

  if (direction === 'left' || direction === 'right') {
    for (let r = 0; r < SIZE; r++) {
      grid[r] = process(grid[r], direction === 'right');
    }
  } else {
    for (let c = 0; c < SIZE; c++) {
      const column = process(getColumn(c), direction === 'down');
      setColumn(c, column);
    }
  }

  if (moved) {
    score += gainedTotal;
    addRandomTile();
    render();
    checkGameState();
  }

  return moved;
}

function canMove() {
  if (emptyCells().length > 0) return true;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const value = grid[r][c];
      if (c < SIZE - 1 && grid[r][c + 1] === value) return true;
      if (r < SIZE - 1 && grid[r + 1][c] === value) return true;
    }
  }
  return false;
}

function checkGameState() {
  const won = grid.some((row) => row.some((v) => v >= 2048));
  if (won && !gameOver) {
    gameOver = true;
    showOverlay('승리! 🎉');
    return;
  }
  if (!canMove()) {
    gameOver = true;
    showOverlay('게임 오버');
  }
}

function showOverlay(text) {
  overlayTextEl.textContent = text;
  overlayEl.hidden = false;
}

function hideOverlay() {
  overlayEl.hidden = true;
}

function render() {
  tileLayer.innerHTML = '';

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const value = grid[r][c];
      if (value === 0) continue;
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.dataset.value = value >= 2048 ? '2048' : String(value);
      tile.style.gridRow = String(r + 1);
      tile.style.gridColumn = String(c + 1);
      tile.textContent = String(value);
      tileLayer.appendChild(tile);
    }
  }

  scoreEl.textContent = String(score);
  if (score > bestScore) {
    bestScore = score;
    saveBestScore(bestScore);
  }
  bestScoreEl.textContent = String(bestScore);
}

function newGame() {
  grid = createEmptyGrid();
  score = 0;
  gameOver = false;
  hideOverlay();
  addRandomTile();
  addRandomTile();
  render();
}

const KEY_DIRECTIONS = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

document.addEventListener('keydown', (event) => {
  const direction = KEY_DIRECTIONS[event.key];
  if (!direction) return;
  event.preventDefault();
  move(direction);
});

let touchStartX = 0;
let touchStartY = 0;
const SWIPE_THRESHOLD = 24;

boardEl.addEventListener(
  'touchstart',
  (event) => {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  },
  { passive: true }
);

boardEl.addEventListener(
  'touchend',
  (event) => {
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      move(dx > 0 ? 'right' : 'left');
    } else {
      move(dy > 0 ? 'down' : 'up');
    }
  },
  { passive: true }
);

newGameBtn.addEventListener('click', newGame);
overlayRetryBtn.addEventListener('click', newGame);

bestScore = loadBestScore();
newGame();
