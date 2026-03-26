import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";

// Define a simple model
export const Item = sequelize.define('Item', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
})