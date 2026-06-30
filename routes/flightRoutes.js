const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightControllers');

router.get('/', flightController.getIndex);
router.get('/api/vuelos', flightController.getFlights);
router.post('/api/reservas', flightController.bookFlight);
router.get('/api/reservas/:usuarioId', flightController.getUserBookings);
router.post('/reservar', flightController.bookFlightPage);
router.get('/reservas', flightController.getReservas);

module.exports = router;
