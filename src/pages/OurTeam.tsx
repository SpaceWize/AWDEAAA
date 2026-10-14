import ScrollReveal from '../components/ScrollReveal';
import { Link } from '../lib/router';
import { content } from '../content';
import { eyebrow, primaryButton, sectionTitle } from '../lib/styles';

const { team: page } = content;
const team = page.members;

const OurTeam = () => (
  <>
    <section className="bg-[var(--color-mist)] px-6 pt-36 pb-20 md:px-12">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <p className={`mb-4 ${eyebrow}`}>{page.eyebrow}</p>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-[var(--color-body-strong)] md:text-6xl">
            {page.heading}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-[var(--color-body)]">
            {page.intro}
          </p>
        </ScrollReveal>
      </div>
    </section>

    <section className="px-6 py-20 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-24">
        {team.map((member, index) => (
          <article key={member.name}>
            <div
              className={`grid items-start gap-10 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] ${
                index % 2 === 1 ? 'md:grid-cols-[minmax(0,1fr)_minmax(0,320px)]' : ''
              }`}
            >
              <ScrollReveal
                direction={index % 2 === 1 ? 'right' : 'left'}
                className={index % 2 === 1 ? 'md:order-2' : ''}
              >
                <img
                  src={member.photo}
                  alt={member.photoAlt}
                  loading="lazy"
                  className="aspect-[4/5] w-full rounded-3xl object-cover shadow-lg"
                />
              </ScrollReveal>

              <ScrollReveal
                direction={index % 2 === 1 ? 'left' : 'right'}
                delay={0.15}
                className={index % 2 === 1 ? 'md:order-1' : ''}
              >
                <p className={`mb-3 ${eyebrow}`}>{member.role}</p>
                <h2 className={`mb-6 ${sectionTitle}`}>{member.name}</h2>
                <div className="flex flex-col gap-4">
                  {member.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 40)}
                      className="text-lg leading-relaxed text-[var(--color-body)]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </article>
        ))}
      </div>
    </section>

    <section className="bg-[var(--color-slab)] px-6 py-14 text-white md:px-12 md:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <ScrollReveal>
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
            {page.callToAction.heading}
          </h2>
          <p className="mb-10 text-lg leading-relaxed text-violet-100">
            {page.callToAction.paragraph}
          </p>
          <Link to="/donate" className={primaryButton}>
            {page.callToAction.button}
          </Link>
        </ScrollReveal>
      </div>
    </section>
  </>
);

export default OurTeam;
