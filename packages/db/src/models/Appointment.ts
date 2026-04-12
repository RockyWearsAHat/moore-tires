import { Schema, model, type Types } from 'mongoose';

export interface IAppointment {
  id?: string;
  jobId: Types.ObjectId;
  technicianId: Types.ObjectId;
  startsAt: Date;
  endsAt: Date;
  reminderJobId24h?: string;
  reminderJobId2h?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true, unique: true },
    technicianId: { type: Schema.Types.ObjectId, ref: 'Technician', required: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    // BullMQ job IDs for cancellation when rescheduling
    reminderJobId24h: { type: String },
    reminderJobId2h: { type: String },
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

AppointmentSchema.index({ jobId: 1 }, { unique: true });
// Critical index for conflict detection: technician + time range overlap
AppointmentSchema.index({ technicianId: 1, startsAt: 1 });

export const Appointment = model<IAppointment>('Appointment', AppointmentSchema);
