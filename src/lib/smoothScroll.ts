const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** easeInOutCubic — slow start, slow finish, so long jumps stay readable. */
const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const smoothScrollTo = (targetY: number, duration = 1500) => {
  const startY = window.scrollY;
  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  const endY = Math.max(0, Math.min(targetY, maxY));
  const distance = endY - startY;

  if (prefersReducedMotion() || Math.abs(distance) < 2) {
    window.scrollTo(0, endY);
    return;
  }

  const startTime = performance.now();

  const step = (now: number) => {
    const t = Math.min(1, (now - startTime) / duration);
    window.scrollTo(0, startY + distance * ease(t));
    if (t < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

/** Scrolls an element into view, leaving room for the fixed header. */
export const smoothScrollToId = (id: string, duration = 1500) => {
  const el = document.getElementById(id);
  if (!el) return;
  const headerOffset = 88;
  smoothScrollTo(
    el.getBoundingClientRect().top + window.scrollY - headerOffset,
    duration,
  );
};
