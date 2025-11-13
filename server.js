// Servidor Express para SimpleClub
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'simpleclub-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// Middleware de autenticación
function verificarToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        // Si no hay token, continuar sin usuario (modo demo)
        req.user = null;
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido' });
        }
        req.user = decoded;
        next();
    });
}

// ========== RUTAS DE AUTENTICACIÓN ==========

// Registrar usuario
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, nombre, rol } = req.body;

        if (!username || !password || !nombre) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }

        // Verificar si el usuario ya existe
        const usuarioExistente = await db.obtenerUsuarioPorUsername(username);
        if (usuarioExistente) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        const resultado = await db.crearUsuario({
            username,
            password: hashedPassword,
            nombre,
            rol: rol || 'vendedor'
        });

        res.status(201).json({
            mensaje: 'Usuario creado exitosamente',
            usuario: { id: resultado.id, username, nombre }
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Faltan credenciales' });
        }

        // Buscar usuario
        const usuario = await db.obtenerUsuarioPorUsername(username);
        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const esValida = await bcrypt.compare(password, usuario.password);
        if (!esValida) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar token
        const token = jwt.sign(
            { id: usuario.id, username: usuario.username, rol: usuario.rol },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            usuario: {
                id: usuario.id,
                username: usuario.username,
                nombre: usuario.nombre,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// Verificar token
app.get('/api/auth/verify', verificarToken, (req, res) => {
    if (req.user) {
        res.json({ valido: true, usuario: req.user });
    } else {
        res.json({ valido: false });
    }
});

// ========== RUTAS DE PRODUCTOS ==========

// Obtener todos los productos
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await db.obtenerProductos();
        res.json(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// Obtener un producto
app.get('/api/productos/:id', async (req, res) => {
    try {
        const producto = await db.obtenerProducto(req.params.id);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

// Crear producto
app.post('/api/productos', verificarToken, async (req, res) => {
    try {
        const { nombre, precio, descripcion } = req.body;

        if (!nombre || !precio) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }

        const resultado = await db.crearProducto({ nombre, precio, descripcion });
        res.status(201).json(resultado);
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ error: 'Error al crear producto' });
    }
});

// Actualizar producto
app.put('/api/productos/:id', verificarToken, async (req, res) => {
    try {
        const { nombre, precio, descripcion } = req.body;

        if (!nombre || !precio) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }

        const resultado = await db.actualizarProducto(req.params.id, { nombre, precio, descripcion });

        if (resultado.changes === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ mensaje: 'Producto actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

// Eliminar producto
app.delete('/api/productos/:id', verificarToken, async (req, res) => {
    try {
        const resultado = await db.eliminarProducto(req.params.id);

        if (resultado.changes === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ mensaje: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

// ========== RUTAS DE MIEMBROS ==========

// Obtener todos los miembros
app.get('/api/miembros', async (req, res) => {
    try {
        const miembros = await db.obtenerMiembros();
        res.json(miembros);
    } catch (error) {
        console.error('Error al obtener miembros:', error);
        res.status(500).json({ error: 'Error al obtener miembros' });
    }
});

// Obtener un miembro
app.get('/api/miembros/:id', async (req, res) => {
    try {
        const miembro = await db.obtenerMiembro(req.params.id);
        if (!miembro) {
            return res.status(404).json({ error: 'Miembro no encontrado' });
        }
        res.json(miembro);
    } catch (error) {
        console.error('Error al obtener miembro:', error);
        res.status(500).json({ error: 'Error al obtener miembro' });
    }
});

// Crear miembro
app.post('/api/miembros', verificarToken, async (req, res) => {
    try {
        const { nombre, telefono, email } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: 'El nombre es requerido' });
        }

        const resultado = await db.crearMiembro({ nombre, telefono, email });
        res.status(201).json(resultado);
    } catch (error) {
        console.error('Error al crear miembro:', error);
        res.status(500).json({ error: 'Error al crear miembro' });
    }
});

// Actualizar miembro
app.put('/api/miembros/:id', verificarToken, async (req, res) => {
    try {
        const { nombre, telefono, email } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: 'El nombre es requerido' });
        }

        const resultado = await db.actualizarMiembro(req.params.id, { nombre, telefono, email });

        if (resultado.changes === 0) {
            return res.status(404).json({ error: 'Miembro no encontrado' });
        }

        res.json({ mensaje: 'Miembro actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar miembro:', error);
        res.status(500).json({ error: 'Error al actualizar miembro' });
    }
});

// Eliminar miembro
app.delete('/api/miembros/:id', verificarToken, async (req, res) => {
    try {
        const resultado = await db.eliminarMiembro(req.params.id);

        if (resultado.changes === 0) {
            return res.status(404).json({ error: 'Miembro no encontrado' });
        }

        res.json({ mensaje: 'Miembro eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar miembro:', error);
        res.status(500).json({ error: 'Error al eliminar miembro' });
    }
});

// ========== RUTAS DE VENTAS ==========

// Obtener todas las ventas
app.get('/api/ventas', async (req, res) => {
    try {
        const filtros = {
            fecha_inicio: req.query.fecha_inicio,
            fecha_fin: req.query.fecha_fin,
            producto_id: req.query.producto_id,
            miembro_id: req.query.miembro_id,
            limite: req.query.limite
        };

        const ventas = await db.obtenerVentas(filtros);
        res.json(ventas);
    } catch (error) {
        console.error('Error al obtener ventas:', error);
        res.status(500).json({ error: 'Error al obtener ventas' });
    }
});

// Buscar ventas
app.get('/api/ventas/buscar/:termino', async (req, res) => {
    try {
        const ventas = await db.buscarVentas(req.params.termino);
        res.json(ventas);
    } catch (error) {
        console.error('Error al buscar ventas:', error);
        res.status(500).json({ error: 'Error al buscar ventas' });
    }
});

// Obtener una venta
app.get('/api/ventas/:id', async (req, res) => {
    try {
        const venta = await db.obtenerVenta(req.params.id);
        if (!venta) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        res.json(venta);
    } catch (error) {
        console.error('Error al obtener venta:', error);
        res.status(500).json({ error: 'Error al obtener venta' });
    }
});

// Crear venta
app.post('/api/ventas', verificarToken, async (req, res) => {
    try {
        const { producto_id, miembro_id, cantidad, precio_unitario, fecha, notas } = req.body;

        if (!producto_id || !miembro_id || !cantidad || !precio_unitario || !fecha) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }

        const resultado = await db.crearVenta({
            producto_id,
            miembro_id,
            cantidad,
            precio_unitario,
            fecha,
            notas,
            created_by: req.user?.id
        });

        res.status(201).json(resultado);
    } catch (error) {
        console.error('Error al crear venta:', error);
        res.status(500).json({ error: 'Error al crear venta' });
    }
});

// Eliminar venta
app.delete('/api/ventas/:id', verificarToken, async (req, res) => {
    try {
        const resultado = await db.eliminarVenta(req.params.id);

        if (resultado.changes === 0) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }

        res.json({ mensaje: 'Venta eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar venta:', error);
        res.status(500).json({ error: 'Error al eliminar venta' });
    }
});

// ========== RUTAS DE ESTADÍSTICAS ==========

// Obtener estadísticas generales
app.get('/api/estadisticas', async (req, res) => {
    try {
        const stats = await db.obtenerEstadisticas();
        res.json(stats);
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

// Obtener top vendedores
app.get('/api/estadisticas/vendedores', async (req, res) => {
    try {
        const limite = parseInt(req.query.limite) || 10;
        const vendedores = await db.obtenerTopVendedores(limite);
        res.json(vendedores);
    } catch (error) {
        console.error('Error al obtener top vendedores:', error);
        res.status(500).json({ error: 'Error al obtener top vendedores' });
    }
});

// Obtener top productos
app.get('/api/estadisticas/productos', async (req, res) => {
    try {
        const limite = parseInt(req.query.limite) || 10;
        const productos = await db.obtenerTopProductos(limite);
        res.json(productos);
    } catch (error) {
        console.error('Error al obtener top productos:', error);
        res.status(500).json({ error: 'Error al obtener top productos' });
    }
});

// ========== RUTA PRINCIPAL ==========

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ========== MANEJO DE ERRORES ==========

app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// ========== INICIAR SERVIDOR ==========

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   SimpleClub - Sistema de Ventas       ║
╠════════════════════════════════════════╣
║  Servidor ejecutándose en:             ║
║  http://localhost:${PORT}                   ║
║                                        ║
║  API disponible en:                    ║
║  http://localhost:${PORT}/api               ║
╚════════════════════════════════════════╝
    `);
});

module.exports = app;
