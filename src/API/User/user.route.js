import express from 'express';
import fs from 'fs';
import * as UserController from './user.controller.js';
import multer from 'multer';

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads/users';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

router.post('/', upload.single('profileImage'), UserController.insertUser);

// Add User
// router.post('/', UserController.insertUser);

// User Login
router.post('/login', UserController.loginUser);

// User Logout
router.post('/logout', UserController.logoutUser);

// Get all users
router.get('/', UserController.getAllUser);

// Get user by ID
router.get('/:userId', UserController.getUserById);

// Update user
router.put('/:userId', UserController.updateUser);

// Delete user
router.delete('/:userId', UserController.deleteUser);

export default router;
