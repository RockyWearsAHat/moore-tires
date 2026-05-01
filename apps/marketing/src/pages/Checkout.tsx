import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useApiFetch } from '../hooks/useApi';
import { parseJson } from '../utils/http';

interface DeliveryEstimate {
  minDays: number;
  maxDays: number;
  estimatedDate: string;
  distributionCenter: string;
}

interface CheckoutResult {
  orderId: string;
  paymentIntentId: string;
  clientSecret: string;
  total: number;
}

export default function Checkout() {
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  const apiFetch = useApiFetch();
  const navigate = useNavigate();

  const [step, setStep] = useState<'shipping' | 'review' | 'confirmation'>('shipping');
  const [address, setAddress] = useState({ line1: '', city: '', state: '', zip: '' });
  const [eta, setEta] = useState<DeliveryEstimate | null>(null);
  const [loadingEta, setLoadingEta] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderResult, setOrderResult] = useState<CheckoutResult | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% estimated tax
  const shipping = subtotal > 500 ? 0 : 49.99; // Free shipping over $500
  const total = subtotal + tax + shipping;

  // Redirect if no items or not logged in
  useEffect(() => {
    if (items.length === 0 && step !== 'confirmation') {
      navigate('/cart');
    }
    if (!user) {
      navigate('/login');
    }
  }, [items, user, navigate, step]);

  const fetchEta = async () => {
    if (!/^\d{5}(-\d{4})?$/.test(address.zip)) return;
    setLoadingEta(true);
    try {
      const res = await apiFetch('/api/v1/checkout/estimate', {
        method: 'POST',
        body: JSON.stringify({ zip: address.zip }),
      });
      if (res.ok) {
        const json = await parseJson<{ data: DeliveryEstimate }>(res);
        setEta(json.data);
      }
    } finally {
      setLoadingEta(false);
    }
  };

  const handleShippingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!address.line1 || !address.city || !address.state || !address.zip) {
      setError('All address fields are required.');
      return;
    }
    setError('');
    void fetchEta();
    setStep('review');
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setError('');
    try {
      // Create the order first
      const orderRes = await apiFetch('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shippingAddress: address,
        }),
      });
      const orderJson = await parseJson<{ data?: { id: string }; message?: string }>(orderRes);

      if (!orderRes.ok) {
        throw new Error(orderJson.message ?? 'Failed to create order');
      }

      const orderId = orderJson.data?.id;
      if (!orderId) {
        throw new Error('Order response did not include an order ID');
      }

      // Process checkout/payment
      const checkoutRes = await apiFetch(`/api/v1/checkout/${orderId}`, {
        method: 'POST',
      });
      const checkoutJson = await parseJson<{ data?: CheckoutResult; message?: string }>(checkoutRes);
      if (!checkoutRes.ok) {
        throw new Error(checkoutJson.message ?? 'Payment failed');
      }

      if (!checkoutJson.data) {
        throw new Error('Checkout response did not include payment details');
      }

      setOrderResult(checkoutJson.data);
      clearCart();
      setStep('confirmation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-onyx-900 min-h-screen py-16">
      <div className="container mx-auto max-w-2xl px-6">
        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {(['shipping', 'review', 'confirmation'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  step === s
                    ? 'bg-flame-500 text-white'
                    : i < ['shipping', 'review', 'confirmation'].indexOf(step)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-onyx-700 text-gray-500'
                }`}
              >
                {i + 1}
              </span>
              <span className={`text-sm font-medium capitalize ${step === s ? 'text-white' : 'text-gray-500'}`}>
                {s}
              </span>
              {i < 2 && <span className="mx-2 h-px w-8 bg-onyx-700" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Shipping Step */}
        {step === 'shipping' && (
          <form onSubmit={handleShippingSubmit} className="space-y-6">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-white">
              Shipping Address
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Street Address"
                value={address.line1}
                onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
                className="w-full rounded border border-onyx-600 bg-onyx-800 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-flame-500 focus:outline-none"
              />
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  value={address.city}
                  onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                  className="rounded border border-onyx-600 bg-onyx-800 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-flame-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={address.state}
                  onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                  className="rounded border border-onyx-600 bg-onyx-800 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-flame-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="ZIP Code"
                  value={address.zip}
                  onChange={(e) => setAddress((a) => ({ ...a, zip: e.target.value }))}
                  className="rounded border border-onyx-600 bg-onyx-800 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-flame-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flame-btn w-full py-3 text-sm font-bold uppercase tracking-wider"
            >
              Continue to Review
            </button>
          </form>
        )}

        {/* Review Step */}
        {step === 'review' && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-white">
              Review Order
            </h2>

            {/* Items */}
            <div className="rounded border border-onyx-700 bg-onyx-800 divide-y divide-onyx-700">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {item.brand} {item.tireModel} — {item.formattedSize}
                    </p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-mono text-flame-400">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Shipping to */}
            <div className="rounded border border-onyx-700 bg-onyx-800 px-4 py-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Ship to</p>
              <p className="text-sm text-white">
                {address.line1}, {address.city}, {address.state} {address.zip}
              </p>
            </div>

            {/* Delivery Estimate */}
            {(Boolean(eta) || loadingEta) && (
              <div className="rounded border border-onyx-700 bg-onyx-800 px-4 py-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Estimated Delivery</p>
                {loadingEta ? (
                  <p className="text-sm text-gray-400">Calculating…</p>
                ) : eta ? (
                  <div>
                    <p className="text-sm font-medium text-emerald-400">
                      {eta.minDays}–{eta.maxDays} business days
                    </p>
                    <p className="text-xs text-gray-500">
                      Est. arrival by {new Date(eta.estimatedDate).toLocaleDateString()} · Ships from {eta.distributionCenter}
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {/* Totals */}
            <div className="rounded border border-onyx-700 bg-onyx-800 px-4 py-3 space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Estimated Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white border-t border-onyx-700 pt-2">
                <span>Total</span>
                <span className="text-flame-400">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep('shipping')}
                className="ghost-btn flex-1 py-3 text-sm font-bold uppercase tracking-wider"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => void handlePlaceOrder()}
                disabled={submitting}
                className="flame-btn flex-1 py-3 text-sm font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {submitting ? 'Processing…' : 'Place Order'}
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Step */}
        {step === 'confirmation' && orderResult && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-4xl">
                ✓
              </span>
            </div>
            <h2 className="font-display text-3xl font-bold uppercase tracking-wider text-white">
              Order Confirmed
            </h2>
            <p className="text-gray-400">
              Your order has been placed successfully. You&apos;ll receive a confirmation email shortly.
            </p>
            <div className="rounded border border-onyx-700 bg-onyx-800 px-4 py-3 text-left">
              <p className="text-xs text-gray-500">Order ID</p>
              <p className="font-mono text-sm text-white">{orderResult.orderId}</p>
              <p className="text-xs text-gray-500 mt-2">Total</p>
              <p className="font-mono text-sm text-flame-400">${orderResult.total.toFixed(2)}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/tires')}
              className="flame-btn px-8 py-3 text-sm font-bold uppercase tracking-wider"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
