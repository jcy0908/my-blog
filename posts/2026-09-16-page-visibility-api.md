---
title: 탭이 백그라운드로 가면 알아채는 법, Page Visibility API
date: 2026-09-16
tags: [JavaScript, 브라우저]
---

동영상이 재생 중인 탭을 다른 탭으로 전환했더니 소리만 계속 나거나, 백그라운드 탭에서도 `setInterval`이 쉬지 않고 돌아 배터리를 갉아먹는 경우가 있다. 브라우저는 탭이 화면에 보이는지 여부를 이미 알고 있고, Page Visibility API로 그 정보를 코드에서도 확인할 수 있다.

## document.hidden과 visibilitychange

`document.hidden`은 현재 문서가 화면에서 보이지 않으면 `true`를 반환한다. 탭이 최소화되거나 다른 탭으로 전환될 때 값이 바뀌며, 이 변화는 `visibilitychange` 이벤트로 감지할 수 있다.

```js
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    video.pause();
  } else {
    video.play();
  }
});
```

## visibilityState로 더 세밀하게

`document.visibilityState`는 `hidden`, `visible` 두 값 중 하나를 가지며, `hidden`보다 상태를 명시적으로 다룰 때 읽기 좋다. 탭이 완전히 닫히는 시점을 잡고 싶다면 `pagehide` 이벤트가 `unload`보다 더 안정적으로 동작한다.

## 언제 쓰면 좋은가

영상·오디오 자동 정지, 백그라운드에서 폴링 주기 늘리기, 분석 도구에서 실제 체류 시간 계산 등에 활용할 수 있다. `blur`/`focus` 이벤트와 달리 개발자 도구를 열거나 다른 창을 겹쳐도 오작동하지 않는다는 점이 실무에서 특히 유용하다.

탭이 보이지 않을 때 불필요한 작업을 멈추는 것만으로도 배터리와 네트워크 자원을 아낄 수 있으니, 백그라운드 동작이 있는 페이지라면 Page Visibility API를 한 번쯤 점검해볼 만하다.
