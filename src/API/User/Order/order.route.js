import express from 'express';
import * as OrderController from './order.controller.js';

const router = express.Router();

router.post('/place-order', OrderController.placeOrder);

export default router;
