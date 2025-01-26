import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Manually define __dirname in ES Modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Utility function to generate a unique product ID
function generateProductId(existingProducts) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const matchingIds = existingProducts
        .map(product => product.productId)
        .filter(id => id.startsWith(randomPart));
    if (matchingIds.length > 0) {
        return generateProductId(existingProducts);
    }
    return randomPart;
}

// Insert a new product
export async function insertProduct(req, res) {
    try {
        const { categoryName, subCategoryName, brandName, productName, price, quantity, description, userId } = req.body;
        const productImage = req.file; // This will handle the image uploaded by the user

        console.log("categoryName, subCategoryName, brandName, productName, productImage, price, quantity, description ---", categoryName, subCategoryName, brandName, productName, productImage, price, quantity, description);

        // Validate input
        if (!categoryName || !subCategoryName || !brandName || !productName || !productImage || !price || !quantity) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const filePath = path.resolve('dataProduct.json');

        // Ensure file exists or create it
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
        }

        const existingProducts = JSON.parse(fs.readFileSync(filePath, 'utf8')) || [];
        const productId = generateProductId(existingProducts);

        const newProduct = {
            productId,
            categoryName,
            subCategoryName,
            brandName,
            productName,
            productImage: productImage.path, // Save image path
            price,
            quantity,
            description,
            userId,  // Add userId
            activeStatus: true, // Default active status
        };

        existingProducts.push(newProduct);
        fs.writeFileSync(filePath, JSON.stringify(existingProducts, null, 2), 'utf8');

        res.status(200).json({ message: 'Product added successfully', productId });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Update a product by ID
export async function updateProduct(req, res) {
    try {
        const { productId } = req.params;
        const { productName, price, quantity, description } = req.body;
        const productImage = req.file;

        const filePath = path.resolve('dataProduct.json');

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const productIndex = products.findIndex(prod => prod.productId === productId);

        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        products[productIndex] = {
            ...products[productIndex],
            productName: productName || products[productIndex].productName,
            productImage: productImage ? productImage.path : products[productIndex].productImage,
            price: price || products[productIndex].price,
            quantity: quantity || products[productIndex].quantity,
            description: description || products[productIndex].description,
        };

        fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf8');

        res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Get all products
export async function getAllProducts(req, res) {
    try {
        const filePath = path.resolve('dataProduct.json');
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({ message: 'No products found.' });
        }
    
        const products = JSON.parse(fs.readFileSync(filePath, 'utf8')) || [];
        res.status(200).json({ products });
      } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'Internal Server Error' });
      }
}

// Get product by ID
export async function getProductById(req, res) {
    try {
        const { productId } = req.params;
        console.log("productId ---> ", productId);

        // File paths for product and user data
        const productFilePath = path.resolve('dataProduct.json');
        const userFilePath = path.resolve('dataUser.json');

        // Check if product and user files exist
        if (!fs.existsSync(productFilePath) || !fs.existsSync(userFilePath)) {
            return res.status(404).json({ message: 'Product or User data not found.' });
        }

        // Read product and user data
        const products = JSON.parse(fs.readFileSync(productFilePath, 'utf8'));
        const users = JSON.parse(fs.readFileSync(userFilePath, 'utf8'));

        // Find the product by productId
        const product = products.find(prod => prod.productId === productId);
        console.log("product ---> ", product);

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Find the user associated with the userId in the product
        const user = users.find(user => user.userId === product.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found for this product.' });
        }

        // Merge user details into the product response
        const response = {
            ...product,
            userId: user,  // Adding the user details to the response
        };

        res.status(200).json({ product: response });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Delete product by ID
export async function deleteProduct(req, res) {
    try {
        const { productId } = req.params;
        const filePath = path.resolve('dataProduct.json');

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const productIndex = products.findIndex(prod => prod.productId === productId);

        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        const [deletedProduct] = products.splice(productIndex, 1);
        fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf8');

        // Remove the product image file if it exists
        if (fs.existsSync(deletedProduct.productImage)) {
            fs.unlinkSync(deletedProduct.productImage);
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Get products by userId
export async function getProductsByUserId(req, res) {
    try {
        const { userId } = req.params; // Retrieve userId from URL path
        const filePath = path.resolve('dataProduct.json');

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'No products found.' });
        }

        // Read and parse the JSON file
        const products = JSON.parse(fs.readFileSync(filePath, 'utf8')) || [];

        // Filter products by userId
        const userProducts = products.filter(prod => prod.userId === userId);

        // Log the userId and filtered products for debugging
        console.log('Requested UserId:', userId);
        console.log('Filtered Products:', userProducts);

        // Return appropriate response
        if (userProducts.length === 0) {
            return res.status(404).json({ message: 'No products found for this user.' });
        }

        res.status(200).json({ products: userProducts });
    } catch (error) {
        console.error('Error fetching products for user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Get products by subCategoryName
export async function getProductsBySubCategory(req, res) {
    try {
        const { subCategoryName } = req.params;
        const filePath = path.resolve('dataProduct.json');

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'No products found.' });
        }

        const products = JSON.parse(fs.readFileSync(filePath, 'utf8')) || [];
        const filteredProducts = products.filter(prod => prod.subCategoryName === subCategoryName);
        console.log("filteredProducts ---> ", filteredProducts);


        if (filteredProducts.length === 0) {
            return res.status(404).json({ message: 'No products found for this subcategory.' });
        }

        res.status(200).json({ products: filteredProducts });
    } catch (error) {
        console.error('Error fetching products for subcategory:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Search products by productName or brandName or categoryName or subCategoryName
export async function searchProducts(req, res) {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: 'Search query is required.' });
        }

        console.log("Search Query --->", query);

        // Adjust file path as per your project structure
        const filePath = path.resolve('dataProduct.json'); // Update to the correct relative or absolute path
        console.log("Resolved File Path --->", filePath);

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'No products found.' });
        }

        // Read and parse the product data
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const products = JSON.parse(fileContent) || [];

        if (!Array.isArray(products)) {
            return res.status(500).json({ message: 'Invalid product data format.' });
        }

        const searchQuery = query.toLowerCase();

        // Filter products based on search query
        const filteredProducts = products.filter(
            (prod) =>
                prod.productName?.toLowerCase().includes(searchQuery) ||
                prod.categoryName?.toLowerCase().includes(searchQuery) ||
                prod.subCategoryName?.toLowerCase().includes(searchQuery) ||
                prod.brandName?.toLowerCase().includes(searchQuery)
        );

        return res.status(200).json({ products: filteredProducts });
    } catch (error) {
        console.error('Error searching products:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Search products by userId and query (productName, categoryName, subCategoryName, or brandName)
export async function searchProductsByUserId(req, res) {
    try {
        const { userId } = req.params; // Extract userId from URL parameters
        const { query } = req.query; // Extract search query from URL query

        // Validate input
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        if (!query) {
            return res.status(400).json({ message: 'Search query is required.' });
        }

        console.log("Search Query --->", query);
        console.log("UserId --->", userId);

        const filePath = path.resolve('dataProduct.json'); // Adjust the path as needed
        console.log("Resolved File Path --->", filePath);

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'No products found.' });
        }

        // Read and parse the product data
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const products = JSON.parse(fileContent) || [];

        if (!Array.isArray(products)) {
            return res.status(500).json({ message: 'Invalid product data format.' });
        }

        const searchQuery = query.toLowerCase();

        // Filter products based on userId and search query
        const filteredProducts = products.filter((prod) => {
            return (
                prod.userId === userId && // Match userId
                (
                    prod.productName?.toLowerCase().includes(searchQuery) || // Match productName
                    prod.categoryName?.toLowerCase().includes(searchQuery) || // Match categoryName
                    prod.subCategoryName?.toLowerCase().includes(searchQuery) || // Match subCategoryName
                    prod.brandName?.toLowerCase().includes(searchQuery) // Match brandName
                )
            );
        });

        // Return filtered products
        if (filteredProducts.length === 0) {
            return res.status(404).json({ message: 'No products found for this user and query.' });
        }

        res.status(200).json({ products: filteredProducts });
    } catch (error) {
        console.error('Error searching products by userId:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
