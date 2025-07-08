// backend/src/config/db.config.js
const Sequelize = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize
(
    process.env.MYSQL_DATABASE, 
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        dialect: 'mysql',
        logging: process.env.NODE_ENV ? console.log : true,
        pool: 
        {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: 
        {
            timestamps: true,
            underscored: true,
            freezeTableName: true
        }
    }
);

module.exports = sequelize;