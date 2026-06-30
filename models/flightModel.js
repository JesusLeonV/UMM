const getDb = require('../config/database');

const Flight = {
    getAll: async () => {
        const db = await getDb();
        // .all() trae todas las filas
        const rows = await db.all('SELECT * FROM vuelos ORDER BY fecha, hora');
        return rows;
    },
    search: async (origen, destino) => {
        const db = await getDb();
        const params = [];
        const filters = [];

        if (origen) {
            filters.push('LOWER(origen) LIKE LOWER(?)');
            params.push(`%${origen}%`);
        }

        if (destino) {
            filters.push('LOWER(destino) LIKE LOWER(?)');
            params.push(`%${destino}%`);
        }

        const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
        const rows = await db.all(`SELECT * FROM vuelos ${where} ORDER BY fecha, hora`, params);
        return rows;
    },
    findById: async (id) => {
        const db = await getDb();
        const row = await db.get('SELECT * FROM vuelos WHERE id = ?', [id]);
        return row;
    },
    createBooking: async (usuarioId, vueloId, pasajeros) => {
        const db = await getDb();
        const vuelo = await db.get('SELECT * FROM vuelos WHERE id = ?', [vueloId]);

        if (!vuelo) {
            const error = new Error('Vuelo no encontrado');
            error.status = 404;
            throw error;
        }

        if (vuelo.asientos < pasajeros) {
            const error = new Error('No hay suficientes asientos disponibles');
            error.status = 400;
            throw error;
        }

        const total = Number((vuelo.precio * pasajeros).toFixed(2));
        await db.run('UPDATE vuelos SET asientos = asientos - ? WHERE id = ?', [pasajeros, vueloId]);
        const result = await db.run(
            'INSERT INTO reservas (usuario_id, vuelo_id, pasajeros, total) VALUES (?, ?, ?, ?)',
            [usuarioId, vueloId, pasajeros, total]
        );
        return result;
    },
    getBookingsByUser: async (usuarioId) => {
        const db = await getDb();
        const rows = await db.all(`
            SELECT
                r.id,
                'R-' || r.id AS codigo,
                r.pasajeros,
                r.total,
                v.id AS vuelo_id,
                v.codigo AS vuelo_codigo,
                v.origen,
                v.destino,
                v.fecha,
                v.hora,
                v.precio
            FROM reservas r 
            JOIN vuelos v ON r.vuelo_id = v.id 
            WHERE r.usuario_id = ?
            ORDER BY r.fecha_reserva DESC
        `, [usuarioId]);
        return rows;
    }
};

module.exports = Flight;
