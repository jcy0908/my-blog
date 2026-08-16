const root = document.documentElement;
const toggleButton = document.getElementById('theme-toggle');
const themeColor = document.querySelector('meta[name="theme-color"]');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

function getEffectiveTheme() {
  if (root.dataset.theme === 'dark' || root.dataset.theme === 'light') {
    return root.dataset.theme;
  }
  return systemTheme.matches ? 'dark' : 'light';
}

function updateButton(theme) {
  if (!toggleButton) return;
  const isDark = theme === 'dark';
  toggleButton.setAttribute('aria-pressed', String(isDark));
  toggleButton.setAttribute('aria-label', `${isDark ? '라이트' : '다크'} 테마로 전환`);
  toggleButton.title = `${isDark ? '라이트' : '다크'} 테마로 전환`;
  if (themeColor) themeColor.content = isDark ? '#1b1b19' : '#f4f2ec';
}

updateButton(getEffectiveTheme());

toggleButton?.addEventListener('click', () => {
  const next = getEffectiveTheme() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try {
    localStorage.setItem('theme', next);
  } catch (e) {
    /* localStorage unavailable */
  }
  updateButton(next);
});

systemTheme.addEventListener('change', () => {
  if (!root.dataset.theme) updateButton(getEffectiveTheme());
});

// 콘텐츠가 고정 헤더 아래로 들어갈 때만 얇은 경계를 표시한다.
const header = document.querySelector('.site-header');
if (header) {
  let ticking = false;
  const sync = () => {
    header.classList.toggle('is-overlapping', window.scrollY > 4);
    ticking = false;
  };
  addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(sync);
    },
    { passive: true }
  );
  sync();
}
