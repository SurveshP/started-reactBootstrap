import express from 'express';
import * as SubCategoryController from './subCategory.controller.js';

const router = express.Router();

// Add SubCategory
router.post('/', SubCategoryController.insertSubCategory);

// Get all SubCategories
router.get('/', SubCategoryController.getAllSubCategories);

// Get SubCategory by ID
router.get('/:subCategoryId', SubCategoryController.getSubCategoryById);

// Update SubCategory by ID
router.put('/:subCategoryId', SubCategoryController.updateSubCategory);

// Delete SubCategory by ID
router.delete('/:subCategoryId', SubCategoryController.deleteSubCategory);

// Search subCategories
router.get('/subCategories/search/subCategory', SubCategoryController.searchSubCategories);

export default router;
