---
title: 이미지가 찌그러지지 않게, object-fit과 object-position
date: 2026-11-08
tags: [CSS]
---

썸네일 영역에 다양한 비율의 이미지를 넣다 보면 사진이 늘어나거나 어색하게 잘릴 때가 많다. `width`와 `height`만 고정하면 비율이 깨지기 쉬운데, `object-fit`과 `object-position` 두 속성만으로 이 문제를 깔끔하게 해결할 수 있다는 걸 오늘 제대로 이해했다.

## object-fit, 콘텐츠를 담는 방식 정하기

`object-fit`은 `<img>`나 `<video>` 같은 요소의 콘텐츠가 지정된 박스 크기에 어떻게 맞춰질지 결정한다. `cover`는 비율을 유지하면서 박스를 꽉 채우고 넘치는 부분을 잘라내며, `contain`은 비율을 유지하면서 박스 안에 전부 들어오도록 줄인다. `fill`은 기존 기본값처럼 비율을 무시하고 박스에 맞춰 늘린다.

## object-position, 잘리는 기준점 바꾸기

`cover`를 쓰면 이미지 일부가 잘리는데, 어느 부분이 남을지는 `object-position`으로 정한다. 기본값은 `center`지만 `top`, `bottom` 같은 키워드를 쓰거나 `20% 80%`처럼 좌표로 세밀하게 조정할 수도 있다. 인물 사진처럼 얼굴이 위쪽에 있는 이미지는 `top`으로 맞춰주면 중요한 부분이 잘리는 걸 피할 수 있다.

## 코드로 확인하기

```css
.thumbnail {
  width: 240px;
  height: 160px;
  object-fit: cover;
  object-position: top;
}
```

`object-fit`과 `object-position`을 쓰면 원본 이미지를 자르거나 가공하지 않고도 다양한 비율의 썸네일을 깨짐 없이 보여줄 수 있다. `background-size: cover`와 비슷한 효과를 내지만, `<img>` 태그의 시맨틱과 `alt` 속성을 통한 접근성을 그대로 유지할 수 있다는 점이 가장 큰 장점이다.
