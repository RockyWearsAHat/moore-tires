import { Link } from 'react-router-dom';

const NAV_ITEMS = [
  'Dashboard',
  'Orders',
  'Inventory',
  'Catalog',
  'Deliveries',
  'Locations',
  'Billing',
  'Support',
];

const KPI_ITEMS = [
  { title: 'Open Orders', value: '12', status: 'View orders', statusColor: 'text-blue-700' },
  { title: 'Low Stock Items', value: '18', status: '18 items to reorder', statusColor: 'text-orange-600' },
  { title: 'Deliveries Today', value: '4', status: 'On track', statusColor: 'text-emerald-600' },
  { title: 'Monthly Spend', value: '$86,420.50', status: '+12% vs last month', statusColor: 'text-emerald-600' },
];

export function Home() {
  return (
    <div className="min-h-screen bg-onyx-900 text-platinum-100">
      <div className="md:grid md:grid-cols-[240px_1fr]">
        <aside className="bg-navy-800 text-white md:min-h-screen">
          <div className="px-5 pb-5 pt-6">
            <img src="/moore-tire-lockup-partner-light.svg" alt="Moore Tire Partner Portal" className="h-11 w-auto" />
          </div>

          <nav className="overflow-x-auto px-3 pb-4 md:overflow-visible" aria-label="Partner navigation">
            <ul className="flex gap-2 md:flex-col">
              {NAV_ITEMS.map((item, index) => (
                <li key={item} className="shrink-0 md:shrink">
                  <Link
                    to={index === 0 ? '/' : '/services'}
                    className={`block rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                      index === 0 ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-900'
                    }`}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden p-4 md:block">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
              <p className="text-sm text-blue-100">Need help?</p>
              <p className="mt-1 text-sm text-blue-200">Our support team is here to help.</p>
              <button className="mt-4 w-full rounded-xl border border-blue-300/40 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10">
                Contact Support
              </button>
            </div>
          </div>
        </aside>

        <main className="bg-[#f6f9ff]">
          <header className="border-b border-[#d9e4f7] bg-white">
            <div className="grid gap-3 px-4 py-4 sm:px-6 xl:grid-cols-[280px_1fr_auto] xl:items-center">
              <div className="rounded-xl border border-[#d9e4f7] bg-[#f9fbff] px-4 py-2.5 text-sm font-semibold text-[#153053]">
                Acme Construction Co.
              </div>

              <div className="rounded-xl border border-[#d9e4f7] bg-[#f9fbff] px-4 py-2.5 text-sm text-[#6a7f9f]">
                Search tires, SKUs, sizes, or orders...
              </div>

              <div className="justify-self-start text-sm text-[#193b66] xl:justify-self-end">
                <span className="font-semibold">John Davis</span>
                <span className="ml-2 text-[#6a7f9f]">Buyer</span>
              </div>
            </div>
          </header>

          <div className="space-y-4 px-4 py-5 sm:px-6 lg:space-y-5 lg:py-6">
            <section>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#0f2a52] sm:text-4xl">Good morning, Acme Construction</h1>
              <p className="mt-2 text-base text-[#5c7597]">
                Here is your account overview and what is happening with your orders and inventory.
              </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {KPI_ITEMS.map((item) => (
                <article key={item.title} className="rounded-2xl border border-[#d9e4f7] bg-white p-5 shadow-[0_6px_20px_rgba(12,36,72,0.08)]">
                  <p className="text-sm font-medium text-[#5f7798]">{item.title}</p>
                  <p className="mt-2 text-4xl font-extrabold leading-none text-[#112f58]">{item.value}</p>
                  <p className={`mt-3 text-sm font-semibold ${item.statusColor}`}>{item.status}</p>
                </article>
              ))}
            </section>

            <section className="grid gap-4 2xl:grid-cols-[1fr_1.3fr_1.3fr]">
              <article className="rounded-2xl border border-[#d9e4f7] bg-white p-5 shadow-[0_6px_20px_rgba(12,36,72,0.08)]">
                <h2 className="text-xl font-bold text-[#112f58]">Inventory Health</h2>
                <div className="mt-6 grid place-items-center">
                  <div className="grid h-44 w-44 place-items-center rounded-full border-[18px] border-emerald-500/80 bg-white">
                    <div className="text-center">
                      <p className="text-4xl font-extrabold text-[#133461]">74%</p>
                      <p className="text-sm font-semibold text-emerald-600">Good Health</p>
                    </div>
                  </div>
                </div>
                <Link to="/inventory" className="mt-6 inline-block text-sm font-semibold text-blue-700 hover:text-blue-800">
                  View inventory
                </Link>
              </article>

              <article className="rounded-2xl border border-[#d9e4f7] bg-white p-5 shadow-[0_6px_20px_rgba(12,36,72,0.08)]">
                <h2 className="text-xl font-bold text-[#112f58]">Low Stock / Replenishment</h2>
                <div className="mt-4 space-y-3">
                  {['10R22.5 G622 RSD', '12R22.5 G283A', '315/80R22.5 G159', '11R24.5 G622 LHD'].map((sku, i) => (
                    <div key={sku} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border border-[#e4ecfa] bg-[#fbfdff] px-3 py-3">
                      <p className="text-sm font-semibold text-[#17355f]">{sku}</p>
                      <p className="text-sm text-[#5e7696]">{[6, 8, 4, 7][i]} on hand</p>
                      <button className="rounded-lg border border-orange-300 px-2.5 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-50">
                        Reorder
                      </button>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-[#d9e4f7] bg-white p-5 shadow-[0_6px_20px_rgba(12,36,72,0.08)]">
                <h2 className="text-xl font-bold text-[#112f58]">Deliveries Overview</h2>
                <div className="mt-4 space-y-2 text-sm text-[#1f3f68]">
                  {['Acme HQ - Main Yard', 'Acme Site - North', 'Acme Site - South'].map((stop, i) => (
                    <div key={stop} className="rounded-xl border border-[#e4ecfa] bg-[#fbfdff] px-3 py-2.5">
                      <p className="font-semibold">{stop}</p>
                      <p className="text-[#5f7798]">{['Out for delivery', 'On the way', 'Scheduled'][i]}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 h-36 rounded-xl border border-[#d9e4f7] bg-[linear-gradient(135deg,#eaf2ff,#dfeafb)]" />
              </article>
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
              <article className="rounded-2xl border border-[#d9e4f7] bg-white p-5 shadow-[0_6px_20px_rgba(12,36,72,0.08)]">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#112f58]">Recent Orders</h2>
                  <Link to="/orders" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
                    View all orders
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-[#6780a1]">
                      <tr>
                        <th className="py-2 pr-4">Order #</th>
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Items</th>
                        <th className="py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#1b3b64]">
                      {[
                        ['SO-248731', 'May 19, 2025', 'Partially Shipped', '8 tires', '$8,742.30'],
                        ['SO-248452', 'May 16, 2025', 'Shipped', '6 tires', '$6,129.75'],
                        ['SO-248112', 'May 13, 2025', 'Delivered', '10 tires', '$10,482.60'],
                      ].map((row) => (
                        <tr key={row[0]} className="border-t border-[#ebf1fb]">
                          {row.map((cell) => (
                            <td key={cell} className="py-3 pr-4">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="rounded-2xl border border-[#d9e4f7] bg-white p-5 shadow-[0_6px_20px_rgba(12,36,72,0.08)]">
                <h2 className="text-xl font-bold text-[#112f58]">Account Snapshot</h2>
                <div className="mt-4 space-y-4 text-sm text-[#1e3d66]">
                  <div className="rounded-xl border border-[#e4ecfa] bg-[#fbfdff] px-3 py-3">
                    <p className="font-semibold">Locations</p>
                    <p className="text-[#60789a]">5 active locations</p>
                  </div>
                  <div className="rounded-xl border border-[#e4ecfa] bg-[#fbfdff] px-3 py-3">
                    <p className="font-semibold">Current Balance</p>
                    <p className="text-2xl font-extrabold text-[#13315a]">$12,560.75</p>
                  </div>
                  <div className="rounded-xl border border-[#e4ecfa] bg-[#fbfdff] px-3 py-3">
                    <p className="font-semibold">Next Statement Date</p>
                    <p className="text-[#60789a]">June 1, 2025</p>
                  </div>
                </div>
              </article>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
