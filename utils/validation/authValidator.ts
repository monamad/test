import { RequestHandler } from "express";
import { check } from "express-validator";
import validatorMiddleware from "../../middlewares/validatorMiddleware";
import usersModel from "../../models/usersModel";

const passwordValidation = () =>
  check('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6, max: 20 }).withMessage('Password length must be between 6 and 20 characters');

const confirmPasswordValidation = () =>
  check('confirmPassword')
    .notEmpty().withMessage('Confirm Password is required')
    .isLength({ min: 6, max: 20 }).withMessage('Confirm Password length must be between 6 and 20 characters')
    .custom((val: string, { req }) => {
      if (val !== req.body.password) { throw new Error("Passwords do not match"); }
      return true;
    });

export const signupValidator: RequestHandler[] = [
  check('name')
    .notEmpty().withMessage('User Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name length must be between 2 and 50 characters'),
  check('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid Email')
    .custom(async (val: string) => {
      const user = await usersModel.findOne({ email: val });
      if (user) { throw new Error('Email already exists'); }
      return true;
    }),
  passwordValidation(),
  confirmPasswordValidation(),
  validatorMiddleware,
];

export const loginValidator: RequestHandler[] = [
  check('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email'),
  passwordValidation(),
  validatorMiddleware,
];

export const sendMailValidator: RequestHandler[] = [
  check('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email'),
  validatorMiddleware,
];

export const resetCodeValidator: RequestHandler[] = [
  passwordValidation(),
  confirmPasswordValidation(),
  validatorMiddleware,
];
