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

export function layout({ title, basePath, bodyHtml }) {
  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#f4f2ec">
<meta name="description" content="좋았던 것들이 왜 좋았는지, 감각과 구조를 언어로 기록하는 감도 感度입니다.">
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="${basePath}styles.css">
<script>
(function () {
  try {
    var theme = localStorage.getItem('theme');
    if (theme === 'dark' || theme === 'light') {
      document.documentElement.dataset.theme = theme;
    }
  } catch (e) {}
})();
</script>
</head>
<body>
<a class="skip-link" href="#content">본문으로 건너뛰기</a>
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
<main id="content" tabindex="-1">
${bodyHtml}
</main>
<footer class="site-footer">
  <div class="site-footer-inner">
    <p class="footer-name">감도 <span>感度</span></p>
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
      (app, i) => `  <li class="app-card">
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
      (post, i) => `  <li class="post-list-item">
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

  const bodyHtml = `<section class="hero">
<div class="hero-meta">
  <p class="hero-eyebrow">Studies in Sensibility</p>
  <p class="hero-volume">Journal 01 / 2026</p>
</div>
<h1>감각의 <span class="accent">해상도</span>를<br>높이는 연습.</h1>
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

  return layout({ title: '감도 感度 — 감각의 해상도를 높이는 연습', basePath: './', bodyHtml });
}

export function renderPostPage(post) {
  const bodyHtml = `<article class="post-page">
  <header class="post-header">
    <p class="post-kicker">Journal / Essay</p>
    <h1>${escapeHtml(post.title)}</h1>
    <div class="post-meta">
      <time datetime="${escapeHtml(post.isoDate)}">${formatDate(post.date)}</time>
      ${renderTags(post.tags)}
    </div>
  </header>
  <div class="post-content">
${post.html}
  </div>
</article>
<p class="post-nav"><a href="../index.html"><span aria-hidden="true">←</span> 목록으로</a></p>`;

  return layout({ title: `${post.title} — 감도 感度`, basePath: '../', bodyHtml });
}
