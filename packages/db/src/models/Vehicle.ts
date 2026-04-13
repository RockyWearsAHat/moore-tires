import { Schema, model, type Types } from 'mongoose';

export interface IVehicle {
  id?: string;
  customerId: Types.ObjectId;
  year: number;
  make: string;
  vehicleModel: string;
  licensePlate: string;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    year: { type: Number, required: true },
    make: { type: String, required: true, trim: true, maxlength: 50 },
    vehicleModel: { type: String, required: true, trim: true, maxlength: 50 },
    licensePlate: { type: String, required: true, trim: true, uppercase: true, maxlength: 20 },
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

VehicleSchema.index({ customerId: 1 });
VehicleSchema.index({ licensePlate: 1 });

export const Vehicle = model<IVehicle>('Vehicle', VehicleSchema);
