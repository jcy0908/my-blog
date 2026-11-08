---
title: input 하나씩 꺼내지 말고, FormData 객체로 폼 데이터 모으기
date: 2026-11-09
tags: [JavaScript, HTML, 폼]
---

회원가입 폼을 `fetch`로 제출할 때마다 `document.querySelector`로 input을 하나씩 꺼내 객체를 직접 만들곤 했는데, `FormData`를 쓰면 `<form>` 요소 하나만 넘겨도 모든 입력값을 한 번에 모을 수 있다는 걸 오늘 제대로 배웠다.

## FormData 만들기

`new FormData(formElement)`를 호출하면 폼 안의 모든 `input`, `select`, `textarea` 값이 `name` 속성을 키로 자동 수집된다. `type="file"` input도 그대로 포함되기 때문에, 텍스트와 파일을 함께 보내야 하는 폼에서 특히 유용하다. 폼 요소 없이 빈 `FormData`를 만들고 `append`로 값을 하나씩 채워 넣을 수도 있다.

## fetch와 함께 쓸 때 주의할 점

`fetch`의 `body`에 `FormData` 인스턴스를 그대로 넣으면 브라우저가 `Content-Type`을 `multipart/form-data; boundary=...` 형식으로 자동 설정해준다. boundary 값은 매번 랜덤하게 생성되므로, 직접 `Content-Type` 헤더를 지정하면 이 값이 빠져서 서버가 요청 바디를 제대로 파싱하지 못한다. 헤더는 건드리지 않는 것이 핵심이다.

## 값 다루기

`append(key, value)`는 같은 키를 여러 번 추가할 수 있고, `set(key, value)`는 기존 값을 덮어쓴다. `get`, `getAll`로 값을 꺼내거나 `entries()`로 전체를 순회할 수도 있다.

```js
const form = document.querySelector('#signup-form');
const formData = new FormData(form);

formData.append('source', 'landing');

fetch('/api/signup', {
  method: 'POST',
  body: formData,
});
```

`FormData`는 폼의 입력값과 파일을 자바스크립트 객체로 다시 조합하는 수고를 없애주고, `multipart/form-data` 인코딩까지 대신 처리해준다. 폼 전송 코드를 짤 때는 값을 일일이 꺼내기 전에 `FormData`로 시작하는 게 더 안전하다.
