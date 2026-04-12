import { NavLink, Outlet } from 'react-router-dom';

const NAV = [
  { to: '/dispatch',  label: 'Dispatch',  icon: '▦' },
  { to: '/inbox',     label: 'Inbox',     icon: '✉' },
  { to: '/calendar',  label: 'Calendar',  icon: '◫' },
];

export function Layout() {
  return (
    <div className="flex h-full min-h-screen bg-surface-base">
      {/* Sidebar */}
      <aside className="flex w-56 flex-shrink-0 flex-col border-r border-surface-border bg-[#0D0F14]">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-surface-border">
          <span className="flex h-7 w-7 items-center justify-center bg-brand-500 text-white text-xs font-bold font-display">M</span>
          <span className="font-display font-bold text-sm uppercase tracking-widest text-gray-100">Moore Ops</span>
        </div>

        <nav className="flex-1 px-3 pt-4" aria-label="Main navigation">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? 'nav-item-active' : 'nav-item')}
            >
              <span className="w-4 text-center text-sm" aria-hidden="true">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-surface-border">
          <p className="text-xs text-gray-600">Moore Tires Dispatch</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
