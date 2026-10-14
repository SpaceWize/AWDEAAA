import { motion } from 'framer-motion';
import EventsCalendar from '../components/EventsCalendar';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import LoopingVideo from '../components/LoopingVideo';
import ScrollReveal from '../components/ScrollReveal';
import StaggerContainer, { staggerChild } from '../components/StaggerContainer';
import { content } from '../content';
import { Link } from '../lib/router';
import { invertedButton, outlineButton, primaryButton, sectionTitle } from '../lib/styles';

const { about, offer, getInvolved, venues } = content.home;

const Home = () => (
  <>
    <Hero />

    {/* Flat paper on purpose: the drifting bubbles are reserved for the hero,
        How it works, and the donate pages, so the founder's story reads
        against something calm. Video first, so that on a phone the media
        arrives before its caption in both this section and Accessible venues
        — the visual order and the reading order stay the same. */}
    <section id="about" className="bg-[var(--color-paper)] px-6 py-14 md:px-12 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-8 md:gap-14 md:grid-cols-2">
        <ScrollReveal direction="left">
          <LoopingVideo
            src="media/about-conversation.mp4"
            poster="media/about-conversation-poster.jpg"
            label={about.videoLabel}
            aspect="aspect-video"
          />
        </ScrollReveal>

        <ScrollReveal direction="right" delay={0.15}>
          <h2 className={`mb-6 ${sectionTitle}`}>{about.heading}</h2>
          <p className="mb-8 text-lg leading-relaxed text-[var(--color-body)]">
            {about.paragraph}
          </p>
          <Link to="/bios" className={outlineButton}>
            {about.button}
          </Link>
        </ScrollReveal>
      </div>
    </section>

    {/* The one dark moment on the page. A deep plum slab gives the eye somewhere
        to land between two light sections, and lets the offer cards read as
        lit objects rather than more boxes on more paper. */}
    <section className="on-slab bg-[var(--color-slab)] px-6 py-14 text-white md:px-12 md:py-24">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-14 max-w-2xl">
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
            {offer.heading}
          </h2>
          <p className="text-lg leading-relaxed text-violet-100">
            {offer.introBefore}
            <span className="font-semibold text-white underline decoration-[var(--color-brand-bright)] decoration-2 underline-offset-4">
              {offer.introHighlight}
            </span>
            {offer.introAfter}
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid gap-6 md:grid-cols-3">
          {offer.cards.map((card) => (
            <motion.article
              key={card.title}
              variants={staggerChild}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -6 }}
              className="rounded-2xl border border-white/15 bg-white/[0.07] p-8 transition-colors duration-300 hover:border-[var(--color-brand-bright)]/70 hover:bg-white/[0.12]"
            >
              <h3 className="mb-3 text-xl font-bold">{card.title}</h3>
              <p className="leading-relaxed text-violet-100">{card.body}</p>
            </motion.article>
          ))}
        </StaggerContainer>

        <ScrollReveal className="mt-12">
          <Link to="/donate" className={invertedButton}>
            {offer.button}
          </Link>
        </ScrollReveal>
      </div>
    </section>

    <HowItWorks />

    <EventsCalendar />

    <section className="bg-[var(--color-paper)] px-6 py-14 md:px-12 md:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <ScrollReveal>
          <h2 className={`mb-6 ${sectionTitle}`}>{getInvolved.heading}</h2>
          <p className="mb-10 text-lg leading-relaxed text-[var(--color-body)]">
            {getInvolved.paragraph}
          </p>
          <Link to="/donate" className={primaryButton}>
            {getInvolved.button}
          </Link>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-[var(--color-mist)] px-6 py-14 md:px-12 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-8 md:gap-14 md:grid-cols-2">
        <ScrollReveal direction="left">
          <LoopingVideo
            src="media/ramp-wheelchair.mp4"
            poster="media/ramp-wheelchair-poster.jpg"
            label={venues.videoLabel}
            aspect="aspect-square"
            className="mx-auto w-full max-w-md"
          />
        </ScrollReveal>
        <ScrollReveal direction="right" delay={0.15}>
          <h2 className={`mb-6 ${sectionTitle}`}>{venues.heading}</h2>
          <p className="text-lg leading-relaxed text-[var(--color-body)]">
            {venues.paragraph}
          </p>
        </ScrollReveal>
      </div>
    </section>
  </>
);

export default Home;
