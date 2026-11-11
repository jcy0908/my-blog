---
title: 미디어 쿼리를 JS로도 감지하기, matchMedia
date: 2026-11-12
tags: [JavaScript, CSS, 반응형]
---

리사이즈 이벤트마다 `window.innerWidth`를 재서 분기하다가, 뷰포트 조건이 실제로 바뀌는 순간에만 반응하는 더 깔끔한 방법이 있다는 걸 알았다. `matchMedia`를 쓰면 CSS 미디어 쿼리를 JS에서도 그대로 재사용할 수 있다.

## 기본 사용법

`window.matchMedia(쿼리)`는 `matches` 불리언을 가진 객체를 돌려준다. 여기에 `change` 이벤트 리스너를 달면 조건이 참/거짓으로 바뀔 때만 콜백이 실행된다.

```
const mq = matchMedia('(max-width: 768px)');
mq.addEventListener('change', (e) => {
  console.log(e.matches ? '모바일' : '데스크톱');
});
```

## resize 이벤트와 다른 점

`resize`는 픽셀 단위로 계속 발생해서 매번 조건을 직접 비교해야 한다. `matchMedia`는 경계를 넘을 때만 알려주므로 불필요한 실행이 줄고, 판정 기준을 CSS와 완전히 같게 유지할 수 있다.

## 다크 모드 감지에도 활용

`(prefers-color-scheme: dark)`를 넘기면 시스템 테마가 바뀌는 순간을 JS에서 바로 받을 수 있다. 캔버스 차트 색상처럼 CSS만으로는 처리하기 어려운 부분에 쓰기 좋다.

`matchMedia`는 CSS 미디어 쿼리의 판정 결과를 JS 쪽 이벤트로 그대로 넘겨받는 API로, 조건을 직접 계산하는 대신 브라우저가 이미 알고 있는 변화를 재사용하게 해준다.
