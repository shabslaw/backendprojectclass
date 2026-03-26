import express from "express";
import cors from "cors";
import { sequelize } from "./models/index.js"
import { Item } from "./models/Item.js"
import { Product } from "./models/Product.js";
import { defaultProducts } from "./defaultData/defaultProducts.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Simple route
app.get('/', (req, res)=>{
    res.json({ message: 'Welcome to the UNCLE SHABS Express.js backend!' })
})

// API route example
/*
app.get('/api/data', (req, res) => {
    res.json({ success: true, data: ['item1', 'item2', 'item3'] })
    })
*/

app.get('/api/data', async (req, res) => {
    const items = await Item.findAll();
    res.json({ success: true, data: items });
})

app.get('/products', async (req, res) => {
    const products = await Product.findAll();
    res.json( products );
})

// Error handling middleware
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
// await sequelize.sync()
await sequelize.sync({ force: true })
await Item.create({ name: 'Sample Item' });
// Sync database and load default products if none exist
// await sequelize.sync()
const productCount = await Product.count();
if (productCount === 0) {
    await Product.bulkCreate(defaultProducts);
}

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});