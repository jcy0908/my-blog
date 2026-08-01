import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseFrontmatter } from './lib/frontmatter.js';
import { markdownToHtml } from './lib/markdown.js';
import { renderIndexPage, renderPostPage } from './lib/templates.js';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const postsDir = path.join(rootDir, 'posts');
const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist');
const distPostsDir = path.join(distDir, 'posts');

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
      html: markdownToHtml(content),
    };
  });
}

function build() {
  fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(distPostsDir, { recursive: true });

  const posts = readPosts().sort((a, b) => b.dateObj - a.dateObj);

  for (const post of posts) {
    fs.writeFileSync(path.join(distPostsDir, `${post.slug}.html`), renderPostPage(post));
  }

  fs.writeFileSync(path.join(distDir, 'index.html'), renderIndexPage(posts));

  if (fs.existsSync(publicDir)) {
    fs.cpSync(publicDir, distDir, { recursive: true });
  }

  console.log(`빌드 완료: 포스트 ${posts.length}개 → ${path.relative(rootDir, distDir)}/`);
}

build();
