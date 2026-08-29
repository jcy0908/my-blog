---
title: CSS Grid로 2차원 레이아웃 잡기
date: 2026-08-30
tags: [CSS, 레이아웃]
---

Flexbox는 한 줄 또는 한 열을 정렬하는 데는 편하지만, 행과 열을 동시에 다루는 레이아웃을 짜려면 마진 계산이 금방 복잡해진다. 오늘은 2차원 레이아웃을 위해 설계된 CSS Grid를 정리했다.

## 컨테이너에 격자 정의하기

`display: grid`를 선언한 다음 `grid-template-columns`와 `grid-template-rows`로 격자의 크기를 정한다. `fr` 단위는 남은 공간을 비율대로 나눠 가지는 유연한 단위라서, 픽셀 계산 없이도 반응형 레이아웃을 만들 수 있다.

```css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 16px;
}
```

## 아이템 배치는 gap과 grid-column으로

칸 사이 여백은 `gap` 속성 하나로 처리하고, 특정 아이템을 여러 칸에 걸치게 하려면 `grid-column: span 2`처럼 지정하면 된다. 자식 요소마다 마진을 따로 계산하지 않아도 돼서 코드가 훨씬 간결해진다.

## Flexbox와의 역할 구분

Flexbox는 내용의 크기에 맞춰 한 축을 정렬하는 콘텐츠 중심 레이아웃에 어울리고, Grid는 페이지 전체 골격처럼 행과 열을 미리 설계해두는 레이아웃 중심 작업에 어울린다. 실무에서는 큰 틀은 Grid로 짜고 그 안의 카드나 버튼 정렬은 Flexbox로 처리하는 식으로 섞어 쓰는 경우가 많다.

오늘은 CSS Grid가 `fr` 단위와 `grid-template-columns`로 2차원 격자를 어떻게 정의하는지, 그리고 Flexbox와 언제 나눠 써야 하는지를 정리했다. 다음에는 `grid-template-areas`로 이름 붙여 배치하는 방법도 다뤄봐야겠다.
