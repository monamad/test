import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import usersModel from '../models/usersModel';
import ApiErrors from '../utils/apiErrors';

export const addProductToWishlist = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = await usersModel.findByIdAndUpdate(
    req.user?._id,
    { $addToSet: { wishlist: req.body.product } },
    { new: true }
  );

  if (!user) {
    return next(new ApiErrors('User not found', 404));
  }

  res.status(200).json({ data: user.wishlist });
});

export const removeProductFromWishlist = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = await usersModel.findByIdAndUpdate(
    req.user?._id,
    { $pull: { wishlist: req.params.product } },
    { new: true }
  );

  if (!user) {
    return next(new ApiErrors('User not found', 404));
  }

  res.status(200).json({ data: user.wishlist });
});

export const getLoggedUserWishlist = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = await usersModel.findById(req.user?._id).populate('wishlist');

  if (!user) {
    return next(new ApiErrors('User not found', 404));
  }

  res.status(200).json({
    length: user.wishlist.length,
    data: user.wishlist,
  });
});
