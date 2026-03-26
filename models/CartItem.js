import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";

// Define a simple model
export const CartItem = sequelize.define('CartItem', {
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Products',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    deliveryOptionId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'DeliveryOptions',
            key: 'id'
        }
    }
});