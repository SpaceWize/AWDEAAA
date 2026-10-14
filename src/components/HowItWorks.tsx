import { motion } from 'framer-motion';
import AmbientBackdrop from './AmbientBackdrop';
import ScrollReveal from './ScrollReveal';
import StaggerContainer, { staggerChild } from './StaggerContainer';
import { content } from '../content';
import { fill } from '../lib/fill';
import { eyebrow } from '../lib/styles';

const { steps } = content.howItWorks;

/**
 * A vertical timeline of cards.
 *
 * The steps happen over weeks, and a top-to-bottom rail reads as time passing
 * in a way four boxes side by side do not. Vertical also means one column at
 * every width — no reflow from four across to two to one, and no horizontal
 * scrolling on a phone.
 *
 * Each step is still a card, so it keeps the tactile hover of a grid without
 * the grid's mobile problems.
 */
const HowItWorks = () => (
  <section
    id="how-it-works"
    className="relative overflow-hidden bg-[var(--color-mist)] px-6 py-14 md:px-12 md:py-24"
  >
    <AmbientBackdrop />

    <div className="relative mx-auto max-w-4xl">
      <ScrollReveal className="mb-16 text-center">
        <p className={`mb-4 ${eyebrow}`}>{content.howItWorks.eyebrow}</p>
        <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-[var(--color-body-strong)] md:text-5xl">
          {content.howItWorks.heading}
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-[var(--color-body)]">
          {content.howItWorks.intro}
        </p>
      </ScrollReveal>

      <StaggerContainer className="relative">
        {/* The rail sits behind the numerals and stops short of the last one so
            it doesn't trail past the final step into empty space. */}
        <span
          aria-hidden="true"
          className="absolute left-6 top-6 bottom-24 hidden w-0.5 bg-[var(--color-brand)]/25 sm:block"
        />

        <ol className="space-y-6">
          {steps.map((step, idx) => (
            <motion.li
              key={step.num}
              variants={staggerChild}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative sm:pl-20"
            >
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-[var(--color-brand)]/15 bg-[var(--color-paper)] p-6 shadow-sm transition-shadow duration-300 hover:shadow-xl md:p-8"
              >
                {/* Lives inside the card so it is in normal flow on a phone,
                    where there is no room for a rail beside it. From sm up it
                    pins to the rail instead — the card's nearest positioned
                    ancestor is the li, so it lands beside the card, not in it. */}
                <span
                  aria-hidden="true"
                  className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-[var(--color-brand)] text-base font-extrabold tracking-tight text-white shadow-md shadow-violet-900/25 sm:absolute sm:left-0 sm:top-4 sm:mb-0 sm:h-12 sm:w-12 sm:text-lg"
                >
                  {step.num}
                </span>

                <h3 className="mb-2 text-xl font-bold text-[var(--color-body-strong)]">
                  {/* The numeral is decorative; screen readers get the step
                      order from here instead, so it is never read as "zero
                      one" or skipped entirely. */}
                  <span className="sr-only">{fill(content.howItWorks.stepAnnouncement, { number: idx + 1, total: steps.length })}</span>
                  {step.title}
                </h3>
                <p className="text-base leading-relaxed text-[var(--color-body)]">
                  {step.description}
                </p>
                {step.note && (
                  <p className="mt-3 text-base text-[var(--color-body)] md:text-sm">{step.note}</p>
                )}
              </motion.div>
            </motion.li>
          ))}
        </ol>
      </StaggerContainer>
    </div>
  </section>
);

export default HowItWorks;
