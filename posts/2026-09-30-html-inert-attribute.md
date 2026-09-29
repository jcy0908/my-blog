---
title: 모달 뒤편 잠재우기, HTML inert 속성
date: 2026-09-30
tags: [HTML, 접근성]
---

모달을 열 때 배경 콘텐츠에 여전히 Tab 키로 포커스가 가고, 스크린 리더도 뒤쪽 텍스트를 읽어버리는 문제가 있었다. `aria-hidden`만 붙이면 포커스는 여전히 이동해서 보이지 않는 요소에 포커스가 갇히는 모순이 생긴다. `inert` 속성을 쓰면 이 문제를 한 번에 해결할 수 있다.

## inert가 하는 일

`inert` 속성이 붙은 요소와 그 자손은 클릭, 포커스, 텍스트 선택이 모두 막히고 스크린 리더 접근 트리에서도 제외된다. 자바스크립트 없이 속성 하나로 "이 영역은 지금 상호작용 대상이 아니다"를 선언하는 셈이다.

```html
<main id="page-content" inert>
  <!-- 배경 콘텐츠 -->
</main>
<div class="modal" role="dialog">...</div>
```

## aria-hidden과의 차이

`aria-hidden="true"`는 스크린 리더에서만 숨길 뿐 마우스나 키보드 포커스는 막지 못한다. 반면 `inert`는 시각적으로는 그대로 보이면서 모든 입력 상호작용을 차단한다. 그래서 모달, 오프캔버스 메뉴처럼 "보이지만 지금은 만질 수 없는" 영역에 정확히 들어맞는다.

## 자바스크립트로 토글하기

모달을 열고 닫을 때 배경에 속성을 붙였다 떼면 된다.

```js
const bg = document.getElementById('page-content');
function openModal() { bg.inert = true; }
function closeModal() { bg.inert = false; }
```

정리하면 `inert`는 배경 콘텐츠를 포커스, 클릭, 스크린 리더 탐색 모두에서 한 번에 제외시켜주는 선언적 속성으로, 모달 같은 오버레이 UI의 접근성을 자바스크립트 포커스 트랩 코드 없이도 크게 개선해준다.
