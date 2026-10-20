---
title: 객체를 완전히 복사하는 법, structuredClone()
date: 2026-10-21
tags: [JavaScript, 브라우저]
---

객체를 복사할 때 흔히 `JSON.parse(JSON.stringify(obj))`를 쓰는데, `Date`나 `Map`처럼 JSON으로 표현할 수 없는 값이 섞여 있으면 결과가 깨진다. 이 문제를 깔끔하게 풀어주는 브라우저 내장 함수 `structuredClone`을 오늘 정리했다.

## 얕은 복사와 깊은 복사

스프레드 연산자(`...`)나 `Object.assign`은 한 단계만 복사하는 얕은 복사라서, 중첩된 객체나 배열은 원본과 참조를 그대로 공유한다. 복사본을 수정했는데 원본까지 바뀌는 버그는 대부분 여기서 나온다. 중첩 구조까지 모두 새로 만드는 게 깊은 복사다.

## structuredClone 사용법

별도 라이브러리 없이 함수 하나만 호출하면 된다.

```
const original = { date: new Date(), tags: new Set(['a', 'b']) }
const copy = structuredClone(original)

copy.tags.add('c')
console.log(original.tags.size) // 2, 원본은 그대로
```

`Date`, `Map`, `Set`, `ArrayBuffer`, 순환 참조까지 그대로 복제할 수 있어서 JSON 방식보다 다루는 범위가 훨씬 넓다.

## JSON 방식과 다른 점

`JSON.stringify`는 함수나 `undefined`를 조용히 누락시키고 `Date`는 문자열로 바꿔버린다. `structuredClone`은 함수나 DOM 노드처럼 복제할 수 없는 값을 만나면 에러를 던져 문제를 바로 드러낸다는 점도 다르다.

## 요약

`structuredClone`은 별도 설치 없이 브라우저가 기본 제공하는 깊은 복사 함수로, `Date`나 `Map` 같은 타입도 안전하게 복제한다. 다만 함수나 DOM 노드는 복제할 수 없으니, 복사 대상에 그런 값이 섞여 있는지 먼저 확인하는 습관이 필요하다.
