// 2048 — 그리기와 입력. 규칙은 rules 모듈이 맡는다.
// 그리드 좌표는 x = column(0~3), y = row(0~3) 을 사용한다.
//
// 규칙(이동·병합·게임오버 판정)은 C++로 쓰여 WebAssembly로 빌드된
// grid.wasm이 계산한다. 받지 못하면 같은 API의 JS 구현(rules.js)으로
// 되돌아가고 게임은 똑같이 돌아간다.
//
// 두 구현이 같은 값을 낸다는 것은 tools/2048_equivalence.mjs가 확인한다 —
// 무작위 200판 27,507수를 판·점수·타일 정체성까지 대조한다.

let rules;
let rulesEngine = "JavaScript";
try {
  rules = await import("./rules-wasm.js");
  await rules.loadGridWasm();
  rulesEngine = "WebAssembly (C++)";
} catch (err) {
  rules = await import("./rules.js");
}
console.info(`2048 — 규칙 엔진: ${rulesEngine}`);

const { SIZE, WIN_VALUE, createEmptyCells, forEachCell, availableCells } = rules;

const TRANSITION_MS = 110; // style.css의 .tile transition 시간과 맞춤
const SWIPE_THRESHOLD = 24; // px
const BEST_SCORE_KEY = "2048-best-score";
const THEME_KEY = "2048-theme";

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

  const result = rules.move(state.cells, direction, createTile);
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

    if (!rules.movesAvailable(state.cells)) {
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
