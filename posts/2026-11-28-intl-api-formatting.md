---
title: 라이브러리 없이 숫자와 날짜 포맷하기, Intl API
date: 2026-11-28
tags: [JavaScript, 국제화]
---

가격에 쉼표를 찍거나 날짜를 "2026년 11월 28일"로 바꾸려고 정규식이나 moment 같은 라이브러리를 끌어다 쓴 적이 있다면, 브라우저에 이미 내장된 `Intl` 객체로 충분히 해결된다는 걸 알아둘 만하다.

## Intl.NumberFormat

숫자를 통화, 퍼센트, 천 단위 구분 기호가 있는 형태로 바꿔준다. 로케일만 바꾸면 표기 규칙도 자동으로 따라간다.

```js
const price = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
});
price.format(15000); // "₩15,000"
```

## Intl.DateTimeFormat

`Date` 객체를 원하는 로케일과 형식의 문자열로 바꾼다. `dateStyle`, `timeStyle` 같은 옵션을 쓰면 세세한 포맷 문자열을 직접 조립할 필요가 없다.

```js
const fmt = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long' });
fmt.format(new Date()); // "2026년 11월 28일"
```

## Intl.RelativeTimeFormat

"3일 전", "2시간 후"처럼 상대 시간을 표현할 때 쓴다. 숫자와 단위만 넘기면 로케일에 맞는 문장을 돌려준다.

```js
const rtf = new Intl.RelativeTimeFormat('ko-KR');
rtf.format(-3, 'day'); // "3일 전"
```

## 요약

`Intl` API는 숫자, 날짜, 상대 시간을 로케일에 맞게 포맷하는 기능을 브라우저가 기본으로 제공하는 도구다. 별도 라이브러리 없이도 통화 표시나 날짜 문자열을 다룰 수 있어, 다국어를 지원하지 않는 프로젝트에서도 가벼운 대안으로 써볼 만하다.
