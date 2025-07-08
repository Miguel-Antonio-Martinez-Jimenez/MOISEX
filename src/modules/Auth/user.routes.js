// backend/src/modules/Auth/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const verifyToken = require('../../middlewares/verifyToken.middleware');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/verify-sms', userController.verifySmsCode);

// Protected routes (require valid JWT)
router.use(verifyToken);
router.post('/logout', userController.logout);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;