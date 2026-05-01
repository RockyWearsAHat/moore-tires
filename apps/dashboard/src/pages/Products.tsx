import { useState, useEffect } from 'react';
import { useDashboardApi } from '../hooks/useDashboardApi';
import { parseJson, type ApiResponse } from '../utils/http';

interface Product {
  id: string;
  brand: string;
  tireModel: string;
  formattedSize: string;
  type: string;
  baseRetailPrice: number;
  isActive: boolean;
}

const DEMO_PRODUCTS: Product[] = [
  { id: 'p1', brand: 'Michelin', tireModel: 'G622 RSD',  formattedSize: '10R22.5', type: 'COMMERCIAL', baseRetailPrice: 412.35, isActive: true },
  { id: 'p2', brand: 'Michelin', tireModel: 'G622 LHD',  formattedSize: '11R24.5', type: 'COMMERCIAL', baseRetailPrice: 448.60, isActive: true },
  { id: 'p3', brand: 'Goodyear', tireModel: 'G283A',     formattedSize: '11R22.5', type: 'COMMERCIAL', baseRetailPrice: 389.00, isActive: true },
  { id: 'p4', brand: 'Goodyear', tireModel: 'G159',      formattedSize: '315/80R22.5', type: 'COMMERCIAL', baseRetailPrice: 386.75, isActive: true },
  { id: 'p5', brand: 'Bridgestone', tireModel: 'R250',   formattedSize: '11R24.5', type: 'COMMERCIAL', baseRetailPrice: 421.00, isActive: false },
  { id: 'p6', brand: 'Continental', tireModel: 'HSR2+',  formattedSize: '275/70R22.5', type: 'COMMERCIAL', baseRetailPrice: 498.50, isActive: true },
  { id: 'p7', brand: 'Michelin', tireModel: 'X Line Energy Z', formattedSize: '295/75R22.5', type: 'COMMERCIAL', baseRetailPrice: 465.00, isActive: true },
  { id: 'p8', brand: 'Hankook', tireModel: 'AH12',       formattedSize: '11R22.5', type: 'COMMERCIAL', baseRetailPrice: 298.00, isActive: true },
];

export function ProductsPage() {
  const apiFetch = useDashboardApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    void loadProducts();
  }, [search]);

  async function loadProducts() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('search', search);
      const res = await apiFetch(`/api/v1/products?${params.toString()}`);
      const json = await parseJson<ApiResponse<{ items?: Product[] } | Product[]>>(res);
      if (json.success) {
        const productData = json.data;
        setProducts(Array.isArray(productData) ? productData : (productData.items ?? []));
      }
    } catch {
      setProducts(DEMO_PRODUCTS);
      setIsDemo(true);
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
      void loadProducts();
    } catch {
      // Error
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display theme-text-strong text-2xl font-bold uppercase tracking-wide">
            Products
          </h1>
          <p className="theme-text-faint text-sm">{products.length} tires</p>
        </div>

        <input
          type="search"
          placeholder="Search brand or model…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="theme-input w-56 rounded-lg px-3 py-2 text-sm"
        />
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
          {products.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-gray-500">No products found.</p>
            </div>
          ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-left">
                <th className="theme-text-faint px-3 py-3 font-medium">Brand</th>
                <th className="theme-text-faint px-3 py-3 font-medium">Model</th>
                <th className="theme-text-faint px-3 py-3 font-medium">Size</th>
                <th className="theme-text-faint px-3 py-3 font-medium">Type</th>
                <th className="theme-text-faint px-3 py-3 text-right font-medium">Retail Price</th>
                <th className="theme-text-faint px-3 py-3 text-center font-medium">Status</th>
                <th className="theme-text-faint px-3 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-surface-border/50 hover:bg-surface-elevated/50">
                  <td className="theme-text-body px-3 py-3">{p.brand}</td>
                  <td className="theme-text-body px-3 py-3">{p.tireModel}</td>
                  <td className="theme-text-muted px-3 py-3 font-mono text-xs">{p.formattedSize}</td>
                  <td className="px-3 py-3">
                    <span className="theme-text-muted inline-flex rounded-full bg-surface-elevated px-2 py-0.5 text-xs">
                      {p.type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="theme-text-strong px-3 py-3 text-right font-medium">
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
                      onClick={() => {
                        void toggleActive(p.id, p.isActive);
                      }}
                      className="theme-text-muted text-xs transition hover:text-brand-400"
                    >
                      {p.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>          )}
        </>      )}
    </div>
  );
}
