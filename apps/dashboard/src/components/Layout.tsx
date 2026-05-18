import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@moore-tires/shared';
import { useEffect, useState } from 'react';

/* ── Icons ─────────────────────────────────────────────── */
const IconDispatch = () => (
  <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IconOrders = () => (
  <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
    <path d="M9 12h6M9 16h4"/>
  </svg>
);
const IconCatalog = () => (
  <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/>
  </svg>
);
const IconCustomers = () => (
  <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const IconInventory = () => (
  <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    <polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const IconWarehouse = () => (
  <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);
const IconUsers = () => (
  <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M20 21a8 8 0 10-16 0"/>
  </svg>
);
const IconInbox = () => (
  <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>
  </svg>
);
const IconCalendar = () => (
  <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconSearch = () => (
  <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
);
const IconBell = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);
const IconChevron = () => (
  <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const IconBuilding = () => (
  <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M9 3v18"/><path d="M3 9h6"/><path d="M3 15h6"/><path d="M15 9h3"/><path d="M15 15h3"/>
  </svg>
);
const IconLogout = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
  </svg>
);
const IconMoon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);
const IconSun = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

/* ── Nav config ─────────────────────────────────────────── */
const NAV_OPS = [
  { to: '/dispatch',  label: 'Dispatch Board', Icon: IconDispatch },
  { to: '/orders',    label: 'Orders Queue',   Icon: IconOrders },
  { to: '/products',  label: 'Catalog',        Icon: IconCatalog },
  { to: '/companies', label: 'Customers',      Icon: IconCustomers },
  { to: '/inventory', label: 'Inventory',      Icon: IconInventory },
];
const NAV_ADMIN = [
  { to: '/centers',  label: 'Warehouses', Icon: IconWarehouse, adminOnly: true },
  { to: '/users',    label: 'Users',      Icon: IconUsers,     adminOnly: true },
  { to: '/inbox',    label: 'Messages',   Icon: IconInbox },
  { to: '/calendar', label: 'Schedule',   Icon: IconCalendar },
];

function initials(first?: string, last?: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?';
}

/* ── Layout ─────────────────────────────────────────────── */
export function Layout() {
  const { user, logout, hasRole } = useAuth();
  const isAdmin = hasRole('admin');

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document === 'undefined') return 'light';
    const saved = localStorage.getItem('dashboard-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'light';
  });

  useEffect(() => {
    document.documentElement.dataset['theme'] = theme;
    localStorage.setItem('dashboard-theme', theme);
  }, [theme]);

  const userInitials = initials(user?.firstName, user?.lastName);

  return (
    <div className="flex h-full min-h-screen">

      {/* ── Sidebar — always dark navy regardless of theme ──────── */}
      <aside
        className="fixed inset-y-0 left-0 z-40 flex w-[220px] flex-col"
        style={{ background: '#0b1d40', borderRight: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Brand lockup */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2">
            <span
              className="text-[20px] font-black tracking-tight text-white leading-none"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              MOORE TIRE
            </span>
            <svg className="h-5 w-5 flex-shrink-0 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M5 6h3"/><path d="M4 12h3"/><path d="M5 18h3"/>
              <path d="M8.5 5.5C11.5 6.5 13 9 13 12c0 3-1.5 5.5-4.5 6.5" strokeWidth={2.2}/>
              <path d="M12 4C15.5 5.5 17.5 8.5 17.5 12S15.5 18.5 12 20" strokeWidth={2}/>
              <path d="M15.5 3C19.5 5 21.5 8.2 21.5 12s-2 7-6 9" strokeWidth={1.8}/>
            </svg>
          </div>
          <span className="mt-1 block text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Internal Ops Portal
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Main navigation">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Operations
          </p>
          {NAV_OPS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? 'nav-item-active' : 'nav-item')}
            >
              <Icon />
              {label}
            </NavLink>
          ))}

          <p className="mb-2 mt-5 px-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Admin
          </p>
          {NAV_ADMIN.filter((item) => !item.adminOnly || isAdmin).map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? 'nav-item-active' : 'nav-item')}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Support + user footer */}
        <div className="px-3 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="mt-3 flex items-center gap-3 rounded-lg px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
              style={{ background: 'rgba(96,166,255,0.18)' }}
            >
              <svg className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white">Need help?</p>
              <button
                type="button"
                className="text-[10px] underline-offset-2 hover:underline"
                style={{ color: 'rgba(255,255,255,0.42)' }}
              >
                Contact Support →
              </button>
            </div>
          </div>

          {user && (
            <div className="mt-3 flex items-center gap-2.5 px-1">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {user.role.replace(/_/g, ' ')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                title="Sign out"
                className="flex-shrink-0 rounded p-1 text-red-400/60 transition hover:text-red-400"
              >
                <IconLogout />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Right panel ───────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col" style={{ paddingLeft: 220 }}>

        {/* Top bar */}
        <header
          className="sticky top-0 z-30 flex h-14 items-center gap-3 px-6"
          style={{
            background: 'color-mix(in srgb, var(--surface-base) 92%, transparent)',
            borderBottom: '1px solid var(--surface-border)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Yard selector */}
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition hover:border-[var(--brand)]"
            style={{
              borderColor: 'var(--surface-border)',
              color: 'var(--text-body)',
              background: 'var(--surface-elevated)',
            }}
          >
            <IconBuilding />
            <span>All Yards</span>
            <IconChevron />
          </button>

          {/* Search */}
          <div
            className="flex flex-1 cursor-default items-center gap-2.5 rounded-lg border px-3 py-1.5 text-sm"
            style={{
              borderColor: 'var(--surface-border)',
              background: 'var(--surface-elevated)',
              color: 'var(--text-faint)',
            }}
          >
            <IconSearch />
            <span>Search orders, SKUs, customers, drivers…</span>
            <kbd
              className="ml-auto rounded px-1.5 py-0.5 text-[10px] font-mono"
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--surface-border)',
                color: 'var(--text-faint)',
              }}
            >
              ⌘K
            </kbd>
          </div>

          {/* Theme + Notifications + User */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme((p) => (p === 'dark' ? 'light' : 'dark'))}
              title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
              className="rounded-lg border p-1.5 transition"
              style={{
                borderColor: 'var(--surface-border)',
                background: 'var(--surface-elevated)',
                color: 'var(--text-muted)',
              }}
            >
              {theme === 'dark' ? <IconSun /> : <IconMoon />}
            </button>

            <button
              type="button"
              className="relative rounded-lg border p-1.5 transition"
              style={{
                borderColor: 'var(--surface-border)',
                background: 'var(--surface-elevated)',
                color: 'var(--text-muted)',
              }}
            >
              <IconBell />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                3
              </span>
            </button>

            {user && (
              <div
                className="flex items-center gap-2.5 rounded-lg border px-3 py-1.5"
                style={{
                  borderColor: 'var(--surface-border)',
                  background: 'var(--surface-elevated)',
                }}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {userInitials}
                </div>
                <div className="hidden text-left md:block">
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-strong)' }}>
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
                    {user.role.replace(/_/g, ' ')}
                  </p>
                </div>
                <IconChevron />
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-surface-base">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
