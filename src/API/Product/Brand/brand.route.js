import express from 'express';
import * as BrandController from './brand.controller.js';

const router = express.Router();

// Add new brand
router.post('/', BrandController.insertBrand);

// Get all brands
router.get('/', BrandController.getAllBrands);

// Get brand by ID
router.get('/:brandId', BrandController.getBrandById);

// Update brand by ID
router.put('/:brandId', BrandController.updateBrand);

// Delete brand by ID
router.delete('/:brandId', BrandController.deleteBrand);

// Search brands by name
router.get('/search', BrandController.searchBrandByName);

export default router;
