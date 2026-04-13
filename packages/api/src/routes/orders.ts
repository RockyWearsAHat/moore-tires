import { Router } from 'express';
import {
  CreateOrderSchema,
  UpdateOrderStatusSchema,
} from '@moore-tires/shared';
import { requireAuth, requireRole, getAuthUser } from '../middleware/auth.js';
import {
  createOrder,
  listOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from '../services/order.service.js';
import { AppError } from '../errors.js';

export const ordersRouter: Router = Router();

ordersRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const result = CreateOrderSchema.safeParse(req.body);
    if (!result.success) {
      throw AppError.badRequest('Validation failed', result.error.flatten());
    }
    const data = await createOrder(result.data, user);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

ordersRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const page = Math.max(1, Number(req.query['page']) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query['limit']) || 20));
    const data = await listOrders(user, page, limit);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

ordersRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const data = await getOrderById(String(req.params['id'] ?? ''), user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

ordersRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('admin', 'district_manager'),
  async (req, res, next) => {
    try {
      const user = getAuthUser(req);
      const result = UpdateOrderStatusSchema.safeParse(req.body);
      if (!result.success) {
        throw AppError.badRequest('Validation failed', result.error.flatten());
      }
      const data = await updateOrderStatus(String(req.params['id'] ?? ''), result.data, user);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
);

ordersRouter.post('/:id/cancel', requireAuth, async (req, res, next) => {
  try {
    const user = getAuthUser(req);
    const data = await cancelOrder(String(req.params['id'] ?? ''), user);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});
