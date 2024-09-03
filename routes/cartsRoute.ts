import { Router } from "express";
import { allowedTo, checkActive, protectRoutes } from "../controllers/auth";
import { addProductToCart, applyCoupon, clearCart, getLoggedUserCart, removeProduct, updateProductQuantity } from "../controllers/carts";
import { addProductToCartValidator, removeProductFromCartValidator, updateProductQuantityValidator } from "../utils/validation/cartsValidator";

const cartsRoute: Router = Router();
cartsRoute.use(protectRoutes, checkActive, allowedTo('user'))

cartsRoute.route('/')
  .get(getLoggedUserCart)
  .post(addProductToCartValidator, addProductToCart)
  .delete(clearCart);

cartsRoute.put('/applyCoupon', applyCoupon)

cartsRoute.route('/:itemId') // TODO: item id is belong to object id
  .put(updateProductQuantityValidator, updateProductQuantity)
  .delete(removeProductFromCartValidator, removeProduct);

export default cartsRoute;