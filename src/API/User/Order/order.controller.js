import fs from 'fs';
import path from 'path';

// Insert a new order
export async function placeOrder(req, res) {
    try {
        const { userId, products, totalAmount, shippingAddress, paymentMethod } = req.body;

        // Validate input
        if (!userId || !products || products.length === 0 || !totalAmount || !shippingAddress || !paymentMethod) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const filePath = path.resolve('dataOrders.json');

        // Ensure file exists or create it
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
        }

        const existingOrders = JSON.parse(fs.readFileSync(filePath, 'utf8')) || [];
        const orderId = `ORD-${Date.now()}`;

        const newOrder = {
            orderId,
            userId,
            products,
            totalAmount,
            shippingAddress,
            paymentMethod,
            status: 'Pending',
            createdAt: new Date().toISOString(),
        };

        existingOrders.push(newOrder);
        fs.writeFileSync(filePath, JSON.stringify(existingOrders, null, 2), 'utf8');

        res.status(201).json({ message: 'Order placed successfully', orderId });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}
