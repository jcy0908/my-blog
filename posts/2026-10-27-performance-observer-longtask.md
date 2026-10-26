---
title: 화면이 멈추는 50ms를 잡아내는 PerformanceObserver
date: 2026-10-27
tags: [JavaScript, 성능]
---

버튼을 눌렀는데 반응이 한 박자 늦게 오는 느낌, 누구나 겪어봤을 것이다. 범인을 찾으려고 `console.time`을 여기저기 찍어보다가, 실제 사용자 브라우저에서 자동으로 "메인 스레드가 막혔다"를 알려주는 API가 있다는 걸 알게 됐다.

## Long Task는 무엇을 기준으로 잡나

브라우저는 메인 스레드를 50ms 넘게 붙잡고 있는 작업을 **Long Task**로 분류한다. 이 시간 동안은 클릭이나 스크롤 같은 입력을 처리할 수 없어서, 사용자는 화면이 멈춘 것처럼 느낀다.

## PerformanceObserver로 자동 감지하기

콘솔에 직접 로그를 남기지 않아도 `longtask` 타입을 구독하면 알아서 알림이 온다.

```
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.duration);
  }
});
observer.observe({ type: "longtask", buffered: true });
```

## 실무에서 쓰는 법

이렇게 수집한 기록은 실제 사용자(RUM) 환경에서 어떤 페이지, 어떤 시점에 병목이 생기는지 찾는 데 쓴다. `entry.attribution`을 보면 어떤 스크립트나 iframe이 원인인지까지 좁혀볼 수 있어서, 개발 환경에서는 안 보이던 문제를 운영 환경 데이터로 잡아낼 수 있다.

결국 Long Task는 "사용자가 느끼는 끊김"을 숫자로 바꿔주는 기준이고, PerformanceObserver는 그 숫자를 직접 들여다보지 않아도 흘러들어오게 해주는 감시 창구다.
