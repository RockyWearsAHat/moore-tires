import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      navigate('/tires');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'mt-1.5 block w-full rounded-lg border border-platinum-600/20 bg-onyx-950 px-4 py-2.5 text-platinum-50 placeholder-platinum-600 outline-none transition focus:border-flame-400 focus:ring-1 focus:ring-flame-400';

  return (
    <section className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-platinum-600/10 bg-onyx-900/60 p-8 backdrop-blur-sm">
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-platinum-50">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-platinum-400">
            Sign up to browse tires, track orders, and access pricing.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-platinum-300">
                  First Name
                </label>
                <input
                  id="firstName"
                  required
                  value={form.firstName}
                  onChange={(e) => update('firstName', e.target.value)}
                  className={inputClass}
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-platinum-300">
                  Last Name
                </label>
                <input
                  id="lastName"
                  required
                  value={form.lastName}
                  onChange={(e) => update('lastName', e.target.value)}
                  className={inputClass}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-platinum-300">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className={inputClass}
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-platinum-300">
                Phone <span className="text-platinum-600">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className={inputClass}
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-platinum-300">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                required
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                className={inputClass}
                placeholder="Min 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-platinum-300">
                Confirm Password
              </label>
              <input
                id="confirm"
                type="password"
                required
                autoComplete="new-password"
                value={form.confirm}
                onChange={(e) => update('confirm', e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flame-btn mt-2 w-full disabled:opacity-50"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-platinum-400">
            Already have an account?{' '}
            <Link to="/login" className="text-flame-400 hover:text-flame-500 transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
