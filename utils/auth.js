const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET;
//funcion para generar un tockend despues de un blogueo exitoso.
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); //token expira en 1 hora.
}
//middeware para verificar el token en cada petición
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado.' });
    }
    try {
        const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET); //verificar el token
        req.user = decoded; // añadir la informacion de usuario a la peticion.
        next();//perimite que la peticion continue.

    } catch (error) {
        return res.status(401).json({ message: 'Token no valido.' });
    }
}

module.exports = {generateToken, verifyToken};


