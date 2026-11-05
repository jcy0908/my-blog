---
title: 실패해도 then이 실행된다, Fetch API 에러 처리의 함정
date: 2026-11-06
tags: [JavaScript, 네트워크]
---

`fetch()`는 쓰기 쉬워 보이지만 막상 에러 처리를 제대로 하려면 생각보다 까다롭다. 가장 흔한 실수는 404나 500 같은 HTTP 에러 응답을 catch에서 잡힐 거라 믿는 것이다. 실제로는 그렇지 않다.

## fetch는 네트워크 실패만 거부한다

`fetch()`가 반환하는 프로미스는 DNS 실패나 연결 끊김처럼 요청 자체가 안 될 때만 거부(reject)된다. 서버가 404나 500을 응답해도 fetch는 정상적으로 resolve되고, then으로 넘어간다.

```
fetch('/api/missing')
  .then((res) => console.log(res.ok, res.status))
```

위 코드는 에러 없이 `false 404`를 출력한다.

## response.ok로 직접 확인하기

그래서 응답이 성공인지는 `response.ok`(상태 코드 200~299)를 직접 확인해야 한다. 실패로 처리하고 싶다면 수동으로 에러를 던져야 catch까지 전파된다.

```
async function getUser(id) {
  const res = await fetch(`/api/users/${id}`)
  if (!res.ok) {
    throw new Error(`요청 실패: ${res.status}`)
  }
  return res.json()
}
```

## try/catch와 함께 쓰기

async 함수 안에서는 위에서 던진 에러와 네트워크 에러를 같은 catch 블록으로 묶어서 처리할 수 있다. 사용자에게는 두 경우 모두 "요청에 실패했다"는 메시지로 보여주되, 콘솔에는 구분해서 로그를 남기면 디버깅이 쉬워진다.

## 요약

fetch의 프로미스는 HTTP 상태 코드와 무관하게 응답을 받기만 하면 resolve되므로, `response.ok`를 확인하지 않으면 404 응답을 성공으로 오인하는 버그가 생기기 쉽다. 응답이 실패 상태일 때 직접 에러를 던져 catch로 보내는 패턴을 습관화하면 네트워크 실패와 HTTP 에러를 한곳에서 안전하게 처리할 수 있다.
