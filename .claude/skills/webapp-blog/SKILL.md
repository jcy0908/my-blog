---
name: webapp-blog
description: 이 저장소(마크다운 블로그 + 미니 웹앱 포트폴리오)에 새 미니 웹앱을 추가하거나 기존 웹앱을 수정할 때 사용한다. "~게임 만들어줘", "~에디터/도구 추가해줘", "새 웹앱 만들어줘" 같은 요청이 오면 반드시 이 스킬을 먼저 참고해서 plan→build→review→embed 순서와 서브에이전트 분리 규칙을 따른다. spec.md, review.md, apps.json, apps/{이름}/ 폴더 구조, 서브에이전트 지침 파일 작성 방식이 헷갈릴 때도 이 스킬을 확인한다. "스킬"이라는 단어를 언급하지 않아도, 이 블로그에 새로운 인터랙티브 미니 앱을 붙이는 작업이면 항상 적용한다.
---

# webapp-blog: 이 프로젝트의 미니 웹앱 개발 하네스

## 이 프로젝트가 뭔지

마크다운 기반 정적 블로그 + 미니 웹앱 포트폴리오. HTML/CSS/JavaScript만 사용하고 프레임워크는 쓰지 않는다.
`scripts/build.js`가 `posts/*.md`와 `apps/apps.json`을 읽어 `dist/`에 정적 사이트를 생성하고, GitHub Actions(`.github/workflows/deploy.yml`)가 `main` 브랜치 푸시마다 GitHub Pages로 배포한다.

## 폴더 구조

```
apps/
  apps.json          # 미니앱 매니페스트 (아래 스키마 참고)
  {앱이름}/
    index.html
    style.css
    script.js
    spec.md          # plan 단계 산출물
    review.md         # review 단계 산출물
posts/*.md            # 블로그 글
public/styles.css     # 블로그 전체 CSS 변수(팔레트) — 웹앱 색상은 반드시 이걸 참조
scripts/build.js       # 빌드 스크립트, 건드리지 않는다
dist/                  # 빌드 산출물, gitignore됨, 직접 수정 금지
CLAUDE.md              # 이 프로젝트의 규칙 원본. 이 스킬과 내용이 어긋나면 CLAUDE.md가 우선한다.
```

`apps/apps.json` 스키마 (배열, 각 항목은 카드 하나):
```json
{
  "path": "폴더명",
  "title": "카드에 표시될 제목",
  "description": "카드에 표시될 한 줄 설명"
}
```

## 작업 사이클 (반드시 이 순서, 각 단계는 별도 서브에이전트)

사용자가 웹앱 주제를 요청하면 아래 4단계를 순서대로 진행한다. **승인 없이 구현을 시작하지 않는다.** 막히면 바로 사용자에게 알린다.

### 1. Plan
서브에이전트를 만들어 계획을 작성시킨다. 무엇을 만들지, 파일 구조를 어떻게 할지 정리해 `apps/{앱이름}/spec.md`로 저장한다. **사용자 승인을 받기 전까지 다음 단계로 넘어가지 않는다.**

### 2. Build
별도 서브에이전트를 만들어 구현시킨다. `apps/{앱이름}/` 폴더만 새로 만들고, 블로그의 다른 파일(posts/, scripts/, public/, 다른 apps/*)은 건드리지 않는다.

### 3. Review
Build와는 **다른** 서브에이전트를 만들어 검증시킨다. 브라우저에서 실제로 동작하는지, 코드에 문제가 없는지 확인하고 `apps/{앱이름}/review.md`에 결과를 남긴다. 문제가 있으면 수정한다.

### 4. Embed
`apps/apps.json`에 항목을 추가하고(위 스키마), `npm run build`로 반영을 확인한 뒤 필요하면 커밋한다. `dist/index.html`은 빌드 산출물이므로 직접 편집하지 않고 `apps.json` + build 스크립트를 통해서만 반영한다.

## 서브에이전트 규칙

- 서브에이전트에게 작업을 넘길 때는 전용 지침 파일(`.md`)을 만들어 전달한다. (예: `apps/{앱이름}/spec.md`를 빌드 서브에이전트에게 지침으로 넘기고, 별도 review 지침을 review 서브에이전트에게 넘긴다.)
- Build 서브에이전트와 Review 서브에이전트는 반드시 분리한다. 같은 에이전트가 구현하고 스스로 검증하지 않는다.
- 서브에이전트는 지침 파일에 명시된 범위만 수정한다. 특히 Build 서브에이전트는 자기 앱 폴더 밖을 건드리지 않는다.

## 웹앱 규칙

- 모든 웹앱은 `/apps/{앱이름}/` 폴더 안에 자체 완결한다 (다른 폴더 참조 없음).
- 외부 라이브러리 사용을 최소화한다. CDN은 허용한다.
- 모바일에서도 사용할 수 있어야 한다 (반응형, 터치 입력 고려).
- 모든 웹앱은 블로그 색상 팔레트를 따른다. `public/styles.css`의 CSS 변수(`--color-bg`, `--color-text`, `--color-text-muted`, `--color-link`, `--color-link-hover`, `--color-border`, `--color-code-bg`, `--color-surface`, 폰트/스페이싱 변수 등)를 앱 자체 `style.css`에서 재사용하거나 값을 맞춘다. 라이트/다크 모드 전환(`prefers-color-scheme` + `data-theme` 속성)도 블로그 방식과 일치시킨다.
- 웹앱에 사용법 안내 문구를 반드시 포함한다 (예: "방향키로 조작하세요" 같은 짧은 안내를 `index.html` 안에 넣는다). 별도 README 파일을 만들지 않는다 — 문서는 화면 안에 넣는다.

## 참고

- `apps/2048/spec.md`, `apps/2048/review.md`가 이 사이클을 따른 실제 예시다. 새 spec.md를 쓸 때 톤/구조를 참고해도 좋다.
- 이 스킬의 규칙과 `CLAUDE.md`가 어긋나면 `CLAUDE.md`를 확인하고 최신 내용을 우선한다 — `CLAUDE.md`가 이 프로젝트 규칙의 원본이다.
