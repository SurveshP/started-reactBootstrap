import express from 'express';
import * as ProductController from './product.controller.js';
import multer from 'multer';
import fs from 'fs';

const router = express.Router();

// Configure multer storage for product images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads/products';
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

// Add new product with image
router.post('/', upload.single('productImage'), ProductController.insertProduct);

// Get all products
router.get('/', ProductController.getAllProducts);

// Get product by ID
router.get('/:productId', ProductController.getProductById);

// Update product by ID with image
router.put('/:productId', upload.single('productImage'), ProductController.updateProduct);

// Delete product by ID
router.delete('/:productId', ProductController.deleteProduct);

// Get products by userId
router.get('/products/:userId', ProductController.getProductsByUserId);

// Get products by subCategoryName
router.get('/subcategory/:subCategoryName', ProductController.getProductsBySubCategory);

// Search products by productName or brandName
router.get('/products/search/product', ProductController.searchProducts);

// New search method by userId
router.get('/products/search/user/:userId', ProductController.searchProductsByUserId);

export default router;