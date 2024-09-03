import { model, Schema } from 'mongoose';
import { Users } from '../interfaces/users';
import bcrypt from 'bcryptjs';

const userSchema: Schema = new Schema<Users>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, minlength: 6, maxlength: 20 },
        address: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            zipCode: { type: String },
            country: { type: String, required: true },
        },
        image: String,
        role: { type: String, required: true, enum: ['manager', 'admin', 'user'] },
        active: { type: Boolean, default: true },
        passwordChangedAt: Date,
        resetCode: String,
        resetCodeExpireTime: Date,
        resetCodeVerify: Boolean,
        wishlist: [{ type: Schema.Types.ObjectId, ref: 'products' }],
    },
    { timestamps: true }
);

userSchema.pre<User>('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

export default model<User>('User', userSchema);