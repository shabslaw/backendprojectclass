import express from "express";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from "url";
import { sequelize } from "./models/index.js"
import { Item } from "./models/Item.js"
import productRoutes from './routes/products.js';
import deliveryOptionsRoutes from './routes/deliveryOptions.js';
import cartItemRoutes from './routes/cartItems.js';
import orderRoutes from './routes/orders.js';
import resetRoutes from './routes/reset.js';
import paymentSummaryRoutes from './routes/paymenySumary.js'



const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());


// Simple route
app.get('/', (req, res)=>{
    res.json({ message: 'Welcome to the UNCLE SHABS Express.js backend!' })
})

/*

// API route example

app.get('/api/data', (req, res) => {
    res.json({ success: true, data: ['item1', 'item2', 'item3'] })
})



app.get('/api/data', async (req, res) => {
    const items = await Item.findAll();
    res.json({ success: true, data: items });
})

app.get('/products', async (req, res) => {
    const products = await Product.findAll();
    res.json(products);
})

app.get('/delivery-options', async (req, res) => {
    const deliveryOptions = await DeliveryOptions.findAll();
    res.json(deliveryOptions);
})

app.get('/cart-items', async (req, res) => {
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
app.post('/cart-items', async (req, res) => {
    const { productId, quantity } = req.body;

    // Check if productId exists in the database
    const product = await Product.findByPk(productId);
    if (!product) {
        return res.status(400).json({ error: 'Product not found' });
    }

    // Check if quantity is a number between 1 and 10
    if (typeof quantity !== "number" || quantity < 1 || quantity > 10) {
        return res.status(400).json({ error: "Quantity must be a number between 1 and 10" })
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
app.put('/cart-items/:productId', async (req, res) => {
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
app.delete("/cart-items/:productId", async (req, res) => {
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


// API route to get all orders
app.get('/orders', async (req, res) => {
    const expand = req.query.expand;
    let orders = await Order.findAll();

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
app.get('/orders/:orderId', async (req, res) => {
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
app.post('/orders', async (req, res) => {
    const { cart } = req.body;

    // Validate the Cart
    if (!Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ error: 'Invalid cart' });
    }

    let totalCostCents = 0;
    const products = await Promise.all(cart.map(async (item) => {
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

// API route to reset all data
app.post('/reset', async (req, res) => {
    await sequelize.sync({ force: true });

    // Load default data
    await Product.bulkCreate(defaultProducts)
    await DeliveryOptions.bulkCreate(defaultDeliveryOptions)
    await CartItem.bulkCreate(defaultCartItem)
    await Order.bulkCreate(defaultOrders)

    res.status(204).send();
})














// Sync database and create a sample item
// { force: true } : to clear stored data in storage

sequelize.sync().then(async () => {
    await Item.create({ name: 'Sample Item' });
});


// OR 
// Sync database and load default products, delivery options, cart items, and orders if none exist
await sequelize.sync()
// await sequelize.sync({ force: true })
await Item.create({ name: 'Sample Item' });
// Sync database and load default products if none exist
// await sequelize.sync()

const productCount = await Product.count();
if (productCount === 0) {
    await Product.bulkCreate(defaultProducts);
    await DeliveryOptions.bulkCreate(defaultDeliveryOptions);
    await CartItem.bulkCreate(defaultCartItem);
    await Order.bulkCreate(defaultOrders);
}


*/


// Serve images from the images folder
app.use('/images', express.static(path.join(__dirname, 'images')));


app.use('/api/products', productRoutes)
app.use('/api/delivery-options', deliveryOptionsRoutes)
app.use('/api/cart-items', cartItemRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/reset', resetRoutes)
app.use('/api/payment-summary', paymentSummaryRoutes)


// Error handling middleware
/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' })
})


// Sync database and create a sample item
// { force: true } : to clear stored data in storage
/*
sequelize.sync().then(async () => {
    await Item.create({ name: 'Sample Item' });
});
*/

// OR 
// Sync database and load default products, delivery options, cart items, and orders if none exist
await sequelize.sync()




// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});