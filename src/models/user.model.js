// backend/src/models/user.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const User = sequelize.define('usuarios', 
{
    id: 
    {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    googleId: 
    {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true
    }, 
    githubId: 
    {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true
    },
    rol: 
    {
        type: DataTypes.ENUM('administrador', 'florista', 'cliente'),
        allowNull: false,
        defaultValue: 'cliente'
    },
    usuario: 
    {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    correo_electronico: 
    {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    contraseña: 
    {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    nombre: 
    {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    apellido: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
    },
    conectado:
    {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    ultimo_login: 
    {
        type: DataTypes.DATE,
        allowNull: true
    },
    refresh_token: 
    {
        type: DataTypes.TEXT,
    },
    activo: 
    {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    codigo_activacion_sms: 
    {
        type: DataTypes.STRING(10),
        allowNull: true
    }
},
{
  timestamps: true,
  createdAt: 'fecha_registro',
  updatedAt: 'fecha_actualizado',
  freezeTableName: true,
});

module.exports = User;