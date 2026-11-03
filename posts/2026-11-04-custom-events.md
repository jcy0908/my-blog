---
title: 컴포넌트끼리 대화시키는 법, CustomEvent
date: 2026-11-04
tags: [JavaScript, DOM]
---

버튼 클릭이나 입력 같은 기본 이벤트만으로는 "이 작업이 끝났다", "데이터가 바뀌었다" 같은 내 코드만의 신호를 전달하기 어렵다. `CustomEvent`를 쓰면 프레임워크 없이도 내가 원하는 이름과 데이터를 가진 이벤트를 만들어 DOM으로 흘려보낼 수 있다.

## CustomEvent 만들고 보내기

`new CustomEvent(이름, { detail })`로 이벤트를 만들고, 요소에서 `dispatchEvent()`로 쏘아 보낸다. `detail` 필드에 원하는 데이터를 담으면 리스너 쪽에서 그대로 꺼내 쓸 수 있다.

```
const el = document.querySelector('#cart')
el.dispatchEvent(new CustomEvent('item-added', {
  detail: { id: 42, price: 9900 },
  bubbles: true
}))
```

## 받는 쪽은 그냥 addEventListener

받는 쪽은 특별할 게 없다. 기본 이벤트와 똑같이 `addEventListener`로 듣고, `event.detail`로 전달된 값을 읽으면 된다.

```
el.addEventListener('item-added', (e) => {
  console.log(e.detail.id, e.detail.price)
})
```

## bubbles 옵션이 중요한 이유

`CustomEvent`는 기본적으로 버블링되지 않는다. 자식 요소에서 발생시킨 이벤트를 조상 요소에서 잡고 싶다면 `bubbles: true`를 꼭 명시해야 한다. 안 그러면 리스너를 아무리 위에 걸어둬도 이벤트가 도착하지 않는다.

## 왜 유용한가

웹 컴포넌트나 바닐라 JS 모듈들이 서로 직접 함수를 호출하며 강하게 결합되는 대신, CustomEvent로 "이런 일이 일어났다"고만 알리고 듣는 쪽이 알아서 반응하게 만들 수 있다. 전역 상태 관리 라이브러리 없이도 모듈 간 결합도를 낮추는 가장 간단한 방법이다.

CustomEvent는 리스너를 등록해 듣는 쪽과 이벤트를 쏘는 쪽을 분리해, 작은 바닐라 JS 프로젝트에서도 느슨하게 연결된 구조를 만들 수 있게 해준다. detail로 데이터를 실어 보내고 bubbles로 전파 범위를 정하면, 별도 라이브러리 없이 꽤 쓸만한 이벤트 기반 아키텍처를 짤 수 있다.
