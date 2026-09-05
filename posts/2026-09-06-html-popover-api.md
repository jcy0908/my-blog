---
title: 팝오버 하나 띄우려고 JS를 쓸 필요가 없어졌다, Popover API
date: 2026-09-06
tags: [HTML, 접근성, UI]
---

드롭다운이나 툴팁을 만들 때마다 `position: absolute`로 겹침을 관리하고, 바깥 클릭 감지와 ESC 키 처리를 직접 짜고, `aria-expanded`를 손으로 맞춰본 적이 있다면 반가울 소식이다. 이제 브라우저가 이 모든 걸 속성 하나로 대신해준다.

## popover 속성

아무 요소에나 `popover` 속성을 붙이면 기본적으로 화면에서 숨겨진 상태가 되고, 열렸을 때는 다른 요소보다 항상 위에 뜨는 **top layer**로 승격된다. `z-index` 전쟁이 필요 없다는 뜻이다.

## 트리거 연결하기

버튼에 `popovertarget`으로 대상 id를 지정하면 클릭만으로 열고 닫을 수 있다. `popovertargetaction="show"` 또는 `"hide"`로 동작을 고정할 수도 있다.

```html
<button popovertarget="menu">메뉴</button>
<div id="menu" popover>
  <p>여기에 내용을 넣는다</p>
</div>
```

## 공짜로 따라오는 접근성

바깥을 클릭하거나 ESC를 누르면 자동으로 닫히고, 포커스도 알아서 이동한다. `:popover-open` 슈도클래스로 열린 상태의 스타일만 따로 지정하면 된다.

간단한 툴팁이나 메뉴 정도라면 JS 라이브러리 없이 `popover` 속성과 CSS 몇 줄로 끝낼 수 있다는 게 오늘의 핵심이다.
