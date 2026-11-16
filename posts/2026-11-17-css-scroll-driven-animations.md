---
title: 스크롤 이벤트 없이 스크롤에 맞춰 움직이기, CSS 스크롤 기반 애니메이션
date: 2026-11-17
tags: [CSS, 애니메이션, 스크롤]
---

스크롤에 맞춰 진행 바가 채워지는 효과를 넣으려고 `scroll` 이벤트와 `requestAnimationFrame`을 짜곤 했는데, CSS만으로 된다는 걸 오늘 알았다. `animation-timeline` 속성 얘기다.

## 애니메이션의 시계를 바꾼다

보통 `animation`은 시간이 흐르며 재생되지만, `animation-timeline: scroll()`을 주면 그 시계가 시간 대신 **스크롤 위치**가 된다. 내리면 진행되고 올리면 되감긴다.

```
.progress {
  animation: grow linear;
  animation-timeline: scroll(root);
}
@keyframes grow {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
```

## 보이는 동안만 움직이게 하기

요소가 뷰포트에 들어오고 나가는 구간에만 걸고 싶다면 `animation-timeline: view()`를 쓴다. 등장 시 시작하고 퇴장 시 끝나므로, IntersectionObserver와 콜백 없이 페이드인 효과를 만들 수 있다.

## 여전히 JS가 필요한 경우

지원이 아직 보편적이지 않아 `@supports`로 폴백을 챙기는 게 안전하다. 진행률에 맞춰 숫자를 세는 등 keyframe으로 표현하기 어려운 로직은 JS가 유리하다.

결국 `animation-timeline`은 스크롤 위치를 애니메이션 진행률에 바로 연결하는 기능으로, 간단한 진행 바나 등장 효과라면 이벤트 리스너 없이 CSS 한 줄로 끝낼 수 있다.
