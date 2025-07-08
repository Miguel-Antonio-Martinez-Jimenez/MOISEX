// backend/src/middlewares/2FA.middleware.js
const User = require('../models/user.model');

exports.require2FA = async (req, res, next) => 
{
    try 
    {
        const user = await User.findByPk(req.user.id);
        
        if (!user) 
        {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        if (!user.activo) 
        {
            return res.status(403).json(
            { 
                message: 'Cuenta no activada. Por favor verifica tu teléfono.',
                requires2FA: true
            });
        }
        next();
    } 
    catch (error) 
    {
        console.error(error);
        res.status(500).json({ message: 'Error al verificar autenticación' });
    }
};