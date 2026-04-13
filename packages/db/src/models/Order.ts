import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type OrderStatus =
  | 'CART'
  | 'SUBMITTED'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface IOrderItem {
  productId: Types.ObjectId;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  wholesaleAccountId?: Types.ObjectId;
  storeLocationId?: Types.ObjectId;
  items: IOrderItem[];
  status: OrderStatus;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  distributionCenter: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  total: number;
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
  paymentMethod: 'CARD' | 'ACH' | 'INVOICE';
  estimatedDeliveryDate?: Date;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'TireProduct', required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    wholesaleAccountId: { type: Schema.Types.ObjectId, ref: 'WholesaleAccount' },
    storeLocationId: { type: Schema.Types.ObjectId, ref: 'StoreLocation' },
    items: { type: [OrderItemSchema], required: true, validate: (v: unknown[]) => v.length > 0 },
    status: {
      type: String,
      required: true,
      enum: ['CART', 'SUBMITTED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      default: 'CART',
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
    },
    distributionCenter: { type: String, default: 'WA' },
    subtotal: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    shippingCost: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    stripePaymentIntentId: { type: String },
    stripeInvoiceId: { type: String },
    paymentMethod: {
      type: String,
      enum: ['CARD', 'ACH', 'INVOICE'],
      default: 'CARD',
    },
    estimatedDeliveryDate: { type: Date },
    trackingNumber: { type: String },
    notes: { type: String },
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

OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ wholesaleAccountId: 1, status: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
