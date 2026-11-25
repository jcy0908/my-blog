---
title: 툴팁 위치 계산에 JS 라이브러리가 필요 없어졌다, CSS 앵커 포지셔닝
date: 2026-11-26
tags: [CSS, 레이아웃]
---

드롭다운이나 툴팁을 버튼 옆에 붙이려고 매번 JS로 `getBoundingClientRect()` 를 재고 좌표를 계산했다. CSS 앵커 포지셔닝을 쓰면 이 계산을 브라우저가 대신해준다.

## anchor-name과 position-anchor

기준이 될 요소에 `anchor-name` 으로 이름을 붙이고, 띄울 요소에 `position-anchor` 로 그 이름을 연결한다. 위치는 `position: absolute` 에 `inset-area` 나 `top: anchor(bottom)` 같은 `anchor()` 함수로 지정한다.

```
.trigger {
  anchor-name: --btn;
}
.tooltip {
  position: absolute;
  position-anchor: --btn;
  top: anchor(bottom);
  left: anchor(center);
  translate: -50% 8px;
}
```

## 화면 밖으로 안 나가게, position-try

화면 끝에 있는 버튼이면 아래에 띄운 툴팁이 잘릴 수 있다. `position-try-fallbacks` 에 대안 위치를 나열해두면 공간이 없을 때 자동으로 반대쪽으로 뒤집어준다. Popper.js 류 라이브러리가 하던 충돌 감지를 CSS가 처리하는 셈이다.

## 아직은 점진적으로

크로미움 계열은 지원하지만 사파리·파이어폭스는 아직이라, `@supports (anchor-name: --a)` 로 감싸서 미지원 브라우저에는 기존 JS 포지셔닝을 폴백으로 남겨두는 게 안전하다.

버튼과 툴팁처럼 서로 떨어진 두 요소의 위치 관계를 CSS만으로 선언할 수 있게 되면서, 위치 계산용 JS 의존성을 줄일 여지가 생겼다. 다만 브라우저 지원이 갈린 지금은 폴백을 함께 준비하는 편이 낫다.
