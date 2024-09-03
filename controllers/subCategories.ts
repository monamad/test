import asyncHandler from 'express-async-handler';
import sharp from "sharp";
import subCategoriesModel from "../models/subCategoriesModel";
import { SubCategories } from "../interfaces/subCategories";
import { createOne, deleteOne, getAll, getOne, updateOne } from "./refactorHandler";
import { NextFunction, Request, Response } from "express";
import { FilterData } from "../interfaces/filterData";
import { uploadSingleImage } from "../middlewares/uploadImages";

export const filterData = (req: Request, res: Response, next: NextFunction) => {
  let filterData: FilterData = {};
  if (req.params.categoryId) { filterData.category = req.params.categoryId };
  req.filterData = filterData;
  next();
}

export const setCategoryId = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.category) { req.body.category = req.params.categoryId };
  next();
};

export const createSubcategory = createOne<SubCategories>(subCategoriesModel)
export const getSubcategories = getAll<SubCategories>(subCategoriesModel, 'subcategories')
export const getSubcategory = getOne<SubCategories>(subCategoriesModel)
export const updateSubcategory = updateOne<SubCategories>(subCategoriesModel)
export const deleteSubcategory = deleteOne<SubCategories>(subCategoriesModel)
export const uploadSubcategoryImage = uploadSingleImage('image');
export const resizeSubcategoryImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const imageName: string = `subcategory-${Date.now()}.jpeg`
    await sharp(req.file.buffer)
      .toFormat('jpeg')
      .jpeg({ quality: 95 })
      .toFile(`uploads/subcategories/${imageName}`)
    req.body.image = imageName;
  }
  next();
});