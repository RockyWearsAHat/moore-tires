import { Schema, model, type Types } from 'mongoose';

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface IWholesaleAccount {
  id?: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  pricingTierId?: Types.ObjectId;
  paymentTerms: 'PREPAID' | 'NET_15' | 'NET_30';
  billingAddress: IAddress;
  stripeCustomerId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    street: { type: String, required: true, trim: true, maxlength: 200 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    state: { type: String, required: true, trim: true, minlength: 2, maxlength: 2 },
    zip: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const WholesaleAccountSchema = new Schema<IWholesaleAccount>(
  {
    companyName: { type: String, required: true, trim: true, maxlength: 200 },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    contactPhone: { type: String, required: true, trim: true },
    pricingTierId: { type: Schema.Types.ObjectId, ref: 'PricingTier' },
    paymentTerms: {
      type: String,
      required: true,
      enum: ['PREPAID', 'NET_15', 'NET_30'],
      default: 'PREPAID',
    },
    billingAddress: { type: AddressSchema, required: true },
    stripeCustomerId: { type: String, sparse: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret['id'] = (ret['_id'] as Types.ObjectId).toString();
        Reflect.deleteProperty(ret, '_id');
        Reflect.deleteProperty(ret, '__v');
      },
    },
  }
);

WholesaleAccountSchema.index({ companyName: 1 });
WholesaleAccountSchema.index({ isActive: 1 });

export const WholesaleAccount = model<IWholesaleAccount>(
  'WholesaleAccount',
  WholesaleAccountSchema
);
