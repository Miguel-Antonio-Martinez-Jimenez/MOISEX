// backend/src/modules/Products/product.controller.js
const { validateUrl } = require('../../validations/url.validation');
const upload = require('../../config/cloudinary.config');
const cloudinary = require('cloudinary').v2;
const Product = require('../../models/product.model');

exports.createProduct = async (req, res) => {
  try {
    console.log('Datos recibidos:', {
      body: req.body,
      file: req.file,
      user: req.user
    });

    if (!req.file) {
      return res.status(400).json({ error: 'La imagen es requerida' });
    }

    const newProduct = await Product.create({
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      precio: parseFloat(req.body.precio),
      stock: parseInt(req.body.stock) || 0,
      categoria: req.body.categoria,
      imagen_url: req.file.path, // URL de Cloudinary
      destacado: req.body.destacado === 'true',
      creado_por: req.user.id
    });

    console.log('Producto creado:', newProduct.toJSON());
    
    return res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error al crear producto:', error);
    return res.status(500).json({ error: 'Error al crear producto' });
  }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener productos' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener producto' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, stock, categoria, imagen_url, destacado } = req.body;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Validations
        if (precio && precio <= 0) {
            return res.status(400).json({ message: 'El precio debe ser mayor que 0' });
        }

        if (stock && stock < 0) {
            return res.status(400).json({ message: 'El stock no puede ser negativo' });
        }

        if (imagen_url) {
            const urlValidation = validateUrl(imagen_url);
            if (!urlValidation.isValid) {
                return res.status(400).json({ message: urlValidation.message });
            }
        }

        await product.update({
            nombre: nombre || product.nombre,
            descripcion: descripcion !== undefined ? descripcion : product.descripcion,
            precio: precio || product.precio,
            stock: stock !== undefined ? stock : product.stock,
            categoria: categoria || product.categoria,
            imagen_url: imagen_url || product.imagen_url,
            destacado: destacado !== undefined ? destacado : product.destacado
        });

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar producto' });
    }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Eliminar imagen de Cloudinary
    const publicId = product.imagen_url.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`neoluxe/${publicId}`);

    await product.destroy();
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
};

exports.upload = upload.single('imagen');