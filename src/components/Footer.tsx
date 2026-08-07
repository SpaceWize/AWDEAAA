import { Link } from '../lib/router';

const footerLink =
  'inline-flex min-h-11 items-center transition-colors duration-500 hover:text-white';

const Footer = () => (
  <footer className="bg-[var(--color-slab)] px-6 py-16 text-white md:px-12">
    <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-3">
      <div>
        <h2 className="mb-4 text-lg font-bold">Contact us</h2>
        <ul className="text-sm text-violet-100">
          <li>
            <a href="tel:6048375616" className={footerLink}>
              604-837-5616
            </a>
          </li>
          <li>
            <a href="mailto:james@awdea.org" className={footerLink}>
              james@awdea.org
            </a>
          </li>
          <li className="py-2">605-125 20th St. E, North Vancouver V7L 3A3</li>
        </ul>
      </div>
      <div>
        <h2 className="mb-4 text-lg font-bold">About us</h2>
        <ul className="text-sm text-violet-100">
          <li>
            <Link to="/bios" className={footerLink}>
              Our team
            </Link>
          </li>
          <li>
            <Link to="/donors" className={footerLink}>
              Our donors
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h2 className="mb-4 text-lg font-bold">Join us</h2>
        <ul className="text-sm text-violet-100">
          <li>
            <Link to="/donate" className={footerLink}>
              Make a donation
            </Link>
          </li>
        </ul>
      </div>
    </div>
    <p className="mx-auto mt-12 max-w-6xl border-t border-white/10 pt-8 text-sm text-violet-200">
      © 2026 AWDEA™
    </p>
  </footer>
);

export default Footer;
