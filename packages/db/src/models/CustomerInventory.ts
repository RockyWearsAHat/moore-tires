import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IInventoryItem {
  productId: Types.ObjectId;
  currentQuantity: number;
  reorderThreshold: number;
  targetQuantity: number;
  autoReorder: boolean;
}

export interface ICustomerInventory extends Document {
  wholesaleAccountId: Types.ObjectId;
  storeLocationId?: Types.ObjectId;
  items: IInventoryItem[];
  lastUploadedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryItemSchema = new Schema<IInventoryItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'TireProduct', required: true },
    currentQuantity: { type: Number, required: true, min: 0 },
    reorderThreshold: { type: Number, required: true, min: 0 },
    targetQuantity: { type: Number, required: true, min: 0 },
    autoReorder: { type: Boolean, default: false },
  },
  { _id: false }
);

const CustomerInventorySchema = new Schema<ICustomerInventory>(
  {
    wholesaleAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'WholesaleAccount',
      required: true,
    },
    storeLocationId: { type: Schema.Types.ObjectId, ref: 'StoreLocation' },
    items: { type: [InventoryItemSchema], default: [] },
    lastUploadedAt: { type: Date },
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

CustomerInventorySchema.index(
  { wholesaleAccountId: 1, storeLocationId: 1 },
  { unique: true }
);

export const CustomerInventory = mongoose.model<ICustomerInventory>(
  'CustomerInventory',
  CustomerInventorySchema
);
