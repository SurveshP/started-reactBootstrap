import fs from 'fs';
import path from 'path';

// Utility function to generate unique sub-category ID
function generateSubCategoryId(categoryId, existingSubCategories) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const matchingIds = existingSubCategories
        .map(subCategory => subCategory.subCategoryId)
        .filter(id => id.startsWith(randomPart));
    if (matchingIds.length > 0) {
        return generateCategoryId(existingSubCategories);
    }
    return randomPart;
}

// Insert a new sub-category into the JSON file
export async function insertSubCategory(req, res) {
  try {
    const { categoryId, subCategoryName } = req.body;

    if (!categoryId || !subCategoryName) {
      return res.status(400).json({
        message: 'Category ID and SubCategory name are required',
      });
    }

    const categoryFilePath = path.resolve('dataCategory.json');
    const subCategoryFilePath = path.resolve('dataSubCategory.json');

    if (!fs.existsSync(categoryFilePath)) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    const categories = JSON.parse(fs.readFileSync(categoryFilePath, 'utf8'));
    const categoryExists = categories.some(cat => cat.categoryId === categoryId);

    if (!categoryExists) {
      return res.status(404).json({ message: 'Category does not exist.' });
    }

    const existingSubCategories = fs.existsSync(subCategoryFilePath) ? JSON.parse(fs.readFileSync(subCategoryFilePath, 'utf8')) : [];
    const subCategoryId = generateSubCategoryId(categoryId, existingSubCategories);

    const newSubCategory = {
      subCategoryId,
      subCategoryName,
      categoryId,
    };

    console.log("newSubCategory ---> ", newSubCategory);
    
    existingSubCategories.push(newSubCategory);
    fs.writeFileSync(subCategoryFilePath, JSON.stringify(existingSubCategories, null, 2), 'utf8');

    res.status(201).json({ message: 'Sub-category added successfully', subCategoryId });
  } catch (error) {
    console.error('Error adding sub-category:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Get all sub-categories
export async function getAllSubCategories(req, res) {
  try {
    const subCategoryFilePath = path.resolve('dataSubCategory.json');

    if (!fs.existsSync(subCategoryFilePath)) {
      return res.status(404).json({ message: 'No sub-categories found.' });
    }

    const subCategories = JSON.parse(fs.readFileSync(subCategoryFilePath, 'utf8'));
    res.status(200).json({ subCategories });
  } catch (error) {
    console.error('Error fetching sub-categories:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Get sub-category by ID with category details inside categoryId
export async function getSubCategoryById(req, res) {
  try {
    const { subCategoryId } = req.params;

    // Helper to read and parse JSON file
    const readJSONFile = (filePath) => fs.existsSync(filePath) && JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Read sub-categories and categories
    const [subCategories, categories] = [readJSONFile('dataSubCategory.json'), readJSONFile('dataCategory.json')];

    if (!subCategories || !categories) return res.status(404).json({ message: 'Data files are missing.' });

    // Find the sub-category and merge with the related category
    const subCategory = subCategories.find(sub => sub.subCategoryId === subCategoryId);
    if (!subCategory) return res.status(404).json({ message: 'Sub-category not found.' });

    const category = categories.find(cat => cat.categoryId === subCategory.categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found.' });

    res.status(200).json({ subCategory: { ...subCategory, categoryId: category } });
  } catch (error) {
    console.error('Error fetching sub-category:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Update sub-category by ID
export async function updateSubCategory(req, res) {
  try {
    const { subCategoryId } = req.params;
    const { subCategoryName, categoryId } = req.body;

    const subCategoryFilePath = path.resolve('dataSubCategory.json');
    if (!fs.existsSync(subCategoryFilePath)) {
      return res.status(404).json({ message: 'Sub-category not found.' });
    }

    const subCategories = JSON.parse(fs.readFileSync(subCategoryFilePath, 'utf8'));
    const subCategoryIndex = subCategories.findIndex(sub => sub.subCategoryId === subCategoryId);

    if (subCategoryIndex === -1) {
      return res.status(404).json({ message: 'Sub-category not found.' });
    }

    subCategories[subCategoryIndex] = {
      ...subCategories[subCategoryIndex],
      subCategoryName: subCategoryName || subCategories[subCategoryIndex].subCategoryName,
      categoryId: categoryId || subCategories[subCategoryIndex].categoryId,
    };

    fs.writeFileSync(subCategoryFilePath, JSON.stringify(subCategories, null, 2), 'utf8');

    res.status(200).json({ message: 'Sub-category updated successfully' });
  } catch (error) {
    console.error('Error updating sub-category:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Delete sub-category by ID
export async function deleteSubCategory(req, res) {
  try {
    const { subCategoryId } = req.params;
    const subCategoryFilePath = path.resolve('dataSubCategory.json');

    if (!fs.existsSync(subCategoryFilePath)) {
      return res.status(404).json({ message: 'Sub-category not found.' });
    }

    const subCategories = JSON.parse(fs.readFileSync(subCategoryFilePath, 'utf8'));
    const subCategoryIndex = subCategories.findIndex(sub => sub.subCategoryId === subCategoryId);

    if (subCategoryIndex === -1) {
      return res.status(404).json({ message: 'Sub-category not found.' });
    }

    subCategories.splice(subCategoryIndex, 1);
    fs.writeFileSync(subCategoryFilePath, JSON.stringify(subCategories, null, 2), 'utf8');

    res.status(200).json({ message: 'Sub-category deleted successfully' });
  } catch (error) {
    console.error('Error deleting sub-category:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Search subCategories by query
export async function searchSubCategories(req, res) {
  try {
    const { q } = req.query; // Ensure query parameter is named `q`
    if (!q) {
      return res.status(400).json({ message: 'Search query is required.' });
    }

    // File paths for sub-categories and categories
    const subCategoryFilePath = path.resolve('dataSubCategory.json');
    const categoryFilePath = path.resolve('dataCategory.json');

    // Check if sub-category and category files exist
    if (!fs.existsSync(subCategoryFilePath) || !fs.existsSync(categoryFilePath)) {
      return res.status(404).json({ message: 'Sub-category or category data not found.' });
    }

    const subCategories = JSON.parse(fs.readFileSync(subCategoryFilePath, 'utf8')) || [];
    const categories = JSON.parse(fs.readFileSync(categoryFilePath, 'utf8')) || [];

    if (!Array.isArray(subCategories) || !Array.isArray(categories)) {
      return res.status(500).json({ message: 'Invalid data format.' });
    }

    const searchQuery = q.toLowerCase();

    // Filter sub-categories based on categoryName and subCategoryName
    const filteredSubCategories = subCategories.filter((subCategory) => {
      const matchesSubCategoryName = subCategory.subCategoryName?.toLowerCase().includes(searchQuery);
      
      // Find the related category by categoryId
      const category = categories.find(cat => cat.categoryId === subCategory.categoryId);
      const matchesCategoryName = category && category.categoryName?.toLowerCase().includes(searchQuery);

      return matchesSubCategoryName || matchesCategoryName;
    });

    res.status(200).json({ subCategories: filteredSubCategories });
  } catch (error) {
    console.error('Error searching subCategories:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}



