// ==========================================================================
// rules.js — 2048의 규칙. DOM을 모른다.
//
// script.js에서 그대로 떼어 낸 것이며 동작은 같다. 순수하게 분리한 이유는
// 두 가지다. 규칙과 그리기를 섞어 두면 어느 쪽도 검증하기 어렵고, 같은
// 규칙을 C++로 다시 구현해 대조하려면 JS 쪽이 import 가능해야 한다.
// ==========================================================================

export const SIZE = 4;
export const WIN_VALUE = 2048;

export const VECTORS = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

export function createEmptyCells() {
  const cells = [];
  for (let x = 0; x < SIZE; x++) {
    cells.push(new Array(SIZE).fill(null));
  }
  return cells;
}

export function withinBounds(x, y) {
  return x >= 0 && x < SIZE && y >= 0 && y < SIZE;
}

export function cellAvailable(cells, x, y) {
  return !cells[x][y];
}

export function forEachCell(cells, callback) {
  for (let x = 0; x < SIZE; x++) {
    for (let y = 0; y < SIZE; y++) {
      callback(cells[x][y], x, y);
    }
  }
}

export function availableCells(cells) {
  const out = [];
  forEachCell(cells, (tile, x, y) => {
    if (!tile) out.push({ x, y });
  });
  return out;
}

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

export function prepareTiles(cells) {
  forEachCell(cells, (tile) => {
    if (!tile) return;
    tile.previousX = tile.x;
    tile.previousY = tile.y;
    tile.mergedFrom = null;
  });
}

/**
 * 한 방향으로 민다. cells를 제자리에서 바꾼다.
 * createTile(x, y, value)는 호출자가 준다 — id 발급은 규칙의 일이 아니다.
 */
export function move(cells, direction, createTile) {
  const vector = VECTORS[direction];
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

export function movesAvailable(cells) {
  if (availableCells(cells).length > 0) return true;

  for (let x = 0; x < SIZE; x++) {
    for (let y = 0; y < SIZE; y++) {
      const tile = cells[x][y];
      if (!tile) continue;
      const neighbors = [
        { x: x + 1, y },
        { x, y: y + 1 },
      ];
      for (const n of neighbors) {
        if (withinBounds(n.x, n.y)) {
          const other = cells[n.x][n.y];
          if (other && other.value === tile.value) return true;
        }
      }
    }
  }
  return false;
}
