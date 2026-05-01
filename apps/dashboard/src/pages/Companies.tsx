import { useState, useEffect } from 'react';
import { useDashboardApi } from '../hooks/useDashboardApi';
import { parseJson, type ApiResponse } from '../utils/http';

interface Account {
  id: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  paymentTerms: string;
  isActive: boolean;
}

const DEMO_ACCOUNTS: Account[] = [
  { id: 'c1', companyName: 'Acme Logistics',     contactEmail: 'john@acme.com',    contactPhone: '(512) 555-0100', paymentTerms: 'NET_30', isActive: true },
  { id: 'c2', companyName: 'Sunrise Fleet Co.',  contactEmail: 'sara@sunrise.com', contactPhone: '(512) 555-0101', paymentTerms: 'NET_15', isActive: true },
  { id: 'c3', companyName: 'BuildRight Inc.',    contactEmail: 'tom@buildright.com',contactPhone: '(512) 555-0102', paymentTerms: 'NET_30', isActive: true },
  { id: 'c4', companyName: 'Metro Deliveries',  contactEmail: 'rita@metro.com',   contactPhone: '(512) 555-0103', paymentTerms: 'NET_60', isActive: false },
  { id: 'c5', companyName: 'Pinnacle Transport', contactEmail: 'jay@pinnacle.com', contactPhone: '(512) 555-0104', paymentTerms: 'NET_30', isActive: true },
  { id: 'c6', companyName: 'Canyon Rock LLC',   contactEmail: 'rex@canyon.com',  contactPhone: '(512) 555-0105', paymentTerms: 'NET_45', isActive: true },
];

export function CompaniesPage() {
  const apiFetch = useDashboardApi();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    void loadAccounts();
  }, []);

  async function loadAccounts() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/auth/accounts');
      const json = await parseJson<ApiResponse<Account[]>>(res);
      if (json.success) setAccounts(json.data);
    } catch {
      setAccounts(DEMO_ACCOUNTS);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display theme-text-strong text-2xl font-bold uppercase tracking-wide">
          Companies
        </h1>
        <p className="theme-text-faint text-sm">
          Wholesale accounts and their payment terms.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : (
        <>
          {isDemo && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-400">
              <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
              API offline — showing demo data
            </div>
          )}
          {accounts.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-gray-500">No wholesale accounts yet.</p>
            </div>
          ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => (
            <div key={a.id} className="card p-5">
              <div className="flex items-start justify-between">
                <h3 className="font-display theme-text-strong text-lg font-semibold">
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
              <div className="theme-text-muted mt-3 space-y-1.5 text-sm">
                <p>{a.contactEmail}</p>
                <p>{a.contactPhone}</p>
                <p>
                  Terms:{' '}
                  <span className="theme-text-body font-medium">
                    {a.paymentTerms.replace(/_/g, ' ')}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}
    </div>
  );
}
