import { useState, useEffect } from 'react';
import { useDashboardApi } from '../hooks/useDashboardApi';

interface Account {
  id: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  paymentTerms: string;
  isActive: boolean;
}

export function CompaniesPage() {
  const apiFetch = useDashboardApi();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/auth/accounts');
      const json = await res.json();
      if (json.success) setAccounts(json.data);
    } catch {
      // Network error
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-gray-100">
          Companies
        </h1>
        <p className="text-sm text-gray-500">
          Wholesale accounts and their payment terms.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No wholesale accounts yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => (
            <div key={a.id} className="card p-5">
              <div className="flex items-start justify-between">
                <h3 className="font-display text-lg font-semibold text-gray-100">
                  {a.companyName}
                </h3>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    a.isActive
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-gray-500/10 text-gray-500'
                  }`}
                >
                  {a.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-3 space-y-1.5 text-sm text-gray-400">
                <p>{a.contactEmail}</p>
                <p>{a.contactPhone}</p>
                <p>
                  Terms:{' '}
                  <span className="font-medium text-gray-300">
                    {a.paymentTerms.replace(/_/g, ' ')}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
