// backend/src/middlewares/verifyToken.middleware.js
const JWT = require('jsonwebtoken');

const verifyToken = (req, res, next) => 
{
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) 
    {
        return res.status(403).json({ message: 'Token no proporcionado.' });
    }

    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => 
    {
        if (err) 
        {
            return res.status(403).json({ message: 'Token invalido.' });
        }

        req.user = user;
        next();
    });
};

module.exports = verifyToken;