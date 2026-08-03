# 사칙연산 계산기 — 리뷰 문서 (review)

## 1. 동작 확인

- `7 × 6 = 42` 정상 계산 확인 (실제 브라우저 클릭 테스트)
- `0 ÷ 0` → "오류" 표시, 크래시 없이 이후 입력에서 정상 복구
- 다크모드 토글 버튼 클릭 시 즉시 테마 전환, 아이콘(🌙/☀️) 정상 갱신
- 콘솔 에러 없음

## 2. 코드 점검

- `script.js`: 순수 ES 모듈, 외부 의존성 없음. 상태(`currentValue`/`previousValue`/`pendingOp`/`overwrite`)가 명확히 분리되어 있고 연속 연산·퍼센트·백스페이스·나눗셈 예외 처리가 모두 구현됨.
- `style.css`: 자체 CSS 변수로 라이트/다크 테마 관리, `prefers-color-scheme` 자동 감지 + `data-theme` 수동 토글 지원. 2048/pixel-art와 동일한 패턴.
- `index.html`: 사용법 안내 문구(footer)와 `aria-label`/`aria-live` 등 기본 접근성 속성 포함.

## 3. 범위 확인

- `apps/calculator/` 폴더 안에서만 파일이 생성됨 (index.html, style.css, script.js, spec.md).
- 블로그의 다른 파일(posts/, scripts/, public/, 다른 apps/*)은 건드리지 않음.

## 4. 결론

문제 없음. Embed 단계(apps.json 등록)로 진행 가능.
