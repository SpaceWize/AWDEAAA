import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../lib/useReducedMotion';

interface LoopingVideoProps {
  /** Path under the public dir, e.g. "media/clip.mp4" — no leading slash. */
  src: string;
  /** Still frame shown before the clip is ready, and instead of it when motion
   *  is reduced. Same path convention as `src`. */
  poster: string;
  /**
   * What the footage shows. This becomes the accessible name, so write it the
   * way you'd write alt text: describe the scene, not the fact it's a video.
   */
  label: string;
  /** Aspect-ratio utility matching the clip's native ratio, to avoid cropping. */
  aspect?: string;
  className?: string;
}

/**
 * A short clip that plays on a loop.
 *
 * The back-and-forth is baked into the file: it holds the footage forward and
 * then in reverse, so the browser only ever plays forward and `loop` does the
 * rest. Reversing in JavaScript is the obvious alternative and a bad one —
 * no browser supports a negative playbackRate, so it means stepping
 * currentTime backwards by hand every frame, which stutters on exactly the
 * low-powered phones this needs to work on. The encode also drops the
 * duplicate frame at the turn and at the loop point, so neither seam hitches.
 *
 * For accessibility:
 *  - A pause control is always present. WCAG 2.2.2 requires a way to stop
 *    anything that moves automatically for more than five seconds, and this
 *    moves forever.
 *  - Under `prefers-reduced-motion` the clip does not autoplay and is not even
 *    fetched; the poster carries the section, and the control becomes Play for
 *    anyone who does want to watch it.
 *  - The wrapper carries role="img" with descriptive alt text and the <video>
 *    is hidden from the accessibility tree, so a screen reader announces one
 *    image rather than a media player it cannot operate.
 *  - Playback pauses when the clip scrolls out of view, which saves battery
 *    and stops phones decoding video nobody is looking at.
 */
const LoopingVideo = ({
  src,
  poster,
  label,
  aspect = 'aspect-video',
  className = '',
}: LoopingVideoProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();

  // What the reader has asked for, which is not the same as whether the video
  // happens to be playing — it can be paused for being off-screen while the
  // reader still wants it running.
  const [wantsPlay, setWantsPlay] = useState(!reduceMotion);

  // If the setting changes mid-session, follow it.
  useEffect(() => setWantsPlay(!reduceMotion), [reduceMotion]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return;

    // Nothing is downloaded until the reader wants it moving. Someone on
    // reduced motion who never presses Play pays no bytes for the clip.
    if (!wantsPlay) {
      video.pause();
      return;
    }

    if (!video.src) {
      video.src = `${import.meta.env.BASE_URL}${src}`;
    }

    let onScreen = true;
    const sync = () => {
      if (onScreen && wantsPlay) {
        // Autoplay can still be refused (a battery-saver mode, say). Leaving
        // the poster up is the correct outcome, so swallow the rejection.
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0].isIntersecting;
        sync();
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(wrap);
    sync();

    return () => {
      io.disconnect();
      video.pause();
    };
  }, [src, wantsPlay]);

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden rounded-3xl bg-[var(--color-mist)] ${aspect} ${className}`}
    >
      <div role="img" aria-label={label} className="h-full w-full">
        <video
          ref={videoRef}
          poster={`${import.meta.env.BASE_URL}${poster}`}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Always visible, never hover-revealed. This is the control that stops
          the motion, so someone who needs it has to be able to see that it is
          there without first discovering it by accident. The label alone says
          which action it performs — pairing a changing label with aria-pressed
          makes a screen reader announce "Play the clip, pressed", which
          contradicts itself. */}
      <button
        type="button"
        onClick={() => setWantsPlay((v) => !v)}
        className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition-colors duration-200 hover:bg-black/80"
      >
        <span className="sr-only">
          {wantsPlay ? `Pause the clip: ${label}` : `Play the clip: ${label}`}
        </span>
        {wantsPlay ? (
          <svg aria-hidden="true" width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
            <rect x="0" y="0" width="5" height="16" rx="1" />
            <rect x="9" y="0" width="5" height="16" rx="1" />
          </svg>
        ) : (
          <svg aria-hidden="true" width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
            <path d="M1 1.2v13.6a1 1 0 0 0 1.5.87l11-6.8a1 1 0 0 0 0-1.74l-11-6.8A1 1 0 0 0 1 1.2Z" />
          </svg>
        )}
      </button>

    </div>
  );
};

export default LoopingVideo;
