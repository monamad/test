import { RequestHandler } from "express";
import { check } from "express-validator";
import validatorMiddleware from "../../middlewares/validatorMiddleware";
import categoriesModel from "../../models/categoriesModel";

export const createSubcategoryValidator: RequestHandler[] = [
  check('name')
    .notEmpty().withMessage('Subcategory Name is Required')
    .isLength({ min: 2, max: 50 }).withMessage('Name length must be between 2 and 50'),
  check('category')
    .notEmpty().withMessage('Category is Required')
    .isMongoId().withMessage('Invalid Mongo Id')
    // * Check if category exist
    .custom(async (val) => {
      const category = await categoriesModel.findById(val);
      if (!category) {
        throw new Error('Category Not Found');
      }
      return true;
    }),
  validatorMiddleware
]

export const updateSubcategoryValidator: RequestHandler[] = [
  check('name').optional()
    .isLength({ min: 2, max: 50 }).withMessage('Name length must be between 2 and 50'),
  check('category').optional()
    .isMongoId().withMessage('Invalid Mongo Id')
    .custom(async (val) => {
      const category = await categoriesModel.findById(val);
      if (!category) {
        throw new Error('Category Not Found');
      }
      return true;
    }),
  validatorMiddleware
]

export const getSubcategoryValidator: RequestHandler[] = [
  check('id').isMongoId().withMessage('Invalid Mongo Id'),
  validatorMiddleware
]

export const deleteSubcategoryValidator: RequestHandler[] = [
  check('id').isMongoId().withMessage('Invalid Mongo Id'),
  validatorMiddleware
]