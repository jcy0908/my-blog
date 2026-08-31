---
title: DOM 변화를 감지하는 방법, MutationObserver
date: 2026-09-01
tags: [JavaScript, DOM]
---

외부 스크립트가 특정 요소에 클래스를 붙이거나, 채팅 위젯이 메시지를 동적으로 추가하는 순간을 감지하고 싶을 때가 있다. 예전에는 `setInterval`로 주기적으로 DOM을 확인하는 방식을 썼지만, 오늘은 브라우저가 제공하는 `MutationObserver`로 더 깔끔하게 처리하는 법을 정리했다.

## 기본 사용법

`MutationObserver`는 콜백 함수와 관찰할 대상, 관찰 옵션을 받는다. `childList`는 자식 노드의 추가·삭제, `attributes`는 속성 변화, `subtree`는 하위 요소까지 포함할지를 결정한다.

```
const target = document.querySelector('#chat-list');
const observer = new MutationObserver((mutations) => {
  mutations.forEach((m) => {
    if (m.type === 'childList') {
      console.log('새 메시지 추가됨', m.addedNodes);
    }
  });
});
observer.observe(target, { childList: true, subtree: true });
```

## setInterval과의 차이

`setInterval`로 폴링하면 변화가 없을 때도 계속 DOM을 확인하느라 자원을 낭비하고, 확인 주기 사이의 변화는 놓칠 수도 있다. `MutationObserver`는 실제 DOM 변화가 일어난 시점에만 콜백이 실행되고, 여러 변화를 한 번의 마이크로태스크로 묶어서 처리하기 때문에 성능 부담도 적다.

## 관찰 종료하기

더 이상 감지가 필요 없어지면 `observer.disconnect()`를 호출해 관찰을 멈춰야 한다. 특히 SPA에서 컴포넌트가 사라질 때 해제하지 않으면 불필요한 콜백이 계속 쌓일 수 있다.

내가 직접 만들지 않은 DOM 변화까지 감지해야 할 때, `MutationObserver`는 폴링보다 정확하고 가벼운 선택지가 된다.
