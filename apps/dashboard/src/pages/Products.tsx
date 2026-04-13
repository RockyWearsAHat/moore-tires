import { useState, useEffect } from 'react';
import { useDashboardApi } from '../hooks/useDashboardApi';

interface Product {
  id: string;
  brand: string;
  tireModel: string;
  formattedSize: string;
  type: string;
  baseRetailPrice: number;
  isActive: boolean;
}

export function ProductsPage() {
  const apiFetch = useDashboardApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProducts();
  }, [search]);

  async function loadProducts() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('search', search);
      const res = await apiFetch(`/api/v1/products?${params.toString()}`);
      const json = await res.json();
      if (json.success) setProducts(json.data.items ?? json.data);
    } catch {
      // Network error
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      await apiFetch(`/api/v1/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !isActive }),
      });
      loadProducts();
    } catch {
      // Error
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-gray-100">
            Products
          </h1>
          <p className="text-sm text-gray-500">{products.length} tires</p>
        </div>

        <input
          type="search"
          placeholder="Search brand or model…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56 rounded-lg border border-surface-border bg-surface-base px-3 py-2 text-sm text-gray-300 placeholder-gray-600 outline-none focus:border-brand-500"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No products found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-left">
                <th className="px-3 py-3 font-medium text-gray-500">Brand</th>
                <th className="px-3 py-3 font-medium text-gray-500">Model</th>
                <th className="px-3 py-3 font-medium text-gray-500">Size</th>
                <th className="px-3 py-3 font-medium text-gray-500">Type</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-right">Retail Price</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-center">Status</th>
                <th className="px-3 py-3 font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-surface-border/50 hover:bg-surface-elevated/50">
                  <td className="px-3 py-3 text-gray-200">{p.brand}</td>
                  <td className="px-3 py-3 text-gray-300">{p.tireModel}</td>
                  <td className="px-3 py-3 font-mono text-xs text-gray-400">{p.formattedSize}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex rounded-full bg-surface-elevated px-2 py-0.5 text-xs text-gray-400">
                      {p.type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-medium text-gray-200">
                    ${p.baseRetailPrice.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.isActive
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-gray-500/10 text-gray-500'
                      }`}
                    >
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      onClick={() => toggleActive(p.id, p.isActive)}
                      className="text-xs text-gray-400 transition hover:text-brand-400"
                    >
                      {p.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
