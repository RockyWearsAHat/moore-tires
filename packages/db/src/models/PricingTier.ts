import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IPricingTier extends Document {
  name: string;
  defaultDiscountPercent: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PricingTierSchema = new Schema<IPricingTier>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    defaultDiscountPercent: { type: Number, required: true, min: 0, max: 100 },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id?.toString();
        Reflect.deleteProperty(ret, '_id');
        Reflect.deleteProperty(ret, '__v');
        return ret;
      },
    },
  }
);

export const PricingTier = mongoose.model<IPricingTier>('PricingTier', PricingTierSchema);

// ─── Price Override (per-product exception to a tier's default discount) ──────

export interface IPriceOverride extends Document {
  tierId: Types.ObjectId;
  productId: Types.ObjectId;
  overridePrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const PriceOverrideSchema = new Schema<IPriceOverride>(
  {
    tierId: { type: Schema.Types.ObjectId, ref: 'PricingTier', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'TireProduct', required: true },
    overridePrice: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id?.toString();
        Reflect.deleteProperty(ret, '_id');
        Reflect.deleteProperty(ret, '__v');
        return ret;
      },
    },
  }
);

PriceOverrideSchema.index({ tierId: 1, productId: 1 }, { unique: true });

export const PriceOverride = mongoose.model<IPriceOverride>('PriceOverride', PriceOverrideSchema);
