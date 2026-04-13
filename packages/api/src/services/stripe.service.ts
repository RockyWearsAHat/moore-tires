/**
 * Stripe payment integration service.
 * Handles payment intent creation, webhook processing, and checkout.
 *
 * Stripe is initialized lazily — if STRIPE_SECRET_KEY is missing,
 * methods return mock responses for development.
 */
import type { JwtPayload } from '@moore-tires/shared';
import { Order, WholesaleAccount } from '@moore-tires/db';
import { AppError } from '../errors.js';

interface StripeClient {
  paymentIntents: {
    create: (params: Record<string, unknown>) => Promise<{ id: string; client_secret: string; status: string }>;
    retrieve: (id: string) => Promise<{ id: string; status: string; amount: number }>;
  };
  webhooks: {
    constructEvent: (body: string, sig: string, secret: string) => { type: string; data: { object: Record<string, unknown> } };
  };
}

let stripe: StripeClient | null = null;

function getStripe(): StripeClient | null {
  if (stripe) return stripe;
  const key = process.env['STRIPE_SECRET_KEY'];
  if (!key) {
    console.warn('[stripe] STRIPE_SECRET_KEY not set — payments run in dev/mock mode');
    return null;
  }
  // Dynamic import to avoid hard dep when Stripe isn't installed
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Stripe = require('stripe') as new (key: string) => StripeClient;
    stripe = new Stripe(key);
    return stripe;
  } catch {
    console.warn('[stripe] stripe package not installed — running in mock mode');
    return null;
  }
}

export interface CheckoutResult {
  orderId: string;
  paymentIntentId: string;
  clientSecret: string;
  total: number;
}

/**
 * Create a payment intent for an order.
 * For wholesale accounts with NET terms, skips Stripe and marks as invoiced.
 */
export async function createCheckoutSession(
  orderId: string,
  user: JwtPayload
): Promise<CheckoutResult> {
  const order = await Order.findById(orderId);
  if (!order) throw AppError.notFound('Order not found');

  // Verify ownership
  const customerId = order.get('customerId')?.toString();
  if (user.role !== 'admin' && customerId !== user.userId) {
    throw AppError.forbidden('Not your order');
  }

  const total = order.get('total') as number;
  if (!total || total <= 0) throw AppError.badRequest('Order total must be positive');

  // Check if wholesale account has NET payment terms (invoice, no Stripe)
  if (user.wholesaleAccountId) {
    const account = await WholesaleAccount.findById(user.wholesaleAccountId).lean();
    if (account && ['NET_15', 'NET_30'].includes(account.paymentTerms as string)) {
      order.set('status', 'CONFIRMED');
      order.set('paymentMethod', 'INVOICE');
      await order.save();

      return {
        orderId: order.id as string,
        paymentIntentId: `inv_${order.id}`,
        clientSecret: '',
        total,
      };
    }
  }

  const client = getStripe();

  if (!client) {
    // Mock mode for development
    const mockId = `pi_mock_${Date.now()}`;
    order.set('status', 'CONFIRMED');
    order.set('stripePaymentIntentId', mockId);
    await order.save();

    return {
      orderId: order.id as string,
      paymentIntentId: mockId,
      clientSecret: `${mockId}_secret_mock`,
      total,
    };
  }

  // Real Stripe payment intent
  const intent = await client.paymentIntents.create({
    amount: Math.round(total * 100), // cents
    currency: 'usd',
    metadata: {
      orderId: order.id as string,
      userId: user.userId,
    },
  });

  order.set('stripePaymentIntentId', intent.id);
  await order.save();

  return {
    orderId: order.id as string,
    paymentIntentId: intent.id,
    clientSecret: intent.client_secret,
    total,
  };
}

/**
 * Process Stripe webhook events.
 * Validates the webhook signature and updates order status.
 */
export async function handleStripeWebhook(
  rawBody: string,
  signature: string
): Promise<void> {
  const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];
  const client = getStripe();

  if (!client || !webhookSecret) {
    console.warn('[stripe] Webhook received but Stripe not configured');
    return;
  }

  const event = client.webhooks.constructEvent(rawBody, signature, webhookSecret);

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as { metadata?: { orderId?: string } };
      if (pi.metadata?.orderId) {
        await Order.findByIdAndUpdate(pi.metadata.orderId, {
          status: 'CONFIRMED',
          paymentMethod: 'CARD',
        });
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as { metadata?: { orderId?: string } };
      if (pi.metadata?.orderId) {
        await Order.findByIdAndUpdate(pi.metadata.orderId, {
          status: 'CANCELLED',
        });
      }
      break;
    }
    default:
      break;
  }
}
