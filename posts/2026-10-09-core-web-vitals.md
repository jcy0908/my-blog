---
title: 체감 속도를 숫자로 재는 법, Core Web Vitals
date: 2026-10-09
tags: [성능, 웹표준]
---

"사이트가 빠르다"는 느낌은 사람마다 다르게 말하지만, 구글은 이를 **Core Web Vitals**라는 세 가지 지표로 정량화했다. 로딩, 반응성, 안정성을 각각 측정해 사용자 경험을 숫자로 비교할 수 있게 해준다.

## LCP (Largest Contentful Paint)

화면에서 가장 큰 콘텐츠(이미지, 텍스트 블록 등)가 렌더링되기까지 걸린 시간이다. 사용자가 "페이지가 다 로드됐다"고 느끼는 시점에 가깝다. 2.5초 이내가 좋은 점수로 분류된다.

## CLS (Cumulative Layout Shift)

페이지가 로드되는 동안 요소들이 갑자기 밀리는 정도를 누적해서 측정한다. 이미지에 `width`/`height`를 지정하지 않으면 로드 후 레이아웃이 튀면서 CLS가 나빠진다.

## INP (Interaction to Next Paint)

클릭이나 입력 같은 상호작용 후 화면이 반응하기까지 걸리는 시간이다. 기존 FID(First Input Delay)를 대체해 공식 지표가 됐고, 상호작용 전체의 지연을 더 정확히 반영한다.

```js
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.startTime);
  }
}).observe({ type: 'largest-contentful-paint', buffered: true });
```

세 지표 모두 실제 사용자 데이터를 기반으로 검색 순위에도 영향을 주기 때문에, 개발 단계에서부터 Lighthouse나 DevTools Performance 탭으로 미리 확인해두는 습관이 중요하다.
