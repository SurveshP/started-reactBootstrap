import fs from 'fs';
import path from 'path';

export async function addToCart(req, res) {
    try {
        const { userId, cart } = req.body;

        if (!userId || !cart) {
            return res.status(400).json({ message: 'User ID and cart are required.' });
        }

        const cartFilePath = path.resolve('dataCart.json');

        // Ensure the cart file exists or create it
        if (!fs.existsSync(cartFilePath)) {
            fs.writeFileSync(cartFilePath, JSON.stringify([], null, 2), 'utf8');
        }

        const cartData = JSON.parse(fs.readFileSync(cartFilePath, 'utf8'));

        // Update or add the user's cart
        const userCartIndex = cartData.findIndex(item => item.userId === userId);

        if (userCartIndex !== -1) {
            // Update the existing cart
            const userCart = cartData[userCartIndex];
            const productIndex = userCart.cart.findIndex(item => item.productId === cart[0].productId);

            if (productIndex !== -1) {
                userCart.cart[productIndex].quantity += cart[0].quantity;
            } else {
                userCart.cart.push(cart[0]);
            }
        } else {
            // Create a new cart for the user
            cartData.push({ userId, cart });
        }

        fs.writeFileSync(cartFilePath, JSON.stringify(cartData, null, 2), 'utf8');

        res.status(200).json({ message: 'Cart updated successfully.' });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


// Get all items in the cart
export async function getCartItems(req, res) {
    try {
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        const cartFilePath = path.resolve('dataCart.json');

        if (!fs.existsSync(cartFilePath)) {
            return res.status(200).json({ cartItems: [] });
        }

        const cartData = JSON.parse(fs.readFileSync(cartFilePath, 'utf8'));
        const userCart = cartData.find(item => item.userId === userId);

        return res.status(200).json({ cartItems: userCart ? userCart.cart : [] });
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

// Remove an item from the cart
export async function removeCartItem(req, res) {
    try {
        const { productId } = req.params; // Get productId from the URL
        const userId = req.headers.userid; // Get userId from request headers
        const filePath = path.resolve('dataCart.json'); // Path to the cart data

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Cart is empty' });
        }

        const cartData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Find the user's cart
        const userCartIndex = cartData.findIndex(cart => cart.userId === userId);

        if (userCartIndex === -1) {
            return res.status(404).json({ message: 'User cart not found' });
        }

        const userCart = cartData[userCartIndex];

        // Remove the specific product from the user's cart
        userCart.cart = userCart.cart.filter(item => item.productId !== productId);

        // Update the cart data
        cartData[userCartIndex] = userCart;

        fs.writeFileSync(filePath, JSON.stringify(cartData, null, 2), 'utf8');

        res.status(200).json({ message: 'Item removed from cart', cart: userCart.cart });
    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export async function updateCartQuantity(req, res) {
    try {
        const { productId } = req.params; // Extract productId from URL params
        const { userId, quantity } = req.body; // Extract userId and new quantity from request body

        if (!userId || !productId || quantity === undefined) {
            return res.status(400).json({ message: 'User ID, product ID, and quantity are required.' });
        }

        const cartFilePath = path.resolve('dataCart.json');

        if (!fs.existsSync(cartFilePath)) {
            return res.status(404).json({ message: 'Cart data not found.' });
        }

        const cartData = JSON.parse(fs.readFileSync(cartFilePath, 'utf8'));
        const userCartIndex = cartData.findIndex((item) => item.userId === userId);

        if (userCartIndex === -1) {
            return res.status(404).json({ message: 'User cart not found.' });
        }

        const userCart = cartData[userCartIndex];
        const productIndex = userCart.cart.findIndex((item) => item.productId === productId);

        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart.' });
        }

        // Update the quantity
        userCart.cart[productIndex].quantity = quantity;

        // Save updated cart data
        fs.writeFileSync(cartFilePath, JSON.stringify(cartData, null, 2), 'utf8');

        res.status(200).json({ message: 'Cart quantity updated successfully.', cart: userCart.cart });
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
