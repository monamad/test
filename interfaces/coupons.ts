import { Document } from "mongoose";

export interface Coupons extends Document {
  name: string;
  expireTime: Date;
  discount: number;
};