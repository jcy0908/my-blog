import { site, adsense, absoluteUrl } from '../site.config.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function renderTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return '';
  return (
    '<ul class="tag-list">' +
    tags.map((tag) => '<li class="tag">' + escapeHtml(tag) + '</li>').join('') +
    '</ul>'
  );
}

function renderTopics(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return '';
  return `<span class="post-topics">${tags.map(escapeHtml).join(' / ')}</span>`;
}

/** JSON-LD 한 덩이. 값은 이미 이스케이프된 JSON이므로 </script>만 막는다. */
function renderJsonLd(objects) {
  if (!objects || objects.length === 0) return '';
  return objects
    .map(
      (obj) =>
        '<script type="application/ld+json">' +
        JSON.stringify(obj).replace(/</g, '\\u003c') +
        '</script>'
    )
    .join('\n');
}

/**
 * AdSense 스크립트. publisherId가 없으면 아무것도 넣지 않는다.
 * 승인 전에 빈 코드를 넣어 둘 이유가 없다.
 */
function renderAdsense() {
  if (!adsense.publisherId) return '';
  const id = escapeHtml(adsense.publisherId);
  return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${id}" crossorigin="anonymous"></script>`;
}

export function layout({
  title,
  basePath,
  bodyHtml,
  pageType = 'home',
  description,
  canonicalPath = '',
  jsonLd = [],
}) {
  const year = new Date().getFullYear();
  const pageDescription =
    description || '좋았던 것들이 왜 좋았는지, 감각과 구조를 언어로 기록하는 감도 感度입니다.';
  const canonicalUrl = absoluteUrl(canonicalPath);
  // 공유 카드에는 사이트명을 두 번 적지 않는다
  const shareTitle = title.replace(/\s*—\s*감도 感度$/, '');
  const readingProgress =
    pageType === 'post'
      ? `<div class="reading-progress" role="progressbar" aria-label="글 읽기 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
  <span class="reading-progress-fill"></span>
</div>`
      : '';

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#f4f2ec">
<meta name="description" content="${escapeHtml(pageDescription)}">
<title>${escapeHtml(title)}</title>
<link rel="canonical" href="${escapeHtml(canonicalUrl)}">

<!-- 공유될 때 보이는 것. 제목·설명·주소를 정규 주소와 같게 유지한다. -->
<meta property="og:type" content="${pageType === 'post' ? 'article' : 'website'}">
<meta property="og:site_name" content="${escapeHtml(site.title)}">
<meta property="og:locale" content="${escapeHtml(site.locale)}">
<meta property="og:title" content="${escapeHtml(shareTitle)}">
<meta property="og:description" content="${escapeHtml(pageDescription)}">
<meta property="og:url" content="${escapeHtml(canonicalUrl)}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${escapeHtml(shareTitle)}">
<meta name="twitter:description" content="${escapeHtml(pageDescription)}">
${renderJsonLd(jsonLd)}
${renderAdsense()}
<link rel="stylesheet" href="${basePath}styles.css">
<script>
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  try {
    var theme = localStorage.getItem('theme');
    if (theme === 'dark' || theme === 'light') {
      root.dataset.theme = theme;
    }
  } catch (e) {}
  var dark = root.dataset.theme === 'dark' ||
    (!root.dataset.theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelector('meta[name="theme-color"]').content = dark ? '#1b1b19' : '#f4f2ec';
})();
</script>
</head>
<body class="page-${escapeHtml(pageType)}">
<a class="skip-link" href="#content">본문으로 건너뛰기</a>
${readingProgress}
<header class="site-header">
  <div class="site-header-inner">
    <a class="site-title" href="${basePath}index.html" aria-label="감도 홈">
      <span>감도</span><span class="hanja">感度</span>
    </a>
    <div class="site-tools">
      <nav class="site-nav" aria-label="주요 메뉴">
        <a href="${basePath}index.html#essays">Journal</a>
        <a href="${basePath}index.html#playground">Objects</a>
      </nav>
      <button id="theme-toggle" class="theme-toggle" type="button" aria-pressed="false">
        <span class="theme-toggle-mark" aria-hidden="true"></span>
        <span class="theme-toggle-label" aria-hidden="true">Theme</span>
        <span class="visually-hidden">테마 전환</span>
      </button>
    </div>
  </div>
</header>
<main id="content" class="page-main" tabindex="-1">
${bodyHtml}
</main>
<footer class="site-footer">
  <div class="site-footer-inner">
    <p class="footer-name">감도 <span>感度</span></p>
    <nav class="footer-nav" aria-label="사이트 정보">
      <a href="${basePath}about.html">소개</a>
      <a href="${basePath}contact.html">연락</a>
      <a href="${basePath}privacy.html">개인정보 처리방침</a>
    </nav>
    <p>&copy; ${year} 감도 感度 — 프레임워크 없이 HTML, CSS, JS로 직접 만들었습니다.</p>
    <p class="footer-note">Studies in Sensibility</p>
  </div>
</footer>
<script type="module" src="${basePath}theme.js"></script>
</body>
</html>
`;
}

function renderAppCards(apps) {
  if (!Array.isArray(apps) || apps.length === 0) return '';

  const cards = apps
    .map(
      (app, i) => `  <li class="app-card" data-reveal>
    <div class="app-preview-wrap">
      <span class="app-index" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      <iframe class="app-preview" src="./apps/${escapeHtml(app.path)}/index.html" title="${escapeHtml(app.title)} 미리보기" loading="lazy" sandbox="allow-scripts"></iframe>
    </div>
    <div class="app-copy">
      <h3><a href="./apps/${escapeHtml(app.path)}/index.html">${escapeHtml(app.title)}<span aria-hidden="true">↗</span></a></h3>
      <p>${escapeHtml(app.description)}</p>
    </div>
  </li>`
    )
    .join('\n');

  return `<section class="section" id="playground" aria-labelledby="playground-title">
<header class="section-header">
  <div>
    <p class="section-label">Playground</p>
    <h2 class="section-title" id="playground-title">미니 앱</h2>
  </div>
  <p class="section-count">${String(apps.length).padStart(2, '0')} Objects</p>
</header>
<ul class="app-list">
${cards}
</ul>
</section>`;
}

export function renderIndexPage(posts, apps = []) {
  const items = posts
    .map(
      (post, i) => `  <li class="post-list-item" data-reveal>
    <a href="./posts/${post.slug}.html">
      <span class="post-index">${String(i + 1).padStart(2, '0')}</span>
      <span class="post-entry">
        <span class="post-title">${escapeHtml(post.title)}</span>
        ${renderTopics(post.tags)}
      </span>
      <time datetime="${escapeHtml(post.isoDate)}">${formatDate(post.date)}</time>
      <span class="post-arrow" aria-hidden="true">↗</span>
    </a>
  </li>`
    )
    .join('\n');

  const bodyHtml = `<section class="hero" aria-labelledby="hero-title">
<div class="hero-meta">
  <p class="hero-eyebrow">Studies in Sensibility</p>
  <p class="hero-volume">Journal 01 / 2026</p>
</div>
<h1 id="hero-title">감각의 <span class="accent">해상도</span>를<br>높이는 연습.</h1>
<div class="hero-footer">
  <p class="hero-sub">교토의 정원에서 토스의 화면까지. 좋았던 것들이 왜 좋았는지, 그 이유를 언어로 만들어 보는 기록입니다.</p>
  <p class="hero-note" aria-hidden="true">Observation<br>Form<br>Function</p>
</div>
</section>
<section class="section" id="essays" aria-labelledby="essays-title">
<header class="section-header">
  <div>
    <p class="section-label">Essays</p>
    <h2 class="section-title" id="essays-title">글</h2>
  </div>
  <p class="section-count">${String(posts.length).padStart(2, '0')} Notes</p>
</header>
<ul class="post-list">
${items}
</ul>
</section>
${renderAppCards(apps)}`;

  return layout({
    title: `${site.title} — ${site.tagline}`,
    basePath: './',
    bodyHtml,
    canonicalPath: '',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: site.title,
        url: absoluteUrl(''),
        description: site.description,
        inLanguage: site.lang,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: site.title,
        url: absoluteUrl(''),
        description: site.description,
        inLanguage: site.lang,
        author: { '@type': 'Person', name: site.author },
        blogPost: posts.slice(0, 10).map((post) => ({
          '@type': 'BlogPosting',
          headline: post.title,
          datePublished: post.isoDate,
          url: absoluteUrl(`posts/${post.slug}.html`),
        })),
      },
    ],
  });
}

function renderSiblingLink(post, direction) {
  if (!post) return '';
  const isNewer = direction === 'newer';
  const directionLabel = isNewer ? '새 글' : '이전 글';
  const arrow = isNewer ? '←' : '→';

  return `<a class="post-sibling post-sibling-${direction}" href="./${escapeHtml(post.slug)}.html">
  <span class="post-sibling-label">${isNewer ? `${arrow} ${directionLabel}` : `${directionLabel} ${arrow}`}</span>
  <span class="post-sibling-title">${escapeHtml(post.title)}</span>
</a>`;
}

export function renderPostPage(post, { newerPost, olderPost } = {}) {
  const siblingLinks = [
    renderSiblingLink(newerPost, 'newer'),
    renderSiblingLink(olderPost, 'older'),
  ]
    .filter(Boolean)
    .join('\n    ');
  const bodyHtml = `<article class="post-page">
  <header class="post-header">
    <p class="post-kicker">Journal / Essay</p>
    <h1>${escapeHtml(post.title)}</h1>
    <div class="post-meta">
      <time datetime="${escapeHtml(post.isoDate)}">${formatDate(post.date)}</time>
      <span>${post.readingMinutes || 1}분 읽기</span>
      ${renderTags(post.tags)}
    </div>
  </header>
  <div class="post-content" data-reading-content>
${post.html}
  </div>
</article>
<nav class="post-navigation" aria-label="글 탐색">
  <a class="post-index-link" href="../index.html#essays"><span aria-hidden="true">←</span> 모든 글</a>
  <div class="post-sibling-links">
    ${siblingLinks}
  </div>
</nav>`;

  const canonicalPath = `posts/${post.slug}.html`;

  return layout({
    title: `${post.title} — ${site.title}`,
    basePath: '../',
    bodyHtml,
    pageType: 'post',
    description: post.summary || `${post.title}. ${site.title}의 기록입니다.`,
    canonicalPath,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.summary || `${post.title}. ${site.title}의 기록입니다.`,
        datePublished: post.isoDate,
        dateModified: post.isoDate,
        inLanguage: site.lang,
        author: { '@type': 'Person', name: site.author },
        publisher: { '@type': 'Person', name: site.author },
        mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(canonicalPath) },
        url: absoluteUrl(canonicalPath),
        ...(post.tags && post.tags.length ? { keywords: post.tags.join(', ') } : {}),
        ...(post.readingMinutes ? { timeRequired: `PT${post.readingMinutes}M` } : {}),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: site.title, item: absoluteUrl('') },
          { '@type': 'ListItem', position: 2, name: post.title, item: absoluteUrl(canonicalPath) },
        ],
      },
    ],
  });
}

/** 소개·연락 같은 단일 페이지. posts와 달리 목록에 들어가지 않는다. */
export function renderStaticPage(page) {
  const canonicalPath = `${page.slug}.html`;
  const bodyHtml = `<article class="post-page">
  <header class="post-header">
    <p class="post-kicker">Page</p>
    <h1>${escapeHtml(page.title)}</h1>
  </header>
  <div class="post-content">
${page.html}
  </div>
</article>
<nav class="post-navigation" aria-label="글 탐색">
  <a class="post-index-link" href="./index.html"><span aria-hidden="true">←</span> 처음으로</a>
</nav>`;

  return layout({
    title: `${page.title} — ${site.title}`,
    basePath: './',
    bodyHtml,
    pageType: 'page',
    description: page.description || site.description,
    canonicalPath,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: page.title,
        description: page.description || site.description,
        url: absoluteUrl(canonicalPath),
        inLanguage: site.lang,
        isPartOf: { '@type': 'WebSite', name: site.title, url: absoluteUrl('') },
      },
    ],
  });
}

/**
 * 개인정보 처리방침.
 *
 * 손으로 쓰지 않고 설정에서 만든다. 광고를 켜지 않았는데 광고 쿠키를
 * 설명하는 방침은 사실이 아니고, 반대도 마찬가지다. adsense.publisherId가
 * 실제 상태를 결정하므로 방침도 거기서 나오게 한다.
 */
export function renderPrivacyPage() {
  const adsEnabled = Boolean(adsense.publisherId);
  const updated = new Date().toISOString().slice(0, 10);

  const adsSection = adsEnabled
    ? `<h2>광고</h2>
<p>
  이 사이트는 Google AdSense로 광고를 게재합니다. Google을 비롯한 제3자 공급업체는
  쿠키를 사용해 이 사이트나 다른 사이트 방문 기록을 바탕으로 광고를 게재할 수 있습니다.
</p>
<p>
  광고 개인 최적화는
  <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google 광고 설정</a>에서 끌 수 있고,
  제3자 공급업체의 쿠키 사용은
  <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener">aboutads.info</a>에서 관리할 수 있습니다.
</p>
<p>
  유럽 등 일부 지역에서는 광고·쿠키에 대한 동의 관리가 필요합니다. 해당 지역
  방문자에게는 동의 메시지가 표시되어야 하며, 그 설정은 AdSense 콘솔에서 관리합니다.
</p>`
    : `<h2>광고</h2>
<p>
  현재 이 사이트에는 광고가 없습니다. 광고를 도입하면 이 문단을 광고 제공자,
  쿠키 사용 범위, 동의 관리 방법으로 바꾸어 다시 적습니다.
</p>`;

  const page = {
    slug: 'privacy',
    title: '개인정보 처리방침',
    description: '감도 感度가 어떤 정보를 다루고 다루지 않는지 적어 둔 문서입니다.',
    html: `<p>마지막 갱신: ${updated}</p>

<h2>수집하지 않는 것</h2>
<p>
  이 사이트는 회원 가입이 없고, 댓글이 없으며, 방문자에게 이름·이메일·전화번호를
  입력받는 양식이 없습니다. 그러므로 개인을 식별할 수 있는 정보를 직접 수집하지
  않습니다.
</p>

<h2>브라우저에 저장되는 것</h2>
<p>
  화면 테마(라이트·다크) 선택을 브라우저의 <code>localStorage</code>에 저장합니다.
  이 값은 방문자의 기기 안에만 있고 서버로 전송되지 않습니다. 미니 앱 중 일부는
  최고 점수나 작업 중인 내용을 같은 방식으로 저장합니다. 브라우저의 사이트
  데이터를 지우면 함께 사라집니다.
</p>

<h2>호스팅</h2>
<p>
  이 사이트는 GitHub Pages에서 제공됩니다. 웹 서버 특성상 접속 시각, IP 주소,
  브라우저 종류 같은 접속 기록이 GitHub에 의해 처리될 수 있습니다. 이는 사이트
  운영자가 수집·열람하는 정보가 아니며, 자세한 내용은
  <a href="https://docs.github.com/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener">GitHub 개인정보 처리방침</a>을 따릅니다.
</p>

<h2>외부 자원</h2>
<p>
  본문 글꼴을 jsDelivr CDN에서 받아옵니다. 이 과정에서 해당 CDN에 접속 요청이
  전달됩니다.
</p>

${adsSection}

<h2>문의</h2>
<p>
  이 방침에 대한 문의는 <a href="./contact.html">연락</a> 페이지의 방법으로 주세요.
</p>`,
  };

  return renderStaticPage(page);
}
