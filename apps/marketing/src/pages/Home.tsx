import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const SERVICES = [
  {
    icon: '⚙',
    title: 'Tire Install',
    desc: 'Full mount and balance on new tires. Any brand, any vehicle.',
    href: '/services#install',
  },
  {
    icon: '◎',
    title: 'Flat Repair',
    desc: 'Rapid patch and plug. Most repairs done in under 30 minutes.',
    href: '/services#repair',
  },
  {
    icon: '↺',
    title: 'Rotation',
    desc: 'Extend tire life and maintain even tread wear across all four corners.',
    href: '/services#rotation',
  },
  {
    icon: '◈',
    title: 'Inspection',
    desc: 'Full tread-depth, pressure, and wheel-alignment diagnostic.',
    href: '/services#inspection',
  },
];

const STATS = [
  { value: '15+', label: 'Years in Business' },
  { value: '12,000+', label: 'Tires Installed' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '< 60 min', label: 'Average Service Time' },
];

/** Simple scroll-reveal hook — watches elements with class "reveal" */
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export function Home() {
  useScrollReveal();
  const heroRef = useRef<HTMLDivElement>(null);

  // Subtle parallax on hero background
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onScroll = () => {
      el.style.transform = `translateY(${window.scrollY * 0.3}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen items-end overflow-hidden pb-20 pt-32">
        {/* Background layers */}
        <div ref={heroRef} className="absolute inset-0 will-change-transform" aria-hidden="true">
          {/* Deep grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,85,0,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,85,0,0.8) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          />
          {/* Radial glow */}
          <div className="absolute left-0 top-1/4 h-[800px] w-[800px] -translate-x-1/3 rounded-full bg-flame-500/8 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[600px] w-[600px] translate-x-1/4 rounded-full bg-flame-500/5 blur-[100px]" />
          {/* Giant background text */}
          <div
            className="absolute bottom-0 right-0 select-none text-[60vw] font-display font-black uppercase leading-none tracking-tighter text-onyx-800"
            aria-hidden="true"
          >
            MT
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="max-w-5xl">
            {/* Label */}
            <div className="mb-8 flex items-center gap-4">
              <span className="accent-line animate-line-grow w-12" />
              <span className="section-label animate-fade-in">Professional Tire Service</span>
            </div>

            {/* Main headline */}
            <h1 className="display-xl animate-slide-up text-platinum-50">
              Gripped.
              <br />
              <span className="text-flame-500">Every</span> Road.
            </h1>

            {/* Subhead */}
            <p
              className="body-lg mt-8 max-w-lg animate-slide-up text-platinum-400"
              style={{ animationDelay: '150ms' }}
            >
              Expert tire installation, repair, rotation, and inspection. Mobile service
              available — we come to you. Book in under 60 seconds.
            </p>

            {/* CTAs */}
            <div
              className="mt-10 flex flex-wrap items-center gap-4 animate-slide-up"
              style={{ animationDelay: '250ms' }}
            >
              <Link to="/book" className="flame-btn">
                Book Appointment
                <svg className="h-5 w-5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a href="tel:+15558675309" className="ghost-btn">
                Call (555) 867-5309
              </a>
            </div>
          </div>

          {/* Stats strip */}
          <div
            className="mt-20 grid grid-cols-2 gap-px border border-onyx-700 bg-onyx-700 md:grid-cols-4 animate-fade-in"
            style={{ animationDelay: '400ms' }}
          >
            {STATS.map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col gap-1 bg-onyx-900 px-6 py-5 transition-colors duration-200 hover:bg-onyx-800"
              >
                <span className="font-display text-3xl font-black text-flame-500">{value}</span>
                <span className="text-xs text-platinum-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID ────────────────────────────────────────────────── */}
      <section className="relative py-32" aria-labelledby="services-heading">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="reveal mb-16 flex items-start justify-between gap-8">
            <div>
              <span className="section-label">What We Do</span>
              <h2 id="services-heading" className="display-lg mt-3 text-platinum-50">
                Every Service.
                <br />
                Done Right.
              </h2>
            </div>
            <Link to="/services" className="ghost-btn hidden self-end md:inline-flex">
              All Services
            </Link>
          </div>

          <div className="grid gap-px bg-onyx-700 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map(({ icon, title, desc, href }, i) => (
              <a
                key={title}
                href={href}
                className="reveal group flex flex-col gap-4 bg-onyx-900 p-8 transition-colors duration-200 hover:bg-onyx-800"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center border border-flame-500/20 text-2xl text-flame-500 transition-colors duration-200 group-hover:border-flame-500 group-hover:bg-flame-500/10">
                  {icon}
                </div>
                <h3 className="font-display text-xl font-bold uppercase tracking-wide text-platinum-50">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-platinum-600">{desc}</p>
                <span className="mt-auto flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-flame-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  Learn More
                  <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6h8m-3-3 3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── MOBILE SERVICE CALLOUT ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-flame-500 py-24">
        {/* Tread texture in accent section */}
        <div className="absolute inset-0 opacity-10 tread-overlay" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="section-label text-white/60">Mobile Service</span>
              <h2 className="display-lg mt-2 text-white">
                We Come<br />To You.
              </h2>
              <p className="mt-4 text-lg text-white/80 leading-relaxed">
                Can't make it in? Our mobile technicians bring the shop to your driveway, office, or roadside. Available seven days a week.
              </p>
            </div>
            <Link
              to="/book"
              className="flex-shrink-0 inline-flex items-center gap-3 bg-onyx-900 px-10 py-5 font-display font-bold
                text-lg uppercase tracking-widest text-white hover:bg-onyx-800 transition-colors duration-200"
            >
              Schedule Mobile Service
              <svg className="h-5 w-5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="py-32" aria-labelledby="testimonials-heading">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="reveal mb-16">
            <span className="section-label">Reviews</span>
            <h2 id="testimonials-heading" className="display-lg mt-3 text-platinum-50">
              What Customers Say.
            </h2>
          </div>
          <div className="grid gap-px bg-onyx-700 md:grid-cols-3">
            {[
              {
                quote: "Pulled in with a nail in my rear tire. They fixed it in 20 minutes — didn't even charge me an arm and a leg. Will be back for my next set.",
                name: 'Marcus T.',
                detail: 'Honda Accord, Flat Repair',
              },
              {
                quote: "The mobile service is a game changer. Tech showed up to my office parking lot and put on four new tires while I was in meetings. Incredible.",
                name: 'Erica L.',
                detail: 'Ford Explorer, Full Install',
              },
              {
                quote: "Super professional. They found a slow leak I'd been ignoring for weeks during the inspection. These guys actually look out for you.",
                name: 'David K.',
                detail: 'Toyota Tacoma, Inspection',
              },
            ].map(({ quote, name, detail }, i) => (
              <blockquote
                key={name}
                className="reveal flex flex-col gap-6 bg-onyx-900 p-8 hover:bg-onyx-800 transition-colors duration-200"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="text-flame-500 text-3xl leading-none" aria-hidden="true">"</div>
                <p className="flex-1 text-sm leading-loose text-platinum-400">{quote}</p>
                <footer>
                  <p className="font-display font-bold text-platinum-100">{name}</p>
                  <p className="text-xs text-platinum-600">{detail}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-onyx-700 py-32 tread-overlay">
        <div className="reveal mx-auto max-w-3xl px-6 text-center lg:px-10">
          <span className="section-label">Ready?</span>
          <h2 className="display-lg mt-4 text-platinum-50">
            Book Your Service<br />
            <span className="text-flame-500">Today.</span>
          </h2>
          <p className="body-lg mx-auto mt-6 max-w-md">
            Takes less than 60 seconds. You'll get an SMS confirmation immediately.
          </p>
          <Link to="/book" className="flame-btn mt-10 text-lg">
            Get Started
            <svg className="h-5 w-5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
