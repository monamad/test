import { Schema, model } from "mongoose";
import { Products } from "../interfaces/products";

const productsSchema: Schema = new Schema<Products>({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true, minlength: 10, maxlength: 500 },
  price: { type: Number, required: true, min: 1, max: 1000000 },
  priceAfterDiscount: { type: Number, min: 1, max: 1000000 },
  quantity: { type: Number, default: 0, min: 0 },
  sold: { type: Number, default: 0 },
  ratingAverage: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  cover: String,
  images: [String],
  category: { type: Schema.Types.ObjectId, required: true, ref: 'categories' },
  subcategory: { type: Schema.Types.ObjectId, required: true, ref: 'subCategories' }
}, { timestamps: true, toJSON: { virtual: true }, toObject: { virtual: true } });

productsSchema.virtual('reviews', { ref: 'reviews', foreignField: 'product', localField: '_id' })

productsSchema.pre<Products>(/^find/, function (next) {
  this.populate({ path: 'category', select: 'name' })
  this.populate({ path: 'subcategory', select: 'name' })
  next()
})

export default model<Products>('products', productsSchema)