const THEME_KEY = "calculator-theme";

// ===== 상태 =====
let currentValue = "0"; // 현재 입력/결과 표시값 (문자열)
let previousValue = null; // 이전 피연산자 (숫자)
let pendingOp = null; // 대기 중인 연산자 ("+","-","×","÷")
let overwrite = true; // 다음 숫자 입력 시 현재값을 덮어쓸지 여부(결과 표시 직후 등)

// ===== DOM =====
const displayValueEl = document.getElementById("display-value");
const displayExpressionEl = document.getElementById("display-expression");
const themeToggleBtn = document.getElementById("theme-toggle");
const keypadEl = document.querySelector(".keypad");

// ===== 렌더링 =====
function formatNumber(numStr) {
  if (numStr === "" || numStr === "-") return numStr;
  const [intPart, decPart] = numStr.split(".");
  const negative = intPart.startsWith("-");
  const digits = negative ? intPart.slice(1) : intPart;
  const withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const sign = negative ? "-" : "";
  return decPart !== undefined ? `${sign}${withCommas}.${decPart}` : `${sign}${withCommas}`;
}

function render() {
  displayValueEl.textContent = formatNumber(currentValue);
  if (pendingOp && previousValue !== null) {
    displayExpressionEl.textContent = `${formatNumber(String(previousValue))} ${pendingOp}`;
  } else {
    displayExpressionEl.textContent = "";
  }
  updateActiveOpKey();
}

function updateActiveOpKey() {
  document.querySelectorAll(".key-op").forEach((btn) => {
    btn.classList.toggle("is-active", pendingOp !== null && btn.dataset.op === pendingOp && overwrite);
  });
}

// ===== 입력 처리 =====
function inputDigit(digit) {
  if (overwrite) {
    currentValue = digit === "." ? "0." : digit;
    overwrite = false;
    return;
  }
  if (digit === "." ) {
    if (currentValue.includes(".")) return;
    currentValue += ".";
    return;
  }
  if (currentValue === "0") {
    currentValue = digit;
  } else {
    // 입력 자릿수 과도한 증가 방지
    if (currentValue.replace(/[-.]/g, "").length >= 15) return;
    currentValue += digit;
  }
}

function clearAll() {
  currentValue = "0";
  previousValue = null;
  pendingOp = null;
  overwrite = true;
}

function backspace() {
  if (overwrite) return;
  if (currentValue.length <= 1 || (currentValue.length === 2 && currentValue.startsWith("-"))) {
    currentValue = "0";
    overwrite = true;
    return;
  }
  currentValue = currentValue.slice(0, -1);
}

function percent() {
  const value = parseFloat(currentValue) / 100;
  currentValue = trimResult(value);
  overwrite = true;
}

function compute(a, b, op) {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      return b === 0 ? NaN : a / b;
    default:
      return b;
  }
}

function trimResult(num) {
  if (Number.isNaN(num) || !Number.isFinite(num)) return "오류";
  // 부동소수점 오차 제거를 위해 소수점 10자리에서 반올림
  const rounded = Math.round((num + Number.EPSILON) * 1e10) / 1e10;
  return String(rounded);
}

function chooseOperator(op) {
  if (currentValue === "오류") return;

  if (pendingOp !== null && !overwrite) {
    // 연속 연산: 이전 연산을 먼저 계산
    const result = compute(previousValue, parseFloat(currentValue), pendingOp);
    if (result === "오류" || Number.isNaN(result) || !Number.isFinite(result)) {
      currentValue = "오류";
      previousValue = null;
      pendingOp = null;
      overwrite = true;
      render();
      return;
    }
    previousValue = result;
    currentValue = trimResult(result);
  } else {
    previousValue = parseFloat(currentValue);
  }
  pendingOp = op;
  overwrite = true;
}

function equals() {
  if (pendingOp === null || previousValue === null || currentValue === "오류") return;
  const result = compute(previousValue, parseFloat(currentValue), pendingOp);
  currentValue = trimResult(result);
  previousValue = null;
  pendingOp = null;
  overwrite = true;
}

// ===== 키패드 클릭 =====
keypadEl.addEventListener("click", (event) => {
  const btn = event.target.closest(".key");
  if (!btn) return;

  const { num, op, action } = btn.dataset;

  if (num !== undefined) {
    inputDigit(num);
  } else if (op !== undefined) {
    chooseOperator(op);
  } else if (action === "clear") {
    clearAll();
  } else if (action === "backspace") {
    backspace();
  } else if (action === "percent") {
    percent();
  } else if (action === "decimal") {
    inputDigit(".");
  } else if (action === "equals") {
    equals();
  }

  render();
});

// ===== 키보드 입력 =====
window.addEventListener("keydown", (event) => {
  const { key } = event;

  if (/^[0-9]$/.test(key)) {
    inputDigit(key);
    render();
    return;
  }

  switch (key) {
    case ".":
      inputDigit(".");
      render();
      break;
    case "+":
      chooseOperator("+");
      render();
      break;
    case "-":
      chooseOperator("-");
      render();
      break;
    case "*":
      chooseOperator("×");
      render();
      break;
    case "/":
      event.preventDefault();
      chooseOperator("÷");
      render();
      break;
    case "Enter":
    case "=":
      event.preventDefault();
      equals();
      render();
      break;
    case "Backspace":
      backspace();
      render();
      break;
    case "Escape":
      clearAll();
      render();
      break;
    case "%":
      percent();
      render();
      break;
    default:
      break;
  }
});

// ===== 다크모드 =====
function initTheme() {
  const stored = localStorage.getItem(THEME_KEY);
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
  localStorage.setItem(THEME_KEY, next);
  updateThemeIcon(next);
}

themeToggleBtn.addEventListener("click", toggleTheme);

// ===== 초기화 =====
initTheme();
render();
