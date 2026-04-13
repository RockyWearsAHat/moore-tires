import mongoose, { Schema, type Document } from 'mongoose';

export interface ITireProduct extends Document {
  brand: string;
  tireModel: string;
  size: {
    width: number;
    aspectRatio: number;
    rimDiameter: number;
    construction: string;
  };
  formattedSize: string;
  type:
    | 'COMMERCIAL'
    | 'ALL_SEASON'
    | 'ALL_TERRAIN'
    | 'HIGHWAY'
    | 'MUD_TERRAIN'
    | 'WINTER';
  loadIndex: string;
  speedRating: string;
  plyRating?: number;
  weight?: number;
  description?: string;
  images: string[];
  specifications: Map<string, string>;
  baseRetailPrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TireProductSchema = new Schema<ITireProduct>(
  {
    brand: { type: String, required: true, index: true },
    tireModel: { type: String, required: true },
    size: {
      width: { type: Number, required: true },
      aspectRatio: { type: Number, required: true },
      rimDiameter: { type: Number, required: true },
      construction: { type: String, default: 'R' },
    },
    formattedSize: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['COMMERCIAL', 'ALL_SEASON', 'ALL_TERRAIN', 'HIGHWAY', 'MUD_TERRAIN', 'WINTER'],
    },
    loadIndex: { type: String, default: '' },
    speedRating: { type: String, default: '' },
    plyRating: { type: Number },
    weight: { type: Number },
    description: { type: String },
    images: [{ type: String }],
    specifications: { type: Map, of: String, default: {} },
    baseRetailPrice: { type: Number, required: true, min: 0 },
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

TireProductSchema.index({ type: 1, formattedSize: 1 });
TireProductSchema.index({ isActive: 1 });

export const TireProduct = mongoose.model<ITireProduct>('TireProduct', TireProductSchema);
