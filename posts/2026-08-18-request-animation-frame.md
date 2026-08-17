---
title: setTimeout 대신 requestAnimationFrame을 쓰는 이유
date: 2026-08-18
tags: [JavaScript, 성능]
---

오늘은 자바스크립트로 화면에 애니메이션을 넣을 때 `setTimeout` 대신 `requestAnimationFrame`을 써야 하는 이유를 정리했다. 이름 그대로 브라우저에게 "다음 프레임을 그리기 직전에 이 콜백을 실행해줘"라고 부탁하는 API라는 점이 핵심이었다.

## setTimeout의 한계

`setTimeout`으로 애니메이션을 만들면 타이머 간격과 실제 화면 리프레시 주기가 어긋난다. 브라우저가 초당 60번 화면을 그리는데 타이머는 그 박자를 모르기 때문에, 프레임이 버려지거나 겹쳐 실행되면서 끊김이 생긴다. 탭이 백그라운드로 가도 타이머는 그대로 돌아 배터리를 낭비한다.

## requestAnimationFrame의 동작

`requestAnimationFrame`은 브라우저의 리페인트 타이밍에 맞춰 콜백을 한 번만 호출하고, 콜백에 현재 시각(timestamp)을 넘겨준다. 탭이 보이지 않으면 자동으로 호출을 멈춰 자원을 아낀다.

```js
function tick(now) {
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
```

이전 timestamp와의 차이를 계산하면 프레임마다 이동 거리를 일정하게 유지할 수 있다. 결국 애니메이션 타이밍은 타이머가 아니라 브라우저의 그리기 주기에 맡기는 게 맞다는 걸 다시 확인했다.
