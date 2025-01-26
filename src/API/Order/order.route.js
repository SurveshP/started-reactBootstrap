import express from 'express';
import * as OrderController from './order.controller.js';

const router = express.Router();

// Add item to cart
router.post('/', OrderController.placeOrder);

// Add item to cart
router.post('/orderId', OrderController.updateOrder);

export default router;
