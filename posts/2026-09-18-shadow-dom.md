---
title: 스타일이 새어 나가지 않는 방, Shadow DOM
date: 2026-09-18
tags: [HTML, CSS, 웹컴포넌트]
---

컴포넌트 하나를 만들 때마다 클래스 이름이 겹칠까 봐 `.card-title-v2` 같은 이름을 짓게 된다면, 진짜 필요한 건 캡슐화다. Shadow DOM은 요소 내부에 독립된 미니 DOM 트리를 만들어, 안쪽 스타일이 바깥으로 새지 않고 바깥 스타일도 안으로 침투하지 않게 해준다.

## 그림자 루트 만들기

`element.attachShadow({ mode: 'open' })`을 호출하면 그 요소 아래에 별도의 렌더링 트리가 생긴다. 이후 `innerHTML`이나 `appendChild`로 넣는 내용은 문서의 일반 DOM이 아니라 이 그림자 트리 안에 존재한다.

```js
class InfoBox extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>p { color: teal; }</style>
      <p>캡슐화된 문단</p>
    `;
  }
}
customElements.define('info-box', InfoBox);
```

## 스타일 경계

그림자 트리 안의 `<style>`은 오직 그 트리 안에서만 적용된다. 문서 전역 CSS가 `p { color: red; }`를 선언해도 `info-box` 내부 문단은 영향을 받지 않는다. 반대로 내부 스타일도 바깥으로 흘러나가지 않는다.

## open과 closed 모드

`mode: 'open'`이면 `element.shadowRoot`로 외부 코드가 내부 트리에 접근할 수 있다. `closed`로 설정하면 이 접근이 막혀 완전히 캡슐화되지만, 디버깅이 까다로워지므로 특별한 이유가 없다면 `open`을 쓰는 편이 실용적이다.

Shadow DOM은 이름 충돌을 걱정하지 않고 컴포넌트를 독립적으로 배포할 수 있게 해주는 도구이며, Custom Elements와 함께 쓸 때 진가를 발휘한다.
