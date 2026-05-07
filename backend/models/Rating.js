import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";


const Rating = sequelize.define('Rating',{
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    value: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    storeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Stores',
            key: 'id'
        },
        onDelete: 'CASCADE'
    }
},{
    timestamps: true,
    indexes: [
        {fields: ['userId']},
        {fields: ['storeId']},
        {
            unique: true,
            fields: ['userId','storeId'] //one rating per user per store
        }
    ]
});

export default Rating;