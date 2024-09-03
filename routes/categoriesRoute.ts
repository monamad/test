import { Router } from "express";
import { createCategory, deleteCategory, getCategories, getCategory, resizeCategoryImage, updateCategory, uploadCategoryImage } from "../controllers/categories";
import { createCategoryValidator, deleteCategoryValidator, getCategoryValidator, updateCategoryValidator } from "../utils/validation/categoriesValidator";
import subcategoriesRoute from "./subcategoriesRoute";
import { allowedTo, checkActive, protectRoutes } from "../controllers/auth";

const categoryRoute: Router = Router();
categoryRoute.use('/:categoryId/subcategories', categoryRoute);

categoryRoute.route('/')
  .get(getCategories)
  .post(protectRoutes, checkActive, allowedTo('manager', 'admin'), createCategoryValidator, createCategory);

categoryRoute.route('/:id')
  .get(getCategoryValidator,getCategory)
  .put(protectRoutes, checkActive, allowedTo('manager', 'admin'), updateCategoryValidator, updateCategory)
  .delete(protectRoutes, checkActive, allowedTo('manager', 'admin'), deleteCategoryValidator, deleteCategory);

export default categoryRoute;