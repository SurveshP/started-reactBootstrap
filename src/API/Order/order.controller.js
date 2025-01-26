import fs from 'fs';
import path from 'path';

export async function placeOrder(req, res) {
    try {
        const { userId, products, totalAmount, shippingAddress, paymentMethod } = req.body;

        if (!userId || !products || !totalAmount || !shippingAddress || !paymentMethod) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const orderFilePath = path.resolve('dataOrders.json');

        if (!fs.existsSync(orderFilePath)) {
            fs.writeFileSync(orderFilePath, JSON.stringify([], null, 2), 'utf8');
        }

        const orderData = JSON.parse(fs.readFileSync(orderFilePath, 'utf8'));

        const newOrder = {
            orderId: Date.now(), // You can generate a unique orderId here
            userId,
            products,
            totalAmount,
            shippingAddress,
            paymentMethod,
            orderStatus: 'Pending',
            orderDate: new Date(),
        };

        orderData.push(newOrder);

        fs.writeFileSync(orderFilePath, JSON.stringify(orderData, null, 2), 'utf8');

        res.status(200).json({ message: 'Order placed successfully', order: newOrder });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


export async function updateOrder(req, res) {
    try {
        // Assuming the orderId is passed as a URL parameter
        const { orderId } = req.params; 
        const { orderStatus } = req.body; // Assuming the status is passed in the request body

        if (!orderId || !orderStatus) {
            return res.status(400).json({ message: 'OrderId and status are required.' });
        }

        // Retrieve userId from sessionStorage
        const userId = req.session.userId; // Assuming sessionStorage stores the userId (You may need to adjust this depending on your setup)
        if (!userId) {
            return res.status(400).json({ message: 'User is not authenticated.' });
        }

        // Ensure the orders file exists
        const orderFilePath = path.resolve('dataOrders.json');
        if (!fs.existsSync(orderFilePath)) {
            return res.status(404).json({ message: 'Orders file not found.' });
        }

        // Read existing order data
        const orderData = JSON.parse(fs.readFileSync(orderFilePath, 'utf8'));

        // Find the order by orderId and userId
        const orderIndex = orderData.findIndex(order => order.orderId === parseInt(orderId) && order.userId === userId);
        if (orderIndex === -1) {
            return res.status(404).json({ message: 'Order not found or user does not own the order.' });
        }

        // Update the order status
        orderData[orderIndex].orderStatus = orderStatus;

        // Save the updated orders data
        fs.writeFileSync(orderFilePath, JSON.stringify(orderData, null, 2), 'utf8');

        res.status(200).json({ message: 'Order status updated successfully', order: orderData[orderIndex] });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}