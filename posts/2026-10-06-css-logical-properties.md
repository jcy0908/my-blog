---
title: 방향 대신 흐름으로 쓰는 CSS, 논리적 속성
date: 2026-10-06
tags: [CSS, 국제화]
---

영어와 한국어는 쓰기 방향이 같지만, 아랍어나 세로쓰기 일본어처럼 방향이 다른 언어도 있다. `margin-left`, `padding-top` 같은 물리적 속성은 이런 경우 레이아웃이 쉽게 어긋난다. 이를 해결하려고 등장한 것이 **논리적 속성**이다.

## block과 inline

논리적 속성은 화면의 좌우/상하가 아니라 글이 흐르는 방향을 기준으로 삼는다. 글이 쌓이는 방향이 `block`, 글자가 이어지는 방향이 `inline`이다. 가로쓰기 언어에서는 block이 수직, inline이 수평이 된다.

## 자주 쓰는 속성

- `margin-inline`, `padding-inline`: 좌우 여백 대신 흐름 방향 여백
- `margin-block`, `padding-block`: 상하 여백 대신 쌓이는 방향 여백
- `inset-inline-start`, `inset-inline-end`: `left`/`right` 대신 사용

```css
.card {
  margin-block: 1rem;
  padding-inline: 1.5rem;
  border-inline-start: 4px solid #333;
}
```

`writing-mode`나 `dir` 속성이 바뀌어도 이 코드는 그대로 동작한다. 다국어 사이트를 만들 계획이 없더라도 논리적 속성은 의미가 더 명확하게 드러나서, 평소 레이아웃을 짤 때도 충분히 쓸 만하다.
