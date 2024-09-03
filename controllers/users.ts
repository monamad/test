import { Request, Response, NextFunction } from "express";
import { Users } from "../interfaces/users";
import usersModel from "../models/usersModel";
import { createOne, deleteOne, getAll, getOne } from "./refactorHandler";
import asyncHandler from 'express-async-handler';
import ApiErrors from "../utils/apiErrors";
import { uploadSingleImage } from "../middlewares/uploadImages";
import sharp from "sharp";
import bcrypt from 'bcryptjs';
import { createToken } from "../utils/createToken";

export const createUser = createOne<Users>(usersModel);
export const getUsers = getAll<Users>(usersModel, 'users');
export const getUser = getOne<Users>(usersModel);
export const deleteUser = deleteOne<Users>(usersModel);

export const updateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = await usersModel.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    image: req.body.image,
    active: req.body.active
  }, { new: true });

  if (!user) {
    return next(new ApiErrors('User not found', 404));
  }

  res.status(200).json({
    data: user,
    message: 'User updated successfully',
  });
});

export const uploadUserImage = uploadSingleImage('image');

export const resizeUserImage = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (req.file) {
    const imageName: string = `user-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .toFormat('jpeg')
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${imageName}`);
    req.body.image = imageName;
  }
  next();
});

export const changeUserPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = await usersModel.findByIdAndUpdate(req.params.id, {
    password: await bcrypt.hash(req.body.password, 13),
    passwordChangedAt: Date.now(),
  }, { new: true });

  if (!user) {
    return next(new ApiErrors('User not found', 404));
  }

  res.status(200).json({
    message: 'User password changed successfully',
    data: user,
  });
});

export const setLoggedUserId = asyncHandler((req: Request, res: Response, next: NextFunction): void => {
  req.params.id = req.user?._id!.toString();
  next();
});

export const updateLoggedUser = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = await usersModel.findByIdAndUpdate(req.user?._id, {
    name: req.body.name,
    image: req.body.image,
  }, { new: true });

  res.status(200).json({
    data: user,
    message: 'User updated successfully',
  });
});

export const changeLoggedUserPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = await usersModel.findByIdAndUpdate(req.user?.id, {
    password: await bcrypt.hash(req.body.password, 13),
    passwordChangedAt: Date.now(),
  }, { new: true });

  const token: string = createToken(user?._id);
  res.status(200).json({
    message: 'Password changed successfully',
    token,
  });
});
