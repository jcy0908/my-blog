---
title: 새 탭이 원래 창을 조종할 수도 있다, rel="noopener"
date: 2026-11-20
tags: [보안, HTML]
---

`target="_blank"`로 링크를 열 때마다 당연하게 써왔지만, 이 속성 하나가 열어주는 틈이 있다는 걸 오늘 알았다.

## reverse tabnabbing이란

`<a target="_blank">`로 연 새 탭은 기본적으로 `window.opener`를 통해 원래 탭의 `window` 객체에 접근할 수 있다. 새 탭 페이지가 악의적이라면 `window.opener.location.href`를 조작해 원래 탭을 가짜 로그인 페이지로 바꿔치기할 수 있다. 사용자는 뒤로 돌아왔을 때 익숙한 사이트가 그대로 있다고 믿고 다시 로그인을 시도하게 된다.

## noopener와 noreferrer의 차이

- `rel="noopener"`: 새 탭에서 `window.opener`를 `null`로 만들어 원래 탭에 접근하지 못하게 막는다.
- `rel="noreferrer"`: `opener` 접근도 막고, 추가로 `Referer` 헤더까지 보내지 않는다.

둘 다 붙이면 안전하지만, 리퍼러 정보가 필요한 분석 용도라면 `noopener`만 쓰는 선택도 가능하다.

```html
<a href="https://example.com" target="_blank" rel="noopener noreferrer">링크</a>
```

## JavaScript로 열 때도 동일하다

`window.open()`으로 새 창을 열 때도 `noopener` 옵션을 지정할 수 있다.

```js
window.open(url, '_blank', 'noopener');
```

> 최신 브라우저는 `target="_blank"`에 `noopener`를 기본 적용하기도 하지만, 구형 환경까지 고려하면 명시적으로 써주는 게 안전하다.

외부 링크를 새 탭으로 여는 코드는 블로그, 랜딩 페이지 어디에나 흔하니 `rel="noopener noreferrer"`를 습관처럼 붙이는 게 좋겠다.
