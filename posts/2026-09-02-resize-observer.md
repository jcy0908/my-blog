---
title: 요소 크기 변화를 감지하는 방법, ResizeObserver
date: 2026-09-02
tags: [JavaScript, 브라우저]
---

반응형 레이아웃을 만들다 보면 창 크기가 아니라 **특정 요소 자체**의 크기 변화에 반응해야 할 때가 있다. 사이드바를 접었다 펴거나, 부모 컨테이너가 유동적으로 늘었다 줄어들 때가 그렇다. 예전에는 `resize` 이벤트나 폴링으로 어설프게 흉내 냈지만, 이제는 `ResizeObserver`라는 전용 API가 있다.

## window resize의 한계

`window.resize`는 브라우저 창 크기만 감지한다. 요소가 flex나 grid 안에서 부모 크기에 따라 커지거나 줄어드는 경우는 잡아내지 못한다. 결국 개발자들은 `setInterval`로 크기를 계속 확인하는 편법을 썼는데, 성능 낭비가 컸다.

## ResizeObserver 기본 사용법

`ResizeObserver`는 지정한 요소의 크기가 바뀔 때마다 콜백을 실행한다.

```js
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    console.log(entry.contentRect.width, entry.contentRect.height);
  }
});

observer.observe(document.querySelector(".card"));
```

`entry.contentRect`에는 padding을 제외한 콘텐츠 영역의 너비와 높이가 담긴다. 더 이상 필요 없으면 `observer.unobserve(element)`나 `observer.disconnect()`로 정리한다.

## 활용 예시

카드 너비가 300px 아래로 줄어들면 클래스를 붙여 레이아웃을 컴팩트하게 바꾸는 식으로, 컨테이너 쿼리가 없던 시절의 반응형 컴포넌트를 직접 구현할 수 있었다. 지금은 CSS `@container`가 비슷한 역할을 하지만, JS 쪽 로직(차트 리사이즈, 캔버스 재계산)과 연결하려면 여전히 `ResizeObserver`가 유용하다.

> 요소 단위의 반응형이 필요하다면 window보다 그 요소 자체를 관찰하는 편이 정확하다.

`MutationObserver`가 DOM 구조 변화를, `IntersectionObserver`가 뷰포트 교차를 감지하듯 `ResizeObserver`는 크기 변화를 감지하는 전용 도구다. 세 옵저버를 구분해서 기억해두면 상황에 맞는 API를 훨씬 빠르게 고를 수 있다.
