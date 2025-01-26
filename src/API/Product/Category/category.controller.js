import fs from 'fs';
import path from 'path';

// Utility function to generate a unique category ID
function generateCategoryId(existingCategories) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const matchingIds = existingCategories
        .map(category => category.categoryId)
        .filter(id => id.startsWith(randomPart));
    if (matchingIds.length > 0) {
        return generateCategoryId(existingCategories);
    }
    return randomPart;
}

// Insert a new category
export async function insertCategory(req, res) {
    try {
        const { categoryName } = req.body;
        const categoryImage = req.file;

        // Validate input
        if (!categoryName || !categoryImage) {
            return res.status(400).json({ message: 'Category name and image are required.' });
        }

        const filePath = path.resolve('dataCategory.json');

        // Ensure file exists or create it
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
        }

        const existingCategories = JSON.parse(fs.readFileSync(filePath, 'utf8')) || [];
        const categoryId = generateCategoryId(existingCategories);

        const newCategory = {
            categoryId,
            categoryName,
            categoryImage: categoryImage.path, // Save image path
        };

        console.log("newCategory ---> ", newCategory);
        

        existingCategories.push(newCategory);
        fs.writeFileSync(filePath, JSON.stringify(existingCategories, null, 2), 'utf8');

        res.status(200).json({ message: 'Category added successfully', categoryId });
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Update a category by ID with image
export async function updateCategory(req, res) {
    try {
        const { categoryId } = req.params;
        const { categoryName } = req.body;
        const categoryImage = req.file;

        const filePath = path.resolve('dataCategory.json');

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        const categories = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const categoryIndex = categories.findIndex(cat => cat.categoryId === categoryId);

        if (categoryIndex === -1) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        categories[categoryIndex] = {
            ...categories[categoryIndex],
            categoryName: categoryName || categories[categoryIndex].categoryName,
            categoryImage: categoryImage ? categoryImage.path : categories[categoryIndex].categoryImage,
        };

        fs.writeFileSync(filePath, JSON.stringify(categories, null, 2), 'utf8');

        res.status(200).json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Get all categories
export async function getAllCategories(req, res) {
    try {
        const filePath = path.resolve('dataCategory.json');

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'No categories found.' });
        }

        const categories = JSON.parse(fs.readFileSync(filePath, 'utf8')) || [];
        res.status(200).json({ categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Get category by ID
export async function getCategoryById(req, res) {
    try {
        const { categoryId } = req.params;
        const filePath = path.resolve('dataCategory.json');

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        const categories = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const category = categories.find(cat => cat.categoryId === categoryId);

        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        res.status(200).json({ category });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Delete category by ID
export async function deleteCategory(req, res) {
    try {
        const { categoryId } = req.params;
        const filePath = path.resolve('dataCategory.json');

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        const categories = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const categoryIndex = categories.findIndex(cat => cat.categoryId === categoryId);

        if (categoryIndex === -1) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        const [deletedCategory] = categories.splice(categoryIndex, 1);
        fs.writeFileSync(filePath, JSON.stringify(categories, null, 2), 'utf8');

        // Remove the category image file if it exists
        if (fs.existsSync(deletedCategory.categoryImage)) {
            fs.unlinkSync(deletedCategory.categoryImage);
        }

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Search categories by categoryName
export async function searchCategory(req, res) {
    try {
        const { query } = req.query; // Extract the search query
        const filePath = path.resolve('dataCategory.json');

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'No categories found.' });
        }

        const categories = JSON.parse(fs.readFileSync(filePath, 'utf8')) || [];
        const matchingCategories = categories.filter(cat =>
            cat.categoryName.toLowerCase().includes(query.toLowerCase())
        );

        if (matchingCategories.length === 0) {
            return res.status(404).json({ message: 'No matching categories found.' });
        }

        res.status(200).json({ categories: matchingCategories });
    } catch (error) {
        console.error('Error searching categories:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}