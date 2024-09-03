import { model, Schema } from 'mongoose';
import { SubCategories } from '../interfaces/subCategories';

const SubCategorySchema: Schema = new Schema<SubCategories>(
    {
        name: { type: String, required: true, trim: true },
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    },
    { timestamps: true }
);

SubCategorySchema.pre<SubCategories>(/^find/, function (next) {
    this.populate({
        path: 'category',
        select: 'name _id',
    });
    next();
});

export default model<SubCategories>('SubCategory', SubCategorySchema);