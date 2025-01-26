import express from 'express';
import fs from 'fs';
import path from 'path';
import * as CategoryController from './category.controller.js';
import multer from 'multer';

const router = express.Router();

// Configure multer storage for category images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads/categories';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// Add new category with image
router.post('/', upload.single('categoryImage'), CategoryController.insertCategory);

// Get all categories
router.get('/', CategoryController.getAllCategories);

// Get category by ID
router.get('/:categoryId', CategoryController.getCategoryById);

// Update category by ID with image
router.put('/:categoryId', upload.single('categoryImage'), CategoryController.updateCategory);

// Delete category by ID
router.delete('/:categoryId', CategoryController.deleteCategory);

// Search categories by categoryName
router.get('/search', CategoryController.searchCategory);

export default router;