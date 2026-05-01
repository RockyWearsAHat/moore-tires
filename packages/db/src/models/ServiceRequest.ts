import { Schema, model, type Types } from 'mongoose';
import {
  type ServiceType,
  type TimeWindow,
  type ServiceRequestStatus,
} from '@moore-tires/shared';

export interface IServiceRequest {
  id?: string;
  customerId: Types.ObjectId;
  vehicleId: Types.ObjectId;
  serviceType: ServiceType;
  preferredDate: string;
  preferredTimeWindow: TimeWindow;
  notes?: string;
  isMobileService: boolean;
  status: ServiceRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceRequestSchema = new Schema<IServiceRequest>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    serviceType: {
      type: String,
      enum: ['INSTALL', 'REPAIR', 'INSPECTION', 'ROTATION'],
      required: true,
    },
    preferredDate: { type: String, required: true },
    preferredTimeWindow: {
      type: String,
      enum: ['MORNING', 'AFTERNOON', 'EVENING'],
      required: true,
    },
    notes: { type: String, maxlength: 500 },
    isMobileService: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['PENDING', 'SCHEDULED', 'CANCELLED'],
      default: 'PENDING',
    },
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

ServiceRequestSchema.index({ customerId: 1 });
ServiceRequestSchema.index({ status: 1, createdAt: -1 });

export const ServiceRequest = model<IServiceRequest>('ServiceRequest', ServiceRequestSchema);
