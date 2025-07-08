// backend/src/middlewares/refreshToken.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.refreshToken = async (req, res) => 
{
    const { token } = req.body;
    try 
    {
        if (!token) return res.status(401).json({ message: 'Se requiere token.' });
    
        const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
            
        const user = await User.findByPk(payload.id);
    
        if (!user || user.refreshToken !== token) return res.status(403).json({ message: 'Token de actualización no válido.' });
    
        const newAccessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
            
        res.json({ accessToken: newAccessToken });
    } 
    catch (error) 
    {
        res.status(401).json({ error: 'Token invalido o expirado.' });
    }
};