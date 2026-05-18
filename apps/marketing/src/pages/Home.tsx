import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="bg-onyx-900">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-32 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10" style={{
          background: 'radial-gradient(ellipse at 20% 0%, rgba(42, 127, 218, 0.12) 0%, transparent 60%)',
        }} />
        
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="section-label">B2B Wholesale Tires</p>
            <h1 className="display-xl mt-4 text-platinum-50">
              Industrial-Strength Tire Management
            </h1>
            <p className="body-lg mx-auto mt-6 max-w-3xl text-platinum-300">
              Orders, inventory tracking, delivery visibility, and financial transparency — all built for fleet operators and multi-location retail.
            </p>
            
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/tires" className="flame-btn">
                Browse Tires
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link to="/contact" className="ghost-btn">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-platinum-700/20 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="section-label">Platform Capabilities</p>
            <h2 className="display-md mt-3 text-platinum-50">Everything you need to run tire operations</h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Smart Catalog',
                desc: 'Filter by size, type, load index, and speed rating. Real-time pricing for wholesale partners.',
                icon: '📦',
              },
              {
                title: 'Cart & Checkout',
                desc: 'Multi-location orders, shipping estimates, tax calculation, and payment flexibility.',
                icon: '🛒',
              },
              {
                title: 'Inventory Sync',
                desc: 'Track stock across distribution centers. Low-stock alerts and auto-reorder workflows.',
                icon: '📊',
              },
              {
                title: 'Order History',
                desc: 'Full visibility into order status, tracking, delivery dates, and cost breakdowns.',
                icon: '📋',
              },
              {
                title: 'Multi-Location',
                desc: 'Manage tires across multiple store locations with shared purchasing power.',
                icon: '🗺️',
              },
              {
                title: 'Support Portal',
                desc: 'Live support, invoices, billing history, and account management in one place.',
                icon: '🎧',
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-platinum-700/20 bg-onyx-900/40 p-6 backdrop-blur-sm hover:border-flame-500/30 transition">
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="font-display text-lg font-bold text-platinum-50">{feature.title}</h3>
                <p className="mt-2 text-sm text-platinum-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-platinum-700/20 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="display-md text-platinum-50">Ready to streamline tire ordering?</h2>
          <p className="body-lg mt-4 text-platinum-300">
            Sign up for a wholesale account, or log in to start managing your fleet.
          </p>
          
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/register" className="flame-btn">
              Create Account
            </Link>
            <Link to="/login" className="ghost-btn">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
