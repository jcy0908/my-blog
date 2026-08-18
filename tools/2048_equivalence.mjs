// ==========================================================================
// 2048_equivalence.mjs — apps/2048/rules.js와 wasm 구현이 같은가.
//
// 무작위 게임을 처음부터 끝까지 두 구현에 똑같이 먹인다. 같은 판, 같은
// 방향, 같은 자리에 스폰. 매 수마다 판·점수·이동 여부·정체성 연결까지
// 대조한다. 어느 한 칸이라도 갈라지면 그 자리에서 멈춘다.
//
//   node tools/2048_equivalence.mjs
// ==========================================================================

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const wasmPath = fileURLToPath(new URL('../apps/2048/grid.wasm', import.meta.url));
globalThis.fetch = async () =>
  new Response(readFileSync(wasmPath), { headers: { 'Content-Type': 'application/wasm' } });

const js = await import('../apps/2048/rules.js');
const wa = await import('../apps/2048/rules-wasm.js');
await wa.loadGridWasm();

const SIZE = js.SIZE;
const DIRECTIONS = ['up', 'right', 'down', 'left'];

// 결정적 난수 — 같은 게임을 두 번 재현하기 위해서다
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const emptyGrid = () => Array.from({ length: SIZE }, () => new Array(SIZE).fill(null));

function makeTileFactory() {
  let id = 0;
  return (x, y, value) => ({ id: id++, x, y, value, previousX: null, previousY: null, mergedFrom: null });
}

const flat = (cells) =>
  Array.from({ length: SIZE }, (_, x) =>
    Array.from({ length: SIZE }, (_, y) => (cells[x][y] ? cells[x][y].value : 0))
  ).flat().join(',');

/** 병합 관계까지 비교한다 — 값만 같고 애니메이션 연결이 어긋나면 안 된다. */
function shapeOf(cells) {
  const out = [];
  for (let x = 0; x < SIZE; x += 1) {
    for (let y = 0; y < SIZE; y += 1) {
      const t = cells[x][y];
      if (!t) { out.push('.'); continue; }
      out.push(t.mergedFrom
        ? `M${t.value}<${t.mergedFrom[0].id},${t.mergedFrom[1].id}`
        : `T${t.value}#${t.id}`);
    }
  }
  return out.join('|');
}

let games = 0;
let moves = 0;
let mismatches = 0;

for (let seed = 1; seed <= 200 && mismatches === 0; seed += 1) {
  const rand = rng(seed);
  const cellsA = emptyGrid();
  const cellsB = emptyGrid();
  const makeA = makeTileFactory();
  const makeB = makeTileFactory();

  const spawn = () => {
    const free = js.availableCells(cellsA);
    if (!free.length) return false;
    const pick = free[Math.floor(rand() * free.length)];
    const value = rand() < 0.9 ? 2 : 4;
    cellsA[pick.x][pick.y] = makeA(pick.x, pick.y, value);
    cellsB[pick.x][pick.y] = makeB(pick.x, pick.y, value);
    return true;
  };
  spawn();
  spawn();

  for (let turn = 0; turn < 400; turn += 1) {
    const dir = DIRECTIONS[Math.floor(rand() * 4)];

    const ra = js.move(cellsA, dir, makeA);
    const rb = wa.move(cellsB, dir, makeB);
    moves += 1;

    const problems = [];
    if (flat(cellsA) !== flat(cellsB)) problems.push('판');
    if (ra.moved !== rb.moved) problems.push(`moved ${ra.moved}/${rb.moved}`);
    if (ra.scoreGain !== rb.scoreGain) problems.push(`점수 ${ra.scoreGain}/${rb.scoreGain}`);
    if (ra.won !== rb.won) problems.push(`won ${ra.won}/${rb.won}`);
    if (shapeOf(cellsA) !== shapeOf(cellsB)) problems.push('정체성·병합 연결');
    if (js.movesAvailable(cellsA) !== wa.movesAvailable(cellsB)) problems.push('movesAvailable');

    if (problems.length) {
      mismatches += 1;
      console.log(`\n  x seed ${seed}, ${turn}수 (${dir}) — ${problems.join(', ')}`);
      console.log('    rules.js :', flat(cellsA));
      console.log('    wasm     :', flat(cellsB));
      console.log('    rules.js :', shapeOf(cellsA));
      console.log('    wasm     :', shapeOf(cellsB));
      break;
    }

    if (ra.moved && !spawn()) break;
    if (!js.movesAvailable(cellsA)) break;
  }
  games += 1;
}

console.log('\napps/2048/rules.js ↔ grid.wasm 동등성\n');
console.log(`  게임 ${games}판, ${moves}수 대조`);
console.log('  판 상태 · 점수 · 이동 여부 · 승리 · 타일 정체성과 병합 연결 · movesAvailable');
console.log(`\n통과 ${mismatches === 0 ? moves : 0} / 실패 ${mismatches}\n`);
process.exit(mismatches === 0 ? 0 : 1);
