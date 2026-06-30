const User = require('../models/userModel');

function publicUser(user) {
    return {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo
    };
}

async function createUser(nombre, correo, password) {
    if (!nombre || nombre.trim().length < 3) {
        const error = new Error('El nombre debe tener minimo 3 caracteres');
        error.status = 400;
        throw error;
    }

    if (!correo || !password || password.length < 6) {
        const error = new Error('Datos de registro invalidos');
        error.status = 400;
        throw error;
    }

    const existing = await User.findByCorreo(correo);
    if (existing) {
        const error = new Error('Ese correo ya esta registrado');
        error.status = 409;
        throw error;
    }

    const result = await User.create(nombre.trim(), correo.trim().toLowerCase(), password);
    return { id: result.lastID, nombre: nombre.trim(), correo: correo.trim().toLowerCase() };
}

async function findValidUser(correo, password) {
    const user = await User.findByCorreo((correo || '').trim().toLowerCase());
    if (!user || user.password !== password) {
        const error = new Error('Correo o contrasena incorrectos');
        error.status = 401;
        throw error;
    }

    return user;
}

exports.getLogin = (req, res) => {
    res.render('login');
};

exports.getRegister = (req, res) => {
    res.render('register');
};

exports.registerApi = async (req, res) => {
    try {
        const { nombre, email, contrasena } = req.body;
        const user = await createUser(nombre, email, contrasena);
        res.status(201).json({ usuario: publicUser(user) });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || 'No se pudo registrar el usuario' });
    }
};

exports.loginApi = async (req, res) => {
    try {
        const { email, contrasena } = req.body;
        const user = await findValidUser(email, contrasena);
        res.json({ usuario: publicUser(user) });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || 'No se pudo iniciar sesion' });
    }
};

exports.registerPage = async (req, res) => {
    try {
        const { nombre, correo, password } = req.body;
        const user = await createUser(nombre, correo, password);
        req.session.user = publicUser(user);
        res.redirect('/');
    } catch (error) {
        res.status(error.status || 500).send(error.message || 'No se pudo registrar el usuario');
    }
};

exports.loginPage = async (req, res) => {
    try {
        const { correo, password } = req.body;
        const user = await findValidUser(correo, password);
        req.session.user = publicUser(user);
        res.redirect('/');
    } catch (error) {
        res.status(error.status || 500).send(error.message || 'No se pudo iniciar sesion');
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => res.redirect('/'));
};
