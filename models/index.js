import { Sequelize } from "sequelize";

// Initilize Sequelize with SQLite
export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});