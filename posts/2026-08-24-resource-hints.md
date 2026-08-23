---
title: 브라우저에 미리 알려주기, preload와 preconnect
date: 2026-08-24
tags: [HTML, 성능]
---

브라우저는 HTML을 위에서부터 파싱하며 필요한 리소스를 그때그때 발견한다. 그런데 정작 중요한 파일이 CSS 안 `@font-face`나 자바스크립트 뒤쪽에 숨어 있으면 요청이 늦게 시작된다. `<link rel="preload">` 같은 리소스 힌트는 이 순서를 브라우저에게 미리 알려주는 역할을 한다.

## preload는 이번 페이지에 확실히 쓸 파일

`<link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>`처럼 쓰면 브라우저는 파서가 그 위치에 도달하기 전에 곧바로 다운로드를 시작한다. 대신 실제로 쓰이지 않는 파일을 preload하면 대역폭만 낭비하므로, 화면에 바로 보이는 폰트나 히어로 이미지처럼 확실히 필요한 리소스에만 써야 한다.

## prefetch와 preconnect는 성격이 다르다

`prefetch`는 지금 페이지가 아니라 다음에 이동할 가능성이 있는 페이지의 리소스를 유휴 시간에 미리 받아두는 힌트라 우선순위가 낮다. `preconnect`는 파일을 받는 게 아니라 DNS 조회, TCP 연결, TLS 협상까지만 미리 끝내둬서, 실제 요청이 시작될 때 왕복 시간을 줄여준다. 외부 폰트 CDN이나 API 도메인처럼 곧 요청할 게 확실한 origin에 붙이면 효과가 크다.

```
<link rel="preconnect" href="https://fonts.example.com" crossorigin>
<link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
```

세 힌트 모두 남용하면 오히려 우선순위가 뒤섞여 정작 중요한 리소스가 밀릴 수 있다. 오늘은 preload는 확정된 리소스를 앞당기고, prefetch는 다음 탐색을 대비하고, preconnect는 연결 자체를 미리 맺어둔다는 역할 차이를 정리했다.
