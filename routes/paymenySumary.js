import express from "express"
import { CartItem } from "../models/CartItem.js"
import { Product } from "../models/Product.js"
import { DeliveryOptions } from "../models/DeliveryOptions.js"

const router = express.Router();

router.get('/', async (req, res) => {
    const cartItems = await CartItem.findAll();
    let totalItems = 0;
    let productCostCents = 0;
    let shippingCostCents = 0;

    for (const item of cartItems) {
        const product = await Product.findByPk(item.productId);
        const deliveryOption = await DeliveryOptions.findByPk(item.deliveryOptionId);
        totalItems += item.quantity;
        productCostCents += product.priceCents * item.quantity;
        shippingCostCents += deliveryOption.priceCents;
    }

    const totalCostBeforeTaxCents = productCostCents + shippingCostCents;
    const taxCents = Math.round(totalCostBeforeTaxCents * 0.1);
    const totalCostCents = totalCostBeforeTaxCents + taxCents;
    
    res.json({
        totalItems,
        productCostCents,
        shippingCostCents,
        totalCostBeforeTaxCents,
        taxCents,
        totalCostCents
    });
});

export default router;