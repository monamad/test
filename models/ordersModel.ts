import { Schema, model } from "mongoose";
import { Orders } from "../interfaces/orders";

const ordersSchema: Schema = new Schema<Orders>({
  cartItems: [{
    product: { type: Schema.Types.ObjectId, ref: 'products' },
    quantity: { type: Number, default: 1 },
    price: Number
  }],
  totalPrice: Number,
  paymentMethod: { type: String, enum: ['card', 'cash'], default: 'cash' },
  deliveredAt: Date,
  paidAt: Date,
  isDelivered: { type: Boolean, default: false },
  isPaid: { type: Boolean, default: false },
  taxPrice: { type: Number, default: 0 },
  address: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'users' }
}, { timestamps: true });

ordersSchema.pre<Orders>(/^find/, function (next) {
  this.populate({ path: 'cartItems.product', select: 'name cover' })
  this.populate({ path: 'user', select: 'name image email' })
  next()
})

export default model<Orders>('order', ordersSchema)