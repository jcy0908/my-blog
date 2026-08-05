// 2048 게임 로직 — 순수 바닐라 JS (외부 의존성 없음)
// 그리드 좌표는 x = column(0~3), y = row(0~3) 을 사용한다.

const SIZE = 4;
const WIN_VALUE = 2048;
const TRANSITION_MS = 110; // style.css의 .tile transition 시간과 맞춤
const SWIPE_THRESHOLD = 24; // px
const BEST_SCORE_KEY = "2048-best-score";
const THEME_KEY = "2048-theme";

const VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

// ===== DOM 참조 =====
const boardGrid = document.getElementById("board-grid");
const tilesLayer = document.getElementById("tiles-layer");
const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("best-score");
const scoreDeltaEl = document.getElementById("score-delta");
const newGameBtn = document.getElementById("new-game");
const themeToggleBtn = document.getElementById("theme-toggle");
const overlayEl = document.getElementById("overlay");
const overlayMessageEl = document.getElementById("overlay-message");
const overlayContinueBtn = document.getElementById("overlay-continue");
const overlayRestartBtn = document.getElementById("overlay-restart");

// ===== 게임 상태 =====
/** @type {{ cells: (Tile|null)[][], score: number, best: number, won: boolean, keepPlaying: boolean, over: boolean }} */
let state;
let nextTileId = 1;
let animating = false; // 이동 애니메이션 진행 중 입력 잠금
let blocked = false; // 오버레이(승리/패배) 표시 중 입력 차단
const tileElements = new Map(); // id -> HTMLElement
let metrics = { cellSize: 0, gap: 0 };

// ===== 타일 팩토리 =====
function createTile(x, y, value) {
  return {
    id: nextTileId++,
    x,
    y,
    previousX: x,
    previousY: y,
    value,
    mergedFrom: null,
  };
}

function createEmptyCells() {
  const cells = [];
  for (let x = 0; x < SIZE; x++) {
    cells.push(new Array(SIZE).fill(null));
  }
  return cells;
}

function withinBounds(x, y) {
  return x >= 0 && x < SIZE && y >= 0 && y < SIZE;
}

function cellAvailable(cells, x, y) {
  return withinBounds(x, y) && cells[x][y] === null;
}

function forEachCell(cells, callback) {
  for (let x = 0; x < SIZE; x++) {
    for (let y = 0; y < SIZE; y++) {
      callback(cells[x][y], x, y);
    }
  }
}

function availableCells(cells) {
  const result = [];
  forEachCell(cells, (tile, x, y) => {
    if (!tile) result.push({ x, y });
  });
  return result;
}

// ===== 게임 초기화 =====
function newGame() {
  const best = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
  state = {
    cells: createEmptyCells(),
    score: 0,
    best,
    won: false,
    keepPlaying: false,
    over: false,
  };
  nextTileId = 1;
  animating = false;
  blocked = false;
  tileElements.clear();
  tilesLayer.innerHTML = "";
  hideOverlay();

  addRandomTile();
  addRandomTile();

  updateMetrics();
  renderInitial();
  updateScoreDisplay();
}

function addRandomTile() {
  const cells = availableCells(state.cells);
  if (cells.length === 0) return null;
  const { x, y } = cells[Math.floor(Math.random() * cells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const tile = createTile(x, y, value);
  state.cells[x][y] = tile;
  return tile;
}

// ===== 이동 로직 =====
function buildTraversals(vector) {
  const traversal = [0, 1, 2, 3];
  const xs = vector.x === 1 ? [...traversal].reverse() : [...traversal];
  const ys = vector.y === 1 ? [...traversal].reverse() : [...traversal];
  return { xs, ys };
}

function findFarthestPosition(cells, cell, vector) {
  let previous;
  let current = cell;
  do {
    previous = current;
    current = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (withinBounds(current.x, current.y) && cellAvailable(cells, current.x, current.y));

  return { farthest: previous, next: current };
}

function moveTileTo(cells, tile, x, y) {
  cells[tile.x][tile.y] = null;
  tile.x = x;
  tile.y = y;
  cells[x][y] = tile;
}

function prepareTiles(cells) {
  forEachCell(cells, (tile) => {
    if (!tile) return;
    tile.previousX = tile.x;
    tile.previousY = tile.y;
    tile.mergedFrom = null;
  });
}

function move(direction) {
  const vector = VECTORS[direction];
  const cells = state.cells;
  prepareTiles(cells);

  let moved = false;
  let scoreGain = 0;
  let won = false;

  const { xs, ys } = buildTraversals(vector);

  xs.forEach((x) => {
    ys.forEach((y) => {
      const tile = cells[x][y];
      if (!tile) return;

      const originalX = tile.x;
      const originalY = tile.y;
      const { farthest, next } = findFarthestPosition(cells, tile, vector);
      const nextTile = withinBounds(next.x, next.y) ? cells[next.x][next.y] : null;

      if (nextTile && nextTile.value === tile.value && !nextTile.mergedFrom) {
        const merged = createTile(next.x, next.y, tile.value * 2);
        merged.mergedFrom = [tile, nextTile];

        cells[tile.x][tile.y] = null;
        tile.x = next.x;
        tile.y = next.y;
        cells[next.x][next.y] = merged;

        scoreGain += merged.value;
        if (merged.value === WIN_VALUE) won = true;
        moved = true;
      } else {
        moveTileTo(cells, tile, farthest.x, farthest.y);
        if (farthest.x !== originalX || farthest.y !== originalY) moved = true;
      }
    });
  });

  return { moved, scoreGain, won };
}

function movesAvailable() {
  if (availableCells(state.cells).length > 0) return true;

  for (let x = 0; x < SIZE; x++) {
    for (let y = 0; y < SIZE; y++) {
      const tile = state.cells[x][y];
      if (!tile) continue;
      const neighbors = [
        { x: x + 1, y },
        { x, y: y + 1 },
      ];
      for (const n of neighbors) {
        if (withinBounds(n.x, n.y)) {
          const other = state.cells[n.x][n.y];
          if (other && other.value === tile.value) return true;
        }
      }
    }
  }
  return false;
}

// ===== 렌더링 =====
function updateMetrics() {
  const gapPx = parseFloat(getComputedStyle(boardGrid).gap) || 0;
  const containerWidth = tilesLayer.clientWidth;
  const cellSize = (containerWidth - gapPx * (SIZE - 1)) / SIZE;
  metrics = { cellSize, gap: gapPx };
}

function positionOf(x, y) {
  const { cellSize, gap } = metrics;
  return {
    left: x * (cellSize + gap),
    top: y * (cellSize + gap),
    size: cellSize,
  };
}

function setTilePosition(el, x, y) {
  const { left, top, size } = positionOf(x, y);
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
}

function createTileElement(tile, animationClass) {
  const el = document.createElement("div");
  el.className = "tile";
  el.dataset.value = String(tile.value);
  if (tile.value > WIN_VALUE) el.dataset.super = "true";
  el.textContent = String(tile.value);
  setTilePosition(el, tile.x, tile.y);
  if (animationClass) el.classList.add(animationClass);
  return el;
}

function renderCellBackground() {
  boardGrid.innerHTML = "";
  for (let i = 0; i < SIZE * SIZE; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    boardGrid.appendChild(cell);
  }
}

function renderInitial() {
  renderCellBackground();
  tilesLayer.innerHTML = "";
  tileElements.clear();
  forEachCell(state.cells, (tile, x, y) => {
    if (!tile) return;
    const el = createTileElement(tile, "tile-spawn");
    tileElements.set(tile.id, el);
    tilesLayer.appendChild(el);
  });
}

// 1단계: 이동/병합 대상 타일들을 새 위치로 슬라이드
function renderSlide() {
  forEachCell(state.cells, (tile, x, y) => {
    if (!tile) return;
    if (tile.mergedFrom) {
      tile.mergedFrom.forEach((source) => {
        const el = tileElements.get(source.id);
        if (el) setTilePosition(el, x, y);
      });
    } else {
      const el = tileElements.get(tile.id);
      if (el) setTilePosition(el, x, y);
    }
  });
}

// 2단계: 병합된 원본 타일 제거 + 새 병합 타일 표시
function finalizeMerges() {
  forEachCell(state.cells, (tile, x, y) => {
    if (!tile || !tile.mergedFrom) return;
    tile.mergedFrom.forEach((source) => {
      const el = tileElements.get(source.id);
      if (el) {
        el.remove();
        tileElements.delete(source.id);
      }
    });
    const el = createTileElement(tile, "tile-merge");
    tileElements.set(tile.id, el);
    tilesLayer.appendChild(el);
  });
}

function renderSpawnedTile(tile) {
  if (!tile) return;
  const el = createTileElement(tile, "tile-spawn");
  tileElements.set(tile.id, el);
  tilesLayer.appendChild(el);
}

function repositionAll() {
  updateMetrics();
  forEachCell(state.cells, (tile, x, y) => {
    if (!tile) return;
    const el = tileElements.get(tile.id);
    if (el) setTilePosition(el, x, y);
  });
}

// ===== 점수판 =====
function updateScoreDisplay() {
  scoreEl.textContent = String(state.score);
  bestScoreEl.textContent = String(state.best);
}

function showScoreDelta(amount) {
  if (amount <= 0) return;
  scoreDeltaEl.textContent = `+${amount}`;
  scoreDeltaEl.classList.remove("show");
  // 리플로우를 강제해 애니메이션을 재시작
  void scoreDeltaEl.offsetWidth;
  scoreDeltaEl.classList.add("show");
}

// ===== 오버레이 =====
function showOverlay(message, { showContinue }) {
  overlayMessageEl.textContent = message;
  overlayContinueBtn.hidden = !showContinue;
  overlayEl.hidden = false;
  blocked = true;
}

function hideOverlay() {
  overlayEl.hidden = true;
  blocked = false;
}

// ===== 이동 실행 =====
function attemptMove(direction) {
  if (animating || blocked) return;

  const result = move(direction);
  if (!result.moved) return;

  animating = true;
  state.score += result.scoreGain;
  if (state.score > state.best) {
    state.best = state.score;
    localStorage.setItem(BEST_SCORE_KEY, String(state.best));
  }
  updateScoreDisplay();
  showScoreDelta(result.scoreGain);

  renderSlide();

  window.setTimeout(() => {
    finalizeMerges();
    const spawned = addRandomTile();
    renderSpawnedTile(spawned);

    animating = false;

    if (result.won && !state.won) {
      state.won = true;
      showOverlay("You Win!", { showContinue: true });
      return;
    }

    if (!movesAvailable()) {
      state.over = true;
      showOverlay("Game Over", { showContinue: false });
    }
  }, TRANSITION_MS);
}

// ===== 입력 처리: 키보드 =====
const KEY_DIRECTIONS = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

window.addEventListener("keydown", (event) => {
  const direction = KEY_DIRECTIONS[event.key];
  if (!direction) return;
  event.preventDefault();
  attemptMove(direction);
});

// ===== 입력 처리: 터치 스와이프 =====
let touchStartX = 0;
let touchStartY = 0;
let touchActive = false;

boardEl.addEventListener(
  "touchstart",
  (event) => {
    if (event.touches.length !== 1) return;
    touchActive = true;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  },
  { passive: true }
);

boardEl.addEventListener(
  "touchmove",
  (event) => {
    if (touchActive) event.preventDefault();
  },
  { passive: false }
);

boardEl.addEventListener("touchend", (event) => {
  if (!touchActive) return;
  touchActive = false;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return;

  if (Math.abs(dx) > Math.abs(dy)) {
    attemptMove(dx > 0 ? "right" : "left");
  } else {
    attemptMove(dy > 0 ? "down" : "up");
  }
});

// ===== 버튼 =====
newGameBtn.addEventListener("click", () => newGame());
overlayRestartBtn.addEventListener("click", () => newGame());
overlayContinueBtn.addEventListener("click", () => {
  state.keepPlaying = true;
  hideOverlay();
});

// ===== 리사이즈 =====
let resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(repositionAll, 100);
});

// ===== 다크 모드 =====
function applyStoredTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") {
    document.documentElement.dataset.theme = stored;
    themeToggleBtn.querySelector(".theme-icon").textContent = stored === "dark" ? "☀️" : "🌙";
  }
}

function toggleTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const current = document.documentElement.dataset.theme || (prefersDark ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);
  themeToggleBtn.querySelector(".theme-icon").textContent = next === "dark" ? "☀️" : "🌙";
}

themeToggleBtn.addEventListener("click", toggleTheme);

// ===== 시작 =====
applyStoredTheme();
newGame();
