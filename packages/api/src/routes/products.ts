import { Router } from 'express';
import {
  CreateTireProductSchema,
  TireProductSearchSchema,
  CreatePricingTierSchema,
  CreatePriceOverrideSchema,
} from '@moore-tires/shared';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createProduct,
  updateProduct,
  getProductById,
  searchProducts,
  softDeleteProduct,
  createPricingTier,
  listPricingTiers,
  updatePricingTier,
  createPriceOverride,
  listPriceOverrides,
  getEffectivePrice,
} from '../services/product.service.js';
import { AppError } from '../errors.js';

export const productsRouter: Router = Router();

// ─── Public product browsing ──────────────────────────────────────────────────

productsRouter.get('/', async (req, res, next) => {
  try {
    const result = TireProductSearchSchema.safeParse(req.query);
    if (!result.success) {
      throw AppError.badRequest('Invalid search parameters', result.error.flatten());
    }
    const data = await searchProducts(result.data);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});



// ─── Admin product management ─────────────────────────────────────────────────

productsRouter.post('/', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const result = CreateTireProductSchema.safeParse(req.body);
    if (!result.success) {
      throw AppError.badRequest('Validation failed', result.error.flatten());
    }
    const data = await createProduct(result.data);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

productsRouter.patch('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const data = await updateProduct(String(req.params['id'] ?? ''), req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

productsRouter.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const data = await softDeleteProduct(String(req.params['id'] ?? ''));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// ─── Pricing tiers (admin) ───────────────────────────────────────────────────

productsRouter.get('/pricing/tiers', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try {
    const data = await listPricingTiers();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

productsRouter.post('/pricing/tiers', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const result = CreatePricingTierSchema.safeParse(req.body);
    if (!result.success) {
      throw AppError.badRequest('Validation failed', result.error.flatten());
    }
    const data = await createPricingTier(result.data);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

productsRouter.patch(
  '/pricing/tiers/:id',
  requireAuth,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const data = await updatePricingTier(String(req.params['id'] ?? ''), req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
);

productsRouter.get(
  '/pricing/overrides/:tierId',
  requireAuth,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const data = await listPriceOverrides(String(req.params['tierId'] ?? ''));
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
);

productsRouter.post(
  '/pricing/overrides',
  requireAuth,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const result = CreatePriceOverrideSchema.safeParse(req.body);
      if (!result.success) {
        throw AppError.badRequest('Validation failed', result.error.flatten());
      }
      const data = await createPriceOverride(result.data);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
);

productsRouter.get('/:id', async (req, res, next) => {
  try {
    const data = await getProductById(String(req.params['id'] ?? ''));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/** Get the effective price for a product (retail or wholesale tier). */
productsRouter.get('/:id/price', async (req, res, next) => {
  try {
    // Optional auth — wholesale users get tier pricing, anonymous get retail
    let user;
    try {
      const authHeader = req.headers['authorization'];
      if (authHeader?.startsWith('Bearer ')) {
        const jwt = await import('jsonwebtoken');
        const secret = process.env['JWT_SECRET'];
        if (secret) {
          user = jwt.default.verify(authHeader.slice(7), secret) as import('@moore-tires/shared').JwtPayload;
        }
      }
    } catch {
      // Invalid token → treat as anonymous
    }
    const data = await getEffectivePrice(String(req.params['id'] ?? ''), user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});
