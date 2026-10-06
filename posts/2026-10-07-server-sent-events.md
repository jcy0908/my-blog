---
title: 서버가 먼저 말 거는 법, Server-Sent Events
date: 2026-10-07
tags: [JavaScript, 네트워크]
---

실시간 알림이나 로그 스트리밍을 구현할 때 WebSocket부터 떠올리기 쉽지만, 서버 → 클라이언트 단방향 전송만 필요하다면 `EventSource` 기반의 **Server-Sent Events(SSE)**가 훨씬 가볍다. 일반 HTTP 연결 위에서 동작해 별도 프로토콜 전환 없이 쓸 수 있다.

## 동작 방식

클라이언트가 `EventSource`로 엔드포인트에 연결하면, 서버는 연결을 끊지 않고 `text/event-stream` 형식으로 이벤트를 계속 흘려보낸다. 각 이벤트는 `data:` 줄로 시작하고 빈 줄로 끝난다.

```js
const sse = new EventSource('/api/notifications');

sse.onmessage = (e) => {
  console.log('받은 데이터:', e.data);
};
```

## 자동 재연결

SSE의 가장 큰 장점은 연결이 끊겨도 브라우저가 자동으로 재연결을 시도한다는 점이다. 서버가 `id:` 필드로 마지막 이벤트 ID를 알려주면, 재연결 시 `Last-Event-ID` 헤더로 끊긴 지점부터 이어받을 수 있다.

## WebSocket과의 차이

- SSE는 서버 → 클라이언트 단방향, WebSocket은 양방향이다.
- SSE는 HTTP/1.1만으로 동작하고 재연결 로직이 내장돼 있다.
- 클라이언트가 서버로 데이터를 보낼 필요가 없는 알림, 피드 업데이트, 진행 상황 표시 같은 경우 SSE가 더 단순하다.

양방향 통신이 꼭 필요하지 않다면, SSE는 WebSocket보다 적은 코드로 실시간 기능을 구현할 수 있는 실용적인 선택이다.
