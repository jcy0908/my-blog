import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseFrontmatter } from './lib/frontmatter.js';
import { markdownToHtml } from './lib/markdown.js';
import { renderIndexPage, renderPostPage } from './lib/templates.js';

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

  if (fs.existsSync(publicDir)) {
    fs.cpSync(publicDir, distDir, { recursive: true });
  }

  console.log(
    `빌드 완료: 포스트 ${posts.length}개, 앱 ${apps.length}개 → ${path.relative(rootDir, distDir)}/`
  );
}

build();
