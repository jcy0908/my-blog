---
title: Sass 없이 색을 섞는다, CSS color-mix()
date: 2026-11-11
tags: [CSS, 색상]
---

버튼 hover 색을 만들려고 또 16진수 코드를 손으로 조정하고 있었다. Sass의 `mix()` 나 `darken()` 이 그리웠는데, 찾아보니 이제 CSS 자체에 `color-mix()` 라는 함수가 있었다.

## 기본 문법

`color-mix(in <색공간>, 색1 비율1, 색2 비율2)` 형태로 쓴다. 비율을 하나만 적으면 나머지는 자동으로 채워진다.

```
.btn:hover {
  background: color-mix(in oklch, #1a73e8 70%, white);
}
```

## 왜 색공간을 지정할까

`srgb` 로 섞으면 중간에 칙칙한 회색이 끼는 경우가 있다. `oklch` 나 `lab` 처럼 인간이 인지하는 밝기에 가까운 색공간을 쓰면 더 자연스럽게 번지듯 섞인다.

## 커스텀 속성과 함께 쓰기

브랜드 컬러 변수에 `color-mix()` 를 얹으면 hover, disabled, 테두리 색을 전처리기 없이 한 줄로 만들 수 있다.

```
:root { --brand: #1a73e8; }
.btn[disabled] {
  background: color-mix(in oklch, var(--brand) 40%, gray);
}
```

`color-mix()` 는 전처리기가 없어도 브라우저가 직접 두 색을 원하는 비율과 색공간으로 섞어주는 함수로, 변형 색상을 변수 하나에서 즉석으로 뽑아낼 수 있게 해준다.
