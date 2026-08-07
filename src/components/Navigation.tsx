import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useRouter } from '../lib/router';

const navLinks = [
  { label: 'About Us', to: '/' },
  { label: 'Our Team', to: '/bios' },
  { label: 'Donors', to: '/donors' },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { path } = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`fixed inset-x-0 top-0 z-50 transition-shadow duration-500 ${
        scrolled ? 'bg-white/95 shadow-md backdrop-blur' : 'bg-white'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex min-h-11 items-center gap-3">
          {/* Served from our own build rather than hotlinked from awdea.org,
              so the masthead can't break if that host moves the file. */}
          <img
            src={`${import.meta.env.BASE_URL}awdea-logo.png`}
            alt="AWDEA home"
            width={942}
            height={265}
            className="h-10 w-auto"
          />
          <span className="hidden text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-body)] sm:block">
            Entertainment Access
          </span>
        </Link>

        <nav aria-label="Main menu" className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              aria-current={path === link.to ? 'page' : undefined}
              className={`inline-flex min-h-11 items-center text-sm font-semibold transition-colors duration-500 hover:text-[var(--color-brand)] ${
                path === link.to
                  ? 'text-[var(--color-brand)] underline underline-offset-8'
                  : 'text-[var(--color-body)]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/donate"
            className="min-h-11 rounded-full bg-[var(--color-brand)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition-colors duration-500 hover:bg-[var(--color-brand-dark)]"
          >
            Donate
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          aria-label={isOpen ? 'Close main menu' : 'Open main menu'}
          className="grid h-11 w-11 place-items-center md:hidden"
        >
          <span className="flex h-4 w-6 flex-col justify-between">
            <motion.span
              animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-0.5 w-6 rounded bg-[var(--color-slab)]"
            />
            <motion.span
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="h-0.5 w-6 rounded bg-[var(--color-slab)]"
            />
            <motion.span
              animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-0.5 w-6 rounded bg-[var(--color-slab)]"
            />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden border-t border-[var(--color-brand)]/15 bg-white md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  aria-current={path === link.to ? 'page' : undefined}
                  className="min-h-11 py-3 text-base font-semibold text-[var(--color-body)]"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/donate"
                onClick={() => setIsOpen(false)}
                className="mt-2 grid min-h-12 place-items-center rounded-full bg-[var(--color-brand)] px-6 text-base font-semibold text-white"
              >
                Donate
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navigation;
