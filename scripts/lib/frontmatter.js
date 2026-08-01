const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function parseValue(raw) {
  const trimmed = raw.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1).trim();
    if (inner === '') return [];
    return inner.split(',').map((item) => parseValue(item.trim()));
  }

  return trimmed;
}

export function parseFrontmatter(raw) {
  const match = raw.match(FRONTMATTER_RE);

  if (!match) {
    return { data: {}, content: raw };
  }

  const [, block, content] = match;
  const data = {};

  for (const line of block.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    data[key] = parseValue(value);
  }

  return { data, content };
}
