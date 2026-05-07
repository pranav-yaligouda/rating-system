import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define('User', {
    id: {type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [20, 60]
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { 
            len: [0, 400] 
        }
    },
    role: {
        type: DataTypes.ENUM('admin', 'normal', 'owner'),
        defaultValue: 'normal'
    }
}, {
    timestamps:true,
    indexes: [
        {fields: ['email']},
        {fields: ['role']}
    ]
});

export default User;