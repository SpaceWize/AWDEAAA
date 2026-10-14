import { motion } from 'framer-motion';
import ScrollReveal from '../components/ScrollReveal';
import StaggerContainer, { staggerChild } from '../components/StaggerContainer';
import { Link } from '../lib/router';
import { content } from '../content';
import { eyebrow, primaryButton, sectionTitle } from '../lib/styles';

const { donors: page } = content;
const donors = page.list;

const Donors = () => (
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

    <section className="px-6 py-14 md:px-12 md:py-24">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal className="mb-10">
          <h2 className={sectionTitle}>{page.listHeading}</h2>
        </ScrollReveal>

        {/* Card list on small screens, table on wide screens. */}
        <StaggerContainer className="flex flex-col gap-4 md:hidden">
          {donors.map((donor) => (
            <motion.div
              key={`${donor.name}-${donor.date}`}
              variants={staggerChild}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="rounded-2xl border border-[var(--color-brand)]/15 bg-white p-6 shadow-sm"
            >
              <p className="mb-1 text-lg font-bold text-[var(--color-body-strong)]">{donor.name}</p>
              <p className="text-sm text-[var(--color-body)]">{donor.date}</p>
              <p className="mt-3 text-xl font-extrabold text-[var(--color-brand)]">
                {donor.amount}
              </p>
            </motion.div>
          ))}
        </StaggerContainer>

        <ScrollReveal className="hidden md:block">
          <div className="overflow-x-auto rounded-2xl border border-[var(--color-brand)]/15">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                {page.tableCaption}
              </caption>
              <thead className="bg-[var(--color-mist)]">
                <tr>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-body)]">
                    {page.columnName}
                  </th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-body)]">
                    {page.columnDate}
                  </th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-body)]">
                    {page.columnAmount}
                  </th>
                </tr>
              </thead>
              <tbody>
                {donors.map((donor) => (
                  <tr
                    key={`${donor.name}-${donor.date}`}
                    className="border-t border-[var(--color-brand)]/15 transition-colors duration-500 hover:bg-[var(--color-mist)]"
                  >
                    <th scope="row" className="px-6 py-5 font-semibold text-[var(--color-body-strong)]">
                      {donor.name}
                    </th>
                    <td className="px-6 py-5 text-[var(--color-body)]">{donor.date}</td>
                    <td className="px-6 py-5 font-bold text-[var(--color-brand)]">
                      {donor.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
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

export default Donors;
