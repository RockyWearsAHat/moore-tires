import { useState, useEffect } from 'react';
import { useDashboardApi } from '../hooks/useDashboardApi';
import { parseJson, type ApiResponse } from '../utils/http';

interface Order {
  id: string;
  status: string;
  subtotal: number;
  total: number;
  createdAt: string;
  customerId?: { firstName: string; lastName: string; email: string };
  items: { productId: string; quantity: number; unitPrice: number }[];
}

const DEMO_ORDERS: Order[] = [
  { id: 'ord-001', status: 'SUBMITTED',  subtotal: 6589.00, total: 7132.59, createdAt: new Date(Date.now() - 3600000).toISOString(),  items: [{ productId: 'p1', quantity: 6, unitPrice: 412.35 }, { productId: 'p2', quantity: 4, unitPrice: 448.60 }, { productId: 'p3', quantity: 6, unitPrice: 386.75 }], customerId: { firstName: 'John', lastName: 'Mills', email: 'john@acme.com' } },
  { id: 'ord-002', status: 'PROCESSING', subtotal: 2474.10, total: 2649.59, createdAt: new Date(Date.now() - 7200000).toISOString(),  items: [{ productId: 'p1', quantity: 6, unitPrice: 412.35 }], customerId: { firstName: 'Sara', lastName: 'Lowe', email: 'sara@sunrise.com' } },
  { id: 'ord-003', status: 'SHIPPED',    subtotal: 1794.40, total: 1920.01, createdAt: new Date(Date.now() - 86400000).toISOString(), items: [{ productId: 'p2', quantity: 4, unitPrice: 448.60 }], customerId: { firstName: 'Tom', lastName: 'Evans', email: 'tom@buildright.com' } },
  { id: 'ord-004', status: 'DELIVERED',  subtotal: 4330.50, total: 4634.64, createdAt: new Date(Date.now() - 172800000).toISOString(),items: [{ productId: 'p1', quantity: 4, unitPrice: 412.35 }, { productId: 'p3', quantity: 4, unitPrice: 669.63 }], customerId: { firstName: 'Rita', lastName: 'Park', email: 'rita@metro.com' } },
  { id: 'ord-005', status: 'CONFIRMED',  subtotal: 3090.00, total: 3308.30, createdAt: new Date(Date.now() - 43200000).toISOString(), items: [{ productId: 'p2', quantity: 5, unitPrice: 618.00 }], customerId: { firstName: 'Jay', lastName: 'Cole', email: 'jay@pinnacle.com' } },
];

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadOrders();
  }, [statusFilter]);

  async function loadOrders() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const res = await apiFetch(`/api/v1/orders?${params.toString()}`);
      const json = await parseJson<ApiResponse<{ items?: Order[] } | Order[]>>(res);
      if (json.success) {
        const orderData = json.data;
        setOrders(Array.isArray(orderData) ? orderData : (orderData.items ?? []));
      }
    } catch {
      setOrders(DEMO_ORDERS);
      setError('demo');
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
      void loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status.');
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display theme-text-strong text-2xl font-bold uppercase tracking-wide">
            Orders
          </h1>
          <p className="theme-text-faint text-sm">{orders.length} orders</p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="theme-input rounded-lg px-3 py-2 text-sm"
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
      ) : (
        <>
          {error === 'demo' && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-400">
              <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
              API offline — showing demo data
            </div>
          )}
          {error && error !== 'demo' && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
              <button type="button" onClick={() => void loadOrders()} className="ml-4 underline hover:no-underline">Retry</button>
            </div>
          )}
          {orders.length === 0 ? (
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
                    <span className="font-mono theme-text-body text-sm">
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[order.status] ?? 'bg-gray-500/10 text-gray-500'}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="theme-text-muted mt-1 text-sm">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''} ·{' '}
                    <span className="theme-text-strong font-medium">${order.total.toFixed(2)}</span>
                    {' · '}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        void updateStatus(order.id, e.target.value);
                      }
                    }}
                    className="theme-input rounded-lg px-2 py-1.5 text-xs"
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
        </>
      )}
    </div>
  );
}
