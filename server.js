import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

import UserRouter from "./src/API/User/user.route.js";
import CategoryRouter from "./src/API/Product/Category/category.route.js";
import SubCategoryRouter from "./src/API/Product/Category/SubCategory/subCategory.route.js";
import BrandRouter from "./src/API/Product/Brand/brand.route.js";
import ProductRouter from "./src/API/Product/product.route.js";
import CartRouter from "./src/API/Cart/cart.route.js";
import OrderRouter from "./src/API/Order/order.route.js";
import PaymentMethodRouter from "./src/API/Payment/paymentMethod.route.js";

const app = express();
const PORT = 5000;

// Get the current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(
  session({
    // secret: process.env.SECRETKEY,
    secret: '78b979468841855ae58dd6c648921752ded602b32b481bcc747d9d99989b5d46',
    resave: false,
    saveUninitialized: false,
  })
);

// Serve static files like images
// app.use('/images', express.static(path.join(__dirname, 'uploads/products')));

// Routes
app.use("/user", UserRouter);
app.use("/category", CategoryRouter);
app.use("/subCategory", SubCategoryRouter);
app.use("/brand", BrandRouter);
app.use("/product", ProductRouter);
app.use("/cart", CartRouter);
app.use("/order", OrderRouter);
app.use("/payment", PaymentMethodRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
