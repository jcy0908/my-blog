#!/bin/sh
# grid.wasm을 만든다. Emscripten이 필요 없다 — clang과 wasm-ld면 된다.
#
#   sh cpp/build.sh
#
# 결과는 apps/2048/grid.wasm이며 그대로 커밋한다. 이 저장소의 앱에는 빌드
# 단계가 없고 GitHub Pages가 파일을 그대로 서빙하기 때문이다.
set -eu

root=$(cd "$(dirname "$0")/.." && pwd)
out="$root/apps/2048/grid.wasm"

clang++ \
  --target=wasm32 -O3 -std=c++17 \
  -nostdlib -ffreestanding -fno-exceptions -fno-rtti \
  -Wl,--no-entry -Wl,--strip-all \
  -Wl,--export=grid_scratch \
  -Wl,--export=grid_scratch_size \
  -Wl,--export=grid_move \
  -Wl,--export=grid_moves_available \
  -o "$out" \
  "$root/cpp/grid2048.cpp"

echo "만들었습니다: apps/2048/grid.wasm ($(wc -c < "$out")바이트)"
