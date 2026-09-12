---
title: 모달 창을 위한 네이티브 태그, HTML dialog 요소
date: 2026-09-13
tags: [HTML, 접근성]
---

지금까지 모달 창을 만들려면 `div`와 CSS로 오버레이를 그리고, JS로 포커스 트랩과 ESC 키 처리까지 직접 구현해야 했다. 그런데 `dialog` 요소 하나면 이 대부분을 브라우저가 대신 해준다는 걸 오늘 알게 됐다.

## show()와 showModal()의 차이

`dialog` 요소는 여는 방법에 따라 동작이 완전히 다르다.

- `show()`: 그냥 화면에 뜨는 대화상자. 배경 클릭이나 다른 요소로 포커스 이동이 자유롭다.
- `showModal()`: 진짜 모달로 열린다. 배경과의 상호작용이 차단되고, 포커스가 다이얼로그 안에 자동으로 갇히며, ESC 키로 닫힌다.

접근성이 필요한 모달이라면 무조건 `showModal()`을 써야 한다.

## ::backdrop으로 배경 꾸미기

모달 뒤에 깔리는 반투명 배경은 `::backdrop` 가상 요소로 스타일링할 수 있다.

```html
<dialog id="myModal">
  <p>정말 삭제하시겠습니까?</p>
  <button onclick="myModal.close()">닫기</button>
</dialog>
<script>
  myModal.showModal();
</script>
```

## 닫힐 때 값 전달하기

`close(반환값)`으로 값을 넘기면 `dialog.returnValue` 속성으로 어떤 버튼을 눌러 닫혔는지 알 수 있다. `<form method="dialog">` 안의 버튼을 누르면 폼 제출 없이 그 값을 자동으로 담아 닫아준다.

포커스 트랩과 ESC 처리, 배경 접근 차단까지 브라우저가 기본 제공한다는 점에서 `dialog`는 커스텀 모달 라이브러리를 대체할 수 있는 실용적인 태그였다.
