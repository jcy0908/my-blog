---
title: 뷰포트 교차를 감지하는 법, IntersectionObserver
date: 2026-09-23
tags: [JavaScript, 브라우저, 성능]
---

무한 스크롤이나 이미지 지연 로딩을 직접 구현하려면 "이 요소가 지금 화면에 보이는가"를 계속 알아야 한다. 예전에는 `scroll` 이벤트마다 `getBoundingClientRect()`를 호출해 위치를 계산했는데, 스크롤이 발생할 때마다 레이아웃을 강제로 다시 계산하니 느릴 수밖에 없었다. `IntersectionObserver`는 이 문제를 비동기·선언적으로 풀어준다.

## 기본 개념

`IntersectionObserver`는 대상 요소가 지정한 루트(기본값은 뷰포트)와 교차하는 정도가 바뀔 때마다 콜백을 실행한다. 스크롤을 직접 감시하지 않고 브라우저가 알아서 교차 여부를 계산해 알려주므로 메인 스레드 부담이 훨씬 적다.

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
});

document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));
```

## 옵션으로 감지 범위 조절하기

`threshold`는 교차 비율이 몇 %일 때 콜백을 실행할지 정하고, `rootMargin`은 루트 영역을 가상으로 넓히거나 좁힌다. 예를 들어 `rootMargin: "200px"`를 주면 요소가 화면에 실제로 들어오기 200px 전에 미리 콜백이 실행되어, 이미지 지연 로딩을 더 자연스럽게 만들 수 있다.

## 활용 사례

- 무한 스크롤: 목록 마지막 요소가 보이면 다음 페이지를 요청
- 지연 로딩: 이미지가 화면 근처에 오면 `src` 속성을 채움 (네이티브 `loading="lazy"`가 커버하지 못하는 세밀한 제어가 필요할 때)
- 스크롤 애니메이션: 섹션이 등장할 때 클래스를 붙여 fade-in 효과 적용
- 광고/콘텐츠 노출 로깅: 실제로 화면에 노출된 시점을 정확히 기록

> 콜백이 한 번 실행된 뒤 더 볼 필요가 없다면 `observer.unobserve()`로 반드시 해제해야 불필요한 감시가 쌓이지 않는다.

`MutationObserver`가 DOM 변화를, `ResizeObserver`가 크기 변화를 감지한다면 `IntersectionObserver`는 "보이는가"를 감지하는 전용 도구다. scroll 이벤트와 좌표 계산을 손으로 짜는 대신, 브라우저에게 교차 여부 판단을 맡기는 것이 더 가볍고 정확한 선택이다.
