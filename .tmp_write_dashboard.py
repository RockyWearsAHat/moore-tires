content = r"""import React from 'react';

/* ── Stat card ─────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  icon: React.ReactNode;
  iconBg: string;
}

function StatCard({ label, value, sub, subColor, icon, iconBg }: StatCardProps) {
  return (
    <div
      className="flex flex-col justify-between rounded-xl p-5"
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--surface-border)',
        boxShadow: 'var(--shadow-md)',
        minWidth: 0,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</p>
          <p className="mt-1 text-3xl font-bold" style={{ color: 'var(--text-strong)', fontFamily: 'var(--font-display)' }}>
            {value}
          </p>
        </div>
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full" style={{ background: iconBg }}>
          {icon}
        </div>
      </div>
      {sub && (
        <p className="mt-3 text-xs font-medium" style={{ color: subColor ?? 'var(--text-muted)' }}>
          {sub} &rarr;
        </p>
      )}
    </div>
  );
}

/* ── Status badge ──────────────────────────────────────── */
type BadgeColor = 'blue' | 'green' | 'amber' | 'red' | 'gray';
function Badge({ label, color }: { label: string; color: BadgeColor }) {
  const styles: Record<BadgeColor, React.CSSProperties> = {
    blue:  { background: 'rgba(59,130,246,0.12)',  color: '#3b82f6',  border: '1px solid rgba(59,130,246,0.28)' },
    green: { background: 'rgba(16,185,129,0.12)',  color: '#10b981',  border: '1px solid rgba(16,185,129,0.28)' },
    amber: { background: 'rgba(245,158,11,0.12)',  color: '#f59e0b',  border: '1px solid rgba(245,158,11,0.28)' },
    red:   { background: 'rgba(239,68,68,0.12)',   color: '#ef4444',  border: '1px solid rgba(239,68,68,0.28)' },
    gray:  { background: 'rgba(107,114,128,0.12)', color: '#9ca3af',  border: '1px solid rgba(107,114,128,0.22)' },
  };
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold" style={styles[color]}>
      {label}
    </span>
  );
}

/* ── Section wrapper ───────────────────────────────────── */
function Section({ title, action, children }: { title: string; action?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)', boxShadow: 'var(--shadow-md)' }}>
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--surface-border)' }}>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>{title}</h2>
        {action && <button type="button" className="text-xs font-medium" style={{ color: 'var(--brand)' }}>{action}</button>}
      </div>
      {children}
    </div>
  );
}

/* ── Demo data ─────────────────────────────────────────── */
const ORDER_QUEUE = [
  { id: 'SO-248731', customer: 'Acme Construction Co.', dest: 'Acme HQ - Main Yard',   skus: '8 SKUs / 196 tires',  date: 'May 21, 2025', status: 'Ready' as const },
  { id: 'SO-248452', customer: 'BuildPro Logistics',    dest: 'BuildPro Yard - South', skus: '6 SKUs / 144 tires',  date: 'May 20, 2025', status: 'Ready' as const },
  { id: 'SO-248112', customer: 'Pioneer Materials',     dest: 'Pioneer Yard - East',   skus: '10 SKUs / 248 tires', date: 'May 20, 2025', status: 'NeedsSourcing' as const },
  { id: 'SO-247891', customer: 'Summit Aggregates',     dest: 'Summit Yard - West',    skus: '7 SKUs / 168 tires',  date: 'May 19, 2025', status: 'Partial' as const },
  { id: 'SO-247532', customer: 'Acme Construction Co.', dest: 'Acme Site - North',    skus: '5 SKUs / 120 tires',  date: 'May 18, 2025', status: 'BackorderRisk' as const },
];
const SOURCE_ALLOC = [
  { orderId: 'SO-248112', needed: '10 SKUs / 248 tires', source: 'Dallas Yard',     dist: '12.4 mi',  avail: 252, skus: 10, match: 92,  matchColor: '#10b981' },
  { orderId: 'SO-247532', needed: '5 SKUs / 120 tires',  source: 'Fort Worth Yard', dist: '34.7 mi',  avail: 134, skus: 5,  match: 100, matchColor: '#10b981' },
  { orderId: 'SO-248921', needed: '6 SKUs / 150 tires',  source: 'Houston Yard',    dist: '156 mi',   avail: 96,  skus: 4,  match: 64,  matchColor: '#f59e0b' },
  { orderId: 'SO-248337', needed: '7 SKUs / 120 tires',  source: 'Memphis Yard',    dist: '412 mi',   avail: 58,  skus: 3,  match: 34,  matchColor: '#ef4444' },
  { orderId: 'SO-248661', needed: '8 SKUs / 210 tires',  source: '-',               dist: '-',        avail: 0,   skus: 0,  match: 0,   matchColor: '#6b7280' },
];
const ROUTES = [
  { id: 'RTE-107', name: 'Acme HQ - Main Yard',  stops: '3/12', eta: '9:45 AM',  driver: 'John Davis', status: 'On Time' as const },
  { id: 'RTE-108', name: 'BuildPro Loop',         stops: '2/8',  eta: '10:20 AM', driver: 'Maria R.',   status: 'On Time' as const },
  { id: 'RTE-109', name: 'Pioneer East Route',    stops: '4/10', eta: '11:05 AM', driver: 'Tim C.',     status: 'Delayed' as const },
  { id: 'RTE-110', name: 'Summit West Route',     stops: '1/9',  eta: '12:15 PM', driver: 'Alex L.',    status: 'On Time' as const },
  { id: 'RTE-111', name: 'South Texas Route',     stops: '5/7',  eta: '1:30 PM',  driver: 'Ben W.',     status: 'Delayed' as const },
];
const FLEET = [
  { unit: 'MT-101', status: 'Available' as const,   location: 'Dallas Yard',       driver: '-' },
  { unit: 'MT-102', status: 'In Route' as const,    location: 'On Route RTE-107',  driver: 'John Davis' },
  { unit: 'MT-103', status: 'In Route' as const,    location: 'On Route RTE-108',  driver: 'Maria R.' },
  { unit: 'MT-104', status: 'At Stop' as const,     location: 'Acme Site - North', driver: 'Tim C.' },
  { unit: 'MT-105', status: 'Maintenance' as const, location: 'Houston Yard',      driver: '-' },
];
const ALERTS = [
  { id: 'A1', title: 'SO-248112 backorder risk',     desc: 'Insufficient inventory for requested date', type: 'Backorder Risk',   impact: 'High',   color: 'red' as const,   mins: 8 },
  { id: 'A2', title: 'RTE-109 delayed',              desc: 'Traffic causing 46-min delay',             type: 'Delayed Delivery', impact: 'Medium', color: 'amber' as const, mins: 21 },
  { id: 'A3', title: 'Driver reassignment needed',   desc: 'Driver unavailable for RTE-111',           type: 'Reassignment',     impact: 'Medium', color: 'amber' as const, mins: 35 },
  { id: 'A4', title: 'SO-247532 needs sourcing',     desc: 'Partial allocation only',                  type: 'Sourcing Needed',  impact: 'Medium', color: 'blue' as const,  mins: 60 },
  { id: 'A5', title: 'MT-105 maintenance scheduled', desc: 'Routine service at Houston Yard',          type: 'Maintenance',      impact: 'Low',    color: 'gray' as const,  mins: 60 },
];
const ORDER_STATUS_COLOR = { Ready: 'green', NeedsSourcing: 'amber', Partial: 'blue', BackorderRisk: 'red' } as const;
const ORDER_STATUS_LABEL = { Ready: 'Ready', NeedsSourcing: 'Needs Sourcing', Partial: 'Partial', BackorderRisk: 'Backorder Risk' } as const;
const FLEET_COLOR = { Available: 'green', 'In Route': 'blue', 'At Stop': 'amber', Maintenance: 'gray' } as const;
const ROUTE_COLOR = { 'On Time': 'green', Delayed: 'red' } as const;

/* ── Page ──────────────────────────────────────────────── */
export function DashboardPage() {
  return (
    <div className="min-h-full px-6 py-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-strong)', fontFamily: 'var(--font-display)' }}>Operations Overview</h1>
            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>Internal Ops Portal</span>
          </div>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Manage fulfillment and deliveries across customers and yards in real time.</p>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Orders Awaiting Dispatch" value="26" sub="View queue" subColor="var(--brand)" iconBg="rgba(59,130,246,0.12)"
          icon={<svg className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>}
        />
        <StatCard label="Deliveries In Progress" value="38" sub="View deliveries" subColor="var(--brand)" iconBg="rgba(16,185,129,0.12)"
          icon={<svg className="h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>}
        />
        <StatCard label="Available Fleet" value="14 / 52" sub="View fleet" subColor="var(--brand)" iconBg="rgba(139,92,246,0.12)"
          icon={<svg className="h-5 w-5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>}
        />
        <StatCard label="Urgent Stockouts" value="9" sub="View stockouts" subColor="#ef4444" iconBg="rgba(245,158,11,0.12)"
          icon={<svg className="h-5 w-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Section title={`Order Queue (${ORDER_QUEUE.length})`} action="View all orders">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  {['Order #', 'Customer', 'Destination', 'SKUs / Tires', 'Req. Date', 'Status'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ORDER_QUEUE.map((o) => (
                  <tr key={o.id} className="transition-colors" style={{ borderBottom: '1px solid var(--surface-border)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-elevated)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                  >
                    <td className="px-5 py-3 font-mono text-xs font-semibold" style={{ color: 'var(--brand)' }}>{o.id}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-body)' }}>{o.customer}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{o.dest}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-body)' }}>{o.skus}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{o.date}</td>
                    <td className="px-5 py-3"><Badge label={ORDER_STATUS_LABEL[o.status]} color={ORDER_STATUS_COLOR[o.status]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Source Allocation" action="View all allocations">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  {['Order #', 'Needed', 'Best Source', 'Available', 'Match %', 'Action'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SOURCE_ALLOC.map((s) => (
                  <tr key={s.orderId} className="transition-colors" style={{ borderBottom: '1px solid var(--surface-border)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-elevated)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
                  >
                    <td className="px-5 py-3 font-mono text-xs font-semibold" style={{ color: 'var(--brand)' }}>{s.orderId}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-body)' }}>{s.needed}</td>
                    <td className="px-5 py-3">
                      <p className="text-xs font-medium" style={{ color: 'var(--text-body)' }}>{s.source}</p>
                      {s.dist !== '-' && <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{s.dist} away</p>}
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{s.avail > 0 ? `${s.avail} tires / ${s.skus} SKUs` : '-'}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full" style={{ background: 'var(--surface-elevated)' }}>
                          <div className="h-full rounded-full" style={{ width: `${s.match}%`, background: s.matchColor }} />
                        </div>
                        <span className="text-xs font-semibold" style={{ color: s.matchColor }}>{s.match}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <button type="button" className="rounded-md px-2.5 py-1 text-xs font-semibold"
                        style={{ background: s.match >= 80 ? 'rgba(59,130,246,0.12)' : 'rgba(245,158,11,0.12)', color: s.match >= 80 ? 'var(--brand)' : '#f59e0b', border: `1px solid ${s.match >= 80 ? 'rgba(59,130,246,0.28)' : 'rgba(245,158,11,0.28)'}` }}>
                        {s.match >= 80 ? 'Allocate' : s.match > 0 ? 'Review' : 'Source'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Section title="Route / Delivery Board" action="View all routes">
          <div className="divide-y" style={{ borderColor: 'var(--surface-border)' }}>
            {ROUTES.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3"
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-elevated)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
              >
                <span className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold" style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--brand)', border: '1px solid rgba(59,130,246,0.2)' }}>{r.id}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium" style={{ color: 'var(--text-body)' }}>{r.name}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{r.stops} stops / ETA {r.eta} / {r.driver}</p>
                </div>
                <Badge label={r.status} color={ROUTE_COLOR[r.status]} />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Fleet Status" action="View all fleet">
          <div className="divide-y" style={{ borderColor: 'var(--surface-border)' }}>
            {FLEET.map((f) => (
              <div key={f.unit} className="flex items-center gap-3 px-5 py-3"
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-elevated)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)' }}>
                  <svg className="h-4 w-4" style={{ color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-body)' }}>{f.unit}</p>
                  <p className="truncate text-[10px]" style={{ color: 'var(--text-faint)' }}>{f.location}{f.driver !== '-' ? ` / ${f.driver}` : ''}</p>
                </div>
                <Badge label={f.status} color={FLEET_COLOR[f.status]} />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 px-5 py-3 text-xs" style={{ borderTop: '1px solid var(--surface-border)', color: 'var(--text-faint)' }}>
            <span><strong style={{ color: '#10b981' }}>14</strong> Available</span>
            <span><strong style={{ color: 'var(--brand)' }}>28</strong> In Route</span>
            <span><strong style={{ color: '#f59e0b' }}>6</strong> At Stop</span>
            <span><strong style={{ color: '#9ca3af' }}>4</strong> Maintenance</span>
          </div>
        </Section>

        <Section title="Recent Exceptions / Alerts" action="View all alerts">
          <div className="divide-y" style={{ borderColor: 'var(--surface-border)' }}>
            {ALERTS.map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3"
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-elevated)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
              >
                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ background: a.color === 'red' ? 'rgba(239,68,68,0.14)' : a.color === 'amber' ? 'rgba(245,158,11,0.14)' : a.color === 'blue' ? 'rgba(59,130,246,0.14)' : 'rgba(107,114,128,0.14)' }}>
                  <svg className="h-3 w-3"
                    style={{ color: a.color === 'red' ? '#ef4444' : a.color === 'amber' ? '#f59e0b' : a.color === 'blue' ? '#3b82f6' : '#9ca3af' }}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium" style={{ color: 'var(--text-body)' }}>{a.title}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{a.desc}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge label={a.type} color={a.color} />
                    <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>Impact: {a.impact}</span>
                    <span className="ml-auto text-[10px]" style={{ color: 'var(--text-faint)' }}>{a.mins} min ago</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
"""

import os
target = '/Users/alexwaldmann/Desktop/Moore Tires/apps/dashboard/src/pages/Dashboard.tsx'
with open(target, 'w') as f:
    f.write(content)
print('OK', os.path.getsize(target), 'bytes')
