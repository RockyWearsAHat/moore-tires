import { useState, useEffect } from 'react';
import { useDashboardApi } from '../hooks/useDashboardApi';

interface Order {
  id: string;
  status: string;
  subtotal: number;
  total: number;
  createdAt: string;
  customerId?: { firstName: string; lastName: string; email: string };
  items: { productId: string; quantity: number; unitPrice: number }[];
}

const STATUS_CLASSES: Record<string, string> = {
  SUBMITTED: 'bg-blue-500/10 text-blue-400',
  CONFIRMED: 'bg-indigo-500/10 text-indigo-400',
  PROCESSING: 'bg-violet-500/10 text-violet-400',
  SHIPPED: 'bg-amber-500/10 text-amber-400',
  DELIVERED: 'bg-emerald-500/10 text-emerald-400',
  CANCELLED: 'bg-gray-500/10 text-gray-500',
};

const STATUS_OPTIONS = ['SUBMITTED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export function OrdersPage() {
  const apiFetch = useDashboardApi();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  async function loadOrders() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const res = await apiFetch(`/api/v1/orders?${params.toString()}`);
      const json = await res.json();
      if (json.success) setOrders(json.data.items ?? json.data);
    } catch {
      // Network error
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId: string, status: string) {
    try {
      await apiFetch(`/api/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      loadOrders();
    } catch {
      // Error
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-gray-100">
            Orders
          </h1>
          <p className="text-sm text-gray-500">{orders.length} orders</p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-surface-border bg-surface-base px-3 py-2 text-sm text-gray-300 outline-none focus:border-brand-500"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="card p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-gray-300">
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[order.status] ?? 'bg-gray-500/10 text-gray-500'}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-400">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''} ·{' '}
                    <span className="font-medium text-gray-200">${order.total.toFixed(2)}</span>
                    {' · '}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) updateStatus(order.id, e.target.value);
                    }}
                    className="rounded-lg border border-surface-border bg-surface-elevated px-2 py-1.5 text-xs text-gray-300 outline-none focus:border-brand-500"
                  >
                    <option value="">Update Status</option>
                    {STATUS_OPTIONS.filter((s) => s !== order.status).map((s) => (
                      <option key={s} value={s}>
                        → {s.charAt(0) + s.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
