---
title: 페이지를 떠나기 직전에 데이터 보내기, navigator.sendBeacon
date: 2026-10-15
tags: [JavaScript, 네트워크, 성능]
---

사용자가 페이지를 닫기 직전에 로그를 하나 남기고 싶을 때, `unload` 이벤트 안에서 `fetch`를 호출해본 적이 있을 것이다. 그런데 이 요청은 브라우저가 페이지를 정리하는 도중 취소되어 서버에 도착하지 못하는 경우가 많다.

## 왜 unload에서 fetch가 불안정한가

브라우저는 페이지가 언로드되면 진행 중인 네트워크 요청을 보장 없이 중단할 수 있다. `fetch`는 비동기로 응답을 기다리는 구조라, 요청이 채 끝나기도 전에 탭이 닫히면 요청 자체가 사라진다.

## navigator.sendBeacon

`navigator.sendBeacon(url, data)`는 이런 상황을 위해 만들어진 API다. 브라우저가 요청을 백그라운드 큐에 넣고 페이지가 닫혀도 전송을 이어서 처리하므로, 분석 로그나 종료 시점 이벤트를 안전하게 보낼 수 있다.

```js
window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    navigator.sendBeacon('/log', JSON.stringify({ event: 'leave' }));
  }
});
```

## 한계

`sendBeacon`은 항상 `POST`로만 전송되고, 응답 본문을 읽을 수 없으며, 전송 가능한 데이터 크기에도 제한이 있다. 더 세밀한 제어가 필요하면 `fetch`에 `keepalive: true` 옵션을 주는 방법도 있는데, 이 역시 페이지 종료 상황에서 요청이 끊기지 않도록 브라우저가 별도로 처리해주는 옵션이다.

정리하면, 페이지를 떠나는 순간에 데이터를 확실히 보내야 한다면 `fetch` 대신 `navigator.sendBeacon`이나 `keepalive` 옵션을 쓰는 것이 안전하다. 두 방법 모두 "응답을 기다리지 않는 짧은 신호"를 위한 도구라는 점을 기억하면 된다.
