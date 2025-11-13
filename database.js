// Módulo de gestión de base de datos SQLite
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crear conexión a la base de datos
const dbPath = path.resolve(__dirname, 'simpleclub.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
    } else {
        console.log('✓ Conectado a la base de datos SQLite');
        initDatabase();
    }
});

// Inicializar tablas
function initDatabase() {
    db.serialize(() => {
        // Tabla de usuarios
        db.run(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                nombre TEXT NOT NULL,
                rol TEXT DEFAULT 'vendedor',
                activo INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de productos
        db.run(`
            CREATE TABLE IF NOT EXISTS productos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                precio REAL NOT NULL,
                descripcion TEXT,
                activo INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de miembros
        db.run(`
            CREATE TABLE IF NOT EXISTS miembros (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                telefono TEXT,
                email TEXT,
                activo INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de ventas
        db.run(`
            CREATE TABLE IF NOT EXISTS ventas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                producto_id INTEGER NOT NULL,
                miembro_id INTEGER NOT NULL,
                cantidad INTEGER NOT NULL,
                precio_unitario REAL NOT NULL,
                total REAL NOT NULL,
                fecha DATE NOT NULL,
                notas TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_by INTEGER,
                FOREIGN KEY (producto_id) REFERENCES productos(id),
                FOREIGN KEY (miembro_id) REFERENCES miembros(id),
                FOREIGN KEY (created_by) REFERENCES usuarios(id)
            )
        `);

        // Índices para mejorar rendimiento
        db.run(`CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_ventas_producto ON ventas(producto_id)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_ventas_miembro ON ventas(miembro_id)`);

        console.log('✓ Tablas de base de datos inicializadas');
    });
}

// ========== FUNCIONES DE USUARIOS ==========

function crearUsuario(datos) {
    return new Promise((resolve, reject) => {
        const { username, password, nombre, rol } = datos;
        const sql = 'INSERT INTO usuarios (username, password, nombre, rol) VALUES (?, ?, ?, ?)';

        db.run(sql, [username, password, nombre, rol || 'vendedor'], function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
        });
    });
}

function obtenerUsuarioPorUsername(username) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM usuarios WHERE username = ? AND activo = 1';

        db.get(sql, [username], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function obtenerUsuarios() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, username, nombre, rol, activo, created_at FROM usuarios WHERE activo = 1';

        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// ========== FUNCIONES DE PRODUCTOS ==========

function crearProducto(datos) {
    return new Promise((resolve, reject) => {
        const { nombre, precio, descripcion } = datos;
        const sql = 'INSERT INTO productos (nombre, precio, descripcion) VALUES (?, ?, ?)';

        db.run(sql, [nombre, precio, descripcion || ''], function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, nombre, precio, descripcion });
        });
    });
}

function obtenerProductos() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM productos WHERE activo = 1 ORDER BY nombre';

        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function obtenerProducto(id) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM productos WHERE id = ? AND activo = 1';

        db.get(sql, [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function actualizarProducto(id, datos) {
    return new Promise((resolve, reject) => {
        const { nombre, precio, descripcion } = datos;
        const sql = `
            UPDATE productos
            SET nombre = ?, precio = ?, descripcion = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        db.run(sql, [nombre, precio, descripcion, id], function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
        });
    });
}

function eliminarProducto(id) {
    return new Promise((resolve, reject) => {
        // Soft delete
        const sql = 'UPDATE productos SET activo = 0 WHERE id = ?';

        db.run(sql, [id], function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
        });
    });
}

// ========== FUNCIONES DE MIEMBROS ==========

function crearMiembro(datos) {
    return new Promise((resolve, reject) => {
        const { nombre, telefono, email } = datos;
        const sql = 'INSERT INTO miembros (nombre, telefono, email) VALUES (?, ?, ?)';

        db.run(sql, [nombre, telefono || '', email || ''], function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, nombre, telefono, email });
        });
    });
}

function obtenerMiembros() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM miembros WHERE activo = 1 ORDER BY nombre';

        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function obtenerMiembro(id) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM miembros WHERE id = ? AND activo = 1';

        db.get(sql, [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function actualizarMiembro(id, datos) {
    return new Promise((resolve, reject) => {
        const { nombre, telefono, email } = datos;
        const sql = `
            UPDATE miembros
            SET nombre = ?, telefono = ?, email = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        db.run(sql, [nombre, telefono, email, id], function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
        });
    });
}

function eliminarMiembro(id) {
    return new Promise((resolve, reject) => {
        // Soft delete
        const sql = 'UPDATE miembros SET activo = 0 WHERE id = ?';

        db.run(sql, [id], function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
        });
    });
}

// ========== FUNCIONES DE VENTAS ==========

function crearVenta(datos) {
    return new Promise((resolve, reject) => {
        const { producto_id, miembro_id, cantidad, precio_unitario, fecha, notas, created_by } = datos;
        const total = cantidad * precio_unitario;

        const sql = `
            INSERT INTO ventas (producto_id, miembro_id, cantidad, precio_unitario, total, fecha, notas, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(sql, [producto_id, miembro_id, cantidad, precio_unitario, total, fecha, notas || '', created_by], function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, total });
        });
    });
}

function obtenerVentas(filtros = {}) {
    return new Promise((resolve, reject) => {
        let sql = `
            SELECT
                v.*,
                p.nombre as producto_nombre,
                p.precio as producto_precio,
                m.nombre as miembro_nombre,
                m.telefono as miembro_telefono
            FROM ventas v
            JOIN productos p ON v.producto_id = p.id
            JOIN miembros m ON v.miembro_id = m.id
            WHERE 1=1
        `;

        const params = [];

        if (filtros.fecha_inicio) {
            sql += ' AND v.fecha >= ?';
            params.push(filtros.fecha_inicio);
        }

        if (filtros.fecha_fin) {
            sql += ' AND v.fecha <= ?';
            params.push(filtros.fecha_fin);
        }

        if (filtros.producto_id) {
            sql += ' AND v.producto_id = ?';
            params.push(filtros.producto_id);
        }

        if (filtros.miembro_id) {
            sql += ' AND v.miembro_id = ?';
            params.push(filtros.miembro_id);
        }

        sql += ' ORDER BY v.fecha DESC, v.created_at DESC';

        if (filtros.limite) {
            sql += ' LIMIT ?';
            params.push(filtros.limite);
        }

        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function obtenerVenta(id) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT
                v.*,
                p.nombre as producto_nombre,
                m.nombre as miembro_nombre
            FROM ventas v
            JOIN productos p ON v.producto_id = p.id
            JOIN miembros m ON v.miembro_id = m.id
            WHERE v.id = ?
        `;

        db.get(sql, [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function eliminarVenta(id) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM ventas WHERE id = ?';

        db.run(sql, [id], function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
        });
    });
}

function buscarVentas(termino) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT
                v.*,
                p.nombre as producto_nombre,
                m.nombre as miembro_nombre
            FROM ventas v
            JOIN productos p ON v.producto_id = p.id
            JOIN miembros m ON v.miembro_id = m.id
            WHERE p.nombre LIKE ? OR m.nombre LIKE ? OR v.notas LIKE ?
            ORDER BY v.fecha DESC, v.created_at DESC
        `;

        const like = `%${termino}%`;
        db.all(sql, [like, like, like], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// ========== FUNCIONES DE ESTADÍSTICAS ==========

function obtenerEstadisticas() {
    return new Promise((resolve, reject) => {
        const stats = {};

        // Total de ventas
        db.get('SELECT COUNT(*) as total, SUM(total) as monto FROM ventas', (err, row) => {
            if (err) {
                reject(err);
                return;
            }

            stats.total_ventas = row.monto || 0;
            stats.num_ventas = row.total || 0;

            // Total de productos
            db.get('SELECT COUNT(*) as total FROM productos WHERE activo = 1', (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                stats.total_productos = row.total || 0;

                // Total de miembros
                db.get('SELECT COUNT(*) as total FROM miembros WHERE activo = 1', (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    stats.total_miembros = row.total || 0;
                    resolve(stats);
                });
            });
        });
    });
}

function obtenerTopVendedores(limite = 10) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT
                m.id,
                m.nombre,
                COUNT(v.id) as cantidad_ventas,
                SUM(v.total) as total_vendido
            FROM miembros m
            JOIN ventas v ON m.id = v.miembro_id
            WHERE m.activo = 1
            GROUP BY m.id, m.nombre
            ORDER BY total_vendido DESC
            LIMIT ?
        `;

        db.all(sql, [limite], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function obtenerTopProductos(limite = 10) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT
                p.id,
                p.nombre,
                SUM(v.cantidad) as unidades_vendidas,
                SUM(v.total) as total_vendido
            FROM productos p
            JOIN ventas v ON p.id = v.producto_id
            WHERE p.activo = 1
            GROUP BY p.id, p.nombre
            ORDER BY total_vendido DESC
            LIMIT ?
        `;

        db.all(sql, [limite], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Exportar funciones
module.exports = {
    db,
    // Usuarios
    crearUsuario,
    obtenerUsuarioPorUsername,
    obtenerUsuarios,
    // Productos
    crearProducto,
    obtenerProductos,
    obtenerProducto,
    actualizarProducto,
    eliminarProducto,
    // Miembros
    crearMiembro,
    obtenerMiembros,
    obtenerMiembro,
    actualizarMiembro,
    eliminarMiembro,
    // Ventas
    crearVenta,
    obtenerVentas,
    obtenerVenta,
    eliminarVenta,
    buscarVentas,
    // Estadísticas
    obtenerEstadisticas,
    obtenerTopVendedores,
    obtenerTopProductos
};
