---
title: required 속성 하나로는 부족할 때, Constraint Validation API
date: 2026-10-28
tags: [HTML, JavaScript, 폼]
---

회원가입 폼에서 비밀번호 확인 필드가 다를 때 보여줄 에러 메시지를 직접 만들려고 JS로 이것저것 짜다가, 브라우저가 이미 폼 검증용 API를 기본 제공한다는 걸 다시 떠올렸다. `required`, `pattern` 같은 속성 뒤에는 생각보다 쓸만한 JS 인터페이스가 숨어 있다.

## 속성만으로 되는 것과 안 되는 것

`required`, `minlength`, `pattern`, `type="email"` 같은 속성은 폼 제출 시 브라우저가 자동으로 검사하고 기본 말풍선 메시지를 띄워준다. 하지만 "비밀번호 확인이 일치하지 않음"처럼 여러 필드를 비교해야 하는 규칙은 속성만으로 표현이 안 된다.

## setCustomValidity로 직접 개입하기

이럴 때 `input.setCustomValidity(message)` 를 호출하면 그 input을 강제로 무효 상태로 만들고, 메시지를 넘기면 브라우저 기본 말풍선에 그대로 표시된다. 빈 문자열을 넘기면 다시 유효 상태로 돌아간다.

```
const pw = document.querySelector("#pw");
const confirm = document.querySelector("#confirm");

confirm.addEventListener("input", () => {
  if (confirm.value !== pw.value) {
    confirm.setCustomValidity("비밀번호가 일치하지 않습니다");
  } else {
    confirm.setCustomValidity("");
  }
});
```

## checkValidity와 :invalid 활용

`form.checkValidity()` 는 제출 없이도 전체 폼이 유효한지 즉시 확인할 수 있고, `input.validity` 객체는 `valueMissing`, `patternMismatch` 등 어떤 규칙이 깨졌는지 구체적으로 알려준다. CSS에서는 `:invalid`, `:valid` 셀렉터로 깨진 필드에만 테두리 색을 입히는 것도 가능하다.

브라우저는 `required`, `pattern` 같은 선언적 규칙 위에 `setCustomValidity`, `checkValidity`, `validity` 객체로 이어지는 검증 레이어를 이미 갖고 있어서, 필드 간 비교처럼 선언만으로 안 되는 규칙도 네이티브 에러 UI를 그대로 활용해 처리할 수 있다.
