import { Schema, model, type Types } from 'mongoose';

export interface ICoordinates {
  lat: number;
  lng: number;
}

export interface IStoreLocation {
  id?: string;
  wholesaleAccountId: Types.ObjectId;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  coordinates?: ICoordinates;
  contactPhone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CoordinatesSchema = new Schema<ICoordinates>(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const StoreLocationSchema = new Schema<IStoreLocation>(
  {
    wholesaleAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'WholesaleAccount',
      required: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    address: { type: String, required: true, trim: true, maxlength: 200 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    state: { type: String, required: true, trim: true, minlength: 2, maxlength: 2 },
    zip: { type: String, required: true, trim: true },
    coordinates: { type: CoordinatesSchema },
    contactPhone: { type: String, trim: true },
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

StoreLocationSchema.index({ wholesaleAccountId: 1 });
StoreLocationSchema.index({ wholesaleAccountId: 1, isActive: 1 });
StoreLocationSchema.index({ zip: 1 });

export const StoreLocation = model<IStoreLocation>('StoreLocation', StoreLocationSchema);
