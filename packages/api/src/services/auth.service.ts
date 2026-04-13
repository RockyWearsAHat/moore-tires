import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, RefreshToken, WholesaleAccount, StoreLocation } from '@moore-tires/db';
import type { IUser } from '@moore-tires/db';
import type {
  RegisterInput,
  LoginInput,
  InviteUserInput,
  AuthResponse,
  AuthUser,
  JwtPayload,
  CreateWholesaleAccountInput,
  CreateStoreLocationInput,
} from '@moore-tires/shared';
import { AppError } from '../errors.js';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_DAYS = 7;

function getJwtSecret(): string {
  const secret = process.env['JWT_SECRET'];
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return secret;
}

function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: ACCESS_TOKEN_EXPIRY });
}

async function createRefreshToken(userId: string): Promise<string> {
  const rawToken = crypto.randomBytes(64).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

  await RefreshToken.create({ userId, tokenHash, expiresAt });
  return rawToken;
}

function hashRefreshToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function buildJwtPayload(user: IUser): JwtPayload {
  const payload: JwtPayload = {
    userId: user.id ?? '',
    email: user.email,
    role: user.role,
  };
  if (user.wholesaleAccountId) {
    payload.wholesaleAccountId = user.wholesaleAccountId.toString();
  }
  if (user.storeLocationId) {
    payload.storeLocationId = user.storeLocationId.toString();
  }
  return payload;
}

function buildAuthUser(user: IUser): AuthUser {
  return {
    id: user.id ?? '',
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    wholesaleAccountId: user.wholesaleAccountId?.toString(),
    storeLocationId: user.storeLocationId?.toString(),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Self-registration for retail customers.
 * Wholesale/employee accounts are created via admin invite.
 */
export async function register(input: RegisterInput): Promise<AuthResponse> {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw AppError.conflict('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const user = await User.create({
    email: input.email.toLowerCase(),
    passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
    role: 'retail_customer',
    phone: input.phone,
  });

  const jwtPayload = buildJwtPayload(user);
  const accessToken = generateAccessToken(jwtPayload);
  const refreshToken = await createRefreshToken(user.id!);

  return {
    user: buildAuthUser(user),
    tokens: { accessToken, refreshToken },
  };
}

/**
 * Authenticate with email + password. Returns tokens and user info.
 */
export async function login(input: LoginInput): Promise<AuthResponse> {
  // select('+passwordHash') overrides the default `select: false` on the field
  const user = await User.findOne({ email: input.email.toLowerCase(), isActive: true }).select(
    '+passwordHash'
  );

  if (!user) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!isMatch) {
    throw AppError.unauthorized('Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const jwtPayload = buildJwtPayload(user);
  const accessToken = generateAccessToken(jwtPayload);
  const refreshToken = await createRefreshToken(user.id!);

  return {
    user: buildAuthUser(user),
    tokens: { accessToken, refreshToken },
  };
}

/**
 * Exchange a valid refresh token for a new access token.
 * The refresh token itself is rotated (old deleted, new issued).
 */
export async function refreshAccessToken(rawRefreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const tokenHash = hashRefreshToken(rawRefreshToken);
  const stored = await RefreshToken.findOne({ tokenHash });

  if (!stored || stored.expiresAt < new Date()) {
    if (stored) await stored.deleteOne();
    throw AppError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(stored.userId);
  if (!user || !user.isActive) {
    await stored.deleteOne();
    throw AppError.unauthorized('Account is inactive');
  }

  // Rotate: delete old, issue new
  await stored.deleteOne();

  const jwtPayload = buildJwtPayload(user);
  const accessToken = generateAccessToken(jwtPayload);
  const newRefreshToken = await createRefreshToken(user.id!);

  return { accessToken, refreshToken: newRefreshToken };
}

/**
 * Revoke a refresh token (logout).
 */
export async function logout(rawRefreshToken: string): Promise<void> {
  const tokenHash = hashRefreshToken(rawRefreshToken);
  await RefreshToken.deleteOne({ tokenHash });
}

/**
 * Revoke all refresh tokens for a user (force logout from all devices).
 */
export async function logoutAll(userId: string): Promise<void> {
  await RefreshToken.deleteMany({ userId });
}

/**
 * Admin-only: create a user with a specific role and account linkage.
 * Generates a temporary password that the invitee must change on first login.
 */
export async function inviteUser(input: InviteUserInput): Promise<AuthUser & { tempPassword: string }> {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw AppError.conflict('A user with this email already exists');
  }

  // Validate referenced account/location exist
  if (input.wholesaleAccountId) {
    const account = await WholesaleAccount.findById(input.wholesaleAccountId);
    if (!account) throw AppError.notFound('Wholesale account not found');
  }
  if (input.storeLocationId) {
    const location = await StoreLocation.findById(input.storeLocationId);
    if (!location) throw AppError.notFound('Store location not found');
  }

  // Generate a temporary password — admin shares it with the invitee
  const tempPassword = crypto.randomBytes(16).toString('base64url');
  const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);

  const user = await User.create({
    email: input.email.toLowerCase(),
    passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
    role: input.role,
    wholesaleAccountId: input.wholesaleAccountId,
    storeLocationId: input.storeLocationId,
    phone: input.phone,
  });

  // Return the user info — the temp password is returned only once
  const authUser = buildAuthUser(user);
  // Attach temp password to response so admin can share it
  return { ...authUser, tempPassword } as AuthUser & { tempPassword: string };
}

/**
 * Admin-only: list users with optional filtering by role and account.
 */
export async function listUsers(filters: {
  role?: string;
  wholesaleAccountId?: string;
  isActive?: boolean;
}): Promise<AuthUser[]> {
  const query: Record<string, unknown> = {};
  if (filters.role) query['role'] = filters.role;
  if (filters.wholesaleAccountId) query['wholesaleAccountId'] = filters.wholesaleAccountId;
  if (filters.isActive !== undefined) query['isActive'] = filters.isActive;

  const users = await User.find(query).sort({ createdAt: -1 }).lean();
  return users.map((u) => ({
    id: u._id?.toString() ?? '',
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    wholesaleAccountId: u.wholesaleAccountId?.toString(),
    storeLocationId: u.storeLocationId?.toString(),
  }));
}

/**
 * Admin-only: deactivate a user account (zero-trust revocation).
 * Also purges all refresh tokens so they cannot re-authenticate.
 */
export async function deactivateUser(userId: string): Promise<void> {
  const user = await User.findById(userId);
  if (!user) throw AppError.notFound('User not found');
  if (user.role === 'admin') throw AppError.forbidden('Cannot deactivate an admin account');

  user.isActive = false;
  await user.save();
  await RefreshToken.deleteMany({ userId });
}

/**
 * Get the current user's profile from their JWT payload.
 */
export async function getProfile(userId: string): Promise<AuthUser> {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw AppError.notFound('User not found');
  }
  return buildAuthUser(user);
}

/**
 * Change the current user's password.
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw AppError.notFound('User not found');

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) throw AppError.unauthorized('Current password is incorrect');

  user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await user.save();

  // Revoke all existing refresh tokens so the user must re-login
  await RefreshToken.deleteMany({ userId });
}

// ─── Wholesale Account Management (Admin) ─────────────────────────────────────

export async function createWholesaleAccount(input: CreateWholesaleAccountInput) {
  return WholesaleAccount.create(input);
}

export async function listWholesaleAccounts() {
  return WholesaleAccount.find({ isActive: true }).sort({ companyName: 1 });
}

export async function getWholesaleAccountById(id: string) {
  const account = await WholesaleAccount.findById(id);
  if (!account) throw AppError.notFound('Wholesale account not found');
  return account;
}

// ─── Store Location Management (Admin) ─────────────────────────────────────────

export async function createStoreLocation(input: CreateStoreLocationInput) {
  const account = await WholesaleAccount.findById(input.wholesaleAccountId);
  if (!account) throw AppError.notFound('Wholesale account not found');
  return StoreLocation.create(input);
}

export async function listStoreLocations(wholesaleAccountId: string) {
  return StoreLocation.find({ wholesaleAccountId, isActive: true }).sort({ name: 1 });
}
