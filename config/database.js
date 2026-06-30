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
            codigo TEXT UNIQUE,
            origen TEXT NOT NULL,
            destino TEXT NOT NULL,
            fecha TEXT NOT NULL,
            hora TEXT,
            precio REAL NOT NULL,
            asientos INTEGER NOT NULL DEFAULT 0,
            estado TEXT NOT NULL DEFAULT 'Disponible'
        );

        CREATE TABLE IF NOT EXISTS reservas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            vuelo_id INTEGER,
            pasajeros INTEGER NOT NULL DEFAULT 1,
            total REAL NOT NULL DEFAULT 0,
            fecha_reserva DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
            FOREIGN KEY (vuelo_id) REFERENCES vuelos(id)
        );
    `);

    await ensureColumn(dbInstance, 'vuelos', 'codigo', 'TEXT');
    await ensureColumn(dbInstance, 'vuelos', 'hora', 'TEXT');
    await ensureColumn(dbInstance, 'vuelos', 'asientos', 'INTEGER NOT NULL DEFAULT 0');
    await ensureColumn(dbInstance, 'vuelos', 'estado', "TEXT NOT NULL DEFAULT 'Disponible'");
    await ensureColumn(dbInstance, 'reservas', 'pasajeros', 'INTEGER NOT NULL DEFAULT 1');
    await ensureColumn(dbInstance, 'reservas', 'total', 'REAL NOT NULL DEFAULT 0');

    const { total } = await dbInstance.get('SELECT COUNT(*) AS total FROM vuelos');
    if (total === 0) {
        await dbInstance.run(
            `INSERT INTO vuelos (codigo, origen, destino, fecha, hora, precio, asientos, estado)
             VALUES
             ('AV101', 'Madrid', 'Bogota', '2026-07-15', '08:30', 420, 18, 'Disponible'),
             ('AV204', 'Bogota', 'Buenos Aires', '2026-07-18', '13:45', 360, 12, 'Disponible'),
             ('AV330', 'Lima', 'Madrid', '2026-07-22', '21:10', 510, 9, 'Disponible'),
             ('AV412', 'Santiago', 'Mexico DF', '2026-07-25', '06:50', 295, 15, 'Disponible')`
        );
    } else {
        await dbInstance.run("UPDATE vuelos SET codigo = 'AV' || id WHERE codigo IS NULL OR codigo = ''");
        await dbInstance.run("UPDATE vuelos SET hora = '00:00' WHERE hora IS NULL OR hora = ''");
        await dbInstance.run("UPDATE vuelos SET estado = 'Disponible' WHERE estado IS NULL OR estado = ''");
    }
     
    return dbInstance;
}

async function ensureColumn(db, table, column, definition) {
    const columns = await db.all(`PRAGMA table_info(${table})`);
    if (!columns.some(item => item.name === column)) {
        await db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
}

module.exports = getDb;
