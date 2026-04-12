const SERVICES = [
  {
    id: 'install',
    icon: '⚙',
    title: 'Tire Installation',
    pricing: 'From $20/tire',
    duration: '45–90 min',
    description:
      'Full mount, balance, and TPMS sensor reset on any new tire. We carry most major brands or work with tires you supply.',
    features: [
      'Any tire brand accepted',
      'Road-force balance available',
      'TPMS reset included',
      'Old tires recycled responsibly',
    ],
  },
  {
    id: 'repair',
    icon: '◎',
    title: 'Flat Repair',
    pricing: 'From $25',
    duration: '20–30 min',
    description:
      'Patch and plug repair for punctures. Sidewall damage and run-flat failure diagnosed with honest options — no pressure to replace unnecessarily.',
    features: [
      'Plug-patch combo (industry best practice)',
      'Sidewall inspection included',
      'Air pressure corrected on all four',
      'Available for 18-wheelers',
    ],
  },
  {
    id: 'rotation',
    icon: '↺',
    title: 'Tire Rotation',
    pricing: 'From $30',
    duration: '30 min',
    description:
      'Move tires to their optimal positions to equalize tread wear and extend the life of your set by thousands of miles.',
    features: [
      'All patterns: X, forward-cross, rearward-cross',
      'Torque specs verified per vehicle',
      'Tread depth logged on each tire',
      'Recommended every 5,000–7,500 mi',
    ],
  },
  {
    id: 'inspection',
    icon: '◈',
    title: 'Tire Inspection',
    pricing: 'Free with any service',
    duration: '15 min',
    description:
      'Comprehensive 20-point tire health check. We catch slow leaks, cracking, uneven wear patterns, and alignment red flags before they become blowouts.',
    features: [
      'Tread depth measurement',
      'Sidewall & bead inspection',
      'Inflation to manufacturer spec',
      'Written report provided',
    ],
  },
];

export function Services() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-onyx-700 py-20">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,85,0,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,85,0,0.8) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <span className="section-label">What We Offer</span>
          <h1 className="display-lg mt-3 text-platinum-50">
            Four Services.<br />
            <span className="text-flame-500">Zero Compromise.</span>
          </h1>
        </div>
      </div>

      {/* Service cards */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="flex flex-col gap-px bg-onyx-700">
          {SERVICES.map(({ id, icon, title, pricing, duration, description, features }) => (
            <div
              key={id}
              id={id}
              className="grid bg-onyx-900 p-10 transition-colors duration-200 hover:bg-onyx-800 lg:grid-cols-[1fr_2fr]"
            >
              <div className="mb-8 lg:mb-0 lg:pr-12">
                <div className="mb-4 flex h-14 w-14 items-center justify-center border border-flame-500/30 text-3xl text-flame-500">
                  {icon}
                </div>
                <h2 className="font-display text-2xl font-extrabold uppercase tracking-wide text-platinum-50">
                  {title}
                </h2>
                <p className="mt-2 font-display font-bold text-flame-500">{pricing}</p>
                <p className="mt-1 text-xs text-platinum-600">⏱ {duration}</p>
              </div>
              <div>
                <p className="leading-relaxed text-platinum-400">{description}</p>
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-platinum-400">
                      <span className="mt-0.5 flex-shrink-0 text-flame-500" aria-hidden="true">—</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
