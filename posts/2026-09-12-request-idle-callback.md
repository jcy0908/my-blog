---
title: 브라우저가 한가할 때 처리하기, requestIdleCallback
date: 2026-09-12
tags: [JavaScript, 성능]
---

로그 전송이나 통계 계산처럼 지금 당장 끝나지 않아도 되는 작업을, 굳이 메인 스레드가 바쁠 때 끼워 넣을 이유는 없다. `requestIdleCallback`은 브라우저가 렌더링과 입력 처리를 마치고 남는 시간에만 콜백을 실행해주는 API다.

## 언제 쓰는가

스크롤이나 애니메이션처럼 매 프레임 실행돼야 하는 작업엔 `requestAnimationFrame`이 맞지만, 우선순위가 낮은 작업은 다르다. 분석 데이터 전송, 캐시 정리, 미리 렌더링해둘 컴포넌트 준비처럼 "언젠가 끝나기만 하면 되는" 일에 적합하다.

## 기본 사용법

콜백은 `IdleDeadline` 객체를 받는데, `timeRemaining()`으로 남은 유휴 시간을 확인해 작업을 쪼갤 수 있다.

```js
requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0 && tasks.length) {
    doWork(tasks.pop());
  }
}, { timeout: 2000 });
```

`timeout`을 주면 브라우저가 계속 바빠도 그 시간 안에는 강제로 실행된다.

## 주의할 점

콜백 안에서 DOM을 크게 변경하면 다음 프레임에 레이아웃 계산 비용이 몰릴 수 있어, 여전히 작업을 잘게 나누는 게 중요하다. 또한 Safari는 아직 지원하지 않으므로 `setTimeout`으로 폴백을 준비해야 한다.

우선순위가 낮은 작업을 유휴 시간에 미뤄두면 렌더링을 방해하지 않으면서도 결국엔 처리된다는 점에서, `requestIdleCallback`은 성능과 사용자 경험 사이의 실용적인 타협점이다.
