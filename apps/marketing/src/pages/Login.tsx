import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
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
      navigate('/tires');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-platinum-600/10 bg-onyx-900/60 p-8 backdrop-blur-sm">
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-platinum-50">
            Sign In
          </h1>
          <p className="mt-2 text-sm text-platinum-400">
            Access your account, orders, and wholesale pricing.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-platinum-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-platinum-600/20 bg-onyx-950 px-4 py-2.5 text-platinum-50 placeholder-platinum-600 outline-none transition focus:border-flame-400 focus:ring-1 focus:ring-flame-400"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-platinum-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-platinum-600/20 bg-onyx-950 px-4 py-2.5 text-platinum-50 placeholder-platinum-600 outline-none transition focus:border-flame-400 focus:ring-1 focus:ring-flame-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flame-btn w-full disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-platinum-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-flame-400 hover:text-flame-500 transition">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
