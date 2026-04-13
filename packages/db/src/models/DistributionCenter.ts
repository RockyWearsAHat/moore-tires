import mongoose, { Schema, type Document } from 'mongoose';

export interface IDistributionCenter extends Document {
  name: string;
  state: string;
  address: string;
  city: string;
  zip: string;
  coordinates: { lat: number; lng: number };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DistributionCenterSchema = new Schema<IDistributionCenter>(
  {
    name: { type: String, required: true },
    state: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
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

export const DistributionCenter = mongoose.model<IDistributionCenter>(
  'DistributionCenter',
  DistributionCenterSchema
);
