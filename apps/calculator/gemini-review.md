- **[Medium] 키보드 입력 시 연산자 버튼 활성화 상태 누락**
  - **근거:** `script.js`의 `updateActiveOpKey()` 함수에서는 `.key-op` 버튼들을 순회하며 `pendingOp !== null && btn.dataset.op === pendingOp && overwrite` 조건에 따라 `.is-active` 클래스를 토글합니다. 하지만 `window.addEventListener("keydown")` 이벤트 리스너 내부에서는 키보드 단축키(예: `+`, `-`, `*`, `/`)로 연산자를 선택한 직후 `updateActiveOpKey()`를 명시적으로 호출하지 않고 있습니다. 반면 키패드 클릭 핸들러에서는 마지막에 `render()`를 호출하여 `updateActiveOpKey()`가 반영됩니다. 이로 인해 키보드로 연산자를 입력했을 때는 연산자 버튼의 활성화(`is-active`) UI가 갱신되지 않는 불일치(Edge Case)가 발생합니다.

- **[Low] 테마 토글 시 `prefers-color-scheme` 변경 실시간 감지 미비**
  - **근거:** `script.js`의 `initTheme()` 및 `toggleTheme()` 함수는 `localStorage`에 저장된 값이 없거나 시스템 설정을 최초 읽을 때 `window.matchMedia("(prefers-color-scheme: dark)").matches`를 일회성으로 평가합니다. 사용자가 OS 레벨에서 다크 모드/라이트 모드를 동적으로 전환할 때 `media-query` 변화를 감지하는 `change` 이벤트 리스너가 없어, 수동 토글 이력이 없는 상태에서는 OS 테마 변경이 즉시 반영되지 않습니다.
