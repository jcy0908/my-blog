---
title: 브라우저가 렌더링하지 않는 마크업, HTML template 요소
date: 2026-09-28
tags: [HTML, JavaScript]
---

리스트 아이템을 반복해서 그릴 때마다 문자열을 이어붙여 `innerHTML`에 때려박곤 했는데, `<template>` 태그를 쓰면 마크업을 미리 HTML에 써두고 필요할 때 복제만 하면 된다는 걸 알게 됐다.

## 렌더링되지 않는 콘텐츠

`<template>` 안의 내용은 DOM에 있어도 화면에 그려지지 않고, 이미지 로드나 스크립트 실행도 일어나지 않는다. 브라우저가 파싱만 해두고 활성화하지 않는 "비활성 DOM"이라서, 나중에 쓸 마크업을 미리 문서에 심어둘 수 있다.

## content 프로퍼티와 복제

템플릿의 실제 내용은 `.content`라는 `DocumentFragment`에 들어 있다. 이걸 `cloneNode(true)`로 복제해서 원하는 위치에 붙이면, 같은 구조를 반복해서 찍어낼 수 있다.

## 코드 예시

```
<template id="row">
  <li class="item"><span></span></li>
</template>
```

```
const tpl = document.getElementById('row');
const frag = tpl.content.cloneNode(true);
frag.querySelector('span').textContent = '항목 1';
list.appendChild(frag);
```

정리하면, `<template>`은 브라우저가 렌더링하지 않고 보관만 해두는 마크업 조각으로, `content`를 `cloneNode`해서 필요한 순간에 DOM에 삽입하면 문자열 조립 없이도 반복되는 UI를 안전하고 빠르게 만들 수 있다.
