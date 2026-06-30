const Flight = require('../models/flightModel');
const User = require('../models/userModel');

function formatBooking(reserva) {
    return {
        id: reserva.id,
        codigo: reserva.codigo,
        pasajeros: reserva.pasajeros,
        total: reserva.total,
        vuelo: {
            id: reserva.vuelo_id,
            codigo: reserva.vuelo_codigo,
            origen: reserva.origen,
            destino: reserva.destino,
            fecha: reserva.fecha,
            hora: reserva.hora,
            precio: reserva.precio
        }
    };
}

exports.getIndex = (req, res) => {
    res.render('index');
};

exports.getFlights = async (req, res) => {
    try {
        const { origen, destino } = req.query;
        const vuelos = await Flight.search(origen, destino);
        res.json({ vuelos });
    } catch (error) {
        res.status(500).json({ error: 'No se pudieron cargar los vuelos' });
    }
};

exports.bookFlight = async (req, res) => {
    try {
        const usuarioId = Number(req.body.usuarioId);
        const vueloId = Number(req.body.vueloId);
        const pasajeros = Number(req.body.pasajeros || 1);

        if (!Number.isInteger(usuarioId) || !Number.isInteger(vueloId) || !Number.isInteger(pasajeros) || pasajeros < 1) {
            return res.status(400).json({ error: 'Datos de reserva invalidos' });
        }

        const user = await User.findById(usuarioId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        await Flight.createBooking(usuarioId, vueloId, pasajeros);
        res.status(201).json({ message: 'Reserva creada correctamente' });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || 'No se pudo crear la reserva' });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const usuarioId = Number(req.params.usuarioId);
        if (!Number.isInteger(usuarioId)) {
            return res.status(400).json({ error: 'Usuario invalido' });
        }

        const reservas = await Flight.getBookingsByUser(usuarioId);
        res.json({ reservas: reservas.map(formatBooking) });
    } catch (error) {
        res.status(500).json({ error: 'No se pudieron cargar las reservas' });
    }
};

exports.bookFlightPage = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        const vueloId = Number(req.body.vueloId);
        await Flight.createBooking(req.session.user.id, vueloId, 1);
        res.redirect('/reservas');
    } catch (error) {
        res.status(error.status || 500).send(error.message || 'No se pudo crear la reserva');
    }
};

exports.getReservas = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    try {
        const reservas = await Flight.getBookingsByUser(req.session.user.id);
        res.render('reservas', {
            user: req.session.user.nombre,
            reservas
        });
    } catch (error) {
        res.status(500).send('No se pudieron cargar las reservas');
    }
};
