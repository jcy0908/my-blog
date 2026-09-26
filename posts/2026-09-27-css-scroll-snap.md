---
title: 스크롤에 자석을 붙이다, CSS scroll-snap
date: 2026-09-27
tags: [CSS, 스크롤]
---

캐러셀이나 이미지 갤러리를 만들 때마다 JS로 스크롤 위치를 계산해 애니메이션을 걸었는데, 사실 CSS 몇 줄이면 브라우저가 알아서 "딱 맞는 위치"에 멈춰준다는 걸 알게 됐다. 바로 `scroll-snap` 속성이다.

## scroll-snap-type

스크롤 컨테이너에 `scroll-snap-type: x mandatory`를 주면 가로 스크롤이 끝날 때 반드시 스냅 지점에 멈춘다. `mandatory` 대신 `proximity`를 쓰면 스냅 지점 근처에서만 살짝 끌어당기고, 멀리 있으면 그냥 자유롭게 멈춘다.

## scroll-snap-align

자식 요소마다 어디에 맞춰 정렬할지 `scroll-snap-align: start` 또는 `center`로 지정한다. 이게 없으면 부모의 `scroll-snap-type`은 아무 효과가 없다.

## 코드 예시

```
.wrap {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}
.card {
  flex: 0 0 100%;
  scroll-snap-align: start;
}
```

`scroll-padding`으로 스냅 위치에 여백을 줄 수도 있고, `scroll-snap-stop: always`를 더하면 한 번에 여러 카드를 건너뛰지 못하게 막을 수 있다.

정리하면, scroll-snap은 별도 라이브러리나 JS 이벤트 리스너 없이도 자연스러운 스크롤 캐러셀을 만들 수 있게 해주는 CSS 표준 기능으로, 부모의 `scroll-snap-type`과 자식의 `scroll-snap-align`이 한 쌍으로 동작한다는 점만 기억하면 바로 써먹을 수 있다.
