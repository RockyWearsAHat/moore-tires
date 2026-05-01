import { Schema, model } from 'mongoose';

export interface ICustomer {
  id?: string;
  fullName: string;
  phone: string;
  email?: string;
  smsOptedOut: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true, sparse: true },
    smsOptedOut: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = String(ret._id);
        Reflect.deleteProperty(ret, '_id');
        Reflect.deleteProperty(ret, '__v');
      },
    },
  }
);

CustomerSchema.index({ phone: 1 }, { unique: true });
CustomerSchema.index({ email: 1 }, { sparse: true });

export const Customer = model<ICustomer>('Customer', CustomerSchema);
