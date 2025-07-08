// backend/src/models/product.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Product = sequelize.define('productos', 
{
    id: 
    {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: 
    {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    descripcion: 
    {
        type: DataTypes.TEXT,
        allowNull: true
    },
    precio: 
    {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: 
        {
            min: 0.01
        }
    },
    stock: 
    {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: 
        {
            min: 0
        }
    },
    categoria: 
    {
        type: DataTypes.ENUM('ramos', 'plantas', 'aros', 'temporada', 'otros'),
        allowNull: false
    },
    imagen_url: 
    {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    destacado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    creado_por: 
    {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: 
        {
            model: 'usuarios',
            key: 'id'
        }
    }
}, 
{
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    freezeTableName: true
});

module.exports = Product;