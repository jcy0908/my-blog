---
title: 탭 사이에 메시지 보내기, BroadcastChannel API
date: 2026-10-03
tags: [JavaScript, 브라우저]
---

여러 탭이 열려있을 때 로그인 상태나 다크모드 설정을 모든 탭에 동시에 반영하고 싶을 때가 있다. localStorage의 `storage` 이벤트로도 비슷하게 흉내 낼 수 있지만, 저장이라는 부수효과 없이 순수하게 "메시지만" 주고받고 싶다면 BroadcastChannel이 정확히 그 역할을 한다.

## 같은 출처의 탭끼리 연결되는 채널

BroadcastChannel은 이름(채널명)으로 식별되는 통신 채널을 만든다. 같은 이름으로 생성한 채널은 같은 출처(origin)의 모든 탭, iframe, 워커에서 서로 메시지를 주고받을 수 있다. 서버를 거치지 않고 브라우저 내부에서 바로 전달된다.

## 사용법은 Worker의 메시지 API와 닮았다

`postMessage`로 보내고 `onmessage`로 받는다. 구조가 익숙해서 배우기 쉽다.

```js
const bc = new BroadcastChannel('theme');
bc.postMessage('dark');
bc.onmessage = (e) => console.log(e.data); // 다른 탭에서 수신
```

## localStorage 이벤트와의 차이

`storage` 이벤트는 실제로 값을 저장해야 발생하고, 보낸 탭 자신에게는 오지 않는다. BroadcastChannel은 저장이 필요 없고 메시지 전달 자체가 목적이라 의도가 더 명확하다. 다 쓴 채널은 `close()`로 닫아줘야 메모리 누수를 막을 수 있다.

탭 간 동기화가 필요할 때 localStorage를 억지로 끌어다 쓰기보다, 그 용도로 설계된 BroadcastChannel을 쓰는 편이 코드도 간결하고 의도도 분명해진다.
