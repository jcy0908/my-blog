# style.md — 색과 토큰의 단일 출처

이 문서는 `CLAUDE.md`의 웹앱 규칙이 참조하는 파일입니다. 새 웹앱을 만들 때 색을 새로 고르지 말고 여기서 가져옵니다.

값의 출처는 `public/styles.css`입니다. 이 문서와 그 파일이 어긋나면 `public/styles.css`가 맞습니다 — 발견하면 이 문서를 고쳐 주세요.

## 원칙 — 색은 한 개뿐이다

바탕은 강원 영서(嶺西)의 겨울에서 채집한 무채색이고, **색을 가진 것은 이끼색(`--moss`) 하나뿐입니다.**

비비드한 색은 화폐 같아서 많이 찍어 내면 가치가 떨어집니다. 화면 전체가 색이면 아무것도 강조되지 않습니다. 그래서 무채색으로 바탕의 값을 낮춰 두고 딱 한 곳에만 색을 지불합니다.

실무적으로는 이렇게 됩니다. **색이 나타나는 자리가 곧 눌러야 할 자리입니다.** 링크, 강조, 라벨, 활성 상태에만 이끼색을 쓰고, 그 외에는 쓰지 않습니다. 장식으로 쓰는 순간 이 규칙이 무너집니다.

## 1. 바탕색 여섯 — 영서의 겨울

```css
--winter-haze:  #eef1f2;   /* 겨울 안개 — 가장 밝은 바탕 */
--ice-sheet:    #dbe2e4;   /* 성엣장 — 한 단 낮은 면 */
--mountain-ink: #1c2325;   /* 먹색 산 — 본문 글자 */
--moss:         #4b6560;   /* 이끼 — 유일한 색 */
--stone:        #8a9296;   /* 돌 — 보조 글자 */
--winter-soil:  #5d6a6d;   /* 겨울 흙 */
```

이 여섯 개는 **이름 그대로 두고 값도 바꾸지 않습니다.** 하나를 바꾸면 블로그와 웹앱 전부가 어긋납니다.

## 2. 역할 이름 — 여섯 색을 무엇에 쓰는가

원색을 직접 쓰지 말고 역할 이름을 거쳐 씁니다. 다크 모드에서 갈아끼울 수 있는 층이 이쪽입니다.

```css
--c-bg:            var(--winter-haze);        /* 페이지 바탕 */
--c-surface:       var(--ice-sheet);          /* 카드·보드 등 한 단 위의 면 */
--c-text:          var(--mountain-ink);       /* 본문 */
--c-muted:         var(--stone);              /* 보조 텍스트, 캡션 */
--c-hairline:      rgba(28, 35, 37, 0.14);    /* 경계선 */
--c-hairline-soft: rgba(28, 35, 37, 0.07);    /* 더 약한 경계선 */
--c-accent:        var(--moss);               /* 링크·강조 — 유일한 색 */
--c-accent-hover:  #354a46;
--c-code-bg:       rgba(255, 255, 255, 0.5);
```

## 3. 유리 — 일곱 번째 재료

안개 낀 아침 창처럼, 뒤가 비치되 흐리게. 헤더·다이얼로그·떠 있는 면에 씁니다.

```css
--glass-bg:        rgba(255, 255, 255, 0.5);
--glass-bg-strong: rgba(255, 255, 255, 0.68);
--glass-border:    rgba(255, 255, 255, 0.65);
--glass-blur:      blur(22px) saturate(150%);
--glass-shadow:    0 1px 1px rgba(28, 35, 37, 0.03),
                   0 8px 28px rgba(28, 35, 37, 0.06);
```

`backdrop-filter`는 접두사와 함께 씁니다.

```css
.panel {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  -webkit-backdrop-filter: var(--glass-blur);
  backdrop-filter: var(--glass-blur);
}
```

유리는 뒤에 무언가 있을 때만 유리입니다. 단색 바탕 위에 얹으면 그냥 반투명한 회색 사각형입니다.

## 4. 다크 모드 — 겨울밤의 산

역할 이름만 갈아끼웁니다. 바탕색 여섯은 건드리지 않습니다.

```css
--c-bg:            #12181a;
--c-surface:       #1a2224;
--c-text:          #e6ecec;
--c-muted:         #8a9296;                      /* 라이트와 동일 */
--c-hairline:      rgba(230, 236, 236, 0.14);
--c-hairline-soft: rgba(230, 236, 236, 0.07);
--c-accent:        #7ea19a;                      /* 어두운 바탕에서 이끼색을 올린 값 */
--c-accent-hover:  #9ab9b2;
--c-code-bg:       rgba(255, 255, 255, 0.055);

--glass-bg:        rgba(255, 255, 255, 0.055);
--glass-bg-strong: rgba(255, 255, 255, 0.09);
--glass-border:    rgba(255, 255, 255, 0.12);
--glass-shadow:    0 1px 1px rgba(0, 0, 0, 0.2),
                   0 8px 28px rgba(0, 0, 0, 0.28);
```

다크에서 `--c-accent`가 `#4b6560`이 아니라 `#7ea19a`인 이유는, 어두운 바탕 위에서 원래 이끼색은 명도 대비가 부족해 링크로 읽히지 않기 때문입니다.

### 세 가지 상태를 모두 처리한다

테마는 두 가지가 아니라 세 가지입니다 — 명시적 라이트, 명시적 다크, 그리고 **아무것도 고르지 않은 기본값**. 기본값일 때는 `data-theme` 속성이 아예 없으므로 시스템 설정만이 단서입니다.

```css
/* 1. 라이트를 기본으로 정의 */
:root { --c-bg: #eef1f2; /* … */ }

/* 2. 시스템이 다크일 때 */
@media (prefers-color-scheme: dark) {
  :root { --c-bg: #12181a; /* … */ }
}

/* 3. 수동 토글은 시스템 설정을 이긴다 (속성 선택자라 명시도가 높음) */
:root[data-theme="dark"]  { --c-bg: #12181a; /* … */ }
:root[data-theme="light"] { --c-bg: #eef1f2; /* … */ }
```

셋 중 하나라도 빠지면 시스템 다크 사용자가 흰 화면을 보거나, 토글이 한쪽 방향으로만 먹습니다.

## 5. 타이포그래피 · 간격 · 반경

```css
--font-sans: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont,
             "Apple SD Gothic Neo", "Segoe UI", Roboto, "Malgun Gothic", sans-serif;
--font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;

--w-text:   42rem;   /* 본문 한 줄 최대 폭 */
--w-wide:   62rem;   /* 넓은 레이아웃 */

--radius:    14px;
--radius-sm:  8px;

--space-1: 0.5rem;
--space-2: 1rem;
--space-3: 1.5rem;
--space-4: 2.5rem;
--space-5: 4rem;
--space-6: 6.5rem;
```

간격은 이 여섯 단계 안에서 고릅니다. `1.3rem` 같은 값이 필요해 보이면 대개 레이아웃이 잘못된 것입니다.

## 6. 웹앱에서 쓰는 법

웹앱은 `/apps/{앱 이름}/` 안에서 자체 완결합니다. 블로그의 `public/styles.css`를 링크하지 않습니다 — 앱은 독립적으로 열려야 하고, 블로그 CSS에는 앱에 필요 없는 규칙이 대부분입니다.

그래서 **값을 복사해 옵니다.** 앱의 `style.css` 맨 위에 위 토큰 중 그 앱이 실제로 쓰는 것만 옮겨 적고, 나머지는 앱 고유의 이름으로 정의합니다. 기존 앱 세 개(`2048`, `pixel-art`, `calculator`)가 모두 이 방식입니다.

복사할 때 지킬 것.

- **여섯 바탕색의 hex 값을 바꾸지 않는다.** 이름은 앱 사정에 맞게 바꿔도 되지만 값은 그대로입니다.
- **이끼색은 누를 수 있는 것에만 쓴다.**
- **다크 모드 세 상태를 모두 만든다.** 위 4절의 세 블록 구조를 그대로 가져갑니다.
- **모바일에서 동작해야 한다.** 터치 타깃은 최소 44×44px, 가로 스크롤이 생기지 않게 합니다.
- **사용법 안내 문구를 넣는다.** `CLAUDE.md`의 웹앱 규칙입니다.

## 7. 알려진 어긋남

앱들은 지금 팔레트를 hex 문자열로 복사해 쓰고 있어서, 여섯 색 중 하나를 바꾸면 앱마다 손으로 고쳐야 합니다. 같은 값이 `public/styles.css`, 앱 세 개의 `style.css`, 그리고 이 문서까지 다섯 곳에 있습니다.

앱이 독립적으로 열려야 한다는 제약과 맞바꾼 결과이므로 당장 고칠 문제는 아니지만, 색을 바꿀 일이 생기면 다섯 곳을 모두 훑어야 한다는 것은 알고 있어야 합니다.
