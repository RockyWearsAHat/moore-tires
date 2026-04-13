import { Schema, model, type Types } from 'mongoose';

export interface IUser {
  id?: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'district_manager' | 'store_employee' | 'retail_customer';
  wholesaleAccountId?: Types.ObjectId;
  storeLocationId?: Types.ObjectId;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    passwordHash: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'district_manager', 'store_employee', 'retail_customer'],
      default: 'retail_customer',
    },
    wholesaleAccountId: { type: Schema.Types.ObjectId, ref: 'WholesaleAccount' },
    storeLocationId: { type: Schema.Types.ObjectId, ref: 'StoreLocation' },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret['id'] = (ret['_id'] as Types.ObjectId).toString();
        Reflect.deleteProperty(ret, '_id');
        Reflect.deleteProperty(ret, '__v');
        Reflect.deleteProperty(ret, 'passwordHash');
      },
    },
  }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ wholesaleAccountId: 1 });
UserSchema.index({ storeLocationId: 1 });
UserSchema.index({ role: 1, isActive: 1 });

export const User = model<IUser>('User', UserSchema);
