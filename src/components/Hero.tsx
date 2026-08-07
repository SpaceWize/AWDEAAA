import { motion, useReducedMotion } from 'framer-motion';
import { Fragment } from 'react';
import AmbientBackdrop from './AmbientBackdrop';
import { Link } from '../lib/router';
import { smoothScrollToId } from '../lib/smoothScroll';
import { eyebrow, outlineButton, primaryButton } from '../lib/styles';

const words = ['Entertainment', 'without', 'exclusion.'];

const Hero = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center overflow-hidden bg-[var(--color-mist)] px-6 pt-28 pb-20 md:px-12"
    >
      <AmbientBackdrop />

      {/* Left-aligned rather than centred: the headline is the loudest thing on
          the page, and a hard left edge shared with the paragraph and buttons
          gives the eye one line to follow down instead of three centres. */}
      <div className="relative mx-auto w-full max-w-6xl">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`mb-6 ${eyebrow}`}
        >
          Adults With Disabilities Entertainment Access
        </motion.p>

        {/* Fluid size: "Entertainment" is one long unbreakable word, so a fixed
            48px overflows a 320px viewport (WCAG 1.4.10 reflow). */}
        <h1 className="mb-8 max-w-4xl text-[clamp(2rem,8vw,5rem)] font-extrabold leading-[1.05] tracking-tight text-[var(--color-body-strong)]">
          {words.map((word, i) => (
            // The space after each word is real text, not CSS margin —
            // otherwise the accessible name collapses to one run-on word.
            <Fragment key={word}>
              <motion.span
                initial={{ opacity: 0, y: 48 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.9,
                  delay: 0.2 + i * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="inline-block"
              >
                {word}
              </motion.span>
              {i < words.length - 1 ? ' ' : ''}
            </Fragment>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mb-10 max-w-2xl text-lg leading-relaxed text-[var(--color-body)] md:text-xl"
        >
          We connect disabled adults across British Columbia with free and discounted
          tickets to concerts, festivals, and sporting events.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75 }}
          className="flex flex-wrap gap-4"
        >
          <Link to="/donate" className={primaryButton}>
            Support our mission
          </Link>
          <a
            href="#how-it-works"
            onClick={(event) => {
              event.preventDefault();
              smoothScrollToId('how-it-works');
            }}
            className={outlineButton}
          >
            See how it works
          </a>
        </motion.div>
      </div>

      {!prefersReducedMotion && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-body)]">
            Scroll to explore
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
