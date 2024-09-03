import { Document } from "mongoose";
import { Users } from "./users";
import { Products } from "./products";

export interface Carts extends Document {
  cartItems: CartProducts[];
  totalPrice: number;
  totalPriceAfterDiscount: number | undefined;
  user: Users;
}

export interface CartProducts extends Document {
  product: Products;
  quantity: number;
  price: number;
}