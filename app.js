const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const flightRoutes = require('./routes/flightRoutes');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: 'aeropuerto_secreto_super_seguro_2026',
    resave: false,
    saveUninitialized: false
}));

app.use('/', authRoutes);
app.use('/', flightRoutes);

app.use((req, res) => {
    res.status(404).send('<h1>Página no encontrada</h1><a href="/">Volver al inicio</a>');
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Servidor corriendo en http://localhost:${port}`);
    });
}

module.exports = app;
