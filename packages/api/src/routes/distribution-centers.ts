import { Router } from 'express';
import { DistributionCenter } from '@moore-tires/db';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { AppError } from '../errors.js';

export const distributionCenterRouter: Router = Router();

/**
 * GET /api/v1/distribution-centers
 * Admin: list all distribution centers.
 */
distributionCenterRouter.get(
  '/',
  requireAuth,
  requireRole('admin'),
  async (_req, res, next) => {
    try {
      const centers = await DistributionCenter.find().sort({ isActive: -1, name: 1 }).lean();
      res.json({ success: true, data: centers });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/v1/distribution-centers
 * Admin: create a new distribution center.
 */
distributionCenterRouter.post(
  '/',
  requireAuth,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const { name, state, address, city, zip, coordinates } = req.body as {
        name: string;
        state: string;
        address: string;
        city: string;
        zip: string;
        coordinates: { lat: number; lng: number };
      };

      if (!name || !state || !address || !city || !zip || !coordinates?.lat || !coordinates?.lng) {
        throw AppError.badRequest('All fields are required including coordinates');
      }

      const center = await DistributionCenter.create({
        name,
        state,
        address,
        city,
        zip,
        coordinates,
      });

      res.status(201).json({ success: true, data: center.toJSON() });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /api/v1/distribution-centers/:id
 * Admin: update a distribution center (e.g. activate/deactivate).
 */
distributionCenterRouter.patch(
  '/:id',
  requireAuth,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const center = await DistributionCenter.findByIdAndUpdate(
        String(req.params['id'] ?? ''),
        { $set: req.body as Record<string, unknown> },
        { new: true, runValidators: true }
      );
      if (!center) throw AppError.notFound('Distribution center not found');
      res.json({ success: true, data: center.toJSON() });
    } catch (err) {
      next(err);
    }
  }
);
