# 2048 게임 검증 보고서 (review)

`spec.md`를 기준으로 `index.html`, `style.css`, `script.js`를 독립적으로 검증했다.

## 검증 항목별 결과

| 항목 | 결과 | 비고 |
|---|---|---|
| HTML ↔ script.js 참조 요소 일치 (id/class) | 통과 | `board-grid`, `tiles-layer`, `board`, `score`, `best-score`, `score-delta`, `new-game`, `theme-toggle`, `overlay`, `overlay-message`, `overlay-continue`, `overlay-restart` 전부 존재하고 정확히 매칭됨 |
| 4방향 이동/병합 로직 정확성 | 통과 | `findFarthestPosition` + `mergedFrom` 플래그 방식으로 원조 2048(gabrielecirulli) 알고리즘과 동일한 구조. `[2,2,2,2]`를 왼쪽으로 미는 케이스를 손으로 추적해 `[4,4,_,_]`로 정확히 병합되고(한 번의 이동에서 8로 이중병합되지 않음) 확인함 |
| 이동 후 재압축 | 통과 | 병합/비병합 모두 `moveTileTo`로 `farthest` 위치까지 즉시 압축되므로 별도의 2차 압축 패스 불필요 |
| 점수 계산 | 통과 | 병합마다 `merged.value`를 `scoreGain`에 누적, `attemptMove`에서 `state.score`에 반영 |
| localStorage 최고점수 저장/로드 | 통과 | 키 `2048-best-score`. `newGame()`에서 로드, 점수 갱신 시 즉시 `localStorage.setItem` |
| 승리(2048) 판정 | 통과 | `merged.value === WIN_VALUE`이고 `!state.won`일 때만 최초 1회 오버레이 트리거, "계속하기" 이후 재트리거 안 됨(2048 초과 허용) |
| 패배 판정 | 통과 | `movesAvailable()`가 빈칸 유무 + 우/하 인접 동일값 쌍 존재 여부로 정확히 판정 (모든 인접쌍을 한 번씩만 검사하므로 충분) |
| 승패 검사 순서 | 통과 | `attemptMove`: 이동 적용 → `renderSlide` → (타임아웃 후) `finalizeMerges` → 새 타일 스폰 → 승리 검사 → 패배 검사. spec 순서와 일치 |
| 키보드/터치 입력 통합 | 통과 | 둘 다 동일한 `attemptMove(direction)`을 호출. 키보드는 `keydown`+`preventDefault`, 터치는 `touchstart/touchmove/touchend`로 dx/dy 계산 후 임계값(24px) 비교 |
| 터치 스크롤/바운스 방지 | 통과 | `.board`에 `touch-action: none`, `overscroll-behavior: contain` 적용 + `touchmove`에서 `preventDefault` |
| 다크모드 자동감지 | 통과 | `@media (prefers-color-scheme: dark)`로 `:root` 변수 재정의 |
| 다크모드 수동 토글 + 유지 | 통과 | `data-theme` 속성 전환, `localStorage`(`2048-theme`) 저장/복원. `:root[data-theme="light|dark"]`가 속성 선택자로 인해 미디어쿼리 내 `:root`보다 우선 적용되어 시스템 설정보다 수동 선택이 항상 이김 (CSS 명세상 올바름) |
| 반응형 레이아웃 | 통과 | `.app { max-width:520px }`, `.board { aspect-ratio:1/1; max-width:480px }`, CSS Grid 4x4, `clamp()` 기반 폰트 크기, `@media (max-width:420px)`에서 컨트롤 영역 세로 스택 |
| `overlay[hidden]` 처리 | 통과 | `.overlay`에 `display:flex`가 걸려 있어 UA의 `[hidden]{display:none}`을 오버라이드할 수 있는데, `.overlay[hidden]{display:none}`을 명시적으로 추가해 정확히 처리함 (흔히 놓치는 부분인데 잘 처리됨) |
| `node --check script.js` | 통과 | 문법 오류 없음 |
| 정적 서버 응답 확인 | 통과 | `python3 -m http.server`로 기동 후 `index.html`, `style.css`, `script.js` 모두 200 응답 확인, 이후 서버 프로세스 종료 및 재확인(연결 거부) 완료 |

## 발견해서 수정한 문제

없음. 코드를 정독하고 핵심 이동/병합 알고리즘을 수기로 트레이싱했으나 로직 결함을 발견하지 못했음.

## 수정하지 않고 남겨둔 문제

없음 (구조적 결함 없음). 단, 참고 수준의 사소한 관찰 사항:
- `score-delta` 엘리먼트는 새 게임 시작 시 텍스트/클래스가 명시적으로 초기화되지 않지만, CSS 애니메이션 종료 후 `opacity:0`으로 고정되어 시각적으로는 문제되지 않음 (기능적 버그 아님, 수정 불필요로 판단).
- `TRANSITION_MS`(110ms)와 CSS `.tile` transition(100ms)이 정확히 일치하지 않고 10ms 여유를 둔 것은 의도적 버퍼로 보이며 문제 없음.

## 최종 결론

게임이 정상 동작한다고 판단한다. 마크업/스크립트 참조가 완전히 일치하고, 이동·병합·점수·승패 로직은 원조 2048 알고리즘과 동일한 구조로 정확성을 수기 검증했으며, 키보드/터치 입력이 동일 함수로 통합되어 있고, 다크모드·반응형도 spec 요구사항을 충족한다. 문법 오류 없고 정적 파일 서빙도 정상이다.
