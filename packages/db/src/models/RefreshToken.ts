import { Schema, model, type Types } from 'mongoose';

export interface IRefreshToken {
  id?: string;
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true, unique: true },
    // MongoDB TTL index auto-deletes expired tokens
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

RefreshTokenSchema.index({ userId: 1 });

export const RefreshToken = model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
