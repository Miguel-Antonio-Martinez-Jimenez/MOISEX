// backend/app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./src/modules/Auth/user.routes');
const productRoutes = require('./src/modules/Products/product.routes');

dotenv.config();

const app = express();

// Middlewares
app.use(cors(
{
    origin: process.env.CORS_ORIGIN,
    methods: process.env.CORS_METHODS,
    allowedHeaders: process.env.CORS_ALLOW_HEADERS,
    credentials: process.env.CORS_CREDENTIALS === 'true'
}));
app.use(express.json());

// Routes
app.use(`${process.env.API_PREFIX}/auth`, userRoutes);
app.use(`${process.env.API_PREFIX}/products`, productRoutes);

// Error handling middleware
app.use((err, req, res, next) => 
{
    console.error(err.stack);
    res.status(500).json({ message: 'Algo salió mal!' });
});

// Start server
const PORT = process.env.PORT || 4002;
app.listen(PORT, () => 
{
    console.log(`Servidor corriendo en puerto ${PORT}`);
});