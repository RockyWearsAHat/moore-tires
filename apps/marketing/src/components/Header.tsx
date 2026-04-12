import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-onyx-700 bg-onyx-900/95 backdrop-blur-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame-500"
        >
          <span className="flex h-9 w-9 items-center justify-center bg-flame-500">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden="true">
              <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" fill="white" />
              <path d="M12 2 L12 6 M12 18 L12 22 M22 12 L18 12 M6 12 L2 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className="font-display font-extrabold text-xl uppercase tracking-widest text-platinum-50">
            Moore <span className="text-flame-500">Tires</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `font-display font-semibold text-sm uppercase tracking-widest transition-colors duration-150 ${
                  isActive ? 'text-flame-400' : 'text-platinum-400 hover:text-platinum-50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* CTA + mobile menu */}
        <div className="flex items-center gap-4">
          <Link
            to="/book"
            className="flame-btn hidden text-sm md:inline-flex"
            aria-label="Book a tire service appointment"
          >
            Book Now
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          {/* Hamburger */}
          <button
            type="button"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={`block h-0.5 w-6 bg-platinum-200 transition-transform duration-200 ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-6 bg-platinum-200 transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-platinum-200 transition-transform duration-200 ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="border-t border-onyx-700 bg-onyx-900/98 pb-6 pt-2 md:hidden">
          <nav className="flex flex-col gap-1 px-6" aria-label="Mobile navigation">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block py-3 font-display font-semibold text-lg uppercase tracking-widest ${
                    isActive ? 'text-flame-400' : 'text-platinum-300'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <Link
              to="/book"
              onClick={() => setMenuOpen(false)}
              className="flame-btn mt-4 justify-center"
            >
              Book Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
