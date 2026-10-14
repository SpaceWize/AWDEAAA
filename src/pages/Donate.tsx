import { motion } from 'framer-motion';
import AmbientBackdrop from '../components/AmbientBackdrop';
import ImagePlaceholder from '../components/ImagePlaceholder';
import ScrollReveal from '../components/ScrollReveal';
import StaggerContainer, { staggerChild } from '../components/StaggerContainer';
import { content } from '../content';
import { eyebrow, primaryButton, sectionTitle } from '../lib/styles';

const { matters, help, methods } = content.donate;

const Donate = () => (
  <>
    <section className="relative overflow-hidden bg-[var(--color-mist)] px-6 pt-36 pb-20 md:px-12">
      <AmbientBackdrop />
      <div className="relative mx-auto grid max-w-6xl items-center gap-8 md:gap-14 md:grid-cols-2">
        <ScrollReveal direction="left">
          <p className={`mb-4 ${eyebrow}`}>{content.donate.eyebrow}</p>
          <h1 className="mb-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-[var(--color-body-strong)] md:text-6xl">
            {content.donate.heading}
          </h1>
          <p className="text-lg leading-relaxed text-[var(--color-body)]">
            {content.donate.intro}
          </p>
        </ScrollReveal>
        <ScrollReveal direction="right" delay={0.15}>
          <ImagePlaceholder
            label={content.donate.imagePlaceholder}
            className="h-80 border-[var(--color-brand)]/40/70 bg-white md:h-96"
          />
        </ScrollReveal>
      </div>
    </section>

    <section className="px-6 py-14 md:px-12 md:py-24">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <h2 className={`mb-8 ${sectionTitle}`}>{matters.heading}</h2>
          <div className="flex flex-col gap-5 text-lg leading-relaxed text-[var(--color-body)]">
            {matters.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-[var(--color-slab)] px-6 py-14 text-white md:px-12 md:py-24">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-14 max-w-2xl">
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            {help.heading}
          </h2>
        </ScrollReveal>
        <StaggerContainer className="grid gap-6 md:grid-cols-2">
          {help.cards.map((way) => (
            <motion.article
              key={way.title}
              variants={staggerChild}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -6 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-8 transition-colors duration-500 hover:border-[var(--color-accent)]/60"
            >
              <h3 className="mb-3 text-xl font-bold">{way.title}</h3>
              <p className="leading-relaxed text-violet-100">{way.body}</p>
            </motion.article>
          ))}
        </StaggerContainer>
      </div>
    </section>

    <section className="relative overflow-hidden px-6 py-14 md:px-12 md:py-24">
      <AmbientBackdrop />
      <div className="relative mx-auto max-w-3xl">
        <ScrollReveal>
          <h2 className={`mb-8 ${sectionTitle}`}>{methods.heading}</h2>
          <p className="mb-8 text-lg leading-relaxed text-[var(--color-body)]">
            {methods.paragraph}
          </p>

          <a
            href={methods.stripeLink}
            className={primaryButton}
            rel="noopener"
          >
            {methods.stripeButton}
          </a>

          <div className="mt-14 rounded-3xl border border-[var(--color-brand)]/15 bg-[var(--color-mist)] p-8">
            <h3 className="mb-4 text-xl font-bold text-[var(--color-body-strong)]">
              {methods.ticketsHeading}
            </h3>
            <p className="mb-6 leading-relaxed text-[var(--color-body)]">
              {methods.ticketsParagraph}
            </p>
            <ul className="flex flex-col gap-2 text-lg font-semibold">
              <li>
                <a
                  href={`mailto:${content.contact.email}`}
                  className="inline-flex min-h-11 items-center text-[var(--color-brand)] underline underline-offset-4 transition-colors duration-500 hover:text-[var(--color-brand-dark)]"
                >
                  {content.contact.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${content.contact.phone.replace(/\D/g, '')}`}
                  className="inline-flex min-h-11 items-center text-[var(--color-brand)] underline underline-offset-4 transition-colors duration-500 hover:text-[var(--color-brand-dark)]"
                >
                  {content.contact.phone}
                </a>
              </li>
            </ul>
          </div>
        </ScrollReveal>
      </div>
    </section>
  </>
);

export default Donate;
