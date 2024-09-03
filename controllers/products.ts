import { Request, Response, NextFunction } from "express";
import { createOne, deleteOne, getAll, getOne, updateOne } from "./refactorHandler";
import sharp from 'sharp';
import { Products } from "../interfaces/products";
import productsModel from "../models/productsModel";
import asyncHandler from 'express-async-handler';
import { uploadMultiImages } from "../middlewares/uploadImages";

export const uploadProductImages = uploadMultiImages([
  { name: 'cover', maxCount: 1 },
  { name: 'images', maxCount: 5 }
]);

export const resizeImages = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (req.files) {
    if (req.files.cover) {
      const coverName: string = `Product-${Date.now()}-cover.png`;
      await sharp(req.files.cover[0].buffer)
        .toFormat('png')
        .png({ quality: 95 })
        .toFile(`uploads/products/${coverName}`);
      req.body.cover = coverName;
    }

    if (req.files.images) {
      req.body.images = [];
      await Promise.all(req.files.images.map(async (img: any, index: number) => {
        const imageName: string = `Product-${Date.now()}N${index + 1}.png`;
        await sharp(img.buffer)
          .toFormat('png')
          .png({ quality: 95 })
          .toFile(`uploads/products/${imageName}`);
        req.body.images.push(imageName);
      }));
    }
  }
  next();
});

export const createProduct = createOne<Products>(productsModel);
export const getProducts = getAll<Products>(productsModel, 'products');
export const getProduct = getOne<Products>(productsModel, 'reviews');
export const updateProduct = updateOne<Products>(productsModel);
export const deleteProduct = deleteOne<Products>(productsModel);
