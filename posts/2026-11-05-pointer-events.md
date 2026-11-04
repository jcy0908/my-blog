---
title: 마우스도 터치도 하나로, Pointer Events
date: 2026-11-05
tags: [JavaScript, DOM, 모바일]
---

드래그 기능을 만들 때 `mousedown`과 `touchstart`를 각각 따로 처리해본 적이 있을 것이다. `Pointer Events`를 쓰면 마우스, 터치, 펜 입력을 입력 장치 종류와 상관없이 하나의 이벤트 체계로 다룰 수 있다.

## pointerdown, pointermove, pointerup

`mousedown/mousemove/mouseup`과 이름만 다를 뿐 쓰는 방식은 거의 같다. 차이는 어떤 입력 장치로 눌렀는지를 `event.pointerType`("mouse", "touch", "pen")으로 구분할 수 있다는 점이다.

```
el.addEventListener('pointerdown', (e) => {
  console.log(e.pointerType, e.pointerId)
})
```

## pointerId와 setPointerCapture

멀티터치 환경에서는 손가락마다 서로 다른 `pointerId`가 부여된다. `setPointerCapture(pointerId)`를 호출하면 포인터가 요소 밖으로 나가도 move/up 이벤트를 계속 그 요소에서 받을 수 있어, 드래그 같은 동작을 끊김 없이 구현할 수 있다.

```
el.addEventListener('pointerdown', (e) => {
  el.setPointerCapture(e.pointerId)
})
```

## 왜 마우스/터치 이벤트 대신 쓰는가

터치스크린 브라우저는 `touchstart` 뒤에 호환성을 위해 `mousedown`을 추가로 발생시키기도 해서, 두 이벤트를 같이 처리하면 로직이 중복되거나 꼬이기 쉽다. Pointer Events는 입력 장치를 하나로 추상화해 분기 처리를 없애준다.

마우스 이벤트와 터치 이벤트를 각각 리스닝하던 코드를 pointerdown/move/up 세 가지로 합치면, 입력 장치를 가리지 않는 드래그나 그리기 기능을 더 적은 코드로, 더 안정적으로 만들 수 있다.
