import { NavLink, Outlet } from 'react-router-dom';
import { useDashboardAuth } from '../context/DashboardAuthContext';

const NAV = [
  { to: '/dispatch',  label: 'Dispatch',  icon: '▦' },
  { to: '/orders',    label: 'Orders',    icon: '📦' },
  { to: '/products',  label: 'Products',  icon: '🔧' },
  { to: '/companies', label: 'Companies', icon: '🏢' },
  { to: '/users',     label: 'Users',     icon: '👤', adminOnly: true },
  { to: '/inbox',     label: 'Inbox',     icon: '✉' },
  { to: '/calendar',  label: 'Calendar',  icon: '◫' },
];

export function Layout() {
  const { user, logout, hasRole } = useDashboardAuth();
  const isAdmin = hasRole('admin');

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
          {NAV.filter((item) => !item.adminOnly || isAdmin).map(({ to, label, icon }) => (
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

        {/* Footer with user info */}
        <div className="px-4 py-4 border-t border-surface-border">
          {user && (
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-gray-300">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-[10px] text-gray-600">{user.role.replace(/_/g, ' ')}</p>
              </div>
              <button
                onClick={() => logout()}
                className="text-xs text-gray-600 transition hover:text-red-400"
                title="Sign out"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
