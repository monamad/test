import { Router } from "express";
import { allowedTo, checkActive, protectRoutes } from "../controllers/auth";
import { createCoupon, deleteCoupon, getCoupon, getCoupons, updateCoupon } from "../controllers/coupons";
import { createCouponValidator, deleteCouponValidator, getCouponValidator, updateCouponValidator } from "../utils/validation/couponsValidator";

const couponsRoute: Router = Router();
couponsRoute.use(protectRoutes, checkActive, allowedTo('manager', 'admin'))

couponsRoute.route('/')
  .get(getCoupons)
  .post(createCouponValidator, createCoupon);

couponsRoute.route('/:id')
  .get(getCouponValidator, getCoupon)
  .put(updateCouponValidator, updateCoupon)
  .delete(deleteCouponValidator, deleteCoupon);

export default couponsRoute;