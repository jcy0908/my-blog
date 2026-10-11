---
title: 새로고침 없이 주소창 바꾸기, History API
date: 2026-10-12
tags: [JavaScript, 브라우저]
---

SPA에서 페이지를 다시 불러오지 않고도 주소창의 URL이 바뀌고 뒤로 가기가 동작하는 건 `History API` 덕분이다.

## pushState로 주소만 바꾸기

`history.pushState(state, title, url)`을 호출하면 페이지를 새로 로드하지 않고 주소창의 URL과 히스토리 스택에 항목을 추가할 수 있다. 화면 갱신은 직접 해줘야 한다.

```js
history.pushState({ page: 2 }, '', '/posts/2');
renderPage(2);
```

## popstate로 뒤로/앞으로 가기 감지

사용자가 뒤로 가기 버튼을 누르면 `popstate` 이벤트가 발생하고, `event.state`에 `pushState`로 저장했던 값이 담겨 온다. 이 값으로 화면을 다시 그려야 한다.

```js
window.addEventListener('popstate', (e) => {
  renderPage(e.state?.page ?? 1);
});
```

## replaceState는 스택에 쌓지 않는다

`replaceState`는 `pushState`와 인자가 같지만 새 항목을 추가하지 않고 현재 항목을 덮어쓴다. 필터 조건처럼 뒤로 가기 대상으로 삼고 싶지 않은 변경에 적합하다.

결국 History API는 브라우저 주소창과 뒤로 가기 버튼을 라우팅 로직과 동기화하는 저수준 도구로, `pushState`로 기록하고 `popstate`로 복원하는 두 동작이 전부다.
