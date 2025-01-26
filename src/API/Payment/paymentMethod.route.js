import express from 'express';
import * as PaymentMethodController from './paymentMethod.controller.js';

const router = express.Router();

// Add item to cart
router.post('/', PaymentMethodController.savePayment);

export default router;
