import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseFrontmatter } from './lib/frontmatter.js';
import { markdownToHtml } from './lib/markdown.js';
import {
  renderIndexPage,
  renderPostPage,
  renderStaticPage,
  renderPrivacyPage,
} from './lib/templates.js';
import { site, adsense, absoluteUrl } from './site.config.js';

/** pages/*.md — 소개, 연락 같은 단일 페이지. 글 목록에는 들어가지 않는다. */
function readPages() {
  if (!fs.existsSync(pagesDir)) return [];
  return fs
    .readdirSync(pagesDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(pagesDir, file), 'utf8');
      const { data, content } = parseFrontmatter(raw);
      const slug = file.replace(/\.md$/, '');
      return {
        slug,
        title: data.title || slug,
        description: data.description || '',
        html: markdownToHtml(content),
      };
    });
}

/** 크롤러에게 열어 두고 사이트맵 위치를 알린다. */
function renderRobotsTxt() {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${absoluteUrl('sitemap.xml')}`,
    '',
  ].join('\n');
}

function renderSitemap(entries) {
  const urls = entries
    .map(({ loc, lastmod }) => {
      const mod = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
      return `  <url>\n    <loc>${loc}</loc>${mod}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function readApps() {
  if (!fs.existsSync(appsManifestPath)) return [];
  return JSON.parse(fs.readFileSync(appsManifestPath, 'utf8'));
}

function copyAppFiles(app) {
  const srcDir = path.join(appsDir, app.path);
  const destDir = path.join(distAppsDir, app.path);
  fs.mkdirSync(destDir, { recursive: true });

  for (const file of fs.readdirSync(srcDir)) {
    if (file.endsWith('.md') || file.endsWith('.json')) continue;
    fs.cpSync(path.join(srcDir, file), path.join(destDir, file), { recursive: true });
  }
}

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const postsDir = path.join(rootDir, 'posts');
const publicDir = path.join(rootDir, 'public');
const appsDir = path.join(rootDir, 'apps');
const appsManifestPath = path.join(appsDir, 'apps.json');
const pagesDir = path.join(rootDir, 'pages');
const distDir = path.join(rootDir, 'dist');
const distPostsDir = path.join(distDir, 'posts');
const distAppsDir = path.join(distDir, 'apps');

function readPosts() {
  if (!fs.existsSync(postsDir)) return [];

  const files = fs.readdirSync(postsDir).filter((file) => file.endsWith('.md'));

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const { data, content } = parseFrontmatter(raw);
    const slug = file.replace(/\.md$/, '');
    const date = data.date || '';
    const dateObj = new Date(date);

    return {
      slug,
      title: data.title || slug,
      date,
      isoDate: Number.isNaN(dateObj.getTime()) ? '' : dateObj.toISOString().slice(0, 10),
      dateObj,
      tags: Array.isArray(data.tags) ? data.tags : [],
      readingMinutes: estimateReadingMinutes(content),
      html: markdownToHtml(content),
    };
  });
}

function estimateReadingMinutes(markdown) {
  const prose = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~-]/g, ' ');
  const koreanCharacters = (prose.match(/[가-힣]/g) || []).length;
  const otherWords = (prose.replace(/[가-힣]/g, ' ').match(/[\p{L}\p{N}]+/gu) || []).length;

  return Math.max(1, Math.ceil(koreanCharacters / 500 + otherWords / 220));
}

function build() {
  fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(distPostsDir, { recursive: true });

  const posts = readPosts().sort((a, b) => b.dateObj - a.dateObj);
  const apps = readApps();

  for (const [index, post] of posts.entries()) {
    fs.writeFileSync(
      path.join(distPostsDir, `${post.slug}.html`),
      renderPostPage(post, {
        newerPost: posts[index - 1],
        olderPost: posts[index + 1],
      })
    );
  }

  for (const app of apps) {
    copyAppFiles(app);
  }

  fs.writeFileSync(path.join(distDir, 'index.html'), renderIndexPage(posts, apps));

  // 소개·연락 등 단일 페이지와, 설정에서 생성하는 개인정보 처리방침.
  // 셋 다 AdSense가 확인하는 '사이트 소개, 연락 방법, 개인정보 처리방침'에
  // 해당하지만, 그 전에 사람이 읽을 이유가 있어야 하는 페이지들이다.
  const pages = readPages();
  for (const page of pages) {
    fs.writeFileSync(path.join(distDir, `${page.slug}.html`), renderStaticPage(page));
  }
  fs.writeFileSync(path.join(distDir, 'privacy.html'), renderPrivacyPage());

  // 크롤러용 파일
  fs.writeFileSync(path.join(distDir, 'robots.txt'), renderRobotsTxt());

  const sitemapEntries = [
    { loc: absoluteUrl(''), lastmod: posts[0]?.isoDate },
    ...posts.map((post) => ({
      loc: absoluteUrl(`posts/${post.slug}.html`),
      lastmod: post.isoDate,
    })),
    ...pages.map((page) => ({ loc: absoluteUrl(`${page.slug}.html`) })),
    { loc: absoluteUrl('privacy.html') },
    ...apps.map((app) => ({ loc: absoluteUrl(`apps/${app.path}/`) })),
  ];
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), renderSitemap(sitemapEntries));

  // ads.txt는 게시자 ID가 있을 때만 만든다. 빈 파일은 소유권 확인을
  // 방해하기만 한다.
  if (adsense.publisherId) {
    const id = adsense.publisherId.replace(/^ca-/, '');
    fs.writeFileSync(
      path.join(distDir, 'ads.txt'),
      `google.com, ${id}, DIRECT, f08c47fec0942fa0\n`
    );
  }

  if (fs.existsSync(publicDir)) {
    fs.cpSync(publicDir, distDir, { recursive: true });
  }

  console.log(
    `빌드 완료: 포스트 ${posts.length}개, 페이지 ${pages.length + 1}개, 앱 ${apps.length}개 → ${path.relative(rootDir, distDir)}/`
  );
  console.log(
    `  sitemap ${sitemapEntries.length}개 · robots.txt · ads.txt ${adsense.publisherId ? '생성' : '없음(게시자 ID 미설정)'}`
  );
}

build();
