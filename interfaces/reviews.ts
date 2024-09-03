import { Document } from "mongoose";
import { Users } from "./users";
import { Products } from "./products";

export interface Reviews extends Document {
  comment: string;
  rating: number;
  user: Users;
  product: Products;
};