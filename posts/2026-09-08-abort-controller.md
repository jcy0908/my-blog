---
title: 요청을 마음대로 취소하기, AbortController
date: 2026-09-08
tags: [JavaScript, 네트워크]
---

검색창에 빠르게 타이핑할 때마다 `fetch`를 날리면, 먼저 보낸 요청의 응답이 늦게 도착해 최신 검색어의 결과를 덮어써 버리는 경우가 있다. 매번 새 요청을 보내기 전에 이전 요청을 확실히 취소하려면 `AbortController`가 필요하다.

## AbortController란

`AbortController`는 진행 중인 비동기 작업에 취소 신호를 보내는 표준 API다. 인스턴스를 만들면 `signal` 프로퍼티가 생기는데, 이 신호를 `fetch`나 이벤트 리스너에 전달해두면 `controller.abort()` 호출 시 해당 작업이 중단된다.

## fetch와 함께 쓰기

```js
let controller;

function search(keyword) {
  controller?.abort();
  controller = new AbortController();

  return fetch(`/api/search?q=${keyword}`, {
    signal: controller.signal,
  });
}
```

새 검색이 시작될 때마다 이전 컨트롤러를 먼저 `abort()`하므로, 오래된 요청의 응답이 와도 무시된다. 취소된 요청은 `AbortError`를 던지므로 `catch`에서 이 경우만 따로 걸러주면 된다.

## 언제 유용한가

자동완성처럼 짧은 간격으로 반복 요청하는 화면, 사용자가 페이지를 벗어나 더 이상 필요 없어진 요청, 타임아웃을 직접 구현할 때(`setTimeout`으로 일정 시간 뒤 `abort` 호출) 모두 대표적인 사용처다.

경쟁 상태로 화면이 엉키는 문제는 디바운스만으로는 완전히 막기 어렵다. `AbortController`로 이전 요청 자체를 취소하는 습관을 들이면 훨씬 안전한 비동기 코드를 짤 수 있다.
