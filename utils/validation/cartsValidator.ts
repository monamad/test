import { RequestHandler } from "express";
import { check } from "express-validator";
import validatorMiddleware from "../../middlewares/validatorMiddleware";

const isValidMongoId = (field: string) => 
  check(field)
    .notEmpty().withMessage(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`)
    .isMongoId().withMessage('Invalid MongoDB ID');

export const addProductToCartValidator: RequestHandler[] = [
  isValidMongoId('product'),
  validatorMiddleware,
];

export const removeProductFromCartValidator: RequestHandler[] = [
  isValidMongoId('itemId'),
  validatorMiddleware,
];

export const updateProductQuantityValidator: RequestHandler[] = [
  isValidMongoId('itemId'),
  check('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isNumeric().withMessage('Quantity must be a number')
    .toInt()
    .custom((val: number) => {
      if (val <= 0) {
        throw new Error('Invalid quantity');
      }
      return true;
    }),
  validatorMiddleware,
];
