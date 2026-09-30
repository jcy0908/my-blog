---
title: 화면 밖 요소를 통째로 건너뛰기, CSS content-visibility
date: 2026-10-01
tags: [CSS, 성능최적화]
---

긴 목록이나 여러 섹션으로 이루어진 페이지를 만들다 보면, 브라우저가 화면에 보이지도 않는 요소까지 매번 레이아웃과 페인트를 계산하느라 스크롤이 버벅였다. `content-visibility` 속성 하나로 이 비용을 통째로 건너뛸 수 있다는 걸 오늘 알게 됐다.

## content-visibility: auto가 하는 일

`content-visibility: auto`를 주면 브라우저는 뷰포트 근처에 오기 전까지 해당 요소의 렌더링(스타일 계산, 레이아웃, 페인트)을 건너뛴다. 콘텐츠는 DOM에 그대로 남아 있지만, 화면 밖에 있는 동안은 마치 존재하지 않는 것처럼 취급돼 초기 렌더링 비용이 크게 줄어든다.

```css
.section {
  content-visibility: auto;
}
```

## contain-intrinsic-size로 스크롤바 튐 막기

렌더링을 건너뛴 요소는 크기가 0으로 계산되기 때문에, 스크롤바 길이가 갑자기 늘었다 줄었다 하며 튈 수 있다. `contain-intrinsic-size`로 예상 높이를 미리 지정해두면 이 문제를 막을 수 있다.

```css
.section {
  content-visibility: auto;
  contain-intrinsic-size: 500px;
}
```

## hidden과의 차이

`content-visibility: hidden`은 `display: none`과 달리 요소 상태(스크롤 위치, 포커스 등)를 유지한 채로 렌더링만 건너뛴다. 나중에 다시 보여줄 화면을 미리 꺼둔 채로 유지하고 싶을 때 유용하다.

정리하면 `content-visibility`는 화면 밖 콘텐츠의 렌더링 비용을 자바스크립트 없이 CSS 한 줄로 건너뛰게 해주는 속성으로, `contain-intrinsic-size`와 함께 쓰면 긴 목록이나 여러 섹션 페이지의 초기 렌더링 성능을 크게 개선할 수 있다.
