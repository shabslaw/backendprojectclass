import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";


export const DeliveryOptions = sequelize.define('DeliveryOptions', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    deliveryDays: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    priceCents: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})