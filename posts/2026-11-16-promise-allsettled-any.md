---
title: Promise.all이 아니라 allSettled를 써야 할 때
date: 2026-11-16
tags: [JavaScript, 비동기]
---

오늘은 여러 비동기 요청을 동시에 처리할 때 `Promise.all`만 쓰다가 생긴 문제를 보고, 비슷하게 생긴 `Promise.allSettled`와 `Promise.any`가 왜 따로 존재하는지 알아봤다. 셋 다 "여러 프로미스를 모아서 처리한다"는 점은 같지만, 실패를 다루는 방식이 완전히 다르다.

## Promise.all의 함정

`Promise.all`은 모든 프로미스가 성공해야 결과를 받을 수 있다. 하나라도 거부(reject)되면 나머지가 아직 진행 중이어도 즉시 전체가 실패로 끝난다. 여러 API를 동시에 호출해서 화면 여기저기를 채우는 상황이라면, 하나의 API 장애 때문에 성공한 나머지 데이터까지 못 쓰게 되는 셈이다.

## allSettled, 성공과 실패를 같이 받기

`Promise.allSettled`는 각 프로미스가 끝나기를 모두 기다린 뒤, 성공/실패 여부와 상관없이 `{status, value}` 또는 `{status, reason}` 형태의 결과 배열을 돌려준다. 성공한 요청의 데이터는 그대로 쓰고, 실패한 요청만 따로 에러 처리를 하면 된다.

```js
const results = await Promise.allSettled([fetchUser(), fetchPosts()]);
const ok = results.filter(r => r.status === "fulfilled").map(r => r.value);
```

## any, 하나만 성공하면 끝

`Promise.any`는 반대로 가장 먼저 성공한 프로미스 하나의 값을 받고 끝낸다. 여러 CDN 중 가장 빨리 응답하는 곳에서만 리소스를 받으면 되는 경우에 어울린다. 모두 실패했을 때만 `AggregateError`가 던져진다.

결국 셋의 차이는 "실패를 전체 실패로 볼지, 부분 성공으로 볼지, 무시해도 되는 실패로 볼지"의 선택이다. 상황에 맞는 메서드를 고르면 불필요한 에러 처리 코드를 줄일 수 있다.
