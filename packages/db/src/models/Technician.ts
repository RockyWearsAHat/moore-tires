import { Schema, model } from 'mongoose';
import { type TechnicianCapability } from '@moore-tires/shared';

export interface ITechnician {
  id?: string;
  fullName: string;
  phone: string;
  email?: string;
  capabilities: TechnicianCapability[];
  territory?: string;
  expoPushToken?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TechnicianSchema = new Schema<ITechnician>(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    capabilities: {
      type: [{ type: String, enum: ['STANDARD', 'COMMERCIAL', 'MOBILE', 'ALIGNMENT'] }],
      default: ['STANDARD'],
    },
    territory: { type: String, trim: true },
    expoPushToken: { type: String },
    isActive: { type: Boolean, default: true },
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

TechnicianSchema.index({ territory: 1 });

export const Technician = model<ITechnician>('Technician', TechnicianSchema);
