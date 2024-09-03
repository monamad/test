import { Router } from "express";
import { allowedTo, checkActive, protectRoutes } from "../controllers/auth";
import { addProductToWishlist, getLoggedUserWishlist, removeProductFromWishlist } from "../controllers/wishlist";

const wishlistRoute: Router = Router();

wishlistRoute.use(protectRoutes, checkActive, allowedTo('user'))

wishlistRoute.route('/')
  .get(getLoggedUserWishlist)
  .post(addProductToWishlist)
wishlistRoute.route('/:product')
  .delete(removeProductFromWishlist)

export default wishlistRoute;