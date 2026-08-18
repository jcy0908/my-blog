function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, '&quot;');
}

function escapeQuotes(str) {
  return str.replace(/"/g, '&quot;');
}

const CODE_MARK = String.fromCharCode(2);

function inlineToHtml(text) {
  let out = escapeHtml(text);
  const codeSpans = [];

  out = out.replace(/`([^`]+?)`/g, (_, code) => {
    const token = CODE_MARK + 'CODE' + codeSpans.length + CODE_MARK;
    codeSpans.push('<code>' + code + '</code>');
    return token;
  });

  out = out.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_, alt, url, title) => {
      const titleAttr = title ? ' title="' + escapeQuotes(title) + '"' : '';
      return (
        '<img src="' +
        escapeQuotes(url) +
        '" alt="' +
        escapeQuotes(alt) +
        '" loading="lazy" decoding="async"' +
        titleAttr +
        '>'
      );
    }
  );

  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
    (_, label, url, title) => {
      const titleAttr = title ? ' title="' + escapeQuotes(title) + '"' : '';
      return '<a href="' + escapeQuotes(url) + '"' + titleAttr + '>' + label + '</a>';
    }
  );

  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  out = out.replace(/_([^_]+)_/g, '<em>$1</em>');

  const restoreRe = new RegExp(CODE_MARK + 'CODE(\\d+)' + CODE_MARK, 'g');
  out = out.replace(restoreRe, (_, idx) => codeSpans[Number(idx)]);

  return out;
}

const FENCE_RE = /^```(\S*)\s*$/;
const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const HR_RE = /^(-{3,}|\*{3,}|_{3,})\s*$/;
const BLOCKQUOTE_RE = /^>\s?/;
const UL_RE = /^[-*+]\s+/;
const OL_RE = /^\d+\.\s+/;

function isBlockStart(line) {
  return (
    FENCE_RE.test(line) ||
    HEADING_RE.test(line) ||
    HR_RE.test(line) ||
    BLOCKQUOTE_RE.test(line) ||
    UL_RE.test(line) ||
    OL_RE.test(line)
  );
}

function renderBlocks(lines) {
  const html = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    const fenceMatch = line.match(FENCE_RE);
    if (fenceMatch) {
      const lang = fenceMatch[1];
      const codeLines = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      const langClass = lang ? ' class="language-' + escapeAttr(lang) + '"' : '';
      html.push('<pre><code' + langClass + '>' + escapeHtml(codeLines.join('\n')) + '</code></pre>');
      continue;
    }

    const headingMatch = line.match(HEADING_RE);
    if (headingMatch) {
      const level = headingMatch[1].length;
      html.push('<h' + level + '>' + inlineToHtml(headingMatch[2].trim()) + '</h' + level + '>');
      i++;
      continue;
    }

    if (HR_RE.test(line)) {
      html.push('<hr>');
      i++;
      continue;
    }

    if (BLOCKQUOTE_RE.test(line)) {
      const quoteLines = [];
      while (i < lines.length && BLOCKQUOTE_RE.test(lines[i])) {
        quoteLines.push(lines[i].replace(BLOCKQUOTE_RE, ''));
        i++;
      }
      html.push('<blockquote>' + renderBlocks(quoteLines).join('\n') + '</blockquote>');
      continue;
    }

    if (UL_RE.test(line)) {
      const items = [];
      while (i < lines.length && UL_RE.test(lines[i])) {
        items.push(lines[i].replace(UL_RE, ''));
        i++;
      }
      html.push('<ul>' + items.map((item) => '<li>' + inlineToHtml(item) + '</li>').join('') + '</ul>');
      continue;
    }

    if (OL_RE.test(line)) {
      const items = [];
      while (i < lines.length && OL_RE.test(lines[i])) {
        items.push(lines[i].replace(OL_RE, ''));
        i++;
      }
      html.push('<ol>' + items.map((item) => '<li>' + inlineToHtml(item) + '</li>').join('') + '</ol>');
      continue;
    }

    const paraLines = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      paraLines.push(lines[i]);
      i++;
    }
    html.push('<p>' + inlineToHtml(paraLines.join(' ')) + '</p>');
  }

  return html;
}

export function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  return renderBlocks(lines).join('\n');
}
