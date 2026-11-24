---
title: console.log만 쓰고 있었다면, 콘솔 디버깅 꿀팁
date: 2026-11-25
tags: [JavaScript, DevTools, 디버깅]
---

디버깅할 때 변수마다 `console.log`를 흩뿌리다 보면 금방 콘솔이 지저분해진다. `console` 객체에는 로그를 구조화해서 보여주는 메서드가 꽤 많은데, 몇 개만 익혀도 디버깅 속도가 눈에 띄게 빨라진다.

## 배열과 객체는 console.table

객체 배열을 로그로 찍으면 한 줄로 뭉쳐 보기 힘들다. `console.table(data)`로 찍으면 각 속성이 열로 펼쳐진 표로 렌더링돼서 값을 비교하기 훨씬 쉽다.

```js
console.table([
  { id: 1, name: "a" },
  { id: 2, name: "b" },
]);
```

## console.group으로 로그 묶기

연관된 로그 여러 줄을 들여쓰기로 묶어주는 기능이다. `console.groupEnd()`로 닫지 않으면 이후 로그까지 계속 묶여버리니 짝을 맞춰야 한다.

```js
console.group("fetchUser");
console.log("요청 시작");
console.log("응답 수신");
console.groupEnd();
```

## 호출 경로가 궁금할 땐 console.trace

"이 함수가 대체 어디서 호출된 거지?"를 알고 싶을 때 `console.trace()`를 넣으면 현재 지점까지의 콜 스택을 그대로 출력해준다. breakpoint를 거는 것보다 가볍게 흐름을 확인할 수 있다.

## 반복 횟수 세기, console.count

같은 코드가 몇 번 실행되는지 셀 때는 `console.count("라벨")`을 쓰면 직접 카운터 변수를 만들 필요가 없다. 라벨별로 독립적으로 세어준다.

`console`은 `log` 하나만 있는 게 아니라 데이터 형태에 맞는 전용 출력 방식을 여러 개 제공한다. 상황에 맞는 메서드를 골라 쓰는 것만으로도 콘솔 창이 훨씬 읽기 편해지고, 임시 변수나 중단점 없이도 많은 디버깅을 끝낼 수 있다.
