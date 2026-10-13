---
title: 공유 버튼, 직접 만들지 말고 OS에 넘기기 — Web Share API
date: 2026-10-14
tags: [JavaScript, 브라우저, 모바일]
---

링크 공유 기능을 넣을 때 트위터·카카오톡 아이콘을 줄줄이 박아넣은 적이 있을 것이다. `navigator.share()`를 쓰면 그 대신 OS가 제공하는 공유 시트를 그대로 띄울 수 있다.

## navigator.share()

`navigator.share(data)`는 제목, 텍스트, URL을 담아 호출하면 운영체제의 네이티브 공유 메뉴를 연다. 사용자는 거기서 메시지, 메일, 설치된 앱 등 원하는 대상으로 바로 공유한다.

```js
async function sharePage() {
  try {
    await navigator.share({
      title: document.title,
      text: '이 글 읽어보세요',
      url: location.href,
    });
  } catch (err) {
    // 사용자가 취소해도 AbortError가 발생한다
    console.log('공유 취소 또는 실패', err);
  }
}
```

## 지원 여부 확인과 fallback

이 API는 보안 컨텍스트(HTTPS)와 사용자 제스처(클릭)가 필요하고, 데스크톱 브라우저 일부는 아직 지원하지 않는다. 그래서 호출 전에 `navigator.share`가 존재하는지 확인하고, 없으면 기존처럼 URL을 클립보드에 복사하는 버튼으로 대체하는 패턴이 흔하다.

```js
if (navigator.share) {
  shareButton.onclick = sharePage;
} else {
  shareButton.onclick = () => navigator.clipboard.writeText(location.href);
}
```

## canShare로 파일 공유 가능 여부 미리 확인

이미지나 파일을 함께 공유하고 싶다면 `data.files` 배열을 넘기면 되는데, 파일 공유는 브라우저마다 지원 폭이 다르다. `navigator.canShare(data)`로 실제로 공유 가능한 데이터인지 먼저 검사하면, 실패할 호출을 미리 걸러낼 수 있다.

정리하면, 공유 버튼은 여러 SNS 아이콘을 직접 구현하기보다 `navigator.share()`로 OS 공유 시트에 위임하는 쪽이 유지보수도 쉽고 사용자 경험도 더 자연스럽다. 다만 지원하지 않는 환경을 위한 fallback은 꼭 챙겨야 한다.
