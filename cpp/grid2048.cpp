// ==========================================================================
// grid2048.cpp — 2048의 규칙을 C++로. apps/2048/rules.js와 같은 값을 낸다.
//
// 그리기는 옮기지 않는다. 타일의 정체성(id)과 애니메이션은 JS가 들고 있고,
// 여기서는 "어느 칸의 무엇이 어디로 갔는가"만 계산한다. 그래서 결과에
// 값뿐 아니라 출처 인덱스를 함께 돌려준다 — JS는 그것으로 같은 타일을
// 이어 붙여 애니메이션을 유지한다.
//
// Emscripten을 쓰지 않는다. clang의 wasm32 타깃과 wasm-ld만으로 빌드하며
// 힙도 표준 라이브러리도 쓰지 않는다.
//
// 칸 인덱스는 JS의 cells[x][y]와 같게 idx = x * 4 + y 이다.
// ==========================================================================

namespace {

constexpr int kSize = 4;
constexpr int kCells = kSize * kSize;
constexpr int kWin = 2048;

// 스크래치 배치 — JS가 Int32Array를 얹어 읽고 쓴다
//   [0..15]  입력 값 (0 = 빈 칸)
//   [16..31] 결과 값
//   [32..47] 출처 A (움직인 타일의 원래 칸, -1 = 없음)
//   [48..63] 출처 B (병합된 경우 제자리에 있던 타일, -1 = 없음)
//   [64] 얻은 점수, [65] 움직였는가, [66] 2048을 만들었는가
constexpr int kScratchSize = 67;
int g_scratch[kScratchSize] = {};

struct Vector {
  int x, y;
};

// JS의 VECTORS와 같은 순서: 0=up, 1=right, 2=down, 3=left
constexpr Vector kVectors[4] = {{0, -1}, {1, 0}, {0, 1}, {-1, 0}};

inline bool withinBounds(int x, int y) {
  return x >= 0 && x < kSize && y >= 0 && y < kSize;
}

inline int idx(int x, int y) { return x * kSize + y; }

}  // namespace

extern "C" {

int* grid_scratch() { return g_scratch; }
int grid_scratch_size() { return kScratchSize; }

/// 한 방향으로 민다. 입력은 scratch[0..15], 결과는 위 배치대로 쓴다.
void grid_move(int direction) {
  if (direction < 0 || direction > 3) direction = 0;
  const Vector v = kVectors[direction];

  int val[kCells];
  int srcA[kCells];
  int srcB[kCells];
  bool merged[kCells];

  for (int i = 0; i < kCells; ++i) {
    val[i] = g_scratch[i];
    srcA[i] = val[i] ? i : -1;
    srcB[i] = -1;
    merged[i] = false;
  }

  // JS의 buildTraversals와 같다 — 이동 방향의 반대쪽부터 훑는다
  int xs[kSize], ys[kSize];
  for (int i = 0; i < kSize; ++i) {
    xs[i] = (v.x == 1) ? (kSize - 1 - i) : i;
    ys[i] = (v.y == 1) ? (kSize - 1 - i) : i;
  }

  int score = 0;
  bool moved = false;
  bool won = false;

  for (int xi = 0; xi < kSize; ++xi) {
    for (int yi = 0; yi < kSize; ++yi) {
      const int x = xs[xi];
      const int y = ys[yi];
      const int here = idx(x, y);
      if (!val[here]) continue;

      // 갈 수 있는 가장 먼 빈 칸과, 그 다음 칸
      int fx = x, fy = y;
      int nx = x + v.x, ny = y + v.y;
      while (withinBounds(nx, ny) && !val[idx(nx, ny)]) {
        fx = nx;
        fy = ny;
        nx += v.x;
        ny += v.y;
      }

      const int farthest = idx(fx, fy);
      const bool nextInside = withinBounds(nx, ny);
      const int next = nextInside ? idx(nx, ny) : -1;

      if (nextInside && val[next] == val[here] && !merged[next]) {
        const int mergedValue = val[here] * 2;
        srcB[next] = srcA[next];   // 제자리에 있던 타일
        srcA[next] = srcA[here];   // 밀고 들어온 타일
        val[next] = mergedValue;
        merged[next] = true;

        val[here] = 0;
        srcA[here] = -1;
        srcB[here] = -1;

        score += mergedValue;
        if (mergedValue == kWin) won = true;
        moved = true;
      } else if (farthest != here) {
        val[farthest] = val[here];
        srcA[farthest] = srcA[here];
        srcB[farthest] = -1;
        val[here] = 0;
        srcA[here] = -1;
        moved = true;
      }
    }
  }

  for (int i = 0; i < kCells; ++i) {
    g_scratch[16 + i] = val[i];
    g_scratch[32 + i] = srcA[i];
    g_scratch[48 + i] = srcB[i];
  }
  g_scratch[64] = score;
  g_scratch[65] = moved ? 1 : 0;
  g_scratch[66] = won ? 1 : 0;
}

/// 빈 칸이 있거나 붙어 있는 같은 값이 있으면 1. 입력은 scratch[0..15].
int grid_moves_available() {
  for (int i = 0; i < kCells; ++i) {
    if (!g_scratch[i]) return 1;
  }
  for (int x = 0; x < kSize; ++x) {
    for (int y = 0; y < kSize; ++y) {
      const int value = g_scratch[idx(x, y)];
      if (!value) continue;
      if (withinBounds(x + 1, y) && g_scratch[idx(x + 1, y)] == value) return 1;
      if (withinBounds(x, y + 1) && g_scratch[idx(x, y + 1)] == value) return 1;
    }
  }
  return 0;
}

}  // extern "C"
