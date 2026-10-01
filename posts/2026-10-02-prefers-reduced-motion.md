---
title: 움직임을 줄여달라는 사용자, CSS prefers-reduced-motion
date: 2026-10-02
tags: [CSS, 접근성]
---

화려한 페이지 전환이나 패럴랙스 스크롤을 보면 멀미나 어지럼증을 느끼는 사람들이 있다. 전정기관 장애가 있는 사용자에게는 과도한 모션이 단순한 취향 문제가 아니라 실제 불편이 될 수 있다. 운영체제 설정을 읽어 애니메이션을 줄여주는 `prefers-reduced-motion`을 알아봤다.

## 미디어 쿼리로 감지하기

운영체제의 "동작 줄이기" 설정이 켜져 있으면 `reduce`, 아니면 `no-preference` 값을 돌려준다.

```
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

애니메이션을 완전히 제거하기보다 아주 짧게 줄이는 쪽이 `animationend` 같은 이벤트에 의존하는 스크립트를 깨뜨리지 않는다.

## 기본값은 신중하게

이 설정을 지원하지 않는 브라우저도 있으므로, 화려한 모션은 `no-preference`일 때만 켜는 식으로 선택적으로 추가하는 편이 안전하다. 처음부터 담백하게 만들고 위에 애니메이션을 얹는 구조가 유지보수에도 유리하다.

## 자바스크립트에서 확인하기

`matchMedia`로 같은 값을 읽어 JS 애니메이션(GSAP, 캔버스 등)도 분기할 수 있다.

```
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
```

접근성은 색상 대비나 키보드 포커스만의 문제가 아니라 움직임의 양에도 걸쳐 있다. 운영체제 설정 하나로 존중할 수 있는 간단한 배려인 만큼, 트랜지션을 추가할 때마다 이 미디어 쿼리를 함께 챙기는 습관을 들이기로 했다.
