import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import BackToTop from './components/BackToTop';
import Footer from './components/Footer';
import Navigation from './components/Navigation';
import { content } from './content';
import { fill } from './lib/fill';
import { Link, useRouter } from './lib/router';
import Donate from './pages/Donate';
import Donors from './pages/Donors';
import Account from './pages/Account';
import Gallery from './pages/Gallery';
import Home from './pages/Home';
import OurTeam from './pages/OurTeam';

const { pages } = content;

const routes: Record<string, { title: string; label: string; element: ReactNode }> = {
  '/': { title: pages.home.title, label: pages.home.name, element: <Home /> },
  '/bios': { title: pages.team.title, label: pages.team.name, element: <OurTeam /> },
  '/gallery': { title: pages.gallery.title, label: pages.gallery.name, element: <Gallery /> },
  '/account': { title: pages.account.title, label: pages.account.name, element: <Account /> },
  '/donate': { title: pages.donate.title, label: pages.donate.name, element: <Donate /> },
  '/donors': { title: pages.donors.title, label: pages.donors.name, element: <Donors /> },
};

const NotFound = () => (
  <section className="grid min-h-[100svh] place-items-center px-6 pt-24">
    <div className="text-center">
      <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-[var(--color-body-strong)]">
        {content.notFound.heading}
      </h1>
      <p className="mb-8 text-lg text-[var(--color-body)]">{content.notFound.paragraph}</p>
      <Link
        to="/"
        className="inline-grid min-h-12 place-items-center rounded-full bg-[var(--color-brand)] px-8 font-semibold text-white"
      >
        {content.notFound.button}
      </Link>
    </div>
  </section>
);

const App = () => {
  const { path } = useRouter();
  const route = routes[path];

  const mainRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);
  // Announced politely on navigation. Without this a screen reader user gets
  // no signal that the page changed, since a client-side route swap is silent.
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    document.title = route?.title ?? pages.notFound.title;

    // Don't steal focus or announce on the initial load.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setAnnouncement(
      fill(pages.loadedAnnouncement, { name: route?.label ?? pages.notFound.name }),
    );
    // Move focus to the top of the new page so keyboard users continue from
    // there rather than from wherever the old page's link used to be.
    mainRef.current?.focus();
  }, [path, route]);

  return (
    <>
      <a href="#main" className="skip-link">
        {content.site.skipLink}
      </a>

      <Navigation />

      <main id="main" ref={mainRef} tabIndex={-1} className="outline-none">
        {/* Slow cross-fade between pages. mode="wait" lets the old page finish
            leaving before the new one arrives. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={path}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {route?.element ?? <NotFound />}
          </motion.div>
        </AnimatePresence>
      </main>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <Footer />
      <BackToTop />
    </>
  );
};

export default App;
