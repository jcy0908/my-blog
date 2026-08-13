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

// ==========================================================================
// Fluid — 누르는 즉시 반응하고, 떠 있는 헤더는 경계선 대신 빛으로 구분한다
// (Apple, Designing Fluid Interfaces / Materials & depth)
// ==========================================================================

// 반응은 click이 아니라 pointerdown에서. 기다리면 죽은 것처럼 느껴진다.
document.querySelectorAll('.post-list-item a, .app-card, .post-nav a, .theme-toggle, .site-title')
  .forEach((el) => {
    el.addEventListener('pointerdown', () => el.classList.add('is-pressed'));
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((evt) =>
      el.addEventListener(evt, () => el.classList.remove('is-pressed'))
    );
  });

// 스크롤 엣지 — 1px 실선 대신, 내용이 유리 밑으로 들어갈 때만 경계가 생긴다
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
