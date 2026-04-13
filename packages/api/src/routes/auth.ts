import { Router } from 'express';
import {
  RegisterSchema,
  LoginSchema,
  RefreshTokenRequestSchema,
  InviteUserSchema,
  CreateWholesaleAccountSchema,
  CreateStoreLocationSchema,
} from '@moore-tires/shared';
import { requireAuth, requireRole, getAuthUser } from '../middleware/auth.js';
import {
  register,
  login,
  refreshAccessToken,
  logout,
  inviteUser,
  getProfile,
  changePassword,
  createWholesaleAccount,
  listWholesaleAccounts,
  getWholesaleAccountById,
  createStoreLocation,
  listStoreLocations,
} from '../services/auth.service.js';
import { loginRateLimit } from '../middleware/rate-limit.js';
import { AppError } from '../errors.js';

export const authRouter: Router = Router();

// ─── Public Auth Routes ───────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 * Public — self-registration for retail customers.
 */
authRouter.post('/register', loginRateLimit, async (req, res, next) => {
  try {
    const result = RegisterSchema.safeParse(req.body);
    if (!result.success) {
      throw AppError.badRequest('Validation failed', result.error.flatten());
    }
    const data = await register(result.data);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/login
 * Public — authenticate with email + password.
 */
authRouter.post('/login', loginRateLimit, async (req, res, next) => {
  try {
    const result = LoginSchema.safeParse(req.body);
    if (!result.success) {
      throw AppError.badRequest('Validation failed', result.error.flatten());
    }
    const data = await login(result.data);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/refresh
 * Public — exchange a refresh token for a new access token.
 */
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const result = RefreshTokenRequestSchema.safeParse(req.body);
    if (!result.success) {
      throw AppError.badRequest('Validation failed', result.error.flatten());
    }
    const data = await refreshAccessToken(result.data.refreshToken);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/logout
 * Public — revoke a refresh token.
 */
authRouter.post('/logout', async (req, res, next) => {
  try {
    const result = RefreshTokenRequestSchema.safeParse(req.body);
    if (!result.success) {
      throw AppError.badRequest('Validation failed', result.error.flatten());
    }
    await logout(result.data.refreshToken);
    res.json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (err) {
    next(err);
  }
});

// ─── Authenticated Routes ─────────────────────────────────────────────────────

/**
 * GET /api/v1/auth/me
 * Auth: any — get current user profile.
 */
authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { userId } = getAuthUser(req);
    const data = await getProfile(userId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/change-password
 * Auth: any — change own password.
 */
authRouter.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    const { userId } = getAuthUser(req);
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };

    if (!currentPassword || !newPassword) {
      throw AppError.badRequest('currentPassword and newPassword are required');
    }
    if (newPassword.length < 8 || newPassword.length > 128) {
      throw AppError.badRequest('New password must be between 8 and 128 characters');
    }

    await changePassword(userId, currentPassword, newPassword);
    res.json({ success: true, data: { message: 'Password changed successfully' } });
  } catch (err) {
    next(err);
  }
});

// ─── Admin-Only Routes ────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/invite
 * Auth: admin — invite a new user with a specific role.
 */
authRouter.post('/invite', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const result = InviteUserSchema.safeParse(req.body);
    if (!result.success) {
      throw AppError.badRequest('Validation failed', result.error.flatten());
    }
    const data = await inviteUser(result.data);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// ─── Wholesale Account Routes (Admin) ─────────────────────────────────────────

/**
 * GET /api/v1/auth/accounts
 * Auth: admin — list all wholesale accounts.
 */
authRouter.get('/accounts', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try {
    const data = await listWholesaleAccounts();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/accounts
 * Auth: admin — create a wholesale account.
 */
authRouter.post('/accounts', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const result = CreateWholesaleAccountSchema.safeParse(req.body);
    if (!result.success) {
      throw AppError.badRequest('Validation failed', result.error.flatten());
    }
    const data = await createWholesaleAccount(result.data);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/auth/accounts/:id
 * Auth: admin — get a wholesale account by ID.
 */
authRouter.get('/accounts/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const data = await getWholesaleAccountById(String(req.params['id'] ?? ''));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/auth/accounts/:id/locations
 * Auth: admin — list store locations for a wholesale account.
 */
authRouter.get(
  '/accounts/:id/locations',
  requireAuth,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const data = await listStoreLocations(String(req.params['id'] ?? ''));
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/v1/auth/accounts/:id/locations
 * Auth: admin — create a store location under a wholesale account.
 */
authRouter.post(
  '/accounts/:id/locations',
  requireAuth,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const input = { ...req.body, wholesaleAccountId: String(req.params['id'] ?? '') };
      const result = CreateStoreLocationSchema.safeParse(input);
      if (!result.success) {
        throw AppError.badRequest('Validation failed', result.error.flatten());
      }
      const data = await createStoreLocation(result.data);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
);
