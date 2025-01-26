import express from 'express';
import * as CartController from './cart.controller.js';

const router = express.Router();

// Add item to cart
router.post('/', CartController.addToCart);

// Get all cart items
router.get('/products', CartController.getCartItems); 

// Remove item from cart
router.delete('/product/cart/:productId', CartController.removeCartItem);

// Update cart qantity
router.put('/product/cart/:productId', CartController.updateCartQuantity);

export default router;
