import { motion } from 'framer-motion';
import ScrollReveal from '../components/ScrollReveal';
import StaggerContainer, { staggerChild } from '../components/StaggerContainer';
import { Link } from '../lib/router';
import { eyebrow, primaryButton, sectionTitle } from '../lib/styles';

const donors = [
  { name: 'Nick', date: 'Wed Sep 24 2025', amount: '$50' },
  { name: 'Nick', date: 'Wed May 14 2025', amount: '$25' },
  { name: 'GOODWIN VENTURES CORP', date: 'Sat Mar 15 2025', amount: '$500' },
  { name: 'Keon Kirby', date: 'Wed Jun 12 2024', amount: '$100' },
  { name: 'Anonymous donation', date: 'Wed May 29 2024', amount: '$1000' },
];

const Donors = () => (
  <>
    <section className="bg-[var(--color-mist)] px-6 pt-36 pb-20 md:px-12">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <p className={`mb-4 ${eyebrow}`}>Our donors</p>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-[var(--color-body-strong)] md:text-6xl">
            Thank you!
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-[var(--color-body)]">
            Thank you to all our donors for your generous contributions. Each
            donation helps us make a difference in our community. Your support is
            vital to our success and is deeply appreciated by everyone impacted by
            your generosity.
          </p>
        </ScrollReveal>
      </div>
    </section>

    <section className="px-6 py-24 md:px-12">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal className="mb-10">
          <h2 className={sectionTitle}>Our donors</h2>
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
                AWDEA donors, with donation date and amount
              </caption>
              <thead className="bg-[var(--color-mist)]">
                <tr>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-body)]">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-body)]">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-body)]">
                    Amount / Item
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

    <section className="bg-[var(--color-slab)] px-6 py-24 text-white md:px-12">
      <div className="mx-auto max-w-3xl text-center">
        <ScrollReveal>
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
            Add your name
          </h2>
          <p className="mb-10 text-lg leading-relaxed text-violet-100">
            Donations of any size go directly towards tickets for disabled adults
            across the Lower Mainland.
          </p>
          <Link to="/donate" className={primaryButton}>
            How to donate
          </Link>
        </ScrollReveal>
      </div>
    </section>
  </>
);

export default Donors;
