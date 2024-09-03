import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import Jwt from 'jsonwebtoken';
import { Users } from '../interfaces/users';
import usersModel from '../models/usersModel';
import ApiErrors from '../utils/apiErrors';
import { createResetToken, createToken } from '../utils/createToken';
import sendMail from '../utils/sendMail';

export const signup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const newUser: Users = await usersModel.create(req.body);
  const token: string = createToken(newUser._id);
  res.status(201).json({ token, data: newUser });
});

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;
  const user = await usersModel.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ApiErrors('Invalid email or password', 401));
  }

  const token: string = createToken(user._id);
  res.status(200).json({ token, message: 'Logged in successfully' });
});

export const protectRoutes = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    return next(new ApiErrors('Please log in to access the application', 401));
  }

  const decodedToken: any = Jwt.verify(token, process.env.JWT_SECRET_KEY!);
  const currentUser = await usersModel.findById(decodedToken._id);

  if (!currentUser) {
    return next(new ApiErrors("User doesn't exist", 401));
  }

  if (currentUser.passwordChangedAt && currentUser.passwordChangedAt instanceof Date) {
    const passwordChangedTime: number = currentUser.passwordChangedAt.getTime() / 1000;
    if (passwordChangedTime > decodedToken.iat) {
      return next(new ApiErrors('Please log in again', 401));
    }
  }

  req.user = currentUser;
  next();
});

export const forgetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email } = req.body;
  const user = await usersModel.findOne({ email });

  if (!user) {
    return next(new ApiErrors('User not found', 404));
  }

  const resetCode: string = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetCode = crypto.createHash('sha256').update(resetCode).digest('hex');
  user.resetCodeExpireTime = Date.now() + 10 * 60 * 1000;
  user.resetCodeVerify = false;

  const message: string = `Your reset password code is ${resetCode}`;
  try {
    await sendMail({ email: user.email, subject: 'Reset Password', message });
    await user.save({ validateModifiedOnly: true });
  } catch (err) {
    return next(new ApiErrors('Error sending email', 400));
  }

  const resetToken: string = createResetToken(user._id);
  res.status(200).json({ message: 'Reset password code sent to your email', resetToken });
});

export const verifyResetCode = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let resetToken: string;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    resetToken = req.headers.authorization.split(' ')[1];
  } else {
    return next(new ApiErrors('Please obtain your reset code first', 400));
  }

  const decodedToken: any = Jwt.verify(resetToken, process.env.JWT_SECRET_KEY!);
  const hashedResetCode: string = crypto.createHash('sha256').update(req.body.resetCode).digest('hex');
  const user = await usersModel.findOne({
    _id: decodedToken._id,
    resetCode: hashedResetCode,
    resetCodeExpireTime: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiErrors('Invalid or expired reset code', 400));
  }

  user.resetCodeVerify = true;
  await user.save({ validateModifiedOnly: true });
  res.status(200).json({ message: 'Reset code verified' });
});

export const resetCode = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let resetToken: string;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    resetToken = req.headers.authorization.split(' ')[1];
  } else {
    return next(new ApiErrors('Unauthorized action', 400));
  }

  const decodedToken: any = Jwt.verify(resetToken, process.env.JWT_SECRET_KEY!);
  const user = await usersModel.findOne({
    _id: decodedToken._id,
    resetCodeVerify: true,
  });

  if (!user) {
    return next(new ApiErrors('Please verify your reset code first', 400));
  }

  user.password = req.body.password;
  user.resetCode = undefined;
  user.resetCodeExpireTime = undefined;
  user.resetCodeVerify = undefined;
  user.passwordChangedAt = new Date();

  await user.save({ validateModifiedOnly: true });
  res.status(200).json({ message: 'Your password has been changed' });
});

export const allowedTo = (...roles: string[]) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role ?? '';
    if (!roles.includes(userRole)) {
      return next(new ApiErrors('Access denied', 403));
    }
    next();
  });


export const checkActive = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user?.active) {
    return next(new ApiErrors('Your account is not active', 403));
  }
  next();
});
