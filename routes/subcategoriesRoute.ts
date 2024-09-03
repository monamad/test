import { Router } from "express";
import { createSubcategory, deleteSubcategory, filterData, getSubcategories, getSubcategory, setCategoryId, updateSubcategory } from "../controllers/subCategories";
import { createSubcategoryValidator, deleteSubcategoryValidator, getSubcategoryValidator, updateSubcategoryValidator } from "../utils/validation/subcategoriesValidator";
import { allowedTo, checkActive, protectRoutes } from "../controllers/auth";
const subcategoriesRoute: Router = Router({ mergeParams: true });

subcategoriesRoute.route('/')
  .get(filterData, getSubcategories)
  .post(protectRoutes, checkActive, allowedTo('manager', 'admin'), setCategoryId, createSubcategoryValidator, createSubcategory);

subcategoriesRoute.route('/:id')
  .get(getSubcategoryValidator, getSubcategory)
  .put(protectRoutes, checkActive, allowedTo('manager', 'admin'), updateSubcategoryValidator, updateSubcategory)
  .delete(protectRoutes, checkActive, allowedTo('manager', 'admin'), deleteSubcategoryValidator, deleteSubcategory);

export default subcategoriesRoute;