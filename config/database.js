const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let dbInstance = null;

async function getDb() {
    if (dbInstance) {
        return dbInstance;
    }
    
    dbInstance = await open({
        filename: path.join(__dirname, '../aeropuerto.sqlite'),
        driver: sqlite3.Database
    });

    await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            correo TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS vuelos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            origen TEXT NOT NULL,
            destino TEXT NOT NULL,
            fecha TEXT NOT NULL,
            precio REAL NOT NULL
        );

        CREATE TABLE IF NOT EXISTS reservas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            vuelo_id INTEGER,
            fecha_reserva DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
            FOREIGN KEY (vuelo_id) REFERENCES vuelos(id)
        );
    `);
    
    return dbInstance;
}

module.exports = getDb;