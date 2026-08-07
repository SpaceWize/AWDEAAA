import ScrollReveal from '../components/ScrollReveal';
import { Link } from '../lib/router';
import { eyebrow, primaryButton, sectionTitle } from '../lib/styles';

const team = [
  {
    name: 'James Willetts',
    role: 'Founder',
    photo: 'https://awdea.org/james_biopic.jpeg',
    alt: 'James Willetts',
    paragraphs: [
      'Our founder, James Willetts, grew up in Edmonton, Alberta. He played competitive hockey until a knee injury ended that dream. He has always loved live music, entertainment, and professional sports, and once camped out for two nights to get tickets to the 40th NHL All-Star Game in Edmonton! James apprenticed as a chef and then, in 1996, switched gears to attend Cameron’s Professional Driving School to become a Class One Professional Truck Driver.',
      'After six years of driving, a 2003 accident changed his life’s direction, but that didn’t slow him down. Always seeking adventure, he found like-minded individuals through the BC Mobility Opportunity Society. He hiked with a BCMOS team, who specialize in accessible outdoor activities, up Mount Steele on the Sunshine Coast. Working with BCMOS, James thought that flying in an unpowered aircraft would be fun. He enjoyed it so much that he became a Coordinator with the Vancouver Soaring Association for six years, planning flights and encouraging people with disabilities to experience the thrill of gliding.',
      'In his free time, James loves attending concerts and sporting events (300 and counting!) Recognizing that ticket prices can be prohibitive, especially for those with disabilities on low incomes, James created AWDEA. Helping people with disabilities experience new sights and sounds has now become his passion and driving force.',
    ],
  },
  {
    name: 'Chris Jacinto',
    role: 'Director',
    photo: 'https://awdea.org/chris_biopic.jpeg',
    alt: 'Chris Jacinto',
    paragraphs: [
      'Chris was raised in the interior of British Columbia, where he developed a love for outdoor activities and competitive sports. Passionate about music and entertainment, he and a group of friends began hosting and producing numerous events and shows. He also started studying business at Selkirk College in Castlegar.',
      'In 1997, he was involved in a motor vehicle accident that left him a quadriplegic. After intensive rehab, he chose to settle in North Vancouver. Soon after, he attended Capilano University and earned his Bachelor of Business Administration. Following his studies, he became HR Manager at Northview Golf and Country Club in Langley, a position he held for seven years before resigning due to health concerns. Over the past 20 years, he has served in various roles on the Board of Directors for the North Shore Housing Co-op.',
      'Chris enjoys attending entertainment and sports events. He is dedicated to giving others the opportunity to attend these events and enhance their psychological, social, and emotional well-being.',
    ],
  },
  {
    name: 'Stephen Rogers',
    role: 'Founding Director',
    photo: 'https://awdea.org/steve.jpg',
    alt: 'Stephen Rogers',
    paragraphs: [
      'Stephen was born in Kitimat, BC, and had the opportunity to live in Quebec, Australia, Ontario, and British Columbia due to his father’s work. Although he injured his spinal cord in two different places during separate car accidents in 1983 and 2000, he feels very fortunate to still be able to walk. Stephen’s passion for food led him to pursue a culinary career, completing a three-year apprenticeship in 1990. He also has a deep love of music and played in a few bands during his younger years. In 2006, he earned certification as a life skills coach.',
      'In 2008, Stephen’s sister, who is also disabled, fell ill, and he stepped up to become her caregiver. Since then, he has worked with many individuals with disabilities.',
      'He heard about James’s idea for a non-profit organization at the start of 2023, and his personal encouragement had a big impact on James. Stephen knows firsthand the challenges that people with disabilities face when attending entertainment events, so when asked to join AWDEA as a founding director, he said “yes” and offered to help.',
    ],
  },
];

const OurTeam = () => (
  <>
    <section className="bg-[var(--color-mist)] px-6 pt-36 pb-20 md:px-12">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <p className={`mb-4 ${eyebrow}`}>About us</p>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-[var(--color-body-strong)] md:text-6xl">
            Our team
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-[var(--color-body)]">
            AWDEA was founded and is run by people with lived experience of
            disability — and a shared love of live entertainment.
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
                  alt={member.alt}
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

    <section className="bg-[var(--color-slab)] px-6 py-24 text-white md:px-12">
      <div className="mx-auto max-w-3xl text-center">
        <ScrollReveal>
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl">
            Want to help us grow?
          </h2>
          <p className="mb-10 text-lg leading-relaxed text-violet-100">
            Donate tickets or contribute financially so more disabled adults can
            get out to the events they love.
          </p>
          <Link to="/donate" className={primaryButton}>
            How to donate
          </Link>
        </ScrollReveal>
      </div>
    </section>
  </>
);

export default OurTeam;
