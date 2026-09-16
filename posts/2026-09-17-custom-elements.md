---
title: 나만의 HTML 태그 만들기, Custom Elements
date: 2026-09-17
tags: [HTML, JavaScript, 웹컴포넌트]
---

`<user-card>`처럼 프로젝트에만 있는 태그를 브라우저가 그냥 알아볼 수 있다면 어떨까. Custom Elements는 프레임워크 없이도 `HTMLElement`를 상속한 클래스 하나로 새로운 HTML 태그를 만들 수 있게 해주는 표준 API다.

## 정의와 등록

`customElements.define()`에 태그 이름과 클래스를 넘기면 끝이다. 태그 이름에는 반드시 하이픈이 하나 이상 들어가야 하는데, 앞으로 나올 표준 태그와 이름이 겹치지 않게 하기 위한 규칙이다.

```js
class UserCard extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<strong>${this.getAttribute('name')}</strong>`;
  }
}
customElements.define('user-card', UserCard);
```

## 생명주기 콜백

`connectedCallback`은 요소가 DOM에 삽입될 때, `disconnectedCallback`은 제거될 때 호출된다. 속성 변화를 감지하려면 `observedAttributes`에 감시할 속성 이름을 배열로 반환하고 `attributeChangedCallback`을 구현하면 된다.

## 기존 태그와의 차이

Custom Elements는 `div`나 `span`처럼 스타일도, 자체 동작도 없는 빈 태그에서 시작한다. 접근성이 필요하다면 `role`이나 `tabindex`를 직접 챙겨야 하며, 폼 요소로 동작하게 하려면 `ElementInternals`까지 별도로 다뤄야 한다.

특정 프레임워크 없이도 재사용 가능한 UI 조각을 만들고 싶다면 Custom Elements는 가장 표준에 가까운 출발점이 되어준다.
