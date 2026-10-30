---
title: CSS도 라이브러리도 없이 애니메이션 제어하기, Web Animations API
date: 2026-10-31
tags: [JavaScript, 애니메이션, 브라우저]
---

CSS 애니메이션은 선언만 하면 끝이지만, 중간에 멈추거나 속도를 바꾸려면 손이 많이 간다. 반대로 라이브러리를 쓰면 번들이 무거워진다. **Web Animations API**는 그 사이, 브라우저 네이티브로 애니메이션을 만들고 자바스크립트로 자유롭게 제어하는 길을 제공한다.

## element.animate()로 시작하기

모든 DOM 요소에는 `animate()` 메서드가 있다. 첫 번째 인자로 키프레임 배열을, 두 번째 인자로 지속시간 같은 옵션을 넘기면 바로 애니메이션이 실행된다.

```
const box = document.querySelector(".box");
const anim = box.animate(
  [{ transform: "translateX(0)" }, { transform: "translateX(200px)" }],
  { duration: 600, easing: "ease-out", fill: "forwards" }
);
```

이 결과로 반환되는 `Animation` 객체가 핵심이다. CSS 애니메이션은 클래스를 떼고 붙이며 흉내 내야 했던 제어를, 이 객체 하나가 직접 담당한다.

## 재생을 자유롭게 조작하기

`Animation` 객체는 `pause()`, `play()`, `reverse()`, `finish()`를 제공하고, `playbackRate`로 속도를 실시간으로 바꿀 수 있다. `anim.playbackRate = 0.5`만 써도 슬로모션이 된다. 끝났을 때는 `anim.finished`라는 프로미스로 완료 시점을 잡을 수 있어 `transitionend`를 여러 번 걸던 번거로움이 사라진다.

## CSS 애니메이션과의 차이

CSS `@keyframes`는 선언적이라 가볍지만, 실행 중 값을 동적으로 바꾸기 어렵다. Web Animations API는 반대로 처음부터 명령형이라, 사용자 입력에 맞춰 키프레임이나 타이밍을 즉석에서 계산해 넘기기 좋다. 둘은 경쟁 관계가 아니라, 정적인 효과는 CSS로 두고 상호작용이 필요한 부분만 이 API로 보완하는 식으로 같이 쓰인다.

결국 Web Animations API는 CSS의 성능과 자바스크립트의 제어력을 동시에 가져가는 방법이며, `animate()`가 돌려주는 `Animation` 객체 하나만 익혀두면 일시정지·역재생·속도조절까지 모두 손에 들어온다.
