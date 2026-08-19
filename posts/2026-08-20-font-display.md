---
title: 폰트가 늦게 뜨는 이유, FOUT와 FOIT 그리고 font-display
date: 2026-08-20
tags: [CSS, 성능]
---

웹폰트를 쓰는 사이트에서 글자가 잠깐 안 보이다가 나타나거나, 다른 폰트로 보이다가 갑자기 바뀌는 경험을 한 적이 있을 것이다. 이건 브라우저가 폰트 파일을 내려받는 동안 무엇을 보여줄지 저마다 다르게 결정하기 때문에 생기는 현상이다.

## FOIT와 FOUT

**FOIT**(Flash of Invisible Text)는 폰트가 로드될 때까지 텍스트를 아예 숨기는 방식이다. 글자가 안 보이다가 갑자기 나타나서 사용자는 잠깐 콘텐츠가 없다고 느낀다. **FOUT**(Flash of Unstyled Text)는 반대로 시스템 폰트로 먼저 보여주고, 웹폰트가 도착하면 교체한다. 텍스트는 바로 보이지만 글꼴이 한 번 바뀌는 게 눈에 띈다.

## font-display로 동작 제어하기

`@font-face` 규칙에 `font-display` 속성을 추가하면 이 동작을 직접 정할 수 있다.

```css
@font-face {
  font-family: "MyFont";
  src: url("/fonts/my-font.woff2") format("woff2");
  font-display: swap;
}
```

`swap`은 대체 폰트를 즉시 보여주고 로드가 끝나면 교체해 FOUT를 선택한다. `block`은 짧게 숨겼다가 실패하면 대체 폰트로 넘어가고, `optional`은 네트워크가 느리면 아예 웹폰트를 포기해 레이아웃 흔들림을 최소화한다.

> 콘텐츠가 바로 보이는 게 중요한 사이트라면 `swap`이나 `optional`이, 브랜드 폰트가 핵심이라면 `block`이 더 어울린다.

결국 어떤 값을 고르느냐는 "글자가 안 보이는 시간"과 "폰트가 바뀌는 순간의 어색함" 중 무엇을 감수할지의 선택이다. `font-display` 하나로 이 트레이드오프를 코드 한 줄로 조정할 수 있다는 게 오늘 배운 것이다.
