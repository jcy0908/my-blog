// ==========================================================================
// rules-wasm.js — rules.js와 같은 API. 규칙 계산만 C++/WebAssembly가 맡는다.
//
// 옮긴 것은 "어느 칸의 무엇이 어디로 갔는가"뿐이다. 타일의 정체성(id)과
// 애니메이션은 JS가 계속 들고 있다. wasm이 출처 인덱스를 함께 돌려주므로
// 같은 타일을 이어 붙일 수 있고, 그래서 렌더러는 한 줄도 바뀌지 않았다.
//
// 두 구현이 같은 값을 낸다는 것은 tools/2048_equivalence.mjs가 확인한다.
// ==========================================================================

import { SIZE, WIN_VALUE, VECTORS, createEmptyCells, withinBounds, cellAvailable,
         forEachCell, availableCells, prepareTiles } from './rules.js';

export { SIZE, WIN_VALUE, VECTORS, createEmptyCells, withinBounds, cellAvailable,
         forEachCell, availableCells, prepareTiles };

const WASM_URL = new URL('./grid.wasm', import.meta.url);
const DIRECTION_INDEX = { up: 0, right: 1, down: 2, left: 3 };

let mod = null;

export async function loadGridWasm() {
  if (mod) return mod;
  const response = await fetch(WASM_URL);
  if (!response.ok) throw new Error(`grid.wasm ${response.status}`);

  let instance;
  if (typeof WebAssembly.instantiateStreaming === 'function') {
    try {
      ({ instance } = await WebAssembly.instantiateStreaming(response.clone(), {}));
    } catch (err) {
      // 서버가 application/wasm을 주지 않는 경우 — 바이트로 다시 시도한다
      ({ instance } = await WebAssembly.instantiate(await response.arrayBuffer(), {}));
    }
  } else {
    ({ instance } = await WebAssembly.instantiate(await response.arrayBuffer(), {}));
  }

  const exports = instance.exports;
  mod = {
    exports,
    scratch: new Int32Array(exports.memory.buffer, exports.grid_scratch(), exports.grid_scratch_size()),
  };
  return mod;
}

/** cells의 값을 스크래치 앞부분에 싣고, 타일 원본을 인덱스로 기억해 둔다. */
function writeBoard(cells) {
  const tiles = new Array(SIZE * SIZE).fill(null);
  for (let x = 0; x < SIZE; x += 1) {
    for (let y = 0; y < SIZE; y += 1) {
      const i = x * SIZE + y;
      const tile = cells[x][y];
      tiles[i] = tile;
      mod.scratch[i] = tile ? tile.value : 0;
    }
  }
  return tiles;
}

/** rules.js의 buildTraversals와 같은 순서로 칸 인덱스를 늘어놓는다. */
function traversalOrder(direction) {
  const v = VECTORS[direction];
  const base = [0, 1, 2, 3];
  const xs = v.x === 1 ? [...base].reverse() : base;
  const ys = v.y === 1 ? [...base].reverse() : base;
  const order = [];
  for (const x of xs) for (const y of ys) order.push(x * SIZE + y);
  return order;
}

export function move(cells, direction, createTile) {
  prepareTiles(cells);
  const before = writeBoard(cells);

  mod.exports.grid_move(DIRECTION_INDEX[direction] ?? 0);

  const s = mod.scratch;

  // 병합으로 생긴 타일은 rules.js와 같은 순서로 만들어야 한다. id가 그
  // 순서로 발급되기 때문이다. 밀고 들어온 타일이 순회에서 언제 방문되는지가
  // 곧 생성 순서다.
  const destOfMover = new Int32Array(SIZE * SIZE).fill(-1);
  for (let d = 0; d < SIZE * SIZE; d += 1) {
    if (s[16 + d] && s[48 + d] !== -1) destOfMover[s[32 + d]] = d;
  }

  const mergedAt = new Array(SIZE * SIZE).fill(null);
  for (const i of traversalOrder(direction)) {
    const d = destOfMover[i];
    if (d === -1) continue;
    const x = Math.floor(d / SIZE);
    const y = d % SIZE;
    const merged = createTile(x, y, s[16 + d]);
    // 순서는 rules.js와 같다: [밀고 들어온 타일, 제자리에 있던 타일]
    merged.mergedFrom = [before[s[32 + d]], before[s[48 + d]]];
    mergedAt[d] = merged;
  }

  for (let x = 0; x < SIZE; x += 1) {
    for (let y = 0; y < SIZE; y += 1) cells[x][y] = null;
  }

  for (let d = 0; d < SIZE * SIZE; d += 1) {
    const value = s[16 + d];
    if (!value) continue;

    const x = Math.floor(d / SIZE);
    const y = d % SIZE;

    if (mergedAt[d]) {
      const mover = before[s[32 + d]];
      mover.x = x;
      mover.y = y;
      cells[x][y] = mergedAt[d];
    } else {
      const tile = before[s[32 + d]];
      tile.x = x;
      tile.y = y;
      cells[x][y] = tile;
    }
  }

  return { moved: s[65] === 1, scoreGain: s[64], won: s[66] === 1 };
}

export function movesAvailable(cells) {
  writeBoard(cells);
  return mod.exports.grid_moves_available() === 1;
}
