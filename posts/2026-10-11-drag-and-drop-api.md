---
title: 마우스로 끌어다 놓기, HTML Drag and Drop API
date: 2026-10-11
tags: [JavaScript, HTML, UI]
---

파일 업로드 영역에 파일을 끌어다 놓거나, 리스트 항목의 순서를 바꾸는 UI는 라이브러리 없이도 브라우저 표준 Drag and Drop API로 구현할 수 있다.

## draggable과 dragstart

요소에 `draggable="true"`를 주면 드래그가 가능해진다. `dragstart` 이벤트에서 `event.dataTransfer.setData(type, value)`로 옮길 데이터를 담아둔다.

## dragover에서 반드시 preventDefault

드롭을 받을 영역은 기본적으로 드롭을 막는다. `dragover` 이벤트에서 `event.preventDefault()`를 호출해야 `drop` 이벤트가 실제로 발생한다.

```js
dropzone.addEventListener('dragover', (e) => e.preventDefault());
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  const id = e.dataTransfer.getData('text/plain');
  dropzone.appendChild(document.getElementById(id));
});
```

## 파일 드롭도 같은 원리

파일 탐색기에서 파일을 끌어오면 `e.dataTransfer.files`에 `File` 객체 목록이 담긴다. 같은 `drop` 핸들러로 업로드 영역을 만들 수 있다.

결국 Drag and Drop API는 `dragstart`에서 데이터를 싣고 `dragover`를 막아 길을 열어준 뒤 `drop`에서 꺼내 쓰는, 세 이벤트의 조합일 뿐이다.
