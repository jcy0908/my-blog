---
title: CDN 스크립트를 믿어도 될까, Subresource Integrity
date: 2026-10-19
tags: [보안, HTML]
---

CDN에서 라이브러리를 불러올 때마다 조금 불안했다. CDN 서버가 해킹당하거나 중간에서 응답이 바뀌면, 내 사이트에 악성 스크립트가 그대로 실행될 수 있기 때문이다. 오늘은 이런 위험을 줄여주는 **Subresource Integrity(SRI)**를 배웠다.

## SRI가 하는 일

SRI는 `<script>`나 `<link>` 태그에 파일의 해시값을 적어두고, 브라우저가 실제로 받은 파일의 해시와 비교하는 기능이다. 값이 다르면 브라우저는 그 리소스를 실행하지 않고 차단한다. 즉 "내가 기대한 바로 그 파일"만 실행되도록 보장해준다.

## 사용법

`integrity` 속성에 해시 알고리즘과 base64 값을 넣고, `crossorigin` 속성을 함께 써준다.

```
<script src="https://cdn.example.com/lib.js"
  integrity="sha384-abc123..."
  crossorigin="anonymous"></script>
```

`crossorigin`이 없으면 CORS 응답 헤더를 확인할 수 없어서 무결성 검사 자체가 동작하지 않는다.

## 해시는 어떻게 만드나

대부분의 CDN(jsDelivr, cdnjs 등)은 스크립트 태그와 함께 해시값을 미리 제공한다. 직접 만들려면 `openssl dgst -sha384 -binary lib.js | openssl base64 -A` 같은 명령으로 구할 수 있다. 중요한 건 파일이 업데이트되면 해시도 반드시 같이 바꿔줘야 한다는 점이다.

## 요약

SRI는 외부에서 불러오는 스크립트나 스타일시트가 변조되지 않았는지 브라우저 단에서 검증해주는 간단하지만 강력한 방어선이다. CDN을 쓰는 프로젝트라면 `integrity`와 `crossorigin` 속성을 챙기는 습관만으로 공급망 공격 위험을 크게 줄일 수 있다.
