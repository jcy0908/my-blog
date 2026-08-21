---
title: 새로고침해도 남아있는 데이터, Web Storage 이야기
date: 2026-08-22
tags: [JavaScript, 브라우저]
---

로그인 상태나 다크모드 설정처럼 새로고침해도 유지되어야 하는 값이 있다. 서버 없이 브라우저에만 저장하고 싶을 때 쓰는 `localStorage`와 `sessionStorage`의 차이를 정리했다.

## 두 저장소의 차이

- `localStorage`는 탭이나 브라우저를 닫아도 데이터가 남는다. 만료 기한이 없어 직접 지우기 전까지 계속 유지된다.
- `sessionStorage`는 탭을 닫으면 사라진다. 같은 사이트라도 새 탭을 열면 별도의 저장소를 쓴다.

두 저장소 모두 같은 오리진(origin) 안에서만 공유되고, 저장 용량은 보통 5MB 안팎으로 제한된다.

## 사용법은 동일하다

API 모양이 완전히 같아서 필요에 따라 골라 쓰면 된다.

```js
localStorage.setItem('theme', 'dark');
const theme = localStorage.getItem('theme');
localStorage.removeItem('theme');
```

## 주의할 점

저장되는 값은 항상 문자열이다. 객체를 넣으려면 `JSON.stringify`로 변환하고, 꺼낼 때 `JSON.parse`로 되돌려야 한다. 두 저장소 모두 동기적으로 동작하기 때문에 큰 데이터를 자주 읽고 쓰면 렌더링이 막힐 수 있다.

정리하면 `localStorage`는 영구 저장, `sessionStorage`는 탭 단위 임시 저장이라는 생명주기 차이만 기억하면, 나머지는 같은 API로 다룰 수 있다.
