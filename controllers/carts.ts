
import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import cartsModel from '../models/cartsModel';
import ApiErrors from '../utils/apiErrors';
import productsModel from '../models/productsModel';
import { CartProducts, Carts } from '../interfaces/carts';
import couponsModel from '../models/couponsModel';

export const getLoggedUserCart = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const cart = await cartsModel.findOne({ user: req.user?._id });
  if (!cart) {
    return next(new ApiErrors("this user don't have cart yet", 404))
  };
  res.status(200).json({ length: cart.cartItems.length, data: cart });
});

export const addProductToCart = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const product = await productsModel.findById(req.body.product);
  if (!product) {
    return next(new ApiErrors('Product Not found', 404))
  }
  let cart: any = await cartsModel.findOne({ user: req.user?._id });
  if (!cart) {
    cart = await cartsModel.create({
      user: req.user?._id,
      cartItems: [{ product: req.body.product, price: product?.price }]
    });
  }
  else {
    const productIndex = cart.cartItems.findIndex((item: CartProducts) => item.product._id!.toString() === req.body.product.toString());
    if (productIndex > -1) {
      cart.cartItems[productIndex].quantity += 1;
    }
    else {
      cart.cartItems.push({ product: req.body.product, price: product.price })
    }
  }
  calcTotalPrice(cart)
  await cart.save();
  res.status(200).json({ length: cart.cartItems.length, data: cart });
});

export const removeProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const cart: any = await cartsModel.findOneAndUpdate({ user: req.user?._id }, {
    $pull: { cartItems: { _id: req.params.itemId } }
  }, { new: true })
  calcTotalPrice(cart);
  await cart.save();
  res.status(200).json({ length: cart.cartItems.length, data: cart });
});

export const updateProductQuantity = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const cart = await cartsModel.findOne({ user: req.user?._id });
  if (!cart) { return next(new ApiErrors("this user don't have cart yet", 404)) }
  const productIndex = cart.cartItems.findIndex((item: CartProducts) => item._id!.toString() === req.params.itemId.toString());
  if (productIndex > -1) {
    cart.cartItems[productIndex].quantity = req.body.quantity;
    calcTotalPrice(cart);
  } else {
    return next(new ApiErrors("product not found in cart", 404))
  }
  await cart.save();
  res.status(200).json({ length: cart.cartItems.length, data: cart });
});

export const applyCoupon = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const coupon = await couponsModel.findOne({
    name: req.body.name,
    expireTime: { $gt: Date.now() }
  });
  if (!coupon) { return next(new ApiErrors('invalid or expired coupon', 400)) }
  const cart: any = await cartsModel.findOne({ user: req.user?._id });
  const totalPrice: number = cart.totalPrice;
  const totalPriceAfterDiscount = (totalPrice - (totalPrice * (coupon.discount / 100))).toFixed(2);
  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();
  res.status(200).json({ length: cart.cartItems.length, data: cart });
});

export const clearCart = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await cartsModel.findOneAndDelete({ user: req.user?._id });
  res.status(204).json();
});

const calcTotalPrice = (cart: Carts): number => {
  let totalPrice: number = 0;
  cart.cartItems.forEach((item: CartProducts) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
}