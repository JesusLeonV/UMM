const getDb = require('../config/database');

const Flight = {
    getAll: async () => {
        const db = await getDb();
        // .all() trae todas las filas
        const rows = await db.all('SELECT * FROM vuelos');
        return rows;
    },
    createBooking: async (usuarioId, vueloId) => {
        const db = await getDb();
        const result = await db.run(
            'INSERT INTO reservas (usuario_id, vuelo_id) VALUES (?, ?)',
            [usuarioId, vueloId]
        );
        return result;
    },
    getBookingsByUser: async (usuarioId) => {
        const db = await getDb();
        const rows = await db.all(`
            SELECT r.id, v.origen, v.destino, v.fecha, v.precio 
            FROM reservas r 
            JOIN vuelos v ON r.vuelo_id = v.id 
            WHERE r.usuario_id = ?
        `, [usuarioId]);
        return rows;
    }
};

module.exports = Flight;