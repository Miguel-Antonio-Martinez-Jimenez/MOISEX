const express = require('express');
const router = express.Router();
const productController = require('./product.controller');
const verifyToken = require('../../middlewares/verifyToken.middleware');
const upload = require('../../config/cloudinary.config');

// Ruta para crear producto
router.post('/',
  verifyToken,       // Middleware de autenticación
  upload.single('imagen'),  // Middleware para subir imagen
  productController.createProduct // Controlador
);

// Otras rutas
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', verifyToken, productController.updateProduct);
router.delete('/:id', verifyToken, productController.deleteProduct);

module.exports = router;