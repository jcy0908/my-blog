const root = document.documentElement;
const toggleButton = document.getElementById('theme-toggle');

function getEffectiveTheme() {
  if (root.dataset.theme === 'dark' || root.dataset.theme === 'light') {
    return root.dataset.theme;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function updateButton(theme) {
  if (!toggleButton) return;
  toggleButton.setAttribute('aria-pressed', String(theme === 'dark'));
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
