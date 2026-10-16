---
title: 양방향 실시간 통신의 기본, WebSocket
date: 2026-10-17
tags: [JavaScript, 네트워크]
---

채팅, 실시간 협업, 게임처럼 서버와 클라이언트가 계속 데이터를 주고받아야 하는 기능은 일반 HTTP 요청-응답으로는 비효율적이다. 이럴 때 쓰는 게 **WebSocket**이다. 하나의 TCP 연결을 계속 열어두고 양쪽이 자유롭게 데이터를 보낼 수 있다.

## HTTP와 다른 점

WebSocket은 처음에 HTTP 핸드셰이크로 시작하지만, 서버가 `101 Switching Protocols`로 응답하면 그 연결이 WebSocket 프로토콜로 전환된다. 이후에는 요청-응답 구조가 아니라, 양쪽이 원할 때 아무 때나 메시지를 보낼 수 있는 완전한 양방향 통신이 된다.

## 기본 사용법

```js
const socket = new WebSocket('wss://example.com/chat');

socket.onopen = () => socket.send('hello');
socket.onmessage = (e) => console.log('받음:', e.data);
socket.onclose = () => console.log('연결 종료');
```

`ws://`는 평문, `wss://`는 TLS로 암호화된 버전이다. HTTPS 페이지에서는 `wss://`만 허용된다.

## 연결 끊김은 직접 처리해야 한다

SSE(`EventSource`)와 달리 WebSocket은 자동 재연결 기능이 없다. 네트워크가 끊기면 `onclose`가 호출될 뿐이고, 재연결·재구독 로직은 애플리케이션 코드에서 직접 구현해야 한다. 지수 백오프로 재시도하고 마지막 상태를 다시 동기화하는 패턴이 흔하다.

## 언제 쓰나

클라이언트도 서버로 데이터를 자주 보내야 한다면 WebSocket이 적합하고, 서버 → 클라이언트 단방향 알림만 필요하다면 SSE가 더 단순하다. 양방향성과 그만큼 커지는 복잡도를 맞바꾸는 선택인 셈이다.
