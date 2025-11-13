// Sistema de Control de Ventas para SimpleClub
// Gestión de datos con LocalStorage

class SimpleClub {
    constructor() {
        this.ventas = this.cargarDatos('ventas') || [];
        this.productos = this.cargarDatos('productos') || [];
        this.miembros = this.cargarDatos('miembros') || [];
        this.init();
    }

    // Inicializar la aplicación
    init() {
        this.configurarPestañas();
        this.configurarFormularios();
        this.configurarBusqueda();
        this.configurarExportacion();
        this.actualizarFechaHoy();
        this.renderizarTodo();
        this.registrarServiceWorker();
    }

    // LocalStorage
    cargarDatos(clave) {
        try {
            const datos = localStorage.getItem(clave);
            return datos ? JSON.parse(datos) : null;
        } catch (error) {
            console.error('Error al cargar datos:', error);
            return null;
        }
    }

    guardarDatos(clave, datos) {
        try {
            localStorage.setItem(clave, JSON.stringify(datos));
        } catch (error) {
            console.error('Error al guardar datos:', error);
            alert('Error al guardar los datos. El almacenamiento puede estar lleno.');
        }
    }

    // Sistema de pestañas
    configurarPestañas() {
        const botones = document.querySelectorAll('.tab-btn');
        botones.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;

                // Actualizar botones
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Actualizar contenido
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById(tab).classList.add('active');

                // Actualizar estadísticas si es la pestaña activa
                if (tab === 'estadisticas') {
                    this.renderizarEstadisticas();
                }
            });
        });
    }

    // Configurar formularios
    configurarFormularios() {
        // Formulario de venta
        document.getElementById('form-venta').addEventListener('submit', (e) => {
            e.preventDefault();
            this.agregarVenta();
        });

        // Formulario de producto
        document.getElementById('form-producto').addEventListener('submit', (e) => {
            e.preventDefault();
            this.agregarProducto();
        });

        // Formulario de miembro
        document.getElementById('form-miembro').addEventListener('submit', (e) => {
            e.preventDefault();
            this.agregarMiembro();
        });
    }

    // Configurar búsqueda
    configurarBusqueda() {
        const inputBusqueda = document.getElementById('buscar-venta');
        inputBusqueda.addEventListener('input', (e) => {
            this.buscarVentas(e.target.value);
        });
    }

    // Configurar exportación/importación
    configurarExportacion() {
        document.getElementById('exportar-datos').addEventListener('click', () => {
            this.exportarDatos();
        });

        document.getElementById('importar-datos').addEventListener('click', () => {
            document.getElementById('file-import').click();
        });

        document.getElementById('file-import').addEventListener('change', (e) => {
            this.importarDatos(e.target.files[0]);
        });

        document.getElementById('limpiar-datos').addEventListener('click', () => {
            this.limpiarDatos();
        });
    }

    // Fecha de hoy por defecto
    actualizarFechaHoy() {
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('fecha').value = hoy;
    }

    // VENTAS
    agregarVenta() {
        const producto = document.getElementById('producto').value;
        const vendedor = document.getElementById('vendedor').value;
        const cantidad = parseInt(document.getElementById('cantidad').value);
        const precio = parseFloat(document.getElementById('precio').value);
        const fecha = document.getElementById('fecha').value;
        const notas = document.getElementById('notas').value;

        const venta = {
            id: Date.now(),
            producto,
            vendedor,
            cantidad,
            precio,
            total: cantidad * precio,
            fecha,
            notas,
            timestamp: new Date().toISOString()
        };

        this.ventas.unshift(venta);
        this.guardarDatos('ventas', this.ventas);
        this.renderizarVentas();
        this.mostrarNotificacion('Venta registrada exitosamente ✓');

        // Limpiar formulario
        document.getElementById('form-venta').reset();
        this.actualizarFechaHoy();
    }

    eliminarVenta(id) {
        if (confirm('¿Estás seguro de eliminar esta venta?')) {
            this.ventas = this.ventas.filter(v => v.id !== id);
            this.guardarDatos('ventas', this.ventas);
            this.renderizarVentas();
            this.mostrarNotificacion('Venta eliminada');
        }
    }

    buscarVentas(termino) {
        const listaVentas = document.getElementById('lista-ventas');
        termino = termino.toLowerCase();

        const ventasFiltradas = this.ventas.filter(v => {
            const productoNombre = this.obtenerNombreProducto(v.producto).toLowerCase();
            const vendedorNombre = this.obtenerNombreMiembro(v.vendedor).toLowerCase();
            const notas = (v.notas || '').toLowerCase();

            return productoNombre.includes(termino) ||
                   vendedorNombre.includes(termino) ||
                   notas.includes(termino);
        });

        this.renderizarListaVentas(ventasFiltradas, listaVentas);
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
                    <div class="item-title">${this.obtenerNombreProducto(v.producto)}</div>
                    <div class="item-details">
                        Vendedor: ${this.obtenerNombreMiembro(v.vendedor)}
                    </div>
                    <div class="item-meta">
                        <span class="badge">Cantidad: ${v.cantidad}</span>
                        <span class="badge">Precio: $${v.precio.toFixed(2)}</span>
                        <span class="badge">Total: $${v.total.toFixed(2)}</span>
                        <span class="badge">Fecha: ${this.formatearFecha(v.fecha)}</span>
                    </div>
                    ${v.notas ? `<div class="item-details" style="margin-top: 0.5rem;">📝 ${v.notas}</div>` : ''}
                </div>
                <button class="btn-delete" onclick="app.eliminarVenta(${v.id})">Eliminar</button>
            </div>
        `).join('');
    }

    // PRODUCTOS
    agregarProducto() {
        const nombre = document.getElementById('nombre-producto').value;
        const precio = parseFloat(document.getElementById('precio-sugerido').value);
        const descripcion = document.getElementById('descripcion-producto').value;

        const producto = {
            id: Date.now(),
            nombre,
            precio,
            descripcion
        };

        this.productos.push(producto);
        this.guardarDatos('productos', this.productos);
        this.renderizarProductos();
        this.actualizarSelectores();
        this.mostrarNotificacion('Producto agregado exitosamente ✓');

        document.getElementById('form-producto').reset();
    }

    eliminarProducto(id) {
        // Verificar si el producto está en uso
        const enUso = this.ventas.some(v => v.producto === id.toString());

        if (enUso) {
            alert('No se puede eliminar este producto porque tiene ventas registradas.');
            return;
        }

        if (confirm('¿Estás seguro de eliminar este producto?')) {
            this.productos = this.productos.filter(p => p.id !== id);
            this.guardarDatos('productos', this.productos);
            this.renderizarProductos();
            this.actualizarSelectores();
            this.mostrarNotificacion('Producto eliminado');
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
                <button class="btn-delete" onclick="app.eliminarProducto(${p.id})">Eliminar</button>
            </div>
        `).join('');
    }

    // MIEMBROS
    agregarMiembro() {
        const nombre = document.getElementById('nombre-miembro').value;
        const telefono = document.getElementById('telefono').value;

        const miembro = {
            id: Date.now(),
            nombre,
            telefono
        };

        this.miembros.push(miembro);
        this.guardarDatos('miembros', this.miembros);
        this.renderizarMiembros();
        this.actualizarSelectores();
        this.mostrarNotificacion('Miembro agregado exitosamente ✓');

        document.getElementById('form-miembro').reset();
    }

    eliminarMiembro(id) {
        // Verificar si el miembro está en uso
        const enUso = this.ventas.some(v => v.vendedor === id.toString());

        if (enUso) {
            alert('No se puede eliminar este miembro porque tiene ventas registradas.');
            return;
        }

        if (confirm('¿Estás seguro de eliminar este miembro?')) {
            this.miembros = this.miembros.filter(m => m.id !== id);
            this.guardarDatos('miembros', this.miembros);
            this.renderizarMiembros();
            this.actualizarSelectores();
            this.mostrarNotificacion('Miembro eliminado');
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

    // ESTADÍSTICAS
    renderizarEstadisticas() {
        // Resumen general
        const totalVentas = this.ventas.reduce((sum, v) => sum + v.total, 0);
        document.getElementById('total-ventas').textContent = `$${totalVentas.toFixed(2)}`;
        document.getElementById('num-ventas').textContent = this.ventas.length;
        document.getElementById('total-productos').textContent = this.productos.length;
        document.getElementById('total-miembros').textContent = this.miembros.length;

        // Top vendedores
        this.renderizarTopVendedores();

        // Top productos
        this.renderizarTopProductos();
    }

    renderizarTopVendedores() {
        const ventasPorVendedor = {};

        this.ventas.forEach(v => {
            if (!ventasPorVendedor[v.vendedor]) {
                ventasPorVendedor[v.vendedor] = {
                    total: 0,
                    cantidad: 0
                };
            }
            ventasPorVendedor[v.vendedor].total += v.total;
            ventasPorVendedor[v.vendedor].cantidad += 1;
        });

        const topVendedores = Object.entries(ventasPorVendedor)
            .map(([id, datos]) => ({
                nombre: this.obtenerNombreMiembro(id),
                total: datos.total,
                cantidad: datos.cantidad
            }))
            .sort((a, b) => b.total - a.total);

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
            if (!ventasPorProducto[v.producto]) {
                ventasPorProducto[v.producto] = {
                    total: 0,
                    cantidad: 0
                };
            }
            ventasPorProducto[v.producto].total += v.total;
            ventasPorProducto[v.producto].cantidad += v.cantidad;
        });

        const topProductos = Object.entries(ventasPorProducto)
            .map(([id, datos]) => ({
                nombre: this.obtenerNombreProducto(id),
                total: datos.total,
                cantidad: datos.cantidad
            }))
            .sort((a, b) => b.total - a.total);

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

    // UTILIDADES
    actualizarSelectores() {
        // Actualizar selector de productos
        const selectProducto = document.getElementById('producto');
        const valorActual = selectProducto.value;
        selectProducto.innerHTML = '<option value="">Selecciona un producto</option>' +
            this.productos.map(p => `<option value="${p.id}">${p.nombre} - $${p.precio.toFixed(2)}</option>`).join('');
        selectProducto.value = valorActual;

        // Actualizar precio cuando se selecciona un producto
        selectProducto.addEventListener('change', (e) => {
            const producto = this.productos.find(p => p.id.toString() === e.target.value);
            if (producto) {
                document.getElementById('precio').value = producto.precio.toFixed(2);
            }
        });

        // Actualizar selector de vendedores
        const selectVendedor = document.getElementById('vendedor');
        const valorActualVendedor = selectVendedor.value;
        selectVendedor.innerHTML = '<option value="">Selecciona un vendedor</option>' +
            this.miembros.map(m => `<option value="${m.id}">${m.nombre}</option>`).join('');
        selectVendedor.value = valorActualVendedor;
    }

    obtenerNombreProducto(id) {
        const producto = this.productos.find(p => p.id.toString() === id.toString());
        return producto ? producto.nombre : 'Producto desconocido';
    }

    obtenerNombreMiembro(id) {
        const miembro = this.miembros.find(m => m.id.toString() === id.toString());
        return miembro ? miembro.nombre : 'Miembro desconocido';
    }

    formatearFecha(fecha) {
        const opciones = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', opciones);
    }

    mostrarNotificacion(mensaje) {
        // Crear elemento de notificación
        const notif = document.createElement('div');
        notif.textContent = mensaje;
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notif);

        setTimeout(() => {
            notif.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }

    // EXPORTAR/IMPORTAR
    exportarDatos() {
        const datos = {
            ventas: this.ventas,
            productos: this.productos,
            miembros: this.miembros,
            exportado: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `simpleclub-datos-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.mostrarNotificacion('Datos exportados exitosamente ✓');
    }

    importarDatos(archivo) {
        if (!archivo) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const datos = JSON.parse(e.target.result);

                if (confirm('¿Estás seguro? Esto reemplazará todos los datos actuales.')) {
                    this.ventas = datos.ventas || [];
                    this.productos = datos.productos || [];
                    this.miembros = datos.miembros || [];

                    this.guardarDatos('ventas', this.ventas);
                    this.guardarDatos('productos', this.productos);
                    this.guardarDatos('miembros', this.miembros);

                    this.renderizarTodo();
                    this.mostrarNotificacion('Datos importados exitosamente ✓');
                }
            } catch (error) {
                alert('Error al importar datos. Asegúrate de que el archivo sea válido.');
                console.error(error);
            }
        };
        reader.readAsText(archivo);

        // Limpiar input
        document.getElementById('file-import').value = '';
    }

    limpiarDatos() {
        if (confirm('⚠️ ¿Estás COMPLETAMENTE seguro? Esto eliminará TODOS los datos de forma permanente.')) {
            if (confirm('Esta acción NO se puede deshacer. ¿Continuar?')) {
                this.ventas = [];
                this.productos = [];
                this.miembros = [];

                localStorage.clear();

                this.renderizarTodo();
                this.mostrarNotificacion('Todos los datos han sido eliminados');
            }
        }
    }

    renderizarTodo() {
        this.renderizarVentas();
        this.renderizarProductos();
        this.renderizarMiembros();
        this.renderizarEstadisticas();
    }

    // Service Worker para PWA
    registrarServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(() => console.log('Service Worker registrado'))
                .catch(err => console.log('Error al registrar Service Worker:', err));
        }
    }
}

// Inicializar la aplicación
const app = new SimpleClub();

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
