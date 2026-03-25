import express from "express";
import cors from "cors";
import { Sequelize, DataTypes } from "sequelize";

const app = express();
const PORT = process.env.PORT || 5000;

// Initilize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});

// Define a simple model
const Item = sequelize.define('Item', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

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
await sequelize.sync({ force: true })
await Item.create({ name: 'Sample Item' });

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});