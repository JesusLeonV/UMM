const getDb = require('../config/database');

const User = {
    create: async (nombre, correo, password) => {
        const db = await getDb();
        const result = await db.run(
            'INSERT INTO usuarios (nombre, correo, password) VALUES (?, ?, ?)',
            [nombre, correo, password]
        );
        return result;
    },
    findByCorreo: async (correo) => {
        const db = await getDb();
        // .get() trae solo una fila
        const user = await db.get('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        return user;
    }
};

module.exports = User;