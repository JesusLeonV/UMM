const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.getLogin);
router.get('/register', authController.getRegister);
router.post('/login', authController.loginPage);
router.post('/register', authController.registerPage);
router.post('/api/login', authController.loginApi);
router.post('/api/registro', authController.registerApi);
router.get('/logout', authController.logout);

module.exports = router;
