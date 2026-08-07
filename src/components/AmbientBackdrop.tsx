import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../lib/useReducedMotion';

/** Drift speed with no scrolling, in fractions of the container per second. */
const BASE_SPEED = 0.11;
/** How much the "wind" of scrolling multiplies that. */
const WIND = 2.6;
/** Ceiling on the wind, so a hard flick doesn't turn it into a streak. */
const MAX_WIND = 26;
/** How quickly the wind picks up, and how slowly it dies away. */
const GUST = 0.2;
const LULL = 0.03;

/**
 * Each bubble has a heading it keeps. Wind makes it travel that heading faster
 * rather than sending it somewhere new, which is what separates "carried" from
 * "shaken". Headings are mostly upward with some sideways lean, and the sway
 * amplitude keeps the path from being a straight line.
 */
const BUBBLES = [
  { color: 'var(--color-brand-bright)', size: 0.5, x: 0.18, y: 0.72, vx: 0.16, vy: -0.5, sway: 0.05, swayHz: 0.29, alpha: 0.95 },
  { color: 'var(--color-brand)', size: 0.36, x: 0.74, y: 1.16, vx: -0.2, vy: -0.62, sway: 0.07, swayHz: 0.4, alpha: 0.85 },
  { color: 'var(--color-brand-bright)', size: 0.58, x: 0.46, y: 1.5, vx: 0.1, vy: -0.4, sway: 0.04, swayHz: 0.22, alpha: 0.8 },
  { color: 'var(--color-brand-dark)', size: 0.3, x: 0.9, y: 0.44, vx: -0.13, vy: -0.72, sway: 0.08, swayHz: 0.52, alpha: 0.9 },
  { color: 'var(--color-brand)', size: 0.44, x: 0.06, y: 0.2, vx: 0.22, vy: -0.34, sway: 0.06, swayHz: 0.35, alpha: 0.78 },
  { color: 'var(--color-brand-bright)', size: 0.26, x: 0.6, y: 0.9, vx: -0.08, vy: -0.85, sway: 0.09, swayHz: 0.61, alpha: 0.88 },
];

interface AmbientBackdropProps {
  /** Scales every bubble, for sections that want the effect quieter. */
  intensity?: number;
  className?: string;
}

/**
 * Bubbles drifting behind a section: they float on their own when the page is
 * still, and travel the same heading faster while the reader scrolls, easing
 * back down when they stop.
 *
 * Scoped to one section rather than the whole page — it sits `absolute` inside
 * a `relative` parent, so it paints over that section's own background but
 * under its content.
 *
 * Under `prefers-reduced-motion` the loop never starts. The bubbles still
 * paint, so the section keeps its colour, but nothing moves: persistent
 * ambient motion is a vestibular trigger, and this carries no information, so
 * holding it still costs nothing.
 *
 * Only `transform` is written per frame, and the blur is set once, so the work
 * stays on the compositor — the scroll-scrubbed video competes for the main
 * thread already.
 */
const AmbientBackdrop = ({ intensity = 1, className = '' }: AmbientBackdropProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const host = hostRef.current;
    if (!host) return;

    const nodes = Array.from(host.children) as HTMLElement[];
    const state = BUBBLES.map((b) => ({ x: b.x, y: b.y }));

    let frame = 0;
    let wind = 0;
    let clock = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let w = host.clientWidth;
    let h = host.clientHeight;

    const measure = () => {
      w = host.clientWidth;
      h = host.clientHeight;
    };

    const paint = () => {
      for (let i = 0; i < nodes.length; i++) {
        const b = BUBBLES[i];
        const s = state[i];
        const sway = Math.sin(clock * b.swayHz + i) * b.sway;
        const px = (s.x + sway) * w - (b.size * w) / 2;
        const py = s.y * h - (b.size * w) / 2;
        nodes[i].style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
      }
    };

    const tick = (now: number) => {
      // Clamped so a backgrounded tab doesn't teleport everything on return.
      const dt = Math.min(now - lastT, 50) / 1000;
      lastT = now;

      const y = window.scrollY;
      const delta = Math.abs(y - lastY);
      lastY = y;

      const target = Math.min(delta / 6, MAX_WIND);
      wind += (target - wind) * (target > wind ? GUST : LULL);

      const step = dt * BASE_SPEED * (1 + wind * WIND);
      clock += dt * (1 + wind * 0.25);

      for (let i = 0; i < state.length; i++) {
        const b = BUBBLES[i];
        const s = state[i];
        s.x += b.vx * step;
        s.y += b.vy * step;

        // Wrap rather than reverse: a bubble that turns around reads as a
        // pendulum. Re-entering from the far edge keeps the heading honest.
        const m = b.size;
        if (s.y < -m) s.y = 1 + m;
        if (s.y > 1 + m) s.y = -m;
        if (s.x < -m) s.x = 1 + m;
        if (s.x > 1 + m) s.x = -m;
      }

      paint();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame) return;
      lastT = performance.now();
      lastY = window.scrollY;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const onVisibility = () => (document.hidden ? stop() : start());
    const onResize = () => {
      measure();
      paint();
    };

    measure();
    paint();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', onResize, { passive: true });
    start();

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
      stop();
    };
  }, [reduceMotion]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`bubble-layer pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {BUBBLES.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: `${b.size * 100}%`,
            aspectRatio: '1',
            borderRadius: '50%',
            // Mixed toward paper first, so a bubble is *lighter* than the
            // section rather than darker. A saturated blob drags background
            // luminance down under dark text and destroys contrast — measured
            // as low as 2:1. Pale reads as light behind a screen, and keeps
            // the page light enough for the text sitting on top of it.
            // Holds full strength out to 52% before falling off, rather than
            // fading from the centre — without an edge there is nothing for the
            // eye to track and the movement goes unread. Peak colour is
            // unchanged, so the contrast result above still holds: the worst
            // case already assumed a bubble centre sitting behind text.
            background: `radial-gradient(circle at 50% 50%, color-mix(in srgb, color-mix(in srgb, var(--color-paper) 52%, ${
              b.color
            }) ${Math.round(b.alpha * intensity * 100)}%, transparent) 0%, color-mix(in srgb, color-mix(in srgb, var(--color-paper) 52%, ${
              b.color
            }) ${Math.round(b.alpha * intensity * 100)}%, transparent) 52%, transparent 78%)`,
            filter: 'blur(22px)',
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
};

export default AmbientBackdrop;
