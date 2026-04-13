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

/**
 * POST /api/v1/inventory/upload-csv
 * Auth: logged-in wholesale user — parse CSV text and upload as inventory.
 * Expects { csv: string } where csv is the raw CSV file contents.
 * Required columns: productId, currentQuantity, reorderThreshold, targetQuantity
 */
inventoryRouter.post('/upload-csv', requireAuth, async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const csvText = req.body?.csv;
    if (typeof csvText !== 'string' || csvText.trim().length === 0) {
      throw AppError.badRequest('Missing or empty csv field');
    }

    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) throw AppError.badRequest('CSV must have a header row and at least one data row');

    const header = lines[0]!.split(',').map((h) => h.trim().toLowerCase());
    const pidIdx = header.indexOf('productid');
    const qtyIdx = header.indexOf('currentquantity');
    const threshIdx = header.indexOf('reorderthreshold');
    const targetIdx = header.indexOf('targetquantity');

    if (pidIdx === -1 || qtyIdx === -1) {
      throw AppError.badRequest('CSV must have productId and currentQuantity columns');
    }

    const items = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i]!.split(',').map((c) => c.trim());
      if (!cols[pidIdx]) continue;
      items.push({
        productId: cols[pidIdx]!,
        currentQuantity: parseInt(cols[qtyIdx] ?? '0', 10) || 0,
        reorderThreshold: parseInt(cols[threshIdx ?? -1] ?? '10', 10) || 10,
        targetQuantity: parseInt(cols[targetIdx ?? -1] ?? '50', 10) || 50,
        autoReorder: false,
      });
    }

    if (items.length === 0) throw AppError.badRequest('No valid rows found in CSV');

    const result = InventoryUploadSchema.safeParse({ items });
    if (!result.success) throw AppError.badRequest('CSV data validation failed', result.error.flatten());

    const data = await uploadInventory(result.data, user);
    res.json({ success: true, data, meta: { rowsParsed: items.length } });
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
