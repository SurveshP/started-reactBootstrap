import fs from 'fs';
import path from 'path';

// Utility function to generate a unique brand ID
function generateBrandId(existingBrands) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Letters and numbers
  let randomPart = '';

  // Generate a 6-character random alphanumeric string
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Check if the generated ID already exists
  const matchingIds = existingBrands
    .map(brand => brand.brandId)
    .filter(id => id.startsWith(randomPart));

  // If the random ID already exists, regenerate it
  if (matchingIds.length > 0) {
    return generateBrandId(existingBrands);
  }

  return randomPart; // Return the random alphanumeric ID
}

// Insert a new brand into the JSON file
export async function insertBrand(req, res) {
  try {
    const { brandName } = req.body; // Removed brandLogo from the body

    // Validate input
    if (!brandName) {
      return res.status(400).json({ message: 'Brand name is required.' });
    }

    const filePath = path.resolve('dataBrand.json');

    // Ensure file exists or create it
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
    }

    // Read existing brands
    let existingBrands = [];
    try {
      const fileData = fs.readFileSync(filePath, 'utf8');
      existingBrands = JSON.parse(fileData);
    } catch (error) {
      console.error('Error reading/parsing JSON:', error);
      return res.status(500).json({ message: 'Error reading brands file.' });
    }

    // Ensure existingBrands is an array
    if (!Array.isArray(existingBrands)) {
      return res.status(500).json({ message: 'Brands data is corrupted.' });
    }

    // Generate unique brand ID
    const brandId = generateBrandId(existingBrands);
    const newBrand = { brandId, brandName };

    console.log("newBrand ---> ", newBrand);
    
    // Add new brand and save
    existingBrands.push(newBrand);
    fs.writeFileSync(filePath, JSON.stringify(existingBrands, null, 2), 'utf8');

    res.status(200).json({ message: 'Brand added successfully', brandId });
  } catch (error) {
    console.error('Error adding brand:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
}

// Fetch all brands from the JSON file
export async function getAllBrands(req, res) {
  try {
    const filePath = path.resolve('dataBrand.json');
    if (!fs.existsSync(filePath)) {
      return res.status(200).json([]); // Return an empty array if the file doesn't exist
    }

    const fileData = fs.readFileSync(filePath, 'utf8');
    const brands = JSON.parse(fileData);

    if (!Array.isArray(brands)) {
      return res.status(500).json({ message: 'Brands data is corrupted.' });
    }

    res.status(200).json(brands); // Return the array of brands
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Fetch brand by ID
export async function getBrandById(req, res) {
  try {
    const { brandId } = req.params;
    const filePath = path.resolve('dataBrand.json');

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Brand not found.' });
    }

    const fileData = fs.readFileSync(filePath, 'utf8');
    const brands = JSON.parse(fileData);
    const brand = brands.find(b => b.brandId === brandId);

    if (!brand) {
      return res.status(404).json({ message: 'Brand not found.' });
    }

    res.status(200).json(brand);
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Update brand by ID
export async function updateBrand(req, res) {
  try {
    const { brandId } = req.params;
    const { brandName } = req.body; // Removed brandLogo from the body
    const filePath = path.resolve('dataBrand.json');

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Brand not found.' });
    }

    const fileData = fs.readFileSync(filePath, 'utf8');
    const brands = JSON.parse(fileData);
    const brandIndex = brands.findIndex(b => b.brandId === brandId);

    if (brandIndex === -1) {
      return res.status(404).json({ message: 'Brand not found.' });
    }

    brands[brandIndex] = { brandId, brandName }; // Removed brandLogo from the update
    fs.writeFileSync(filePath, JSON.stringify(brands, null, 2), 'utf8');

    res.status(200).json({ message: 'Brand updated successfully' });
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Delete brand by ID
export async function deleteBrand(req, res) {
  try {
    const { brandId } = req.params;
    const filePath = path.resolve('dataBrand.json');

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Brand not found.' });
    }

    const fileData = fs.readFileSync(filePath, 'utf8');
    const brands = JSON.parse(fileData);
    const brandIndex = brands.findIndex(b => b.brandId === brandId);

    if (brandIndex === -1) {
      return res.status(404).json({ message: 'Brand not found.' });
    }

    brands.splice(brandIndex, 1);
    fs.writeFileSync(filePath, JSON.stringify(brands, null, 2), 'utf8');

    res.status(200).json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Search brands by brandName
export async function searchBrandByName(req, res) {
  try {
    const { name } = req.query; // Get search query from query params
    const filePath = path.resolve('dataBrand.json');

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'No brands found.' });
    }

    const fileData = fs.readFileSync(filePath, 'utf8');
    const brands = JSON.parse(fileData);

    if (!Array.isArray(brands)) {
      return res.status(500).json({ message: 'Brands data is corrupted.' });
    }

    // Filter brands by name (case-insensitive)
    const filteredBrands = brands.filter(brand =>
      brand.brandName.toLowerCase().includes(name.toLowerCase())
    );

    if (filteredBrands.length === 0) {
      return res.status(404).json({ message: 'No matching brands found.' });
    }

    res.status(200).json(filteredBrands);
  } catch (error) {
    console.error('Error searching brands:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
