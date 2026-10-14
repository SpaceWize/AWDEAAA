import { content } from '../content';
import { Link } from '../lib/router';

const footerLink =
  'inline-flex min-h-11 items-center transition-colors duration-500 hover:text-white';

const { contact, footer } = content;

const Footer = () => (
  <footer className="bg-[var(--color-slab)] px-6 py-16 text-white md:px-12">
    <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-3">
      <div>
        <h2 className="mb-4 text-lg font-bold">{footer.contactHeading}</h2>
        <ul className="text-base text-violet-100 md:text-sm">
          <li>
            <a href={`tel:${contact.phone.replace(/\D/g, '')}`} className={footerLink}>
              {contact.phone}
            </a>
          </li>
          <li>
            <a href={`mailto:${contact.email}`} className={footerLink}>
              {contact.email}
            </a>
          </li>
          <li className="py-2">{contact.address}</li>
        </ul>
      </div>
      <div>
        <h2 className="mb-4 text-lg font-bold">{footer.aboutHeading}</h2>
        <ul className="text-base text-violet-100 md:text-sm">
          <li>
            <Link to="/bios" className={footerLink}>
              {footer.aboutTeamLink}
            </Link>
          </li>
          <li>
            <Link to="/donors" className={footerLink}>
              {footer.aboutDonorsLink}
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h2 className="mb-4 text-lg font-bold">{footer.joinHeading}</h2>
        <ul className="text-base text-violet-100 md:text-sm">
          <li>
            <Link to="/donate" className={footerLink}>
              {footer.joinDonateLink}
            </Link>
          </li>
        </ul>
      </div>
    </div>
    <p className="mx-auto mt-12 max-w-6xl border-t border-white/10 pt-8 text-sm text-violet-200">
      {footer.copyright}
    </p>
  </footer>
);

export default Footer;
