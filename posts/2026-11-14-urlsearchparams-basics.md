---
title: 쿼리 스트링을 손으로 파싱하지 않는 법, URLSearchParams
date: 2026-11-14
tags: [JavaScript, 네트워크]
---

주소창 뒤에 붙는 `?key=value` 문자열을 `split`과 정규식으로 매번 쪼개본 적이 있다면, 브라우저가 이미 이 작업을 위한 전용 도구를 내장하고 있다는 걸 알아두면 좋다.

## 문자열을 객체처럼 다루기

`URLSearchParams`는 쿼리 스트링을 파싱해서 `get`, `set`, `has`, `delete` 같은 메서드로 다룰 수 있게 해준다. `&`와 `=` 기준으로 직접 문자열을 나누는 코드보다 훨씬 안전하다.

```js
const params = new URLSearchParams(location.search);
params.get('page');
params.set('sort', 'asc');
params.toString();
```

## URL 객체와 함께 쓰면 더 편하다

`URL` 인스턴스는 `searchParams` 속성으로 `URLSearchParams`를 바로 노출한다. 전체 주소를 문자열로 들고 있을 때도 쿼리 부분만 따로 떼어낼 필요가 없다.

## 다중 값과 인코딩도 알아서 처리

같은 키가 여러 번 나오면 `getAll`로 배열을 받을 수 있고, 한글이나 특수문자가 들어가도 `encodeURIComponent`를 직접 호출하지 않아도 안전하게 인코딩된다.

쿼리 스트링은 결국 문자열이지만, 그걸 문자열 그대로 다루는 순간 인코딩과 다중 값 처리 같은 함정이 따라온다. `URLSearchParams`를 쓰면 이런 디테일을 신경 쓰지 않고 쿼리 파라미터를 객체처럼 읽고 쓸 수 있다.
