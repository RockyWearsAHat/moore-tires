import { useEffect, useState } from 'react';
import type { ServiceType, TimeWindow } from '@moore-tires/shared';

interface ServiceRequest {
  id: string;
  fullName: string;
  phone: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  serviceType: ServiceType;
  preferredDate: string;
  preferredTimeWindow: TimeWindow;
  isMobileService: boolean;
  notes?: string;
  createdAt: string;
}

export function InboxPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      const res = await fetch('/api/v1/service-requests?status=PENDING');
      if (!res.ok) return;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data } = await res.json();
      setRequests(data as ServiceRequest[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const scheduleRequest = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceRequestId: id }),
      });
      if (res.ok) setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // Error handling
    }
  };

  const dismissRequest = async (id: string) => {
    try {
      // Mark the service request as cancelled
      await fetch(`/api/v1/service-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      // Error handling
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between border-b border-surface-border bg-[#0D0F14] px-6 py-4">
        <div>
          <h1 className="font-display font-bold text-xl uppercase tracking-wider text-gray-100">Inbox</h1>
          <p className="text-xs text-gray-500">Pending service requests</p>
        </div>
        <span className="rounded bg-brand-500/10 px-2 py-1 text-xs font-semibold text-brand-400">
          {requests.length} pending
        </span>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <p className="text-sm text-gray-600">Loading…</p>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-gray-600">
            <span className="text-4xl mb-4" aria-hidden="true">✓</span>
            <p className="text-sm">Inbox is clear.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {requests.map((req) => (
              <div key={req.id} className="card flex flex-col gap-3 p-4 hover:border-brand-500/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-100">{req.fullName}</p>
                    <p className="text-xs text-gray-500">{req.phone}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">
                      {new Date(req.preferredDate).toLocaleDateString()} · {req.preferredTimeWindow.replace(/_/g, ' ')}
                    </p>
                    {req.isMobileService && (
                      <span className="rounded bg-brand-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand-400">
                        MOBILE
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-300">
                  {req.vehicleYear} {req.vehicleMake} {req.vehicleModel} — {req.serviceType.replace(/_/g, ' ')}
                </p>
                {req.notes && (
                  <p className="text-xs text-gray-600 border-t border-surface-border pt-2">{req.notes}</p>
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void scheduleRequest(req.id)}
                    className="rounded bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-400 transition-colors"
                  >
                    Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => void dismissRequest(req.id)}
                    className="rounded border border-surface-border px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-gray-100 transition-colors"
                  >
                    Dismiss
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
