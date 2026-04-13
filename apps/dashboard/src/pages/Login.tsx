import { useState, type FormEvent } from 'react';
import { useDashboardAuth } from '../context/DashboardAuthContext';

export function LoginPage() {
  const { login } = useDashboardAuth();
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
    <div className="flex min-h-screen items-center justify-center bg-surface-base px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center bg-brand-500 text-white text-lg font-bold font-display">
            M
          </span>
          <span className="font-display font-bold text-xl uppercase tracking-widest text-gray-100">
            Moore <span className="text-brand-500">Ops</span>
          </span>
        </div>

        <div className="card p-6">
          <h1 className="font-display text-xl font-bold uppercase tracking-wide text-gray-100">
            Admin Login
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Authorized personnel only. No public sign-up.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-surface-border bg-surface-base px-3 py-2.5 text-gray-100 placeholder-gray-600 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                placeholder="admin@mooretires.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-surface-border bg-surface-base px-3 py-2.5 text-gray-100 placeholder-gray-600 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-brand-400 disabled:opacity-50"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : null}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-gray-600">
          Access is by invitation only. Contact your administrator.
        </p>
      </div>
    </div>
  );
}
