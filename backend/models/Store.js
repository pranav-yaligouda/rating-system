import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Store = sequelize.define('Store', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [0, 400 ]
        }
    },
    ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        onDelete: 'CASCADE'  //if the user is deleted the store is also removed
    }
}, { 
    timestamps: true,
    indexes: [
        {fields: ['ownerId']},
        {fields: ['name']}  // for search by name
    ]
});

export default Store;