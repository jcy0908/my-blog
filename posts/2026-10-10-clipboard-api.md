---
title: 복사 버튼 하나 제대로 만들기, Clipboard API
date: 2026-10-10
tags: [JavaScript, 브라우저]
---

"코드 복사" 버튼을 `document.execCommand('copy')`로 만들던 시절이 있었다. 지금은 `navigator.clipboard`라는 비동기 API가 표준으로 자리잡으면서, 더 안전하고 다루기 쉬운 방식으로 클립보드에 접근할 수 있다.

## writeText와 readText

`navigator.clipboard.writeText(text)`는 문자열을 클립보드에 쓰고, `readText()`는 읽어온다. 둘 다 Promise를 반환하는 비동기 함수라 `await`와 함께 쓰기 좋다.

```js
async function copyCode(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log('복사 완료');
  } catch (err) {
    console.error('복사 실패', err);
  }
}
```

## 보안 컨텍스트와 권한

이 API는 HTTPS 같은 보안 컨텍스트에서만 동작하며, 대부분 브라우저가 사용자 제스처(클릭 등) 없이 호출하면 막는다. 특히 `readText()`는 권한 프롬프트가 뜨거나 거부될 수 있어, 반드시 `try/catch`로 실패를 다뤄야 한다.

## execCommand와의 차이

과거의 `execCommand('copy')`는 동기적이고 선택된 DOM 텍스트에 의존했지만, `navigator.clipboard`는 임의의 문자열이나 이미지(Blob)까지 다룰 수 있고 비동기라 메인 스레드를 막지 않는다. 지원 브라우저가 충분히 늘어난 지금은 구형 방식을 fallback으로만 남겨두는 정도면 충분하다.

결국 클립보드 복사 기능은 버튼 클릭 이벤트 안에서 `writeText`를 호출하고 실패 처리만 잘 해주면 끝나는, 생각보다 단순한 작업이다.
