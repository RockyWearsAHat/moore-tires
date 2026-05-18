import { Schema, model, type Types } from 'mongoose';
import { type JobStatus } from '@moore-tires/shared';

export interface IJob {
  id?: string;
  serviceRequestId: Types.ObjectId;
  technicianId: Types.ObjectId;
  status: JobStatus;
  scheduledAt: Date;
  completedAt?: Date;
  notes?: string;
  photoUrls: string[];
  previousTechnicianId?: Types.ObjectId;
  reassignedBy?: Types.ObjectId;
  reassignedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    serviceRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceRequest',
      required: true,
      unique: true,
    },
    technicianId: { type: Schema.Types.ObjectId, ref: 'Technician', required: true },
    status: {
      type: String,
      enum: ['SCHEDULED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETE', 'CANCELLED'],
      default: 'SCHEDULED',
    },
    scheduledAt: { type: Date, required: true },
    completedAt: { type: Date },
    notes: { type: String, maxlength: 1000 },
    photoUrls: { type: [String], default: [] },
    // Audit trail for reassignment
    previousTechnicianId: { type: Schema.Types.ObjectId, ref: 'Technician' },
    reassignedBy: { type: Schema.Types.ObjectId, ref: 'users' },
    reassignedAt: { type: Date },
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

JobSchema.index({ technicianId: 1, scheduledAt: 1 });
JobSchema.index({ status: 1, scheduledAt: 1 });

export const Job = model<IJob>('Job', JobSchema);
