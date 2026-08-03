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
  <a class="site-title" href="${basePath}index.html">My Blog</a>
  <div class="site-header-actions">
    <a class="site-nav-link" href="${basePath}2048/index.html">2048 게임</a>
    <button id="theme-toggle" class="theme-toggle" type="button" aria-pressed="false">
      <svg class="theme-toggle-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
      <span class="visually-hidden">테마 전환</span>
    </button>
  </div>
</header>
<main>
${bodyHtml}
</main>
<footer class="site-footer">
  <p>&copy; ${year} My Blog</p>
</footer>
<script type="module" src="${basePath}theme.js"></script>
</body>
</html>
`;
}

export function renderIndexPage(posts) {
  const items = posts
    .map(
      (post) => `  <li class="post-list-item">
    <a href="./posts/${post.slug}.html">${escapeHtml(post.title)}</a>
    <time datetime="${escapeHtml(post.isoDate)}">${formatDate(post.date)}</time>
  </li>`
    )
    .join('\n');

  const bodyHtml = `<h1>Posts</h1>
<ul class="post-list">
${items}
</ul>`;

  return layout({ title: 'My Blog', basePath: './', bodyHtml });
}

export function renderPostPage(post) {
  const bodyHtml = `<article>
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

  return layout({ title: post.title, basePath: '../', bodyHtml });
}
