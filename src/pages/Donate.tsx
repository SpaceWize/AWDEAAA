import { motion } from 'framer-motion';
import AmbientBackdrop from '../components/AmbientBackdrop';
import ImagePlaceholder from '../components/ImagePlaceholder';
import ScrollReveal from '../components/ScrollReveal';
import StaggerContainer, { staggerChild } from '../components/StaggerContainer';
import { eyebrow, primaryButton, sectionTitle } from '../lib/styles';

const ways = [
  {
    title: 'Make a donation',
    body: "Every contribution, big or small, makes a difference. Whether it's providing a single ticket to a local concert or funding an entire day out for a group, your donation is a step towards inclusivity.",
  },
  {
    title: 'Spread the word',
    body: 'Help us grow our impact by sharing our mission with your friends, family, and on social media. Awareness is key to our growth and success.',
  },
];

const Donate = () => (
  <>
    <section className="relative overflow-hidden bg-[var(--color-mist)] px-6 pt-36 pb-20 md:px-12">
      <AmbientBackdrop />
      <div className="relative mx-auto grid max-w-6xl items-center gap-8 md:gap-14 md:grid-cols-2">
        <ScrollReveal direction="left">
          <p className={`mb-4 ${eyebrow}`}>Join us</p>
          <h1 className="mb-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-[var(--color-body-strong)] md:text-6xl">
            Promoting inclusivity and joy with your help
          </h1>
          <p className="text-lg leading-relaxed text-[var(--color-body)]">
            Your donation removes the barriers that keep disabled adults out of
            the events the rest of us take for granted.
          </p>
        </ScrollReveal>
        <ScrollReveal direction="right" delay={0.15}>
          <ImagePlaceholder
            label="Photo to come — AWDEA guests enjoying an event"
            className="h-80 border-[var(--color-brand)]/40/70 bg-white md:h-96"
          />
        </ScrollReveal>
      </div>
    </section>

    <section className="px-6 py-14 md:px-12 md:py-24">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <h2 className={`mb-8 ${sectionTitle}`}>Your donation matters</h2>
          <div className="flex flex-col gap-5 text-lg leading-relaxed text-[var(--color-body)]">
            <p>
              At AWDEA, we believe in a world where everyone, regardless of their
              abilities, has the opportunity to experience the joy and community
              spirit of public events and activities. Our initiative aims to
              provide free tickets to disabled individuals, allowing them to enjoy
              concerts, art exhibitions, sports games, and more, alongside their
              friends and families.
            </p>
            <p>
              Many individuals with disabilities face barriers that prevent them
              from participating in events that many of us take for granted. These
              can range from financial constraints to logistical challenges. Your
              donation helps us remove these barriers by covering the costs of
              tickets, ensuring everyone has an equal chance to enjoy these
              experiences.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-[var(--color-slab)] px-6 py-14 text-white md:px-12 md:py-24">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-14 max-w-2xl">
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            How you can help
          </h2>
        </ScrollReveal>
        <StaggerContainer className="grid gap-6 md:grid-cols-2">
          {ways.map((way) => (
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
          <h2 className={`mb-8 ${sectionTitle}`}>Donation methods</h2>
          <p className="mb-8 text-lg leading-relaxed text-[var(--color-body)]">
            We are currently accepting donations through Stripe. All proceeds will
            be donated to AWDEA and used for providing tickets to accessible
            events for adults with disabilities.
          </p>

          <a
            href="https://buy.stripe.com/cN215g7UG1ip7UA144"
            className={primaryButton}
            rel="noopener"
          >
            Donate through Stripe
          </a>

          <div className="mt-14 rounded-3xl border border-[var(--color-brand)]/15 bg-[var(--color-mist)] p-8">
            <h3 className="mb-4 text-xl font-bold text-[var(--color-body-strong)]">
              Donating tickets
            </h3>
            <p className="mb-6 leading-relaxed text-[var(--color-body)]">
              Have tickets you can’t use? We’d love to pass them on. Get in touch
              with James and he’ll take it from there.
            </p>
            <ul className="flex flex-col gap-2 text-lg font-semibold">
              <li>
                <a
                  href="mailto:james@awdea.org"
                  className="inline-flex min-h-11 items-center text-[var(--color-brand)] underline underline-offset-4 transition-colors duration-500 hover:text-[var(--color-brand-dark)]"
                >
                  james@awdea.org
                </a>
              </li>
              <li>
                <a
                  href="tel:6048375616"
                  className="inline-flex min-h-11 items-center text-[var(--color-brand)] underline underline-offset-4 transition-colors duration-500 hover:text-[var(--color-brand-dark)]"
                >
                  604-837-5616
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
