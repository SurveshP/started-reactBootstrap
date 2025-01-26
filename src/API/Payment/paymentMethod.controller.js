import fs from 'fs';
import path from 'path';

export async function savePayment(req, res) {
    try {
        const { userId, productId, paymentDetails, totalAmount, paymentMethod } = req.body;

        if (!userId || !productId || !paymentDetails || !totalAmount || !paymentMethod) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Path to order and product data files
        const orderFilePath = path.resolve('dataOrders.json');
        const productFilePath = path.resolve('dataProduct.json');

        // Ensure the required files exist
        if (!fs.existsSync(orderFilePath) || !fs.existsSync(productFilePath)) {
            return res.status(404).json({ message: 'Required data files not found.' });
        }

        const orders = JSON.parse(fs.readFileSync(orderFilePath, 'utf8'));
        const products = JSON.parse(fs.readFileSync(productFilePath, 'utf8'));

        // Validate product and user data
        const product = products.find(prod => prod.productId === productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        const order = orders.find(order => order.userId === userId && order.products.some(p => p.productId === productId));
        if (!order) {
            return res.status(404).json({ message: 'Order not found for the given user and product.' });
        }

        // Deduct quantity from product
        const productIndex = products.findIndex(prod => prod.productId === productId);
        const orderedProduct = order.products.find(p => p.productId === productId);

        if (product.quantity < orderedProduct.quantity) {
            return res.status(400).json({ message: 'Insufficient product quantity available.' });
        }

        products[productIndex].quantity -= orderedProduct.quantity;

        // Save updated product data
        fs.writeFileSync(productFilePath, JSON.stringify(products, null, 2), 'utf8');

        // Create a new payment object
        const payment = {
            paymentId: Date.now(),
            userId,
            productId,
            paymentDetails,
            totalAmount,     // Ensure totalAmount is passed properly
            paymentMethod,   // Ensure paymentMethod is passed properly
            paymentDate: new Date(),
        };

        // Append payment to a payment file (if needed)
        const paymentFilePath = path.resolve('dataPayments.json');
        if (!fs.existsSync(paymentFilePath)) {
            fs.writeFileSync(paymentFilePath, JSON.stringify([], null, 2), 'utf8');
        }

        const payments = JSON.parse(fs.readFileSync(paymentFilePath, 'utf8'));
        payments.push(payment);
        fs.writeFileSync(paymentFilePath, JSON.stringify(payments, null, 2), 'utf8');

        res.status(200).json({ message: 'Payment recorded and product quantity updated successfully', payment });
    } catch (error) {
        console.error('Error in savePayment:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
