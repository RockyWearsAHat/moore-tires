import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { apiFetch } from '../hooks/useApi';
import type { TireType } from '@moore-tires/shared';
import { parseJson, type ApiResponse } from '../utils/http';

interface TireProduct {
  id: string;
  brand: string;
  tireModel: string;
  formattedSize: string;
  type: TireType;
  baseRetailPrice: number;
  images: string[];
  loadIndex: string;
  speedRating: string;
  plyRating?: number;
}

interface SearchResult {
  items: TireProduct[];
  total: number;
  page: number;
  totalPages: number;
}

const TIRE_TYPES: { value: TireType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'ALL_SEASON', label: 'All Season' },
  { value: 'ALL_TERRAIN', label: 'All Terrain' },
  { value: 'HIGHWAY', label: 'Highway' },
  { value: 'MUD_TERRAIN', label: 'Mud Terrain' },
  { value: 'WINTER', label: 'Winter' },
];

const COMMON_SIZES = [
  '11R24.5',
  '11R22.5',
  'LP 24.5',
  'LP 22.5',
  '445/50R22.5',
  '10.00-20',
  '255/70R22.5',
  '225/70R19.5',
  '295/75R22.5',
];

export default function Tires() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  const typeValue = searchParams.get('type');
  const typeFilter = (typeValue ?? '') as TireType | '';
  const sizeFilter = searchParams.get('size') ?? '';
  const searchQuery = searchParams.get('search') ?? '';
  const parsedPage = Number(searchParams.get('page') ?? '1');
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter) params.set('type', typeFilter);
    if (sizeFilter) params.set('size', sizeFilter);
    if (searchQuery) params.set('search', searchQuery);
    params.set('page', String(page));
    params.set('limit', '12');

    try {
      const res = await apiFetch(`/api/v1/products?${params.toString()}`);
      const json = await parseJson<ApiResponse<SearchResult>>(res);
      if (json.success) setResults(json.data);
    } catch {
      // Network error
    } finally {
      setLoading(false);
    }
  }, [typeFilter, sizeFilter, searchQuery, page]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <p className="section-label">Tire Catalog</p>
        <h1 className="display-lg mt-2 text-platinum-50">Shop Tires</h1>
        <p className="body-lg mx-auto mt-4 max-w-2xl text-platinum-400">
          Browse our full selection of commercial, passenger, and specialty tires.
          Wholesale customers — sign in for your negotiated pricing.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Type tabs */}
        <div className="flex flex-wrap gap-2">
          {TIRE_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilter('type', t.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                typeFilter === t.value
                  ? 'bg-flame-500 text-white'
                  : 'border border-platinum-600/20 text-platinum-400 hover:border-flame-400/40 hover:text-platinum-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Size quick-select + search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {COMMON_SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setFilter('size', sizeFilter === s ? '' : s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-mono transition ${
                  sizeFilter === s
                    ? 'bg-flame-500/20 text-flame-400 ring-1 ring-flame-500/40'
                    : 'bg-onyx-900/60 text-platinum-400 hover:text-platinum-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="ml-auto">
            <input
              type="search"
              placeholder="Search brand or model…"
              value={searchQuery}
              onChange={(e) => setFilter('search', e.target.value)}
              className="w-56 rounded-lg border border-platinum-600/20 bg-onyx-950 px-3 py-2 text-sm text-platinum-50 placeholder-platinum-600 outline-none transition focus:border-flame-400 focus:ring-1 focus:ring-flame-400"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-flame-400 border-t-transparent" />
        </div>
      ) : !results || results.items.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-onyx-900/60">
            <svg className="h-8 w-8 text-platinum-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="font-display text-lg font-semibold text-platinum-200">No tires found</h3>
          <p className="mt-1 text-sm text-platinum-400">
            Try adjusting your filters or search term.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-platinum-400">
            {results.total} tire{results.total !== 1 ? 's' : ''} found
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.items.map((product) => (
              <div
                key={product.id}
                className="group rounded-xl border border-platinum-600/10 bg-onyx-900/40 p-5 transition hover:border-flame-400/30 hover:bg-onyx-900/60"
              >
                {/* Image placeholder */}
                <div className="mb-4 flex h-40 items-center justify-center rounded-lg bg-onyx-950/50">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={`${product.brand} ${product.tireModel}`}
                      className="h-full w-full rounded-lg object-contain"
                    />
                  ) : (
                    <svg className="h-16 w-16 text-platinum-600/40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth={1} />
                      <circle cx="12" cy="12" r="4" strokeWidth={1} />
                      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeWidth={1} />
                    </svg>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-flame-400">
                    {product.brand}
                  </p>
                  <h3 className="font-display text-lg font-semibold text-platinum-50">
                    {product.tireModel}
                  </h3>
                  <p className="font-mono text-sm text-platinum-400">{product.formattedSize}</p>
                </div>

                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold text-platinum-50">
                      ${product.baseRetailPrice.toFixed(2)}
                    </span>
                    <span className="ml-1 text-xs text-platinum-500">retail</span>
                  </div>
                  <button
                    onClick={() => {
                      addItem({
                        productId: product.id,
                        brand: product.brand,
                        tireModel: product.tireModel,
                        formattedSize: product.formattedSize,
                        unitPrice: product.baseRetailPrice,
                        image: product.images[0],
                      });
                    }}
                    className="rounded-lg bg-flame-500 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-flame-600 active:scale-95"
                  >
                    Add to Cart
                  </button>
                </div>

                {/* Specs row */}
                <div className="mt-3 flex gap-3 border-t border-platinum-600/10 pt-3">
                  {product.loadIndex && (
                    <span className="text-xs text-platinum-500">Load: {product.loadIndex}</span>
                  )}
                  {product.speedRating && (
                    <span className="text-xs text-platinum-500">Speed: {product.speedRating}</span>
                  )}
                  {product.plyRating && (
                    <span className="text-xs text-platinum-500">{product.plyRating}-ply</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {results.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {Array.from({ length: results.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilter('page', String(p))}
                  className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
                    p === results.page
                      ? 'bg-flame-500 text-white'
                      : 'text-platinum-400 hover:bg-onyx-900/60 hover:text-platinum-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
