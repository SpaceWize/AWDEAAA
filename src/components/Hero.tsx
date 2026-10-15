import { motion } from 'framer-motion';
import { Fragment } from 'react';
import AmbientBackdrop from './AmbientBackdrop';
import { content } from '../content';
import { Link } from '../lib/router';
import { smoothScrollToId } from '../lib/smoothScroll';
import { outlineButton, primaryButton } from '../lib/styles';
import { useReducedMotion } from '../lib/useReducedMotion';

const words = content.hero.headlineWords;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

// The highlight's timeline: wipe in, hold, wipe out to the other side.
const WIPE_IN = 0.7;
const HOLD = 15;
const WIPE_OUT = 0.7;
const TOTAL = WIPE_IN + HOLD + WIPE_OUT;
const T_HOLD_START = WIPE_IN / TOTAL;
const T_HOLD_END = (WIPE_IN + HOLD) / TOTAL;


const Hero = () => {
  const reduce = useReducedMotion();
  // Under reduced motion every element starts in its final place, so nothing
  // moves, appears, or waits on a timer. The content is identical either way.
  const enter = (delay: number, distance: number, duration: number) =>
    reduce
      ? { initial: false as const, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : {
          initial: { opacity: 0, y: distance },
          animate: { opacity: 1, y: 0 },
          transition: { duration, delay, ease: EASE_OUT },
        };

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-[var(--color-mist)] px-6 pt-24 pb-14 md:pt-28 md:pb-20 md:px-12"
    >
      <AmbientBackdrop />

      {/* Left-aligned rather than centred: the headline is the loudest thing on
          the page, and a hard left edge shared with the paragraph and buttons
          gives the eye one line to follow down instead of three centres. */}
      <div className="relative mx-auto w-full max-w-6xl">
        <motion.p {...enter(0.1, 16, 0.6)} className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-deep)] md:text-base">
          {content.hero.eyebrow}
        </motion.p>

        {/* Fluid size: "Entertainment" is one long unbreakable word, so a fixed
            48px overflows a 320px viewport (WCAG 1.4.10 reflow). */}
        <h1 className="mb-8 max-w-4xl text-[clamp(1.75rem,7vw,4.25rem)] font-extrabold leading-[1.05] tracking-tight text-[var(--color-body-strong)]">
          {words.map((word, i) => {
            const last = i === words.length - 1;
            return (
              // The space after each word is real text, not CSS margin —
              // otherwise the accessible name collapses to one run-on word.
              <Fragment key={word}>
                <motion.span {...enter(0.2 + i * 0.12, 48, 0.9)} className="relative inline-block">
                  {last ? (
                    // "exclusion." gets a purple block that wipes in from the
                    // left, holds for 15 seconds, then wipes out to the right.
                    // The text turns white while the block is behind it and
                    // back to ink as it leaves, so it never disappears.
                    // The text is real, so a screen reader still reads
                    // "exclusion." — the block is decoration.
                    <span
                      className="exclusion-word relative isolate inline-block px-2"
                      style={reduce ? undefined : { animationDuration: `${TOTAL}s` }}
                    >
                      <motion.span
                        aria-hidden="true"
                        initial={reduce ? false : { clipPath: 'inset(0 100% 0 0)' }}
                        animate={
                          reduce
                            ? { clipPath: 'inset(0 0% 0 0)' }
                            : {
                                clipPath: [
                                  'inset(0 100% 0 0)',
                                  'inset(0 0% 0 0)',
                                  'inset(0 0% 0 0)',
                                  'inset(0 0% 0 100%)',
                                ],
                              }
                        }
                        transition={
                          reduce
                            ? { duration: 0 }
                            : { duration: TOTAL, times: [0, T_HOLD_START, T_HOLD_END, 1], ease: 'easeInOut' }
                        }
                        className="absolute inset-0 -z-10 rounded-[0.18em] bg-[var(--color-brand)]"
                      />
                      {word}
                    </span>
                  ) : (
                    word
                  )}
                </motion.span>
                {i < words.length - 1 ? ' ' : ''}
              </Fragment>
            );
          })}
        </h1>

        <motion.p
          {...enter(0.6, 24, 0.7)}
          className="mb-10 max-w-2xl text-lg leading-relaxed text-[var(--color-body)] md:text-xl"
        >
          {content.hero.paragraph}
        </motion.p>

        <motion.div
          {...enter(0.75, -28, 0.8)}
          // Full-width stacked buttons on a phone: two pills of different
          // widths left-aligned read as ragged, and a thumb-width target is
          // easier to hit than a 190px one.
          className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
        >
          <Link to="/donate" className={`${primaryButton} w-full sm:w-auto`}>
            {content.hero.primaryButton}
          </Link>
          <a
            href="#how-it-works"
            onClick={(event) => {
              event.preventDefault();
              smoothScrollToId('how-it-works');
            }}
            className={`${outlineButton} w-full sm:w-auto`}
          >
            {content.hero.secondaryButton}
          </a>
        </motion.div>
      </div>

      {!reduce && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-body)]">
            {content.hero.scrollHint}
          </span>
          <span className="grid h-10 w-6 place-items-start rounded-full border-2 border-[var(--color-body)]/50 pt-2">
            <motion.span
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="mx-auto h-1.5 w-1.5 rounded-full bg-[var(--color-brand)]"
            />
          </span>
        </motion.div>
      )}
    </section>
  );
};

export default Hero;
