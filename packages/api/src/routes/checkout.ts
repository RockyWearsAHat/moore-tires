import { Router } from 'express';
import { DeliveryEstimateRequestSchema } from '@moore-tires/shared';
import { requireAuth, getAuthUser } from '../middleware/auth.js';
import { createCheckoutSession, handleStripeWebhook } from '../services/stripe.service.js';
import { calculateDeliveryEstimate, calculateStoreEta } from '../services/eta.service.js';
import { AppError } from '../errors.js';

export const checkoutRouter: Router = Router();

/**
 * POST /api/v1/checkout/:orderId
 * Auth: logged-in user — initiate payment for an order.
 */
checkoutRouter.post('/:orderId', requireAuth, async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const result = await createCheckoutSession(
      String(req.params['orderId'] ?? ''),
      user
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/checkout/webhook
 * Stripe webhook endpoint — no auth (signature-validated internally).
 */
checkoutRouter.post(
  '/webhook',
  // Express raw body is needed for Stripe signature validation
  async (req, res, next) => {
    try {
      const sig = req.headers['stripe-signature'];
      if (!sig || typeof sig !== 'string') {
        throw AppError.badRequest('Missing stripe-signature header');
      }
      await handleStripeWebhook(JSON.stringify(req.body), sig);
      res.json({ received: true });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/v1/checkout/estimate
 * Public — get delivery estimate for a ZIP code.
 */
checkoutRouter.post('/estimate', async (req, res, next) => {
  try {
    const result = DeliveryEstimateRequestSchema.safeParse(req.body);
    if (!result.success) {
      throw AppError.badRequest('Validation failed', result.error.flatten());
    }
    const estimate = await calculateDeliveryEstimate(result.data.zip);
    res.json({ success: true, data: estimate });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/checkout/estimate/store/:storeId
 * Auth: logged-in user — get delivery estimate for a store location.
 */
checkoutRouter.get(
  '/estimate/store/:storeId',
  requireAuth,
  async (req, res, next) => {
    try {
      const estimate = await calculateStoreEta(
        String(req.params['storeId'] ?? '')
      );
      res.json({ success: true, data: estimate });
    } catch (err) {
      next(err);
    }
  }
);
