// Sistema de Control de Ventas para SimpleClub con Firebase
// Base de datos en la nube con Firestore

// Inicializar Firebase (firebaseConfig se carga desde firebase-config.js)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

class SimpleClubFirebase {
    constructor() {
        this.ventas = [];
        this.productos = [];
        this.miembros = [];
        this.unsubscribers = [];
        this.init();
    }

    // Inicializar la aplicación
    async init() {
        this.configurarPestañas();
        this.configurarFormularios();
        this.configurarBusqueda();
        this.actualizarFechaHoy();

        // Escuchar cambios en tiempo real
        this.escucharProductos();
        this.escucharMiembros();
        this.escucharVentas();
    }

    // ========== FIREBASE LISTENERS (Tiempo Real) ==========

    escucharProductos() {
        const unsubscribe = db.collection('productos')
            .where('activo', '==', true)
            .orderBy('nombre')
            .onSnapshot((snapshot) => {
                this.productos = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                this.renderizarProductos();
                this.actualizarSelectores();
            }, (error) => {
                console.error('Error al escuchar productos:', error);
                this.mostrarNotificacion('Error al sincronizar productos', 'error');
            });

        this.unsubscribers.push(unsubscribe);
    }

    escucharMiembros() {
        const unsubscribe = db.collection('miembros')
            .where('activo', '==', true)
            .orderBy('nombre')
            .onSnapshot((snapshot) => {
                this.miembros = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                this.renderizarMiembros();
                this.actualizarSelectores();
            }, (error) => {
                console.error('Error al escuchar miembros:', error);
                this.mostrarNotificacion('Error al sincronizar miembros', 'error');
            });

        this.unsubscribers.push(unsubscribe);
    }

    escucharVentas() {
        const unsubscribe = db.collection('ventas')
            .orderBy('fecha', 'desc')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .onSnapshot((snapshot) => {
                this.ventas = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                this.renderizarVentas();
            }, (error) => {
                console.error('Error al escuchar ventas:', error);
                this.mostrarNotificacion('Error al sincronizar ventas', 'error');
            });

        this.unsubscribers.push(unsubscribe);
    }

    // ========== PESTAÑAS ==========

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

    // ========== FORMULARIOS ==========

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

    // ========== BÚSQUEDA ==========

    configurarBusqueda() {
        const inputBusqueda = document.getElementById('buscar-venta');
        inputBusqueda.addEventListener('input', (e) => {
            this.buscarVentas(e.target.value);
        });
    }

    actualizarFechaHoy() {
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('fecha').value = hoy;
    }

    // ========== PRODUCTOS ==========

    async agregarProducto() {
        try {
            const nombre = document.getElementById('nombre-producto').value;
            const precio = parseFloat(document.getElementById('precio-sugerido').value);
            const descripcion = document.getElementById('descripcion-producto').value;

            await db.collection('productos').add({
                nombre,
                precio,
                descripcion,
                activo: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.mostrarNotificacion('Producto agregado exitosamente ✓');
            document.getElementById('form-producto').reset();
        } catch (error) {
            console.error('Error al agregar producto:', error);
            this.mostrarNotificacion('Error al agregar producto: ' + error.message, 'error');
        }
    }

    async eliminarProducto(id) {
        // Verificar si tiene ventas
        const ventasConProducto = this.ventas.filter(v => v.productoId === id);

        if (ventasConProducto.length > 0) {
            this.mostrarNotificacion('No se puede eliminar: el producto tiene ventas registradas', 'error');
            return;
        }

        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        try {
            await db.collection('productos').doc(id).update({
                activo: false
            });
            this.mostrarNotificacion('Producto eliminado');
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            this.mostrarNotificacion('Error al eliminar producto', 'error');
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
                    <div class="item-details">Precio sugerido: $${p.precio.toFixed(2)}</div>
                    ${p.descripcion ? `<div class="item-details">${p.descripcion}</div>` : ''}
                </div>
                <button class="btn-delete" onclick="app.eliminarProducto('${p.id}')">Eliminar</button>
            </div>
        `).join('');
    }

    // ========== MIEMBROS ==========

    async agregarMiembro() {
        try {
            const nombre = document.getElementById('nombre-miembro').value;
            const telefono = document.getElementById('telefono').value;

            await db.collection('miembros').add({
                nombre,
                telefono: telefono || '',
                activo: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.mostrarNotificacion('Miembro agregado exitosamente ✓');
            document.getElementById('form-miembro').reset();
        } catch (error) {
            console.error('Error al agregar miembro:', error);
            this.mostrarNotificacion('Error al agregar miembro: ' + error.message, 'error');
        }
    }

    async eliminarMiembro(id) {
        // Verificar si tiene ventas
        const ventasConMiembro = this.ventas.filter(v => v.miembroId === id);

        if (ventasConMiembro.length > 0) {
            this.mostrarNotificacion('No se puede eliminar: el miembro tiene ventas registradas', 'error');
            return;
        }

        if (!confirm('¿Estás seguro de eliminar este miembro?')) return;

        try {
            await db.collection('miembros').doc(id).update({
                activo: false
            });
            this.mostrarNotificacion('Miembro eliminado');
        } catch (error) {
            console.error('Error al eliminar miembro:', error);
            this.mostrarNotificacion('Error al eliminar miembro', 'error');
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
                <button class="btn-delete" onclick="app.eliminarMiembro('${m.id}')">Eliminar</button>
            </div>
        `).join('');
    }

    // ========== VENTAS ==========

    async agregarVenta() {
        try {
            const productoId = document.getElementById('producto').value;
            const miembroId = document.getElementById('vendedor').value;
            const cantidad = parseInt(document.getElementById('cantidad').value);
            const precioUnitario = parseFloat(document.getElementById('precio').value);
            const fecha = document.getElementById('fecha').value;
            const notas = document.getElementById('notas').value;

            if (!productoId || !miembroId) {
                this.mostrarNotificacion('Debes seleccionar un producto y un vendedor', 'error');
                return;
            }

            const producto = this.productos.find(p => p.id === productoId);
            const miembro = this.miembros.find(m => m.id === miembroId);

            const total = cantidad * precioUnitario;

            await db.collection('ventas').add({
                productoId,
                productoNombre: producto.nombre,
                miembroId,
                miembroNombre: miembro.nombre,
                cantidad,
                precioUnitario,
                total,
                fecha,
                notas: notas || '',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.mostrarNotificacion('Venta registrada exitosamente ✓');
            document.getElementById('form-venta').reset();
            this.actualizarFechaHoy();
        } catch (error) {
            console.error('Error al agregar venta:', error);
            this.mostrarNotificacion('Error al registrar venta: ' + error.message, 'error');
        }
    }

    async eliminarVenta(id) {
        if (!confirm('¿Estás seguro de eliminar esta venta?')) return;

        try {
            await db.collection('ventas').doc(id).delete();
            this.mostrarNotificacion('Venta eliminada');
        } catch (error) {
            console.error('Error al eliminar venta:', error);
            this.mostrarNotificacion('Error al eliminar venta', 'error');
        }
    }

    buscarVentas(termino) {
        termino = termino.toLowerCase();

        if (termino.length < 2) {
            this.renderizarVentas();
            return;
        }

        const ventasFiltradas = this.ventas.filter(v => {
            return v.productoNombre.toLowerCase().includes(termino) ||
                   v.miembroNombre.toLowerCase().includes(termino) ||
                   (v.notas && v.notas.toLowerCase().includes(termino));
        });

        this.renderizarListaVentas(ventasFiltradas, document.getElementById('lista-ventas'));
    }

    renderizarVentas() {
        this.renderizarListaVentas(this.ventas, document.getElementById('lista-ventas'));
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
                    <div class="item-title">${v.productoNombre}</div>
                    <div class="item-details">
                        Vendedor: ${v.miembroNombre}
                    </div>
                    <div class="item-meta">
                        <span class="badge">Cantidad: ${v.cantidad}</span>
                        <span class="badge">Precio: $${v.precioUnitario.toFixed(2)}</span>
                        <span class="badge">Total: $${v.total.toFixed(2)}</span>
                        <span class="badge">Fecha: ${this.formatearFecha(v.fecha)}</span>
                    </div>
                    ${v.notas ? `<div class="item-details" style="margin-top: 0.5rem;">📝 ${v.notas}</div>` : ''}
                </div>
                <button class="btn-delete" onclick="app.eliminarVenta('${v.id}')">Eliminar</button>
            </div>
        `).join('');
    }

    // ========== ESTADÍSTICAS ==========

    renderizarEstadisticas() {
        // Resumen general
        const totalVentas = this.ventas.reduce((sum, v) => sum + v.total, 0);
        document.getElementById('total-ventas').textContent = `$${totalVentas.toFixed(2)}`;
        document.getElementById('num-ventas').textContent = this.ventas.length;
        document.getElementById('total-productos').textContent = this.productos.length;
        document.getElementById('total-miembros').textContent = this.miembros.length;

        this.renderizarTopVendedores();
        this.renderizarTopProductos();
    }

    renderizarTopVendedores() {
        const ventasPorVendedor = {};

        this.ventas.forEach(v => {
            if (!ventasPorVendedor[v.miembroId]) {
                ventasPorVendedor[v.miembroId] = {
                    nombre: v.miembroNombre,
                    total: 0,
                    cantidad: 0
                };
            }
            ventasPorVendedor[v.miembroId].total += v.total;
            ventasPorVendedor[v.miembroId].cantidad += 1;
        });

        const topVendedores = Object.values(ventasPorVendedor)
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        const contenedor = document.getElementById('top-vendedores');

        if (topVendedores.length === 0) {
            contenedor.innerHTML = '<p class="empty-message">No hay datos disponibles</p>';
            return;
        }

        contenedor.innerHTML = topVendedores.map((v, index) => `
            <div class="top-item">
                <div>
                    <div class="top-item-name">${index + 1}. ${v.nombre}</div>
                    <div style="font-size: 0.85rem; color: #666;">${v.cantidad} venta${v.cantidad !== 1 ? 's' : ''}</div>
                </div>
                <div class="top-item-value">$${v.total.toFixed(2)}</div>
            </div>
        `).join('');
    }

    renderizarTopProductos() {
        const ventasPorProducto = {};

        this.ventas.forEach(v => {
            if (!ventasPorProducto[v.productoId]) {
                ventasPorProducto[v.productoId] = {
                    nombre: v.productoNombre,
                    total: 0,
                    cantidad: 0
                };
            }
            ventasPorProducto[v.productoId].total += v.total;
            ventasPorProducto[v.productoId].cantidad += v.cantidad;
        });

        const topProductos = Object.values(ventasPorProducto)
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        const contenedor = document.getElementById('top-productos');

        if (topProductos.length === 0) {
            contenedor.innerHTML = '<p class="empty-message">No hay datos disponibles</p>';
            return;
        }

        contenedor.innerHTML = topProductos.map((p, index) => `
            <div class="top-item">
                <div>
                    <div class="top-item-name">${index + 1}. ${p.nombre}</div>
                    <div style="font-size: 0.85rem; color: #666;">${p.cantidad} unidad${p.cantidad !== 1 ? 'es' : ''} vendidas</div>
                </div>
                <div class="top-item-value">$${p.total.toFixed(2)}</div>
            </div>
        `).join('');
    }

    // ========== UTILIDADES ==========

    actualizarSelectores() {
        // Actualizar selector de productos
        const selectProducto = document.getElementById('producto');
        const valorActual = selectProducto.value;
        selectProducto.innerHTML = '<option value="">Selecciona un producto</option>' +
            this.productos.map(p => `<option value="${p.id}">${p.nombre} - $${p.precio.toFixed(2)}</option>`).join('');
        selectProducto.value = valorActual;

        // Actualizar precio cuando se selecciona un producto
        selectProducto.onchange = (e) => {
            const producto = this.productos.find(p => p.id === e.target.value);
            if (producto) {
                document.getElementById('precio').value = producto.precio.toFixed(2);
            }
        };

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

    // Limpiar listeners al cerrar
    destroy() {
        this.unsubscribers.forEach(unsubscribe => unsubscribe());
    }
}

// Inicializar la aplicación cuando Firebase esté listo
let app;

firebase.auth().onAuthStateChanged((user) => {
    // Autenticación anónima para simplicidad
    if (!user) {
        firebase.auth().signInAnonymously().catch((error) => {
            console.error('Error en autenticación:', error);
        });
    } else {
        // Usuario autenticado, inicializar app
        if (!app) {
            app = new SimpleClubFirebase();
        }
    }
});

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
