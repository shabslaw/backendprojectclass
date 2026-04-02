import express from 'express'
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { DeliveryOptions } from '../models/DeliveryOptions.js';
import { CartItem } from '../models/CartItem.js';


const router = express.Router();


// API route to get all orders
router.get('/', async (req, res) => {
    const expand = req.query.expand;
    // let orders = await Order.findAll();
    let orders = await Order.findAll({ order: [['orderTimeMs', 'DESC']] }); // Sort by most recent

    if (expand === 'products') {
        orders = await Promise.all(orders.map(
            async (order) => {
                const products = await Promise.all(order.products.map(async (product) => {
                    const productDetails = await Product.findByPk(product.productId);

                    return {
                        ...product,
                        product: productDetails
                    };
                }));

                return {
                    ...order.toJSON(),
                    products
                };
            }
        ));
    }

    res.json(orders);
});

// API route to get a single order by its ID
router.get('/', async (req, res) => {
    const { orderId } = req.params;
    const expand = req.query.expand;

    let order = await Order.findByPk(orderId);
    if (!order) {
        return res.status(404).json({ error: 'Order Not found' });
    }

    if (expand === 'products') {
        const products = await Promise.all(order.products.map(async (product) => {
            const productDetails = await Product.findByPk(product.productId);

            return {
                ...product,
                product: productDetails
            };
        }));

        order = {
            ...order.toJSON(),
            products
        };
    }

    res.json(order);
});


// API toute to create an order
router.post('/', async (req, res) => {
    // const { cart } = req.body;
    const cartItems = await CartItem.findAll();

    // Validate the Cart
    // if (!Array.isArray(cart) || cart.length === 0) {
    //     return res.status(400).json({ error: 'Invalid cart' });
    // }
    if (cartItems.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' })
    }

    let totalCostCents = 0;
    // const products = await Promise.all(cart.map(async (item) => {
    const products = await Promise.all(cartItems.map(async (item) => {
        const product = await Product.findByPk(item.productId);
        if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
        }

        const deliveryOption = await DeliveryOptions.findByPk(item.deliveryOptionId);
        if (!deliveryOption) {
            throw new Error(`Invaild delivery option: ${item.deliveryOptionId}`);
        }

        const productCost = product.priceCents * item.quantity;
        const shippingCost = deliveryOption.priceCents;

        totalCostCents += productCost + shippingCost;

        const estimatedDeliveryTimeMs = Date.now() + deliveryOption.deliveryDays * 24 * 60 * 60 * 1000;

        return {
            productId: item.productId,
            quantity: item.quantity,
            estimatedDeliveryTimeMs
        };
    }));

    // Apply 10% Tax
    totalCostCents = Math.round(totalCostCents * 1.1);

    // Create the order
    const order = await Order.create({
        orderTimeMs: Date.now(),
        totalCostCents,
        products
    })

    // Remove everything from the cart
    await CartItem.destroy({ where: {} });

    res.status(201).json(order);
})


export default router;