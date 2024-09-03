import { NextFunction, Request, Response } from "express";
import reviewsModel from "../models/reviewsModel";
import { Reviews } from "../interfaces/reviews";
import { FilterData } from "../interfaces/filterData";
import { createOne, deleteOne, getAll, getOne, updateOne } from "./refactorHandler";

export const filterReviews = (req: Request, res: Response, next: NextFunction) => {
  let filterData: FilterData = {};
  if (req.params.productId) { filterData.product = req.params.productId };
  req.filterData = filterData;
  next();
}

export const setProductAndUserId = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.product) { req.body.product = req.params.productId };
  if (!req.body.user) { req.body.user = req.user?._id };
  next();
};

export const createReview = createOne<Reviews>(reviewsModel)
export const getReviews = getAll<Reviews>(reviewsModel, 'reviews')
export const getReview = getOne<Reviews>(reviewsModel)
export const updateReview = updateOne<Reviews>(reviewsModel)
export const deleteReview = deleteOne<Reviews>(reviewsModel)