// Sistema de Control de Ventas para SimpleClub con Base de Datos
// Conectado a API REST con backend

class SimpleClubDB {
    constructor() {
        this.API_URL = window.location.origin + '/api';
        this.token = localStorage.getItem('token');
        this.usuario = null;
        this.ventas = [];
        this.productos = [];
        this.miembros = [];
        this.init();
    }

    // Inicializar la aplicación
    async init() {
        this.configurarPestañas();
        this.configurarFormularios();
        this.configurarBusqueda();
        this.actualizarFechaHoy();

        // Verificar si hay sesión activa
        if (this.token) {
            await this.verificarSesion();
        }

        await this.cargarDatos();
        this.renderizarTodo();
    }

    // ========== UTILIDADES HTTP ==========

    async fetchAPI(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            },
            ...options
        };

        try {
            const response = await fetch(`${this.API_URL}${endpoint}`, config);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error en la petición');
            }

            return await response.json();
        } catch (error) {
            console.error('Error en API:', error);
            throw error;
        }
    }

    // ========== AUTENTICACIÓN ==========

    async verificarSesion() {
        try {
            const data = await this.fetchAPI('/auth/verify');
            if (data.valido) {
                this.usuario = data.usuario;
            } else {
                this.cerrarSesion();
            }
        } catch (error) {
            this.cerrarSesion();
        }
    }

    cerrarSesion() {
        this.token = null;
        this.usuario = null;
        localStorage.removeItem('token');
    }

    // ========== CARGAR DATOS ==========

    async cargarDatos() {
        try {
            const [productos, miembros, ventas] = await Promise.all([
                this.fetchAPI('/productos'),
                this.fetchAPI('/miembros'),
                this.fetchAPI('/ventas')
            ]);

            this.productos = productos;
            this.miembros = miembros;
            this.ventas = ventas;
        } catch (error) {
            console.error('Error al cargar datos:', error);
            this.mostrarNotificacion('Error al cargar datos del servidor', 'error');
        }
    }

    // Sistema de pestañas
    configurarPestañas() {
        const botones = document.querySelectorAll('.tab-btn');
        botones.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;

                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById(tab).classList.add('active');

                if (tab === 'estadisticas') {
                    this.renderizarEstadisticas();
                }
            });
        });
    }

    // Configurar formularios
    configurarFormularios() {
        document.getElementById('form-venta').addEventListener('submit', (e) => {
            e.preventDefault();
            this.agregarVenta();
        });

        document.getElementById('form-producto').addEventListener('submit', (e) => {
            e.preventDefault();
            this.agregarProducto();
        });

        document.getElementById('form-miembro').addEventListener('submit', (e) => {
            e.preventDefault();
            this.agregarMiembro();
        });
    }

    // Configurar búsqueda
    configurarBusqueda() {
        const inputBusqueda = document.getElementById('buscar-venta');
        let timeoutId;

        inputBusqueda.addEventListener('input', (e) => {
            clearTimeout(timeoutId);
            const termino = e.target.value;

            if (termino.length < 2) {
                this.renderizarVentas();
                return;
            }

            timeoutId = setTimeout(() => {
                this.buscarVentas(termino);
            }, 300);
        });
    }

    actualizarFechaHoy() {
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('fecha').value = hoy;
    }

    // ========== VENTAS ==========

    async agregarVenta() {
        try {
            const producto_id = parseInt(document.getElementById('producto').value);
            const miembro_id = parseInt(document.getElementById('vendedor').value);
            const cantidad = parseInt(document.getElementById('cantidad').value);
            const precio_unitario = parseFloat(document.getElementById('precio').value);
            const fecha = document.getElementById('fecha').value;
            const notas = document.getElementById('notas').value;

            const data = await this.fetchAPI('/ventas', {
                method: 'POST',
                body: JSON.stringify({
                    producto_id,
                    miembro_id,
                    cantidad,
                    precio_unitario,
                    fecha,
                    notas
                })
            });

            this.mostrarNotificacion('Venta registrada exitosamente ✓');
            await this.cargarDatos();
            this.renderizarVentas();

            document.getElementById('form-venta').reset();
            this.actualizarFechaHoy();
        } catch (error) {
            this.mostrarNotificacion('Error al registrar venta: ' + error.message, 'error');
        }
    }

    async eliminarVenta(id) {
        if (!confirm('¿Estás seguro de eliminar esta venta?')) return;

        try {
            await this.fetchAPI(`/ventas/${id}`, { method: 'DELETE' });
            this.mostrarNotificacion('Venta eliminada');
            await this.cargarDatos();
            this.renderizarVentas();
        } catch (error) {
            this.mostrarNotificacion('Error al eliminar venta: ' + error.message, 'error');
        }
    }

    async buscarVentas(termino) {
        try {
            const ventas = await this.fetchAPI(`/ventas/buscar/${encodeURIComponent(termino)}`);
            this.renderizarListaVentas(ventas, document.getElementById('lista-ventas'));
        } catch (error) {
            console.error('Error al buscar ventas:', error);
        }
    }

    renderizarVentas() {
        const listaVentas = document.getElementById('lista-ventas');
        this.renderizarListaVentas(this.ventas, listaVentas);
        this.actualizarSelectores();
    }

    renderizarListaVentas(ventas, contenedor) {
        if (ventas.length === 0) {
            contenedor.innerHTML = '<p class="empty-message">No hay ventas registradas</p>';
            return;
        }

        contenedor.innerHTML = ventas.map(v => `
            <div class="item">
                <div class="item-info">
                    <div class="item-title">${v.producto_nombre}</div>
                    <div class="item-details">
                        Vendedor: ${v.miembro_nombre}
                    </div>
                    <div class="item-meta">
                        <span class="badge">Cantidad: ${v.cantidad}</span>
                        <span class="badge">Precio: $${parseFloat(v.precio_unitario).toFixed(2)}</span>
                        <span class="badge">Total: $${parseFloat(v.total).toFixed(2)}</span>
                        <span class="badge">Fecha: ${this.formatearFecha(v.fecha)}</span>
                    </div>
                    ${v.notas ? `<div class="item-details" style="margin-top: 0.5rem;">📝 ${v.notas}</div>` : ''}
                </div>
                <button class="btn-delete" onclick="app.eliminarVenta(${v.id})">Eliminar</button>
            </div>
        `).join('');
    }

    // ========== PRODUCTOS ==========

    async agregarProducto() {
        try {
            const nombre = document.getElementById('nombre-producto').value;
            const precio = parseFloat(document.getElementById('precio-sugerido').value);
            const descripcion = document.getElementById('descripcion-producto').value;

            await this.fetchAPI('/productos', {
                method: 'POST',
                body: JSON.stringify({ nombre, precio, descripcion })
            });

            this.mostrarNotificacion('Producto agregado exitosamente ✓');
            await this.cargarDatos();
            this.renderizarProductos();
            this.actualizarSelectores();

            document.getElementById('form-producto').reset();
        } catch (error) {
            this.mostrarNotificacion('Error al agregar producto: ' + error.message, 'error');
        }
    }

    async eliminarProducto(id) {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        try {
            await this.fetchAPI(`/productos/${id}`, { method: 'DELETE' });
            this.mostrarNotificacion('Producto eliminado');
            await this.cargarDatos();
            this.renderizarProductos();
            this.actualizarSelectores();
        } catch (error) {
            this.mostrarNotificacion('Error: ' + error.message, 'error');
        }
    }

    renderizarProductos() {
        const listaProductos = document.getElementById('lista-productos');

        if (this.productos.length === 0) {
            listaProductos.innerHTML = '<p class="empty-message">No hay productos registrados</p>';
            return;
        }

        listaProductos.innerHTML = this.productos.map(p => `
            <div class="item">
                <div class="item-info">
                    <div class="item-title">${p.nombre}</div>
                    <div class="item-details">Precio sugerido: $${parseFloat(p.precio).toFixed(2)}</div>
                    ${p.descripcion ? `<div class="item-details">${p.descripcion}</div>` : ''}
                </div>
                <button class="btn-delete" onclick="app.eliminarProducto(${p.id})">Eliminar</button>
            </div>
        `).join('');
    }

    // ========== MIEMBROS ==========

    async agregarMiembro() {
        try {
            const nombre = document.getElementById('nombre-miembro').value;
            const telefono = document.getElementById('telefono').value;

            await this.fetchAPI('/miembros', {
                method: 'POST',
                body: JSON.stringify({ nombre, telefono })
            });

            this.mostrarNotificacion('Miembro agregado exitosamente ✓');
            await this.cargarDatos();
            this.renderizarMiembros();
            this.actualizarSelectores();

            document.getElementById('form-miembro').reset();
        } catch (error) {
            this.mostrarNotificacion('Error al agregar miembro: ' + error.message, 'error');
        }
    }

    async eliminarMiembro(id) {
        if (!confirm('¿Estás seguro de eliminar este miembro?')) return;

        try {
            await this.fetchAPI(`/miembros/${id}`, { method: 'DELETE' });
            this.mostrarNotificacion('Miembro eliminado');
            await this.cargarDatos();
            this.renderizarMiembros();
            this.actualizarSelectores();
        } catch (error) {
            this.mostrarNotificacion('Error: ' + error.message, 'error');
        }
    }

    renderizarMiembros() {
        const listaMiembros = document.getElementById('lista-miembros');

        if (this.miembros.length === 0) {
            listaMiembros.innerHTML = '<p class="empty-message">No hay miembros registrados</p>';
            return;
        }

        listaMiembros.innerHTML = this.miembros.map(m => `
            <div class="item">
                <div class="item-info">
                    <div class="item-title">${m.nombre}</div>
                    ${m.telefono ? `<div class="item-details">📱 ${m.telefono}</div>` : ''}
                </div>
                <button class="btn-delete" onclick="app.eliminarMiembro(${m.id})">Eliminar</button>
            </div>
        `).join('');
    }

    // ========== ESTADÍSTICAS ==========

    async renderizarEstadisticas() {
        try {
            const [stats, topVendedores, topProductos] = await Promise.all([
                this.fetchAPI('/estadisticas'),
                this.fetchAPI('/estadisticas/vendedores?limite=10'),
                this.fetchAPI('/estadisticas/productos?limite=10')
            ]);

            // Resumen general
            document.getElementById('total-ventas').textContent = `$${parseFloat(stats.total_ventas || 0).toFixed(2)}`;
            document.getElementById('num-ventas').textContent = stats.num_ventas || 0;
            document.getElementById('total-productos').textContent = stats.total_productos || 0;
            document.getElementById('total-miembros').textContent = stats.total_miembros || 0;

            // Top vendedores
            this.renderizarTopVendedores(topVendedores);

            // Top productos
            this.renderizarTopProductos(topProductos);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    }

    renderizarTopVendedores(vendedores) {
        const contenedor = document.getElementById('top-vendedores');

        if (vendedores.length === 0) {
            contenedor.innerHTML = '<p class="empty-message">No hay datos disponibles</p>';
            return;
        }

        contenedor.innerHTML = vendedores.map((v, index) => `
            <div class="top-item">
                <div>
                    <div class="top-item-name">${index + 1}. ${v.nombre}</div>
                    <div style="font-size: 0.85rem; color: #666;">${v.cantidad_ventas} venta${v.cantidad_ventas !== 1 ? 's' : ''}</div>
                </div>
                <div class="top-item-value">$${parseFloat(v.total_vendido).toFixed(2)}</div>
            </div>
        `).join('');
    }

    renderizarTopProductos(productos) {
        const contenedor = document.getElementById('top-productos');

        if (productos.length === 0) {
            contenedor.innerHTML = '<p class="empty-message">No hay datos disponibles</p>';
            return;
        }

        contenedor.innerHTML = productos.map((p, index) => `
            <div class="top-item">
                <div>
                    <div class="top-item-name">${index + 1}. ${p.nombre}</div>
                    <div style="font-size: 0.85rem; color: #666;">${p.unidades_vendidas} unidad${p.unidades_vendidas !== 1 ? 'es' : ''} vendidas</div>
                </div>
                <div class="top-item-value">$${parseFloat(p.total_vendido).toFixed(2)}</div>
            </div>
        `).join('');
    }

    // ========== UTILIDADES ==========

    actualizarSelectores() {
        // Actualizar selector de productos
        const selectProducto = document.getElementById('producto');
        const valorActual = selectProducto.value;
        selectProducto.innerHTML = '<option value="">Selecciona un producto</option>' +
            this.productos.map(p => `<option value="${p.id}">${p.nombre} - $${parseFloat(p.precio).toFixed(2)}</option>`).join('');
        selectProducto.value = valorActual;

        // Actualizar precio cuando se selecciona un producto
        selectProducto.addEventListener('change', (e) => {
            const producto = this.productos.find(p => p.id.toString() === e.target.value);
            if (producto) {
                document.getElementById('precio').value = parseFloat(producto.precio).toFixed(2);
            }
        });

        // Actualizar selector de vendedores
        const selectVendedor = document.getElementById('vendedor');
        const valorActualVendedor = selectVendedor.value;
        selectVendedor.innerHTML = '<option value="">Selecciona un vendedor</option>' +
            this.miembros.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
        selectVendedor.value = valorActualVendedor;
    }

    formatearFecha(fecha) {
        const opciones = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', opciones);
    }

    mostrarNotificacion(mensaje, tipo = 'success') {
        const notif = document.createElement('div');
        notif.textContent = mensaje;

        const color = tipo === 'error' ? '#f44336' : '#4CAF50';

        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        `;

        document.body.appendChild(notif);

        setTimeout(() => {
            notif.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }

    renderizarTodo() {
        this.renderizarVentas();
        this.renderizarProductos();
        this.renderizarMiembros();
        this.renderizarEstadisticas();
    }
}

// Inicializar la aplicación
const app = new SimpleClubDB();

// Agregar estilos para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
