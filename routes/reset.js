import express from "express";
import { sequelize } from "../models/index.js"
import { Product } from "../models/Product.js";
import { defaultProducts } from "../defaultData/defaultProducts.js";
import { DeliveryOptions } from "../models/DeliveryOptions.js"
import { defaultDeliveryOptions } from "../defaultData/defaultDeliveryOptions.js";
import { CartItem } from "../models/CartItem.js";
import { defaultCartItem } from "../defaultData/defaultCartItem.js";
import { Order } from "../models/Order.js";
import { defaultOrders } from "../defaultData/defaultOrders.js";


const router = express.Router();

// API route to reset all data
router.post('/', async (req, res) => {
    await sequelize.sync({ force: true });

    // Load default data
    await Product.bulkCreate(defaultProducts)
    await DeliveryOptions.bulkCreate(defaultDeliveryOptions)
    await CartItem.bulkCreate(defaultCartItem)
    await Order.bulkCreate(defaultOrders)

    res.status(204).send();
})


export default router;