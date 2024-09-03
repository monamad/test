import { Document, Schema } from "mongoose";

export interface Products extends Document {
  name: string;
  description: string;
  price: number;
  priceAfterDiscount: number;
  quantity: number;
  sold: number;
  ratingAverage: number;
  ratingCount: number;
  cover: string;
  images: string[];
  category: Schema.Types.ObjectId;
  subcategory: Schema.Types.ObjectId;
}