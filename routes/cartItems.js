import express from 'express'
import { CartItem } from '../models/CartItem.js'
import { Product } from '../models/Product.js'
import { DeliveryOptions } from '../models/DeliveryOptions.js'

const router = express.Router();

router.get('/', async (req, res) => {
    const expand = req.query.expand;
    let cartItems = await CartItem.findAll();

    if (expand === 'product') {
        cartItems = await Promise.all(cartItems.map(
            async (item) => {
                const product = await Product.findByPk(item.productId);
                return {
                    ...item.toJSON(),
                    product
                };
            }
        ));
    }

    res.json(cartItems);
})


// API route to add a product to the cart
router.post('/', async (req, res) => {
    const { productId, quantity } = req.body;

    // Check if productId exists in the database
    const product = await Product.findByPk(productId);
    if (!product) {
        return res.status(400).json({ error: 'Product not found' });
    }

    // Check if quantity is a number between 1 and 10
    if (typeof quantity !== "number" || quantity < 1 ) {
        return res.status(400).json({ error: "Quantity must be a number greater than 0" })
    }

    // Check if the product already exists in the cart
    let cartItem = await CartItem.findOne({
        where: { productId }
    });
    if (cartItem) {
        // Increase the quantity
        cartItem.quantity += quantity;
        await cartItem.save();
    } else {
        // Add the product to the cart with default deliveryOptionId of "1"
        cartItem = await CartItem.create({ productId, quantity, deliveryOptionId: "1" })
    }

    // res.status(201).json({ success: true });
    res.status(201).json(cartItem);
});


// API route to update a product in the cart
router.put('/', async (req, res) => {
    const { productId } = req.params;
    const { quantity, deliveryOptionId } = req.body;

    // Check if the cart item exists
    const cartItem = await CartItem.findOne({
        where: { productId }
    });
    if (!cartItem) {
        return res.status(404).json({ error: 'Cart item not found' });
    }

    // Validate quantity if provided
    if (quantity !== undefined) {
        if (typeof quantity !== "number" || quantity < 1 || quantity > 10) {
            return res.status(400).json({ error: 'Quantity must be a number between 1 and 10' });
        }

        cartItem.quantity = quantity;
    }

    // Validate deliveryOptionId if provided
    if (deliveryOptionId !== undefined) {
        const deliveryOption = await DeliveryOptions.findByPk(deliveryOptionId);
        if (!deliveryOption) {
            return res.status(400).json({ error: "Invalid delivery option" });
        }

        cartItem.deliveryOptionId = deliveryOptionId;
    }

    await cartItem.save();
    res.json(cartItem);
});

// API route to delete a product from the cart
router.delete("/", async (req, res) => {
    const { productId } = req.params;

    // Check if the cart item exists
    const cartItem = await CartItem.findOne({
        where: { productId }
    });
    if (!cartItem) {
        return res.status(404).json({ error: "Cart item not found" });
    }

    // Delete the cart item
    await cartItem.destroy();
    res.status(204).send();
})


export default router;