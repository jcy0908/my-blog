---
title: 지원 안 하는 브라우저엔 다른 스타일을, CSS @supports
date: 2026-11-23
tags: [CSS, 웹표준]
---

새 CSS 기능을 쓰고 싶지만 구형 브라우저도 챙겨야 할 때, `@supports`는 JS 없이 조건부로 스타일을 적용하게 해준다. 미디어 쿼리가 화면 조건을 따진다면, `@supports`는 브라우저의 기능 지원 여부를 따진다.

## 기본 문법

속성과 값을 그대로 넣어 테스트한다.

```css
@supports (gap: 1rem) {
  .list { display: flex; gap: 1rem; }
}
```

지원하지 않으면 블록 전체가 무시되므로, 블록 밖에 기본 스타일(margin 등)을 먼저 깔아두는 폴백 패턴이 자연스럽다.

## not과 and로 조합하기

`not`, `and`, `or`를 섞어 더 정교하게 조건을 짤 수 있다.

```css
@supports not (aspect-ratio: 1) {
  .thumb { padding-top: 56.25%; }
}
```

## JS의 CSS.supports와 짝

같은 질의를 JS에서도 `CSS.supports('gap', '1rem')`으로 검사할 수 있다. 레이아웃 분기는 CSS에서, 기능 분기에 따라 다른 동작을 붙여야 할 때는 JS 쪽에서 쓰면 역할이 겹치지 않는다.

`@supports`는 "안 되면 조용히 무시"가 기본값인 CSS의 캐스케이드 특성을 적극적으로 활용하는 도구다. 최신 기능을 바로 쓰면서도 구형 환경을 깨뜨리지 않는, 점진적 향상(progressive enhancement)의 가장 가벼운 형태라고 할 수 있다.
