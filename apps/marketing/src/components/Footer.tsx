import { Link } from 'react-router-dom';

const LINKS = {
  Services: [
    { label: 'Tire Install', to: '/services#install' },
    { label: 'Tire Repair', to: '/services#repair' },
    { label: 'Rotation', to: '/services#rotation' },
    { label: 'Inspection', to: '/services#inspection' },
  ],
  Company: [
    { label: 'About Us', to: '/about' },
    { label: 'Contact', to: '/contact' },
    { label: 'Book Appointment', to: '/book' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-onyx-700 bg-onyx-950 tread-overlay">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 md:grid-cols-3 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 mb-4">
              <span className="flex h-8 w-8 items-center justify-center bg-flame-500">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="2" />
                  <circle cx="12" cy="12" r="4" fill="white" />
                </svg>
              </span>
              <span className="font-display font-extrabold text-lg uppercase tracking-widest text-platinum-50">
                Moore <span className="text-flame-500">Tires</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-platinum-600">
              Professional tire services with precision and pride. Serving the community since 2009.
            </p>
            <p className="mt-4 font-display font-bold text-2xl text-platinum-50">
              (555) 867-5309
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <h3 className="section-label mb-4">{group}</h3>
              <ul className="flex flex-col gap-2">
                {items.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-platinum-600 hover:text-flame-400 transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-onyx-700 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-platinum-600">
            &copy; {new Date().getFullYear()} Moore Tires. All rights reserved.
          </p>
          <p className="text-xs text-onyx-600">
            Built with precision.
          </p>
        </div>
      </div>
    </footer>
  );
}
