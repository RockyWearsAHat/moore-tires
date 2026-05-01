import { useEffect, useState } from 'react';
import { useDashboardApi } from '../hooks/useDashboardApi';

interface DistributionCenter {
  id: string;
  name: string;
  state: string;
  address: string;
  city: string;
  zip: string;
  coordinates: { lat: number; lng: number };
  isActive: boolean;
}

export function DistributionCentersPage() {
  const apiFetch = useDashboardApi();
  const [centers, setCenters] = useState<DistributionCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    state: '',
    address: '',
    city: '',
    zip: '',
    lat: '',
    lng: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiFetch('/api/v1/distribution-centers');
        if (res.ok) {
          const json = await res.json() as { data: DistributionCenter[] };
          setCenters(json.data ?? []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await apiFetch('/api/v1/distribution-centers', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          state: form.state,
          address: form.address,
          city: form.city,
          zip: form.zip,
          coordinates: {
            lat: parseFloat(form.lat),
            lng: parseFloat(form.lng),
          },
        }),
      });
      if (res.ok) {
        const json = await res.json() as { data: DistributionCenter };
        setCenters((prev) => [...prev, json.data]);
        setShowForm(false);
        setForm({ name: '', state: '', address: '', city: '', zip: '', lat: '', lng: '' });
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (center: DistributionCenter) => {
    const res = await apiFetch(`/api/v1/distribution-centers/${center.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !center.isActive }),
    });
    if (res.ok) {
      setCenters((prev) =>
        prev.map((c) =>
          c.id === center.id ? { ...c, isActive: !c.isActive } : c
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="page-header flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="font-display theme-text-strong text-xl font-bold uppercase tracking-wider">
            Distribution Centers
          </h1>
          <p className="theme-text-faint text-xs">Manage warehouses for delivery ETA calculations</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="theme-button-primary rounded px-4 py-2 text-xs font-semibold"
        >
          + Add Center
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {showForm && (
          <div className="card p-4 space-y-3">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-gray-300">
              New Distribution Center
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="theme-input rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="State (e.g. WA)"
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                className="theme-input rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="Address"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="theme-input rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="theme-input rounded px-3 py-2 text-sm"
              />
              <input
                placeholder="ZIP"
                value={form.zip}
                onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))}
                className="theme-input rounded px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <input
                  placeholder="Latitude"
                  value={form.lat}
                  onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                  className="theme-input w-1/2 rounded px-3 py-2 text-sm"
                />
                <input
                  placeholder="Longitude"
                  value={form.lng}
                  onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                  className="theme-input w-1/2 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void handleCreate()}
                disabled={saving || !form.name || !form.state}
                className="theme-button-primary rounded px-4 py-1.5 text-xs font-semibold disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="theme-button-secondary rounded px-4 py-1.5 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {centers.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-600">
            <span className="text-4xl mb-4" aria-hidden="true">🏭</span>
            <p className="text-sm">No distribution centers configured.</p>
            <p className="text-xs text-gray-700 mt-1">Add your Seattle warehouse to enable delivery ETA calculations.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {centers.map((center) => (
              <div
                key={center.id}
                className={`card p-4 transition-colors ${
                  center.isActive ? 'border-surface-border' : 'border-surface-border/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-100">
                      {center.name}
                    </h3>
                    <p className="text-xs text-gray-500">{center.city}, {center.state} {center.zip}</p>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold border ${
                      center.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-gray-500/10 text-gray-500 border-gray-500/30'
                    }`}
                  >
                    {center.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">{center.address}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-gray-500">
                    {center.coordinates.lat.toFixed(4)}, {center.coordinates.lng.toFixed(4)}
                  </span>
                  <button
                    type="button"
                    onClick={() => void toggleActive(center)}
                    className="rounded border border-surface-border px-3 py-1 text-xs font-semibold text-gray-400 hover:text-gray-100 transition-colors"
                  >
                    {center.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
