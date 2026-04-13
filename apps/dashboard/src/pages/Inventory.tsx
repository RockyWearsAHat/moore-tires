import { useEffect, useState, useRef } from 'react';
import { useDashboardAuth } from '../context/DashboardAuthContext';
import { useDashboardApi } from '../hooks/useDashboardApi';

interface InventoryItem {
  productId: string;
  productName?: string;
  currentQuantity: number;
  reorderThreshold: number;
  targetQuantity: number;
  autoReorder: boolean;
}

interface InventoryRecord {
  id: string;
  wholesaleAccountId: string;
  items: InventoryItem[];
  lastUploadedAt?: string;
}

type StockStatus = 'CRITICAL' | 'LOW' | 'OK';

function getStatus(item: InventoryItem): StockStatus {
  if (item.currentQuantity <= 0) return 'CRITICAL';
  if (item.currentQuantity <= item.reorderThreshold) return 'LOW';
  return 'OK';
}

const statusColors: Record<StockStatus, string> = {
  CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/30',
  LOW: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  OK: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

export function InventoryPage() {
  const { user } = useDashboardAuth();
  const apiFetch = useDashboardApi();
  const [inventory, setInventory] = useState<InventoryRecord | null>(null);
  const [alerts, setAlerts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === 'admin';

  const loadData = async () => {
    try {
      const [invRes, alertRes] = await Promise.all([
        apiFetch('/api/v1/inventory'),
        apiFetch('/api/v1/inventory/alerts'),
      ]);
      if (invRes.ok) {
        const json = await invRes.json() as { data: InventoryRecord };
        setInventory(json.data);
      }
      if (alertRes.ok) {
        const json = await alertRes.json() as { data: InventoryItem[] };
        setAlerts(json.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCsvUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadMsg('');
    try {
      const text = await file.text();
      const res = await apiFetch('/api/v1/inventory/upload-csv', {
        method: 'POST',
        body: JSON.stringify({ csv: text }),
      });
      if (res.ok) {
        const json = await res.json() as { meta: { rowsParsed: number } };
        setUploadMsg(`✓ Uploaded ${json.meta.rowsParsed} items`);
        void loadData();
      } else {
        const err = await res.json() as { message?: string };
        setUploadMsg(`✗ ${err.message ?? 'Upload failed'}`);
      }
    } catch {
      setUploadMsg('✗ Network error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
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
      <header className="flex items-center justify-between border-b border-surface-border bg-[#0D0F14] px-6 py-4">
        <div>
          <h1 className="font-display font-bold text-xl uppercase tracking-wider text-gray-100">
            Inventory
          </h1>
          <p className="text-xs text-gray-500">
            {isAdmin ? 'All accounts — stock levels' : 'Your warehouse stock levels'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {alerts.length > 0 && (
            <span className="rounded bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-400">
              {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Upload Section */}
        <div className="card p-4">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-gray-300 mb-3">
            Upload Inventory CSV
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Columns: productId, currentQuantity, reorderThreshold, targetQuantity
          </p>
          <div className="flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="text-sm text-gray-400 file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-brand-500 file:text-xs file:font-semibold file:text-white file:cursor-pointer hover:file:bg-brand-400"
            />
            <button
              type="button"
              onClick={() => void handleCsvUpload()}
              disabled={uploading}
              className="rounded bg-brand-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-400 disabled:opacity-50 transition-colors"
            >
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
          {uploadMsg && (
            <p className={`mt-2 text-xs ${uploadMsg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>
              {uploadMsg}
            </p>
          )}
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="card border-red-500/30 p-4">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-red-400 mb-3">
              Low Stock Alerts
            </h2>
            <div className="space-y-2">
              {alerts.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between rounded bg-red-500/5 px-3 py-2 text-sm"
                >
                  <span className="text-gray-200">{item.productName ?? item.productId}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-red-400 font-mono text-xs">
                      {item.currentQuantity} / {item.reorderThreshold} threshold
                    </span>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold border ${statusColors[getStatus(item)]}`}>
                      {getStatus(item)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Table */}
        {inventory?.items && inventory.items.length > 0 ? (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3 text-right">On Hand</th>
                  <th className="px-4 py-3 text-right">Threshold</th>
                  <th className="px-4 py-3 text-right">Target</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Auto-Reorder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {inventory.items.map((item) => {
                  const status = getStatus(item);
                  return (
                    <tr key={item.productId} className="hover:bg-surface-card/50 transition-colors">
                      <td className="px-4 py-3 text-gray-200">
                        {item.productName ?? item.productId}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-gray-300">
                        {item.currentQuantity}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-gray-500">
                        {item.reorderThreshold}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-gray-500">
                        {item.targetQuantity}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold border ${statusColors[status]}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500">
                        {item.autoReorder ? '✓' : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center py-16 text-gray-600">
            <span className="text-4xl mb-4" aria-hidden="true">📦</span>
            <p className="text-sm">No inventory data yet. Upload a CSV to get started.</p>
          </div>
        )}

        {inventory?.lastUploadedAt && (
          <p className="text-xs text-gray-600 text-right">
            Last uploaded: {new Date(inventory.lastUploadedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
