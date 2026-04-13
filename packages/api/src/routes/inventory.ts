import { Router } from 'express';
import {
  InventoryUploadSchema,
  UpdateInventoryItemSchema,
} from '@moore-tires/shared';
import { requireAuth, getAuthUser } from '../middleware/auth.js';
import {
  getInventory,
  uploadInventory,
  updateInventoryItem,
  getLowStockAlerts,
} from '../services/inventory.service.js';
import { AppError } from '../errors.js';

export const inventoryRouter: Router = Router();

inventoryRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const data = await getInventory(user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

inventoryRouter.post('/upload', requireAuth, async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const result = InventoryUploadSchema.safeParse(req.body);
    if (!result.success) {
      throw AppError.badRequest('Validation failed', result.error.flatten());
    }
    const data = await uploadInventory(result.data, user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

inventoryRouter.patch('/items/:productId', requireAuth, async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const result = UpdateInventoryItemSchema.safeParse(req.body);
    if (!result.success) {
      throw AppError.badRequest('Validation failed', result.error.flatten());
    }
    const data = await updateInventoryItem(
      String(req.params['productId'] ?? ''),
      result.data,
      user
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

inventoryRouter.get('/alerts', requireAuth, async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const data = await getLowStockAlerts(user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});
