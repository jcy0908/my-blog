---
title: 커스텀 속성에도 타입이 필요하다, CSS @property
date: 2026-10-26
tags: [CSS, 애니메이션]
---

그라데이션 각도를 커스텀 속성에 넣고 `transition` 을 걸었는데 뚝 끊기듯 바뀌었다. `var()` 로 쓰는 일반 커스텀 속성은 브라우저에게 그냥 문자열이라, 중간값을 계산할 수 없어서 애니메이션이 안 되는 거였다.

## 왜 보간이 안 될까

`--angle: 90deg;` 라고 적어도 브라우저는 이게 각도인지 전혀 모른다. 타입이 없으니 0deg에서 90deg로 가는 중간 단계를 계산 못 하고 시작값에서 끝값으로 즉시 점프한다.

## @property로 타입 선언하기

`@property` 로 `syntax`, `initial-value`, `inherits` 를 지정하면 브라우저가 실제 타입을 알게 된다.

```
@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}
.box {
  background: linear-gradient(var(--angle), #1a73e8, #d93025);
  transition: --angle 0.3s ease;
}
```

## 달라지는 점

타입을 선언하면 `transition` 과 `animation` 모두 자연스럽게 보간되고, 잘못된 값이 들어와도 조용히 무시되지 않고 `initial-value` 로 되돌아가 디버깅도 쉬워진다.

커스텀 속성은 기본적으로 타입 없는 문자열이지만, `@property` 로 타입과 초기값을 선언하면 일반 CSS 속성처럼 보간되고 검증까지 받는 값으로 바뀐다.
