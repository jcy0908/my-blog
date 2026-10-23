---
title: innerHTML도 검사받게 만들기, Trusted Types
date: 2026-10-24
tags: [보안, 브라우저]
---

DOM 기반 XSS는 서버를 거치지 않고 클라이언트 코드 안에서 조용히 터진다. `innerHTML`이나 `document.write`에 외부 입력이 그대로 들어가는 순간이 바로 그 지점인데, 문제는 이런 '위험한 싱크(sink)'가 코드베이스 전체에 흩어져 있어서 리뷰만으로 다 잡기 어렵다는 점이다. **Trusted Types**는 이 싱크 자체를 브라우저 레벨에서 막아버리는 플랫폼 기능이다.

## 위험한 싱크란

`innerHTML`, `outerHTML`, `document.write`, `eval` 계열처럼 문자열을 바로 DOM이나 스크립트로 해석시키는 API들을 말한다. 이 중 하나에 사용자 입력이 섞여 들어가면 그게 곧 XSS다.

## Trusted Types의 동작 방식

CSP 헤더에 `require-trusted-types-for 'script'`를 추가하면, 브라우저는 저 싱크들에 일반 문자열이 들어오는 걸 거부한다. 대신 반드시 *TrustedHTML* 같은 전용 타입을 거쳐야 하는데, 이 타입은 미리 등록한 **policy**를 통해서만 만들 수 있다.

```js
const policy = trustedTypes.createPolicy('app-policy', {
  createHTML: (input) => sanitize(input)
});

el.innerHTML = policy.createHTML(userInput);
```

policy 안에서 살균(sanitize) 로직을 강제하므로, 검증 없이 문자열을 그대로 꽂는 코드는 런타임에서 바로 예외를 던진다.

## 적용 팁

처음부터 모든 싱크를 막으면 기존 코드가 대거 깨진다. `Content-Security-Policy-Report-Only`로 먼저 위반 사례만 수집하고, 리포트를 보며 policy를 하나씩 추가한 뒤에 강제 모드로 전환하는 순서가 안전하다.

Trusted Types는 "input을 믿고 알아서 안전하게 처리하라"는 관례를 "브라우저가 강제로 검사한다"는 규칙으로 바꿔준다. CSP, SRI처럼 각자 다른 각도에서 위협을 막는 방어선 중 하나로 같이 알아두면 좋다.
