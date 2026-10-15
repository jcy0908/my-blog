---
title: 스크롤이 끊길 때 의심할 것, addEventListener의 passive 옵션
date: 2026-10-16
tags: [JavaScript, 성능, 모바일]
---

모바일에서 스크롤이 살짝 밀리는 느낌이 들 때가 있다. 원인 중 하나가 `scroll`이나 `touchstart` 리스너다. 브라우저는 리스너 안에서 `preventDefault()`를 호출할지 몰라 매번 리스너 실행이 끝나길 기다렸다가 스크롤을 그리는데, 옵션 하나만 바꾸면 이 대기를 없앨 수 있다.

## 왜 기다리는가

터치 스크롤은 원래 취소 가능한 이벤트다. 사용자가 손가락을 움직이는 순간 브라우저는 `touchmove` 리스너를 실행해서 `preventDefault()`가 호출되는지 확인해야 하고, 그 결과가 나올 때까지는 화면을 그릴 수 없다. 리스너 코드가 무겁거나 메인 스레드가 바쁘면 그만큼 스크롤도 밀린다.

## passive: true

리스너를 등록할 때 세 번째 인자로 `{ passive: true }`를 주면 "이 리스너는 절대 `preventDefault()`를 호출하지 않는다"고 미리 약속하는 셈이다. 브라우저는 리스너 실행을 기다리지 않고 바로 스크롤을 그릴 수 있다.

```js
window.addEventListener('touchstart', onTouchStart, { passive: true });
window.addEventListener('scroll', onScroll, { passive: true });
```

## 지키지 않으면

`passive: true`로 등록한 리스너 안에서 `preventDefault()`를 호출하면 아무 효과가 없고, 콘솔에 경고만 남는다. 스크롤을 실제로 막아야 하는 리스너(예: 커스텀 당겨서 새로고침)라면 `passive: false`를 유지해야 한다.

## 언제 바꿔야 하나

스크롤을 막을 일이 없는 `scroll`, `touchstart`, `touchmove`, `wheel` 리스너는 거의 전부 `passive: true`로 바꿔도 안전하다. Lighthouse의 "Does not use passive listeners to improve scrolling performance" 경고도 바로 이 지점을 가리킨다.

정리하면, `passive` 옵션은 "이 리스너는 스크롤을 막지 않는다"는 선언을 브라우저에 미리 넘겨서 렌더링과 이벤트 처리를 병렬로 만들어주는 작은 계약이고, 스크롤 관련 리스너를 추가할 때는 기본값으로 켜두는 게 좋다.
