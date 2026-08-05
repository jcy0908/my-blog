// ===== 픽셀 아트 에디터 =====
// 16x16 논리 격자를 상태 배열로 관리하고, 화면 표시용 캔버스와 저장용 캔버스가
// 동일한 render 로직(색상 상태 -> 사각형)을 공유하도록 구성한다.

const GRID_SIZE = 16;
const EXPORT_SCALE = 32; // 16 * 32 = 512px 최종 저장 이미지 크기
const THEME_KEY = "pixel-art-theme";

const PRESET_COLORS = [
  "#000000", // 검정
  "#ffffff", // 흰색
  "#7f7f7f", // 회색
  "#c2c2c2", // 밝은 회색
  "#e53935", // 빨강
  "#fb8c00", // 주황
  "#fdd835", // 노랑
  "#43a047", // 초록
  "#00acc1", // 청록
  "#1e88e5", // 파랑
  "#3949ab", // 남색
  "#8e24aa", // 보라
  "#d81b60", // 분홍
  "#6d4c41", // 갈색
  "#8d6e63", // 연갈색
  "#37474f", // 남회색
];

// 상태: 256칸, 각 칸은 색상 문자열(#rrggbb) 또는 null(투명/미채색)
const grid = new Array(GRID_SIZE * GRID_SIZE).fill(null);

let currentColor = PRESET_COLORS[0];
let currentTool = "pen"; // 'pen' | 'eraser'
let isDrawing = false;
let lastPaintedIndex = -1;

// ===== DOM 참조 =====
const canvas = document.getElementById("pixel-canvas");
const ctx = canvas.getContext("2d");
const paletteGrid = document.getElementById("palette-grid");
const customColorInput = document.getElementById("custom-color");
const toolPenBtn = document.getElementById("tool-pen");
const toolEraserBtn = document.getElementById("tool-eraser");
const clearBtn = document.getElementById("clear-button");
const saveBtn = document.getElementById("save-button");
const themeToggleBtn = document.getElementById("theme-toggle");

// ===== 유틸 =====
function indexOf(row, col) {
  return row * GRID_SIZE + col;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// ===== 렌더링 =====
function render() {
  const width = canvas.width;
  const height = canvas.height;
  const cellPx = width / GRID_SIZE;

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, width, height);

  const checkerA = getCssVar("--checker-a") || "#f0ece4";
  const checkerB = getCssVar("--checker-b") || "#d8d1c4";
  const gridLine = getCssVar("--grid-line") || "rgba(0,0,0,0.15)";

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const color = grid[indexOf(row, col)];
      const x = col * cellPx;
      const y = row * cellPx;

      if (color === null) {
        ctx.fillStyle = (row + col) % 2 === 0 ? checkerA : checkerB;
      } else {
        ctx.fillStyle = color;
      }
      ctx.fillRect(x, y, cellPx, cellPx);
    }
  }

  // 격자선 (편집 편의용, 저장 이미지에는 포함하지 않음)
  ctx.strokeStyle = gridLine;
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID_SIZE; i++) {
    const pos = Math.round(i * cellPx) + 0.5;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(width, pos);
    ctx.stroke();
  }
}

// ===== 입력 처리: 좌표 -> 격자 인덱스 =====
function getCellFromClientPoint(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const relX = clientX - rect.left;
  const relY = clientY - rect.top;

  let col = Math.floor((relX / rect.width) * GRID_SIZE);
  let row = Math.floor((relY / rect.height) * GRID_SIZE);

  col = clamp(col, 0, GRID_SIZE - 1);
  row = clamp(row, 0, GRID_SIZE - 1);

  return { row, col };
}

// ===== 도트 찍기 =====
function paintCell(row, col) {
  const idx = indexOf(row, col);
  if (idx === lastPaintedIndex) return; // 같은 셀 반복 호출 스킵

  const nextValue = currentTool === "eraser" ? null : currentColor;
  if (grid[idx] === nextValue) {
    lastPaintedIndex = idx;
    return;
  }

  grid[idx] = nextValue;
  lastPaintedIndex = idx;
  render();
}

function paintFromClientPoint(clientX, clientY) {
  const { row, col } = getCellFromClientPoint(clientX, clientY);
  paintCell(row, col);
}

// ===== 마우스 이벤트 =====
canvas.addEventListener("mousedown", (e) => {
  isDrawing = true;
  lastPaintedIndex = -1;
  paintFromClientPoint(e.clientX, e.clientY);
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDrawing) return;
  paintFromClientPoint(e.clientX, e.clientY);
});

window.addEventListener("mouseup", () => {
  isDrawing = false;
  lastPaintedIndex = -1;
});

canvas.addEventListener("mouseleave", () => {
  lastPaintedIndex = -1;
});

// ===== 터치 이벤트 =====
canvas.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    isDrawing = true;
    lastPaintedIndex = -1;
    const touch = e.touches[0];
    if (touch) paintFromClientPoint(touch.clientX, touch.clientY);
  },
  { passive: false }
);

canvas.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const touch = e.touches[0];
    if (touch) paintFromClientPoint(touch.clientX, touch.clientY);
  },
  { passive: false }
);

canvas.addEventListener("touchend", () => {
  isDrawing = false;
  lastPaintedIndex = -1;
});

canvas.addEventListener("touchcancel", () => {
  isDrawing = false;
  lastPaintedIndex = -1;
});

// ===== 팔레트 =====
function setCurrentColor(color) {
  currentColor = color;
  // 지우개 상태였다면 색을 고르는 순간 펜으로 전환해 바로 그릴 수 있게 함
  setCurrentTool("pen");
  highlightSelectedSwatch();
}

function highlightSelectedSwatch() {
  const swatches = paletteGrid.querySelectorAll(".swatch");
  swatches.forEach((swatch) => {
    swatch.classList.toggle("is-selected", swatch.dataset.color.toLowerCase() === currentColor.toLowerCase());
  });
}

function buildPalette() {
  PRESET_COLORS.forEach((color) => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "swatch";
    swatch.style.backgroundColor = color;
    swatch.dataset.color = color;
    swatch.setAttribute("aria-label", `색상 ${color}`);
    swatch.addEventListener("click", () => setCurrentColor(color));
    paletteGrid.appendChild(swatch);
  });
  highlightSelectedSwatch();
}

customColorInput.addEventListener("input", (e) => {
  setCurrentColor(e.target.value);
});

// ===== 도구 (펜/지우개) =====
function setCurrentTool(tool) {
  currentTool = tool;
  const isPen = tool === "pen";
  toolPenBtn.classList.toggle("is-active", isPen);
  toolEraserBtn.classList.toggle("is-active", !isPen);
  toolPenBtn.setAttribute("aria-pressed", String(isPen));
  toolEraserBtn.setAttribute("aria-pressed", String(!isPen));
}

toolPenBtn.addEventListener("click", () => setCurrentTool("pen"));
toolEraserBtn.addEventListener("click", () => setCurrentTool("eraser"));

// ===== 전체 지우기 =====
clearBtn.addEventListener("click", () => {
  const confirmed = window.confirm("모든 그림을 지울까요?");
  if (!confirmed) return;
  grid.fill(null);
  render();
});

// ===== PNG 저장 =====
function exportPNG() {
  // 1) 16x16, 1px=1칸 오프스크린 캔버스에 실제 색상만 그린다 (격자선 없음, 투명 유지)
  const smallCanvas = document.createElement("canvas");
  smallCanvas.width = GRID_SIZE;
  smallCanvas.height = GRID_SIZE;
  const smallCtx = smallCanvas.getContext("2d");
  smallCtx.clearRect(0, 0, GRID_SIZE, GRID_SIZE);

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const color = grid[indexOf(row, col)];
      if (color === null) {
        smallCtx.clearRect(col, row, 1, 1);
      } else {
        smallCtx.fillStyle = color;
        smallCtx.fillRect(col, row, 1, 1);
      }
    }
  }

  // 2) 최종 업스케일 캔버스에 선명하게 확대해서 그린다
  const exportSize = GRID_SIZE * EXPORT_SCALE;
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = exportSize;
  finalCanvas.height = exportSize;
  const finalCtx = finalCanvas.getContext("2d");
  finalCtx.imageSmoothingEnabled = false;
  finalCtx.drawImage(smallCanvas, 0, 0, exportSize, exportSize);

  // 3) 다운로드 트리거
  const dataUrl = finalCanvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = "pixel-art.png";
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

saveBtn.addEventListener("click", exportPNG);

// ===== 다크모드 =====
function initTheme() {
  let stored = null;
  try {
    stored = localStorage.getItem(THEME_KEY);
  } catch (e) {
    stored = null;
  }
  if (stored === "dark" || stored === "light") {
    document.documentElement.dataset.theme = stored;
    updateThemeIcon(stored);
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    updateThemeIcon(prefersDark ? "dark" : "light");
  }
}

function updateThemeIcon(theme) {
  const icon = themeToggleBtn.querySelector(".theme-icon");
  if (icon) icon.textContent = theme === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const current = document.documentElement.dataset.theme || (prefersDark ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch (e) {
    // 스토리지 접근이 차단된 환경: 이번 세션 동안만 테마 적용, 저장은 생략
  }
  updateThemeIcon(next);
  render(); // 테마 변경 시 체크무늬/격자선 색이 바뀌므로 다시 그림
}

themeToggleBtn.addEventListener("click", toggleTheme);

// ===== 초기화 =====
function init() {
  initTheme();
  buildPalette();
  setCurrentTool("pen");
  render();
}

init();
