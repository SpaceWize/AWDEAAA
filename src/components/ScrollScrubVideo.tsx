import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface ScrollScrubVideoProps {
  /** Path under the public dir, e.g. "media/clip.mp4" — no leading slash. */
  src: string;
  /** Still frame shown before the clip is ready, and instead of it when
   *  motion is reduced. Same path convention as `src`. */
  poster: string;
  /**
   * What the footage shows. This becomes the accessible name, so write it the
   * way you'd write alt text: describe the scene, not the fact it's a video.
   */
  label: string;
  /** Aspect-ratio utility matching the clip's native ratio, to avoid cropping. */
  aspect?: string;
  className?: string;
  /**
   * Where the scrub finishes. "exit" spends the element's whole travel through
   * the viewport, which is the slowest scrub. "center" finishes when the
   * element reaches the middle of the screen — needed for a section near the
   * bottom of the page, which runs out of scroll before it can exit.
   */
  endAt?: 'exit' | 'center';
}

/** How hard the clip chases the scroll position each frame. Lower is smoother
 *  and laggier; 1 would track the wheel exactly, jitter and all. */
const EASE = 0.16;
/** Stop the loop once we are within this fraction of the target. */
const SETTLED = 0.0008;
/** Don't seek for a move smaller than half a frame — the browser would just
 *  decode the same picture again. */
const MIN_SEEK = 1 / 48;
/** Scrub anyway after this long rather than leave the clip frozen on a flaky
 *  connection. */
const BUFFER_TIMEOUT = 8000;

/**
 * A short clip whose playhead is driven by scroll position rather than by
 * playback — the footage advances as the section travels through the viewport
 * and stops when the reader stops.
 *
 * Smoothness comes from three things, and dropping any one brings back the
 * stutter:
 *
 *  1. The scroll listener only sets a flag. All reading and seeking happens in
 *     one requestAnimationFrame loop, at most once per displayed frame, and
 *     layout is measured on resize rather than every frame.
 *  2. The playhead eases toward the scroll position instead of snapping to it.
 *     Raw scroll input is jittery; following it exactly reproduces the jitter.
 *  3. Scrubbing waits for the clip to be fully buffered. Seeking into a
 *     partly-downloaded file turns every seek into a range request, which is
 *     precisely the stutter this is meant to avoid.
 *
 * For accessibility:
 *  - Under `prefers-reduced-motion` the clip is never even fetched. The poster
 *    carries the section, so those readers get a photograph and none of the
 *    bytes.
 *  - The wrapper carries role="img" with descriptive alt text and the <video>
 *    is hidden from the accessibility tree, so a screen reader announces one
 *    image rather than a media player it cannot operate.
 *  - Nothing auto-plays. Motion only happens while the reader is scrolling,
 *    so WCAG 2.2.2 does not apply.
 */
const ScrollScrubVideo = ({
  src,
  poster,
  label,
  aspect = 'aspect-video',
  className = '',
  endAt = 'exit',
}: ScrollScrubVideoProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return;

    // Reduced motion: leave the poster in place and never fetch the clip.
    if (reduceMotion) return;

    let duration = 0;
    let target = 0; // 0..1, where the scroll position says we should be
    let eased = 0; // 0..1, where we actually are
    let travelStart = 0; // scrollY at which the scrub begins
    let travelLength = 1;
    let running = false;
    let onScreen = false;
    let ready = false;
    let frame = 0;
    let timeout = 0;

    // Layout reads force a reflow and only change on resize, so they happen
    // here and never inside the loop.
    const measure = () => {
      const top = wrap.getBoundingClientRect().top + window.scrollY;
      const height = wrap.offsetHeight;
      // The scrub starts as the element's top clears the bottom of the screen.
      travelStart = top - window.innerHeight;
      // "exit" ends when its bottom leaves the top of the screen; "center"
      // ends when the element reaches the middle, which is exactly half as far.
      travelLength = (window.innerHeight + height) * (endAt === 'center' ? 0.5 : 1);
      if (travelLength <= 0) travelLength = 1;
    };

    const readScroll = () => {
      const p = (window.scrollY - travelStart) / travelLength;
      return p < 0 ? 0 : p > 1 ? 1 : p;
    };

    const tick = () => {
      frame = 0;
      target = readScroll();
      eased += (target - eased) * EASE;

      const settled = Math.abs(target - eased) < SETTLED;
      if (settled) eased = target;

      if (ready && duration) {
        let t = eased * duration;
        // Never seek to the very end: some browsers clamp to duration and fire
        // `ended`, which drops the last frame.
        if (t > duration - 0.001) t = duration - 0.001;

        // Assigning currentTime while a seek is in flight is not a queue — the
        // browser abandons the old target for the new one, which is what we
        // want: always the newest scroll position, never a backlog of stale
        // ones. Deliberately not gated on `seeked`; waiting for each seek to
        // retire makes the clip crawl behind a fast flick.
        if (Math.abs(video.currentTime - t) > MIN_SEEK) video.currentTime = t;
      }

      // Sleep once we have caught up. A scroll event wakes us again.
      if (settled) {
        running = false;
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (running || !onScreen) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const enable = () => {
      if (ready) return;
      ready = true;
      wake();
    };

    const checkBuffered = () => {
      if (ready || !duration) return;
      const buffered = video.buffered;
      if (!buffered.length) return;
      if (buffered.end(buffered.length - 1) < duration - 0.25) return;
      enable();
    };

    const onMeta = () => {
      duration = video.duration || 0;
      measure();
      eased = target = readScroll();
      // Position the playhead now, before the buffer gate opens, so the first
      // frame the browser paints is the one the scroll position calls for
      // rather than frame zero.
      if (duration) video.currentTime = Math.min(eased * duration, duration - 0.001);
      checkBuffered();
    };

    // A muted video with no autoplay should never play, but a stray play()
    // from anywhere would fight the scrubber.
    const onPlay = () => video.pause();

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        measure();
        wake();
      }, 150);
    };

    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('progress', checkBuffered);
    video.addEventListener('canplaythrough', checkBuffered);
    video.addEventListener('play', onPlay);
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    // Only run the loop while the section is actually on screen. The margin
    // starts the download early enough that the clip is usually buffered by
    // the time it comes into view.
    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0].isIntersecting;
        if (onScreen) wake();
      },
      { rootMargin: '900px 0px' },
    );
    io.observe(wrap);

    // The source is set from JS rather than in the markup so that readers who
    // never get the scrub are not made to download several megabytes.
    video.src = `${import.meta.env.BASE_URL}${src}`;
    timeout = window.setTimeout(enable, BUFFER_TIMEOUT);
    measure();

    // A cached clip can be decoded before this effect runs, in which case the
    // events above never fire — read the current state directly instead.
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) onMeta();

    return () => {
      io.disconnect();
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('progress', checkBuffered);
      video.removeEventListener('canplaythrough', checkBuffered);
      video.removeEventListener('play', onPlay);
      window.removeEventListener('scroll', wake);
      window.removeEventListener('resize', onResize);
      window.clearTimeout(resizeTimer);
      window.clearTimeout(timeout);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [src, endAt, reduceMotion]);

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label={label}
      className={`relative overflow-hidden rounded-3xl bg-[var(--color-mist)] ${aspect} ${className}`}
    >
      <video
        ref={videoRef}
        poster={`${import.meta.env.BASE_URL}${poster}`}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
        className="h-full w-full object-cover"
      />
    </div>
  );
};

export default ScrollScrubVideo;
