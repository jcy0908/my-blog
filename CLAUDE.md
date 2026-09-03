##프로젝트 개요

마크다운 기반 블로그+미니 웹앱 포트폴리오,HTML,CSS,JavasScript만 사용.

##작업 사이클

사용자가 웹앱 주제를 요청하면 다음순서로 진행한다.


1.plan— 서브 에이전트를 만들어 계획을 작성한다.어떤 웹앱을 만들지, 파일 구조는 어떻게할지 정리한다. 작성한 계획은 spec.md로 저장하며,사용자 승인을 받는다

2.build —서브에이전트를 만들어 구현한다. 웹앱은/apps/{웹이름}/폴더를 독립적으로 만든다.블로그의 다른 파일을 건들지 않는다

3.Build — 별도 서브 에이전트를 만들어 검증한다. 브라우저에서 정상 동작하는지, 코드에 문제가 없는지 확인하고 review.md를 작성한다. 문제가 수정한다.

4.Embed — 블로그 메인 페이지(index.html)에 웹앱 카드를 추가한다.카드에는 제목,설명,미리보기 이미지 또는 iframe을 넣은다. 깃 커밋한다.


##서브에이전트 규칙

* 서브에이저트에게 작업을 넘길때 전용 지침 파일(.md)를 만들어 전달한다
* Build 서브에이전트와 Review 서브에이전트는 반드시 분배한다.
* 서브에이전트는 지침 파일에 명시된 범위만 수정한다.


##웹앱 규칙

-모든 웹앱은/apps/{앱 이름}/폴더 안에 자체 완결한다.
-외부 라이브러리 사용을 최소화한다.CDN은 허용한다.
-모바일에서도 사용할 수 있어야 한다.
-모든 웹앱은 블로그 색상의 팔레트를 따른다. style.md의 css변수를 참조할것.
-웹앱에 사용법 안내 문구를 반드시 포함한다.

##SEO

사이트의 정규 주소·메타·광고 설정은 `scripts/site.config.js` 한 곳에 있다.
주소가 바뀌거나 AdSense를 켤 때 이 파일만 고친다.

빌드가 만들어 주는 것.

- 페이지마다 canonical, Open Graph, Twitter 카드
- JSON-LD — 홈은 WebSite + Blog, 글은 BlogPosting + BreadcrumbList, 페이지는 WebPage
- `robots.txt`, `sitemap.xml`
- `about.html`, `contact.html`, `privacy.html`
- `ads.txt` — 게시자 ID가 설정됐을 때만

개인정보 처리방침은 손으로 쓰지 않고 설정에서 생성한다. 광고를 켜지 않았는데
광고 쿠키를 설명하는 방침은 사실이 아니기 때문이다.

### 점검 도구

SEO 점검에는 claude-seo 플러그인을 쓴다. 처음 한 번만 설치하면 된다.

```
/plugin marketplace add AgriciDaniel/claude-seo
/plugin install claude-seo@agricidaniel-claude-seo
/seo setup
```

쓸 때.

```
/seo audit https://jcy0908.github.io/my-blog/     전체 감사
/seo page  <글 주소>                               한 페이지
```

글을 여러 편 올린 뒤나 템플릿을 고친 뒤에 돌린다.

### AdSense

`scripts/site.config.js`의 `adsense.publisherId`가 비어 있으면 광고 코드도
`ads.txt`도 생성되지 않는다. 승인 전에 빈 코드를 넣어 둘 이유가 없다.

승인은 코드가 아니라 사이트 상태를 본다. 정해진 글 개수로 보장되지 않으며
소유권, 정책 준수, 실제 콘텐츠 품질을 본다. 심사용 글을 채웠다가 지우는 식으로
운영하지 않는다.

준비가 되면 `publisherId`에 `ca-pub-` 로 시작하는 전체 값을 넣고 빌드한다.
그러면 광고 스크립트, `ads.txt`, 개인정보 처리방침의 광고·쿠키 문단이 함께
생긴다. 유럽 등 일부 지역은 동의 메시지 설정이 필요하며 AdSense 콘솔에서
관리한다.

##규칙
-승인 없이 구현을 시작하지 않는다
-막히면 사용자에게 알린다.
