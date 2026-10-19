---
title: iframe과 안전하게 대화하기, postMessage API
date: 2026-10-20
tags: [JavaScript, 보안]
---

다른 출처의 iframe이나 팝업 창과 데이터를 주고받아야 할 때가 있다. 같은 origin이 아니면 `window.opener`나 iframe의 `contentWindow` 속성에 바로 접근할 수 없는데, 이럴 때 쓰는 게 `window.postMessage`다. 오늘은 이 API의 기본 동작과 보안 주의점을 정리했다.

## postMessage란

`postMessage`는 origin이 다른 두 창(윈도우, iframe, 팝업) 사이에서 안전하게 메시지를 전달하는 방법이다. 보내는 쪽은 상대 창 객체의 `postMessage(data, targetOrigin)`을 호출하고, 받는 쪽은 `message` 이벤트로 데이터를 받는다.

```
otherWindow.postMessage({ type: 'greet', value: 'hi' }, 'https://example.com')
```

## 메시지 받기

받는 쪽에서는 `window.addEventListener('message', handler)`로 이벤트를 구독한다. 이벤트 객체의 `data`, `origin`, `source` 속성으로 내용과 보낸 창을 확인할 수 있다.

```
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://trusted.com') return
  console.log(event.data)
})
```

## 왜 origin 검사가 중요한가

`targetOrigin`을 `*`로 두면 어떤 origin에서든 메시지를 가로챌 수 있어 위험하고, 수신 쪽에서 `event.origin`을 확인하지 않으면 악성 창이 보낸 데이터를 그대로 신뢰하게 된다. 두 지점 모두에서 origin을 명시적으로 검사하는 게 기본값이어야 한다.

## 요약

postMessage는 CORS 제약을 우회하지 않으면서도 서로 다른 origin의 창들이 데이터를 주고받을 수 있게 해주는 표준 방법이다. 다만 `targetOrigin`을 구체적으로 지정하고 수신부에서 `event.origin`을 검증하는 두 가지를 지키지 않으면 쉽게 보안 구멍이 될 수 있다는 점을 기억해야 한다.
