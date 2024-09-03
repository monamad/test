import { Document } from "mongoose";
import { Products } from "./products";
type Role = 'manager' | 'admin' | 'user'
export interface Users extends Document {
  email: string;
  password: string;
  name: string;
  image: string;
  role: Role;
  active: boolean;
  wishlist:Products[];
  passwordChangedAt: Date | number;
  resetCode: string | undefined;
  resetCodeExpireTime: Date | number | undefined;
  resetCodeVerify: boolean | undefined;
}