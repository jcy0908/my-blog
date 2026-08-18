const root = document.documentElement;
const toggleButton = document.getElementById('theme-toggle');
const themeColor = document.querySelector('meta[name="theme-color"]');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function listenToMediaQuery(query, callback) {
  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', callback);
  } else {
    query.addListener(callback);
  }
}

function getEffectiveTheme() {
  if (root.dataset.theme === 'dark' || root.dataset.theme === 'light') {
    return root.dataset.theme;
  }
  return systemTheme.matches ? 'dark' : 'light';
}

function updateThemeControls(theme) {
  if (toggleButton) {
    const isDark = theme === 'dark';
    toggleButton.setAttribute('aria-pressed', String(isDark));
    toggleButton.setAttribute('aria-label', `${isDark ? '라이트' : '다크'} 테마로 전환`);
    toggleButton.title = `${isDark ? '라이트' : '다크'} 테마로 전환`;
  }
  if (themeColor) themeColor.content = theme === 'dark' ? '#1b1b19' : '#f4f2ec';
}

updateThemeControls(getEffectiveTheme());

toggleButton?.addEventListener('click', () => {
  const next = getEffectiveTheme() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try {
    localStorage.setItem('theme', next);
  } catch (error) {
    /* localStorage unavailable */
  }
  updateThemeControls(next);
});

listenToMediaQuery(systemTheme, () => {
  if (!root.dataset.theme) updateThemeControls(getEffectiveTheme());
});

const header = document.querySelector('.site-header');
const readingProgress = document.querySelector('.reading-progress');
const readingProgressFill = document.querySelector('.reading-progress-fill');
const readingContent = document.querySelector('[data-reading-content]');
let frameRequested = false;
let metricsDirty = true;
let readingStart = 0;
let readingDistance = 1;
let lastProgress = -1;

function measureReadingRange() {
  if (!readingContent) return;
  const contentTop = readingContent.getBoundingClientRect().top + window.scrollY;
  readingStart = contentTop - window.innerHeight * 0.35;
  const readingEnd = contentTop + readingContent.offsetHeight - window.innerHeight * 0.65;
  readingDistance = Math.max(1, readingEnd - readingStart);
}

function syncScrollEffects() {
  if (metricsDirty) {
    measureReadingRange();
    metricsDirty = false;
  }

  header?.classList.toggle('is-overlapping', window.scrollY > 6);

  if (readingProgress && readingProgressFill && readingContent) {
    const ratio = Math.min(1, Math.max(0, (window.scrollY - readingStart) / readingDistance));
    readingProgressFill.style.transform = `scaleX(${ratio})`;
    const roundedProgress = Math.round(ratio * 100);
    if (roundedProgress !== lastProgress) {
      readingProgress.setAttribute('aria-valuenow', String(roundedProgress));
      lastProgress = roundedProgress;
    }
  }

  frameRequested = false;
}

function requestScrollSync() {
  if (frameRequested) return;
  frameRequested = true;
  requestAnimationFrame(syncScrollEffects);
}

function invalidateMetrics() {
  metricsDirty = true;
  requestScrollSync();
}

addEventListener('scroll', requestScrollSync, { passive: true });
addEventListener('resize', invalidateMetrics, { passive: true });
addEventListener('pageshow', invalidateMetrics);

const readingResizeObserver =
  readingContent && 'ResizeObserver' in window ? new ResizeObserver(invalidateMetrics) : null;
readingResizeObserver?.observe(readingContent);

document.fonts?.ready.then(invalidateMetrics);
syncScrollEffects();

function prepareRevealMotion() {
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

  const revealTargets = [...document.querySelectorAll('[data-reveal]')].filter(
    (element) => element.getBoundingClientRect().top > window.innerHeight * 0.9
  );
  if (revealTargets.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.remove('is-reveal-pending');
        entry.target.classList.add('is-reveal-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
  );

  for (const target of revealTargets) {
    target.classList.add('is-reveal-pending');
    observer.observe(target);
  }

  listenToMediaQuery(reducedMotion, () => {
    if (!reducedMotion.matches) return;
    observer.disconnect();
    for (const target of revealTargets) target.classList.remove('is-reveal-pending');
  });
}

prepareRevealMotion();
