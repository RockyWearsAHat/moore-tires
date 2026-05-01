import { Link } from 'react-router-dom';
import { ENABLE_SERVICE_BOOKING } from '../config/features.js';

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
    {
      label: ENABLE_SERVICE_BOOKING ? 'Book Appointment' : 'Order Tires',
      to: ENABLE_SERVICE_BOOKING ? '/book' : '/tires',
    },
  ],
};

interface FooterProps {
  theme: 'light' | 'dark';
}

export function Footer({ theme }: FooterProps) {
  return (
    <footer className="border-t border-onyx-700 bg-onyx-950">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 md:grid-cols-3 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 mb-4">
              <img
                src={theme === 'light' ? '/moore-tire-wordmark-dark.svg' : '/moore-tire-wordmark-light.svg'}
                alt="Moore Tire"
                className="h-7 w-auto"
              />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-platinum-600">
              Industrial tire supply for construction, logistics, and fleet operations.
              Serving partners across the region since 2009.
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
