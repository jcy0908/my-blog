function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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

export function layout({ title, basePath, bodyHtml }) {
  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
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
<header class="site-header">
  <a class="site-title" href="${basePath}index.html">감도 <span class="hanja">感度</span></a>
  <button id="theme-toggle" class="theme-toggle" type="button" aria-pressed="false">
    <svg class="theme-toggle-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
    <span class="visually-hidden">테마 전환</span>
  </button>
</header>
<main>
${bodyHtml}
</main>
<footer class="site-footer">
  <p>&copy; ${year} 감도 感度 — 프레임워크 없이 HTML, CSS, JS로 직접 만들었습니다.</p>
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
      (app) => `  <li class="app-card">
    <iframe class="app-preview" src="./apps/${app.path}/index.html" title="${escapeHtml(app.title)} 미리보기" loading="lazy" sandbox="allow-scripts"></iframe>
    <h3><a href="./apps/${app.path}/index.html">${escapeHtml(app.title)}</a></h3>
    <p>${escapeHtml(app.description)}</p>
  </li>`
    )
    .join('\n');

  return `<section class="section">
<p class="section-label">Playground</p>
<h2 class="section-title">미니 앱</h2>
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
      <span class="post-title">${escapeHtml(post.title)}</span>
      <time datetime="${escapeHtml(post.isoDate)}">${formatDate(post.date)}</time>
    </a>
  </li>`
    )
    .join('\n');

  const bodyHtml = `<section class="hero">
<p class="hero-eyebrow">Studies in Sensibility</p>
<h1>감각의 <span class="accent">해상도</span>를<br>높이는 연습.</h1>
<p class="hero-sub">교토의 정원에서 토스의 화면까지. 좋았던 것들이 왜 좋았는지, 그 이유를 언어로 만들어 보는 기록입니다.</p>
</section>
<section class="section">
<p class="section-label">Essays</p>
<h2 class="section-title">글</h2>
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
    <h1>${escapeHtml(post.title)}</h1>
    <p class="post-meta">
      <time datetime="${escapeHtml(post.isoDate)}">${formatDate(post.date)}</time>
      ${renderTags(post.tags)}
    </p>
  </header>
  <div class="post-content">
${post.html}
  </div>
</article>
<p class="post-nav"><a href="../index.html">← 목록으로</a></p>`;

  return layout({ title: `${post.title} — 감도 感度`, basePath: '../', bodyHtml });
}
