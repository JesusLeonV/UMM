const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');

router.get('/', flightController.getIndex);
router.post('/reservar', flightController.bookFlight);
router.get('/reservas', flightController.getReservas);

module.exports = router;