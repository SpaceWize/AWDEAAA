import { motion } from 'framer-motion';
import AmbientBackdrop from './AmbientBackdrop';
import ScrollReveal from './ScrollReveal';
import StaggerContainer, { staggerChild } from './StaggerContainer';
import { eyebrow } from '../lib/styles';

const steps = [
  {
    num: '01',
    title: 'Sign Up',
    description: 'Create your free AWDEA account.',
    note: 'Eligibility is restricted to disabled adults aged 19+.',
  },
  {
    num: '02',
    title: 'Register for an Event',
    description: "Browse what's available on the Raffle Events page and enter.",
  },
  {
    num: '03',
    title: 'Wait for the Raffle',
    description: 'Draws happen two weeks before each event date.',
  },
  {
    num: '04',
    title: 'Receive Your Tickets',
    description:
      'Winners get an email with their tickets roughly two weeks before the event.',
  },
];

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
    className="relative overflow-hidden bg-[var(--color-mist)] px-6 py-24 md:px-12"
  >
    <AmbientBackdrop />

    <div className="relative mx-auto max-w-4xl">
      <ScrollReveal className="mb-16 text-center">
        <p className={`mb-4 ${eyebrow}`}>Coming soon</p>
        <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-[var(--color-body-strong)] md:text-5xl">
          How it works
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-[var(--color-body)]">
          Four steps between you and a night out.
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
              <span
                aria-hidden="true"
                className="absolute left-0 top-4 hidden h-12 w-12 place-items-center rounded-full bg-[var(--color-brand)] text-lg font-extrabold tracking-tight text-white shadow-md shadow-violet-900/25 sm:grid"
              >
                {step.num}
              </span>

              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-[var(--color-brand)]/15 bg-[var(--color-paper)] p-6 shadow-sm transition-shadow duration-300 hover:shadow-xl md:p-8"
              >
                <h3 className="mb-2 text-xl font-bold text-[var(--color-body-strong)]">
                  {/* The numeral is decorative; screen readers get the step
                      order from here instead, so it is never read as "zero
                      one" or skipped entirely. */}
                  <span className="sr-only">{`Step ${idx + 1} of ${steps.length}: `}</span>
                  {step.title}
                </h3>
                <p className="text-base leading-relaxed text-[var(--color-body)]">
                  {step.description}
                </p>
                {step.note && (
                  <p className="mt-3 text-sm text-[var(--color-body)]">{step.note}</p>
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
