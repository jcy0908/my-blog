---
title: 화면이 꺼지지 않게 붙잡아두기, Screen Wake Lock API
date: 2026-11-13
tags: [JavaScript, 브라우저]
---

레시피 페이지를 보며 요리하다 화면이 꺼져서 처음부터 다시 켜본 경험이 있을 것이다. 예전엔 이 문제를 숨겨진 video를 재생시키거나 setInterval로 화면을 계속 건드리는 식의 꼼수로 피해갔는데, 이제는 표준 API 하나로 깔끔하게 해결할 수 있다.

## 기본 사용법

`navigator.wakeLock.request('screen')`을 호출하면 화면이 꺼지지 않도록 잠금을 건다. 반환되는 lock 객체의 `release()`를 호출하면 잠금이 풀린다.

```
const lock = await navigator.wakeLock.request('screen');
lock.addEventListener('release', () => console.log('잠금 해제됨'));
// 더 이상 필요 없을 때
await lock.release();
```

## 탭이 백그라운드로 가면 자동 해제된다

사용자가 탭을 전환하거나 화면을 끄면 브라우저가 잠금을 알아서 풀어버린다. 그래서 `visibilitychange` 이벤트를 듣고, 탭이 다시 보일 때 잠금이 없다면 재요청하는 로직이 필요하다.

## 반드시 HTTPS

이 API는 보안 컨텍스트에서만 동작하며, 아직 모든 브라우저가 지원하지 않으니 `'wakeLock' in navigator`로 먼저 확인해야 한다.

결국 Screen Wake Lock API는 "화면을 깨워두는 꼼수"를 브라우저가 공식적으로 표준화해준 사례로, 레시피·프레젠테이션·운동 앱처럼 사용자가 손을 안 대는 화면에서 특히 유용하다.
