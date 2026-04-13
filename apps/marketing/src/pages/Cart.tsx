import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();

  if (items.length === 0) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-onyx-900/60">
          <svg className="h-10 w-10 text-platinum-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold uppercase text-platinum-50">
          Your cart is empty
        </h2>
        <p className="mt-2 text-platinum-400">Browse our catalog to find the right tires.</p>
        <Link to="/tires" className="flame-btn mt-6">
          Shop Tires
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-platinum-50">
            Your Cart
          </h1>
          <p className="mt-1 text-sm text-platinum-400">
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-platinum-500 transition hover:text-red-400"
        >
          Clear all
        </button>
      </div>

      {/* Cart items */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-5 rounded-xl border border-platinum-600/10 bg-onyx-900/40 p-5"
          >
            {/* Tire icon */}
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-onyx-950/50">
              {item.image ? (
                <img src={item.image} alt={item.tireModel} className="h-full w-full rounded-lg object-contain" />
              ) : (
                <svg className="h-10 w-10 text-platinum-600/40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth={1} />
                  <circle cx="12" cy="12" r="4" strokeWidth={1} />
                </svg>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-flame-400">
                {item.brand}
              </p>
              <h3 className="font-display text-lg font-semibold text-platinum-50 truncate">
                {item.tireModel}
              </h3>
              <p className="font-mono text-sm text-platinum-400">{item.formattedSize}</p>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-platinum-600/20 text-platinum-400 transition hover:border-flame-400/40 hover:text-platinum-200"
              >
                −
              </button>
              <span className="w-8 text-center font-medium text-platinum-50">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-platinum-600/20 text-platinum-400 transition hover:border-flame-400/40 hover:text-platinum-200"
              >
                +
              </button>
            </div>

            {/* Price */}
            <div className="w-24 text-right">
              <p className="text-lg font-bold text-platinum-50">
                ${(item.unitPrice * item.quantity).toFixed(2)}
              </p>
              <p className="text-xs text-platinum-500">${item.unitPrice.toFixed(2)} each</p>
            </div>

            {/* Remove */}
            <button
              onClick={() => removeItem(item.productId)}
              className="text-platinum-600 transition hover:text-red-400"
              aria-label="Remove item"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 rounded-xl border border-platinum-600/10 bg-onyx-900/40 p-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-platinum-400">
            <span>Subtotal</span>
            <span className="text-platinum-50">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-platinum-400">
            <span>Shipping</span>
            <span className="text-platinum-300">Calculated at checkout</span>
          </div>
          <div className="flex justify-between text-sm text-platinum-400">
            <span>Tax</span>
            <span className="text-platinum-300">Calculated at checkout</span>
          </div>
          <div className="border-t border-platinum-600/10 pt-3">
            <div className="flex justify-between">
              <span className="font-display text-lg font-bold uppercase text-platinum-50">
                Estimated Total
              </span>
              <span className="text-2xl font-bold text-platinum-50">${subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {user ? (
            <button className="flame-btn w-full">
              Proceed to Checkout
            </button>
          ) : (
            <div className="space-y-2">
              <Link to="/login" className="flame-btn block w-full text-center">
                Sign in to Checkout
              </Link>
              <p className="text-center text-xs text-platinum-500">
                or{' '}
                <Link to="/register" className="text-flame-400 hover:text-flame-500">
                  create an account
                </Link>
              </p>
            </div>
          )}
          <Link
            to="/tires"
            className="ghost-btn block w-full text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
