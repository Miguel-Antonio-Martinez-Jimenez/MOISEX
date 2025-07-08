// backend/src/modules/Auth/user.controller.js
const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const User = require('../../models/user.model');
const { Email } = require('../../validations/email.validation');
const { Password } = require('../../validations/password.validation');
const { PhoneNumber } = require('../../validations/phonenumber.validation');

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.register = async (req, res) => {
    try {
        const { usuario, correo_electronico, contraseña, telefono, nombre, apellido } = req.body;

        // Validations
        if (!Email(correo_electronico)) {
            return res.status(400).json({ message: 'Correo electrónico no válido' });
        }
        if (!Password(contraseña)) {
            return res.status(400).json({ 
                message: 'La contraseña debe tener: mínimo 6 caracteres, 1 mayúscula, 1 minúscula y 1 número'
            });
        }
        if (telefono && !PhoneNumber(telefono)) {
            return res.status(400).json({ message: 'Número debe tener 10 dígitos' });
        }

        // Check if user exists
        const existingUser = await User.findOne({
            where: {
                [Sequelize.Op.or]: [
                    { usuario },
                    { correo_electronico },
                    ...(telefono ? [{ telefono }] : [])
                ]
            }
        });

        if (existingUser) {
            const conflictField = 
                existingUser.usuario === usuario ? 'usuario' :
                existingUser.correo_electronico === correo_electronico ? 'correo' :
                'teléfono';
            return res.status(409).json({ 
                message: `El ${conflictField} ya está registrado` 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(contraseña, 10);
        const activationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const newUser = await User.create({
            usuario,
            correo_electronico,
            contraseña: hashedPassword,
            ...(telefono && { telefono }), // Solo añade si existe
            nombre,
            apellido,
            codigo_activacion_sms: activationCode,
            activo: false
        });

        // En desarrollo: Mostrar código en consola/respuesta
        if (process.env.NODE_ENV === 'development') {
            console.log(`Código de activación para ${usuario}: ${activationCode}`);
            return res.status(201).json({
                message: 'Registro exitoso (modo desarrollo)',
                userId: newUser.id,
                activationCode // Solo en desarrollo
            });
        }

        // En producción: Enviar SMS si hay teléfono
        if (telefono) {
            try {
                await twilioClient.messages.create({
                    body: `Tu código de activación Neoluxe: ${activationCode}`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: telefono.startsWith('+') ? telefono : `+52${telefono}`
                });
            } catch (error) {
                console.error('Error SMS:', error.message);
                return res.status(202).json({
                    message: 'Registro completo pero falló el SMS. Contacta al soporte.',
                    userId: newUser.id
                });
            }
        }

        res.status(201).json({
            message: 'Registro exitoso. ' + 
                (telefono ? 'Verifica tu teléfono.' : 'Contacta al administrador.'),
            userId: newUser.id
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { usuario, contraseña } = req.body;

        const user = await User.findOne({ where: { usuario } });
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Si la cuenta no está activa, enviar código SMS
        if (!user.activo) {
            if (!user.telefono) {
                return res.status(403).json({ message: 'Cuenta no activada. Registra un teléfono.' });
            }

            // Generar nuevo código (opcional: puedes reutilizar el existente)
            const newActivationCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            await user.update({
                codigo_activacion_sms: newActivationCode
            });

            // Enviar SMS
            try {
                await twilioClient.messages.create({
                    body: `Tu código de activación para Neoluxe es: ${newActivationCode}`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: user.telefono
                });
            } catch (smsError) {
                console.error('Error sending SMS:', smsError);
                // En desarrollo, devolver el código en la respuesta
                if (process.env.NODE_ENV === 'development') {
                    return res.status(200).json({
                        requiresActivation: true,
                        message: 'Error al enviar SMS. Usa este código en desarrollo:',
                        activationCode: newActivationCode,
                        userId: user.id
                    });
                }
                return res.status(500).json({ message: 'Error al enviar SMS de activación' });
            }

            return res.status(200).json({
                requiresActivation: true,
                message: 'Se ha enviado un código de activación a tu teléfono',
                userId: user.id
            });
        }

        // Si la cuenta está activa, proceder con login normal
        const accessToken = jwt.sign(
            { id: user.id, rol: user.rol },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
        );

        await user.update({
            refresh_token: refreshToken,
            conectado: true,
            ultimo_login: new Date()
        });

        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                usuario: user.usuario,
                rol: user.rol,
                nombre: user.nombre,
                apellido: user.apellido
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
};

exports.logout = async (req, res) => {
    try {
        const { id } = req.user;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        await user.update({
            refresh_token: null,
            conectado: false
        });

        res.json({ message: 'Sesión cerrada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al cerrar sesión' });
    }
};

exports.verifySmsCode = async (req, res) => {
    try {
        const { userId, code } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (user.codigo_activacion_sms !== code) {
            return res.status(400).json({ message: 'Código de verificación incorrecto' });
        }

        await user.update({
            activo: true,
            codigo_activacion_sms: null
        });

        res.json({ message: 'Cuenta activada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al verificar código SMS' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['contraseña', 'refresh_token', 'codigo_activacion_sms'] }
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            attributes: { exclude: ['contraseña', 'refresh_token', 'codigo_activacion_sms'] }
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener usuario' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Don't allow updating password or activation status directly through this endpoint
        if (updateData.contraseña || updateData.activo) {
            return res.status(403).json({ message: 'No permitido' });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Validate email if being updated
        if (updateData.correo_electronico && !Email(updateData.correo_electronico)) {
            return res.status(400).json({ message: 'Correo electrónico no válido' });
        }

        // Validate phone if being updated
        if (updateData.telefono && !PhoneNumber(updateData.telefono)) {
            return res.status(400).json({ message: 'Número de teléfono no válido' });
        }

        await user.update(updateData);
        
        res.json({ message: 'Usuario actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar usuario' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        await user.destroy();
        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar usuario' });
    }
};