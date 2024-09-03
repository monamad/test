import { Schema, model } from "mongoose";
import { Reviews } from "../interfaces/reviews";
import productsModel from "./productsModel";
const reviewsSchema = new Schema<Reviews>(
  {
    comment: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    user: { type: Schema.Types.ObjectId, ref: "users", required: true },
    product: { type: Schema.Types.ObjectId, ref: "products", required: true },
  },
  { timestamps: true }
);

reviewsSchema.statics.calcRatingAndQuantity = async function (productId: Schema.Types.ObjectId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "product",
        avgRating: { $avg: "$rating" },
        ratingQuantity: { $sum: 1 },
      },
    },
  ]);

  const updateData = result.length > 0 
    ? {
        ratingAverage: result[0].avgRating,
        ratingCount: result[0].ratingQuantity,
      }
    : {
        ratingAverage: 0,
        ratingCount: 0,
      };

  await productsModel.findByIdAndUpdate(productId, updateData);
};

reviewsSchema.post("save", async function () {
  await (this.constructor as any).calcRatingAndQuantity(this.product);
});

reviewsSchema.post<Reviews>('save', async function () { await (this.constructor as any).calcRatingAndQuantity(this.product) })


reviewsSchema.pre<Reviews>(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name image' })
  next()
})

export default model<Reviews>('reviews', reviewsSchema)