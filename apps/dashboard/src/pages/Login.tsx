import { useState, type FormEvent } from 'react';
import { useDashboardAuth } from '../context/DashboardAuthContext';

export function LoginPage() {
  const { login } = useDashboardAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('dashboard-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return document.documentElement.dataset['theme'] === 'dark' ? 'dark' : 'light';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-base px-4 py-8">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section
          className="rounded-2xl p-8 lg:p-10"
          style={{
            background: 'linear-gradient(160deg, rgba(7,27,61,0.95) 0%, rgba(10,31,75,0.9) 100%)',
            border: '1px solid rgba(122,173,255,0.24)',
            boxShadow: '0 24px 56px rgba(4, 12, 28, 0.35)',
          }}
        >
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200/70">Moore Tire</p>
              <h1 className="mt-2 text-3xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Internal Ops Portal
              </h1>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = theme === 'dark' ? 'light' : 'dark';
                setTheme(next);
                document.documentElement.dataset['theme'] = next;
                localStorage.setItem('dashboard-theme', next);
              }}
              className="theme-button-secondary rounded-lg px-3 py-1.5 text-xs font-semibold"
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>

          <p className="max-w-md text-sm leading-relaxed text-blue-100/80">
            Dispatch, sourcing, route planning, and fulfillment monitoring for authorized Moore Tire team members.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              { label: 'Orders Awaiting Dispatch', value: '26' },
              { label: 'Deliveries In Progress', value: '38' },
              { label: 'Urgent Stockouts', value: '9' },
              { label: 'Available Fleet', value: '14 / 52' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl px-4 py-3"
                style={{ border: '1px solid rgba(157, 199, 255, 0.24)', background: 'rgba(255,255,255,0.06)' }}
              >
                <p className="text-[11px] text-blue-100/70">{item.label}</p>
                <p className="mt-1 text-xl font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full rounded-2xl card p-6 lg:p-8">
          <div className="mb-6 flex items-center justify-center">
            <img
              src={theme === 'light' ? '/moore-tire-lockup-internal-dark.svg' : '/moore-tire-lockup-internal-light.svg'}
              alt="Moore Tire Internal Ops Portal"
              className="h-14 w-auto"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/moore-tire-lockup-internal-light.svg';
              }}
            />
          </div>

          <h2 className="font-display theme-text-strong text-xl font-bold uppercase tracking-wide">
            Admin Login
          </h2>
          <p className="theme-text-faint mt-1 text-sm">
            Authorized personnel only. No public sign-up.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="theme-text-muted block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="theme-input mt-1 block w-full rounded-lg px-3 py-2.5"
                placeholder="admin@mooretires.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="theme-text-muted block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="theme-input mt-1 block w-full rounded-lg px-3 py-2.5"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="theme-button-primary flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : null}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="theme-text-faint mt-4 text-center text-xs">
            Access is by invitation only. Contact your administrator.
          </p>
        </section>
      </div>
    </div>
  );
}
