---
title: 객체 접근을 가로채는 법, JavaScript Proxy
date: 2026-09-20
tags: [JavaScript, 메타프로그래밍]
---

객체의 속성을 읽거나 쓸 때 그 사이에 끼어들 수 있다면 어떨까. `Proxy`는 객체에 대한 기본 동작(속성 읽기, 쓰기, 삭제 등)을 가로채서 원하는 로직을 끼워 넣게 해주는 객체다. 프레임워크의 반응형 데이터 바인딩도 이 원리 위에서 동작한다.

## 기본 사용법: target과 handler

`Proxy`는 감시 대상이 되는 `target`과, 동작을 가로채는 함수들을 모아둔 `handler`(트랩)로 만든다.

```js
const user = { name: "지연" };

const proxy = new Proxy(user, {
  get(target, key) {
    console.log(`읽기 시도: ${key}`);
    return target[key];
  },
  set(target, key, value) {
    console.log(`쓰기 시도: ${key} = ${value}`);
    target[key] = value;
    return true;
  },
});

proxy.name;
proxy.age = 28;
```

`get`과 `set` 트랩만으로도 로깅, 유효성 검사, 읽기 전용 속성 만들기 같은 걸 원본 객체 코드를 건드리지 않고 구현할 수 있다.

## Reflect와 짝을 이루는 이유

트랩 안에서 `target[key]`를 직접 다루는 대신 `Reflect.get(target, key)`처럼 `Reflect`를 쓰는 게 권장된다. `Reflect`는 객체의 기본 동작을 그대로 수행해주는 함수 모음이라, 상속 관계나 `this` 바인딩이 얽힌 상황에서도 원래 동작을 안전하게 보존해준다.

## 어디에 쓰이나

- 반응형 상태 관리 라이브러리의 변경 감지
- API 응답 객체의 접근 로깅이나 검증
- 존재하지 않는 속성에 접근할 때 기본값을 돌려주는 객체

> 다만 모든 속성 접근에 트랩이 끼어들기 때문에, 성능이 민감한 반복 연산에는 신중히 써야 한다.

Proxy는 객체를 감싸는 얇은 레이어를 만들어 속성 접근이라는 가장 기본적인 동작에 개입할 수 있게 해준다. 직접 만들 일은 적어도, 라이브러리 내부 동작을 이해하는 데는 꼭 알아둘 만한 개념이다.
