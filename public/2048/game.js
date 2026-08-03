const SIZE = 4;
const BEST_KEY = 'game2048-best';

const boardCellsEl = document.getElementById('board-cells');
const boardTilesEl = document.getElementById('board-tiles');
const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const overlayEl = document.getElementById('overlay');
const overlayMessageEl = document.getElementById('overlay-message');
const overlayContinueBtn = document.getElementById('overlay-continue');
const overlayRestartBtn = document.getElementById('overlay-restart');
const newGameBtn = document.getElementById('new-game');

let board = [];
let score = 0;
let best = loadBest();
let over = false;
let won = false;
let keepPlaying = false;

function loadBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch (e) {
    return 0;
  }
}

function saveBest() {
  try {
    localStorage.setItem(BEST_KEY, String(best));
  } catch (e) {
    /* localStorage unavailable */
  }
}

function emptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function addRandomTile() {
  const empties = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) empties.push([r, c]);
    }
  }
  if (empties.length === 0) return null;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
  return [r, c];
}

function canMove() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) return true;
      if (c < SIZE - 1 && board[r][c] === board[r][c + 1]) return true;
      if (r < SIZE - 1 && board[r][c] === board[r + 1][c]) return true;
    }
  }
  return false;
}

function lineCoords(direction, i) {
  const coords = [];
  for (let j = 0; j < SIZE; j++) {
    if (direction === 'left') coords.push([i, j]);
    else if (direction === 'right') coords.push([i, SIZE - 1 - j]);
    else if (direction === 'up') coords.push([j, i]);
    else coords.push([SIZE - 1 - j, i]);
  }
  return coords;
}

function move(direction) {
  if (over) return;

  let moved = false;
  let gained = 0;
  const mergedCells = new Set();

  for (let i = 0; i < SIZE; i++) {
    const coords = lineCoords(direction, i);
    const values = coords.map(([r, c]) => board[r][c]);
    const filtered = values.filter((v) => v !== 0);
    const result = [];
    const mergedFlags = [];

    for (let j = 0; j < filtered.length; j++) {
      if (filtered[j] === filtered[j + 1]) {
        const val = filtered[j] * 2;
        result.push(val);
        mergedFlags.push(true);
        gained += val;
        if (val === 2048 && !won) won = true;
        j++;
      } else {
        result.push(filtered[j]);
        mergedFlags.push(false);
      }
    }
    while (result.length < SIZE) {
      result.push(0);
      mergedFlags.push(false);
    }

    coords.forEach(([r, c], idx) => {
      if (board[r][c] !== result[idx]) moved = true;
      board[r][c] = result[idx];
      if (mergedFlags[idx]) mergedCells.add(r + ',' + c);
    });
  }

  if (!moved) return;

  score += gained;
  if (score > best) {
    best = score;
    saveBest();
  }

  const newTile = addRandomTile();
  over = !canMove();
  render(newTile, mergedCells);
  updateScore();

  if (won && !keepPlaying) {
    showOverlay('win');
  } else if (over) {
    showOverlay('over');
  }
}

function updateScore() {
  scoreEl.textContent = String(score);
  bestEl.textContent = String(best);
}

function render(newTile, mergedCells) {
  boardTilesEl.innerHTML = '';
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const value = board[r][c];
      if (!value) continue;
      const tile = document.createElement('div');
      tile.className = 'tile' + (value > 2048 ? ' tile--super' : '');
      tile.dataset.value = String(value);
      tile.style.gridColumn = String(c + 1);
      tile.style.gridRow = String(r + 1);
      tile.textContent = String(value);
      if (newTile && newTile[0] === r && newTile[1] === c) {
        tile.classList.add('tile-new');
      } else if (mergedCells && mergedCells.has(r + ',' + c)) {
        tile.classList.add('tile-merged');
      }
      boardTilesEl.appendChild(tile);
    }
  }
}

function showOverlay(type) {
  if (type === 'win') {
    overlayMessageEl.textContent = '2048을 만들었어요! 🎉';
    overlayContinueBtn.hidden = false;
  } else {
    overlayMessageEl.textContent = '더 이상 움직일 수 없어요';
    overlayContinueBtn.hidden = true;
  }
  overlayEl.hidden = false;
}

function hideOverlay() {
  overlayEl.hidden = true;
}

function initCells() {
  boardCellsEl.innerHTML = '';
  for (let i = 0; i < SIZE * SIZE; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    boardCellsEl.appendChild(cell);
  }
}

function newGame() {
  board = emptyBoard();
  score = 0;
  over = false;
  won = false;
  keepPlaying = false;
  hideOverlay();
  addRandomTile();
  addRandomTile();
  render();
  updateScore();
}

window.addEventListener('keydown', (e) => {
  const map = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
  };
  const direction = map[e.key];
  if (!direction) return;
  e.preventDefault();
  move(direction);
});

let touchActive = false;
let touchStartX = 0;
let touchStartY = 0;
const SWIPE_THRESHOLD = 24;

boardEl.addEventListener(
  'touchstart',
  (e) => {
    if (e.touches.length !== 1) return;
    touchActive = true;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  },
  { passive: true }
);

boardEl.addEventListener(
  'touchmove',
  (e) => {
    if (touchActive) e.preventDefault();
  },
  { passive: false }
);

boardEl.addEventListener(
  'touchend',
  (e) => {
    if (!touchActive) return;
    touchActive = false;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < SWIPE_THRESHOLD) return;

    if (absDx > absDy) {
      move(dx > 0 ? 'right' : 'left');
    } else {
      move(dy > 0 ? 'down' : 'up');
    }
  },
  { passive: true }
);

newGameBtn.addEventListener('click', newGame);
overlayRestartBtn.addEventListener('click', newGame);
overlayContinueBtn.addEventListener('click', () => {
  keepPlaying = true;
  hideOverlay();
});

initCells();
bestEl.textContent = String(best);
newGame();
