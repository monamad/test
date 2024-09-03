import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import ApiErrors from '../utils/apiErrors';
import { FilterData } from '../interfaces/filterData';
import Features from '../utils/features';

export const getAll = <ModelType>(
  model: mongoose.Model<any>, 
  modelName: string
) => asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let filterData: FilterData = req.filterData || {};
  let searchLength = 0;

  if (req.query) {
    const searchResult = new Features(model.find(filterData), req.query)
      .filter()
      .search(modelName);

    const searchData: ModelType[] = await searchResult.mongooseQuery;
    searchLength = searchData.length;
  }

  const countDocuments = searchLength || await model.find(filterData).countDocuments();
  const apiFeatures = new Features(model.find(filterData), req.query)
    .filter()
    .sort()
    .limitFields()
    .search(modelName)
    .pagination(countDocuments);

  const { mongooseQuery, paginationResult } = apiFeatures;
  const documents: ModelType[] = await mongooseQuery;

  res.status(200).json({
    length: documents.length,
    pagination: paginationResult,
    data: documents,
  });
});

export const getOne = <ModelType>(
  model: mongoose.Model<any>, 
  population?: string
) => asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let query = model.findById(req.params.id);
  if (population) {
    query = query.populate(population);
  }

  const document = await query;
  if (!document) {
    return next(new ApiErrors(req.__('not_found'), 404));
  }

  res.status(200).json({ data: document });
});

export const createOne = <ModelType>(
  model: mongoose.Model<any>
) => asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const document: ModelType = await model.create(req.body);
  res.status(201).json({ data: document });
});

export const updateOne = <ModelType>(
  model: mongoose.Model<any>
) => asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const document = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!document) {
    return next(new ApiErrors(req.__('not_found'), 404));
  }

  await document.save();
  res.status(200).json({ data: document });
});

export const deleteOne = <ModelType>(
  model: mongoose.Model<any>
) => asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const document = await model.findByIdAndDelete(req.params.id);
  if (!document) {
    return next(new ApiErrors(req.__('not_found'), 404));
  }

  await document.remove();
  res.status(204).json({ data: null });
});
