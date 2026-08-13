---
title: 이미지 지연 로딩, loading="lazy"와 IntersectionObserver
date: 2026-08-13
tags: [브라우저, 성능]
---

글이 길어질수록 이미지도 늘어나는데, 화면 밖에 있는 이미지까지 페이지 로드 시점에 전부 받아오면 첫 화면이 뜨는 속도가 느려진다. 오늘은 화면에 보일 때만 이미지를 불러오는 지연 로딩 방법 두 가지를 정리했다.

## 네이티브 속성 하나로 끝내기

가장 간단한 방법은 `img` 태그에 `loading="lazy"`를 붙이는 것이다. 브라우저가 알아서 뷰포트에 가까워질 때 이미지를 요청한다. 별도 스크립트 없이 브라우저 기본 기능만으로 동작하지만, 언제 얼마나 미리 불러올지는 브라우저마다 다르고 세밀하게 조정할 수 없다는 한계가 있다.

## IntersectionObserver로 직접 제어하기

더 정교하게 다루고 싶다면 실제 `src`를 넣지 않고 `data-src`에 경로를 담아두었다가, 요소가 뷰포트에 들어오는 순간 옵저버 콜백에서 `src`로 옮겨준다.

```
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      io.unobserve(img);
    }
  });
});
document.querySelectorAll('img[data-src]').forEach((img) => io.observe(img));
```

`rootMargin`을 주면 뷰포트에 닿기 전 미리 로딩을 시작할 수도 있어서, 스크롤 중 이미지가 늦게 뜨는 느낌을 줄일 수 있다.

간단한 목록형 페이지라면 `loading="lazy"` 한 줄로 충분하고, 로딩 시점을 세밀하게 조정하거나 이미지 외의 콘텐츠까지 지연시키고 싶다면 IntersectionObserver를 쓰는 게 낫다.
