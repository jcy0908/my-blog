---
title: 1차원 레이아웃의 기본기, Flexbox 제대로 쓰기
date: 2026-09-15
tags: [CSS, 레이아웃]
---

`display: flex` 하나로 정렬 문제가 대부분 풀린다는 건 알고 있었지만, `justify-content`와 `align-items`를 헷갈려서 매번 검색했었다. 오늘은 왜 이 둘이 다른 축을 가리키는지, 그리고 `flex-grow`와 `flex-shrink`가 실제로 무엇을 계산하는지 정리해봤다.

## 주축과 교차축

Flexbox의 핵심은 컨테이너에 주축(main axis)과 교차축(cross axis)이 생긴다는 점이다. `flex-direction: row`면 주축은 가로, 교차축은 세로가 된다. `justify-content`는 주축 방향 정렬을, `align-items`는 교차축 방향 정렬을 담당한다. `flex-direction: column`으로 바꾸면 두 속성이 가리키는 방향도 함께 뒤바뀐다.

```css
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

## flex-grow, flex-shrink, flex-basis

`flex: 1 1 auto`처럼 쓰는 축약형은 사실 세 값의 조합이다. `flex-basis`는 아이템의 기준 크기, `flex-grow`는 남는 공간을 나눠 갖는 비율, `flex-shrink`는 공간이 부족할 때 줄어드는 비율이다. `flex-grow: 1`인 아이템 두 개가 있으면 남는 공간을 정확히 절반씩 나눠 갖고, 하나만 `flex-grow: 2`면 그 아이템이 두 배 더 많이 가져간다.

## gap으로 여백 관리하기

예전에는 아이템 사이 간격을 `margin`으로 조정하면서 마지막 아이템의 마진을 지우는 코드를 따로 써야 했다. 지금은 `gap` 속성 하나로 아이템 사이 간격만 정확히 지정할 수 있어서 그런 예외 처리가 필요 없다.

Flexbox는 한 방향으로 나열되는 콘텐츠를 정렬할 때 가장 간단한 도구다. 주축과 교차축의 관계만 명확히 잡으면 `justify-content`와 `align-items`를 헷갈릴 일이 없고, `flex-grow`와 `flex-shrink`로 반응형 크기 조절까지 CSS만으로 해결할 수 있다.
