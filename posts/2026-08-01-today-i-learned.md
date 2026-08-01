---
title: 오늘 배운 것
date: 2026-08-01
tags: [회고, 웹개발]
---

클로드 코드와 함께 마크다운을 정적 HTML로 변환하는 블로그를 직접 만들어보면서, HTML·CSS·JavaScript 세 가지가 각각 어떤 역할을 맡는지 다시 한번 명확하게 정리할 수 있었다.

## HTML: 콘텐츠의 뼈대

HTML은 페이지에 어떤 내용이 들어가는지, 그 내용이 어떤 의미를 갖는지를 표현한다. 이번 프로젝트에서는 마크다운을 파싱해 `<h1>`, `<p>`, `<ul>`, `<pre><code>` 같은 태그로 변환하는 작업이 바로 이 역할이었다. 스타일이나 동작이 하나도 없어도 HTML만으로 글의 구조(제목, 문단, 목록, 인용)는 완전히 전달된다.

## CSS: 보기 좋게 꾸미기

CSS는 같은 HTML을 얼마나 읽기 좋게 보여줄지 결정한다.

- CSS 변수(`--color-bg`, `--color-text` 등)로 라이트/다크 테마 색상을 한곳에서 관리했다.
- `prefers-color-scheme`와 `data-theme` 속성을 조합해 OS 설정과 사용자 수동 선택을 모두 지원했다.
- `max-width`와 `clamp()`만으로도 미디어쿼리 없이 꽤 괜찮은 반응형 레이아웃을 만들 수 있었다.

즉, CSS는 콘텐츠는 그대로 두고 "어떻게 보일지"만 담당한다.

## JavaScript: 상호작용 더하기

JavaScript는 정적인 페이지에 동작을 붙인다. 이번 블로그에서는 다크모드 토글 버튼 하나가 전부였지만, 그 안에도 다음 역할이 들어있었다.

```js
btn.addEventListener('click', () => {
  const next = getEffectiveTheme() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  localStorage.setItem('theme', next);
});
```

클릭 이벤트를 감지하고, 상태(테마)를 바꾸고, 그 상태를 `localStorage`에 저장해 다음 방문에도 기억하게 만드는 것. 이 세 가지가 JavaScript가 하는 일이었다.

## 정리

결국 HTML은 "무엇을", CSS는 "어떻게 보이게", JavaScript는 "어떻게 반응하게" 만들지를 담당한다는 걸 프레임워크 없이 직접 구현해보니 훨씬 몸으로 느껴졌다.
