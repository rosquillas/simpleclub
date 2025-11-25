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
        this.clientes = [];
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
        this.escucharClientes();
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

    escucharClientes() {
        const unsubscribe = db.collection('clientes')
            .where('activo', '==', true)
            .orderBy('nombre')
            .onSnapshot((snapshot) => {
                this.clientes = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                this.renderizarClientes();
                this.actualizarSelectores();
            }, (error) => {
                console.error('Error al escuchar clientes:', error);
                this.mostrarNotificacion('Error al sincronizar clientes', 'error');
            });

        this.unsubscribers.push(unsubscribe);
    }

    escucharVentas() {
        const unsubscribe = db.collection('ventas')
            .orderBy('fecha', 'desc')
            .orderBy('timestamp', 'desc')
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

        document.getElementById('form-cliente').addEventListener('submit', (e) => {
            e.preventDefault();
            this.agregarCliente();
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

            // Verificar si estamos editando
            const productoId = document.getElementById('form-producto').dataset.editId;

            if (productoId) {
                // Actualizar producto existente
                await db.collection('productos').doc(productoId).update({
                    nombre,
                    precio,
                    descripcion,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                this.mostrarNotificacion('Producto actualizado exitosamente ✓');
                delete document.getElementById('form-producto').dataset.editId;
            } else {
                // Crear nuevo producto
                await db.collection('productos').add({
                    nombre,
                    precio,
                    descripcion,
                    activo: true,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                this.mostrarNotificacion('Producto agregado exitosamente ✓');
            }

            document.getElementById('form-producto').reset();
        } catch (error) {
            console.error('Error al guardar producto:', error);
            this.mostrarNotificacion('Error al guardar producto: ' + error.message, 'error');
        }
    }

    editarProducto(id) {
        const producto = this.productos.find(p => p.id === id);
        if (!producto) return;

        document.getElementById('nombre-producto').value = producto.nombre;
        document.getElementById('precio-sugerido').value = producto.precio;
        document.getElementById('descripcion-producto').value = producto.descripcion || '';

        // Guardar el ID para saber que estamos editando
        document.getElementById('form-producto').dataset.editId = id;

        // Scroll al formulario
        document.querySelector('#productos .card').scrollIntoView({ behavior: 'smooth' });
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
                    <div class="item-details">Precio sugerido: $${this.formatearNumero(p.precio)}</div>
                    ${p.descripcion ? `<div class="item-details">${p.descripcion}</div>` : ''}
                </div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="app.editarProducto('${p.id}')">Editar</button>
                    <button class="btn-delete" onclick="app.eliminarProducto('${p.id}')">Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    // ========== MIEMBROS ==========

    async agregarMiembro() {
        try {
            const nombre = document.getElementById('nombre-miembro').value;
            const telefono = document.getElementById('telefono').value;

            // Verificar si estamos editando
            const miembroId = document.getElementById('form-miembro').dataset.editId;

            if (miembroId) {
                // Actualizar miembro existente
                await db.collection('miembros').doc(miembroId).update({
                    nombre,
                    telefono: telefono || '',
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                this.mostrarNotificacion('Miembro actualizado exitosamente ✓');
                delete document.getElementById('form-miembro').dataset.editId;
            } else {
                // Crear nuevo miembro
                await db.collection('miembros').add({
                    nombre,
                    telefono: telefono || '',
                    activo: true,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                this.mostrarNotificacion('Miembro agregado exitosamente ✓');
            }

            document.getElementById('form-miembro').reset();
        } catch (error) {
            console.error('Error al guardar miembro:', error);
            this.mostrarNotificacion('Error al guardar miembro: ' + error.message, 'error');
        }
    }

    editarMiembro(id) {
        const miembro = this.miembros.find(m => m.id === id);
        if (!miembro) return;

        document.getElementById('nombre-miembro').value = miembro.nombre;
        document.getElementById('telefono').value = miembro.telefono || '';

        // Guardar el ID para saber que estamos editando
        document.getElementById('form-miembro').dataset.editId = id;

        // Scroll al formulario
        document.querySelector('#miembros .card').scrollIntoView({ behavior: 'smooth' });
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
                <div class="item-actions">
                    <button class="btn-edit" onclick="app.editarMiembro('${m.id}')">Editar</button>
                    <button class="btn-delete" onclick="app.eliminarMiembro('${m.id}')">Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    // ========== CLIENTES ==========

    async agregarCliente() {
        try {
            const nombre = document.getElementById('nombre-cliente').value;

            // Verificar si estamos editando
            const clienteId = document.getElementById('form-cliente').dataset.editId;

            if (clienteId) {
                // Actualizar cliente existente
                await db.collection('clientes').doc(clienteId).update({
                    nombre,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                this.mostrarNotificacion('Cliente actualizado exitosamente ✓');
                delete document.getElementById('form-cliente').dataset.editId;
            } else {
                // Crear nuevo cliente
                await db.collection('clientes').add({
                    nombre,
                    activo: true,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                this.mostrarNotificacion('Cliente agregado exitosamente ✓');
            }

            document.getElementById('form-cliente').reset();
        } catch (error) {
            console.error('Error al guardar cliente:', error);
            this.mostrarNotificacion('Error al guardar cliente: ' + error.message, 'error');
        }
    }

    editarCliente(id) {
        const cliente = this.clientes.find(c => c.id === id);
        if (!cliente) return;

        document.getElementById('nombre-cliente').value = cliente.nombre;

        // Guardar el ID para saber que estamos editando
        document.getElementById('form-cliente').dataset.editId = id;

        // Scroll al formulario
        document.querySelector('#clientes .card').scrollIntoView({ behavior: 'smooth' });
    }

    async eliminarCliente(id) {
        // Verificar si tiene ventas
        const ventasConCliente = this.ventas.filter(v => v.clienteId === id);

        if (ventasConCliente.length > 0) {
            this.mostrarNotificacion('No se puede eliminar: el cliente tiene ventas registradas', 'error');
            return;
        }

        if (!confirm('¿Estás seguro de eliminar este cliente?')) return;

        try {
            await db.collection('clientes').doc(id).update({
                activo: false
            });
            this.mostrarNotificacion('Cliente eliminado');
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            this.mostrarNotificacion('Error al eliminar cliente', 'error');
        }
    }

    renderizarClientes() {
        const listaClientes = document.getElementById('lista-clientes');

        if (this.clientes.length === 0) {
            listaClientes.innerHTML = '<p class="empty-message">No hay clientes registrados</p>';
            return;
        }

        listaClientes.innerHTML = this.clientes.map(c => `
            <div class="item">
                <div class="item-info">
                    <div class="item-title">${c.nombre}</div>
                </div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="app.editarCliente('${c.id}')">Editar</button>
                    <button class="btn-delete" onclick="app.eliminarCliente('${c.id}')">Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    // ========== VENTAS ==========

    async agregarVenta() {
        try {
            const productoId = document.getElementById('producto').value;
            const miembroId = document.getElementById('vendedor').value;
            const clienteId = document.getElementById('comprador').value;
            const cantidad = parseInt(document.getElementById('cantidad').value);
            const precioUnitario = parseFloat(document.getElementById('precio').value);
            const fecha = document.getElementById('fecha').value;
            const notas = document.getElementById('notas').value;

            if (!productoId || !miembroId || !clienteId) {
                this.mostrarNotificacion('Debes seleccionar un producto, vendedor y comprador', 'error');
                return;
            }

            const producto = this.productos.find(p => p.id === productoId);
            const miembro = this.miembros.find(m => m.id === miembroId);
            const cliente = this.clientes.find(c => c.id === clienteId);

            const total = cantidad * precioUnitario;

            // Verificar si estamos editando
            const ventaId = document.getElementById('form-venta').dataset.editId;

            if (ventaId) {
                // Actualizar venta existente
                await db.collection('ventas').doc(ventaId).update({
                    productoId,
                    productoNombre: producto.nombre,
                    miembroId,
                    miembroNombre: miembro.nombre,
                    clienteId,
                    clienteNombre: cliente.nombre,
                    cantidad,
                    precioUnitario,
                    total,
                    fecha,
                    notas: notas || '',
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                this.mostrarNotificacion('Venta actualizada exitosamente ✓');
                delete document.getElementById('form-venta').dataset.editId;
            } else {
                // Crear nueva venta
                await db.collection('ventas').add({
                    productoId,
                    productoNombre: producto.nombre,
                    miembroId,
                    miembroNombre: miembro.nombre,
                    clienteId,
                    clienteNombre: cliente.nombre,
                    cantidad,
                    precioUnitario,
                    total,
                    fecha,
                    notas: notas || '',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });

                this.mostrarNotificacion('Venta registrada exitosamente ✓');
            }

            document.getElementById('form-venta').reset();
            this.actualizarFechaHoy();
        } catch (error) {
            console.error('Error al guardar venta:', error);
            this.mostrarNotificacion('Error al guardar venta: ' + error.message, 'error');
        }
    }

    editarVenta(id) {
        const venta = this.ventas.find(v => v.id === id);
        if (!venta) return;

        document.getElementById('producto').value = venta.productoId;
        document.getElementById('vendedor').value = venta.miembroId;
        document.getElementById('comprador').value = venta.clienteId;
        document.getElementById('cantidad').value = venta.cantidad;
        document.getElementById('precio').value = venta.precioUnitario;
        document.getElementById('fecha').value = venta.fecha;
        document.getElementById('notas').value = venta.notas || '';

        // Guardar el ID para saber que estamos editando
        document.getElementById('form-venta').dataset.editId = id;

        // Scroll al formulario
        document.querySelector('#ventas .card').scrollIntoView({ behavior: 'smooth' });
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
                   (v.clienteNombre && v.clienteNombre.toLowerCase().includes(termino)) ||
                   (v.notas && v.notas.toLowerCase().includes(termino));
        });

        this.renderizarListaVentas(ventasFiltradas, document.getElementById('lista-ventas'));
    }

    renderizarVentas() {
        this.renderizarListaVentas(this.ventas.slice(0, 100), document.getElementById('lista-ventas'));
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
                        👤 Vendedor: ${v.miembroNombre}
                    </div>
                    ${v.clienteNombre ? `<div class="item-details">
                        🛒 Comprador: ${v.clienteNombre}
                    </div>` : ''}
                    <div class="item-meta">
                        <span class="badge">Cantidad: ${this.formatearNumero(v.cantidad, 0)}</span>
                        <span class="badge">Precio: $${this.formatearNumero(v.precioUnitario)}</span>
                        <span class="badge">Total: $${this.formatearNumero(v.total)}</span>
                        <span class="badge">Fecha: ${this.formatearFecha(v.fecha)}</span>
                    </div>
                    ${v.notas ? `<div class="item-details" style="margin-top: 0.5rem;">📝 ${v.notas}</div>` : ''}
                </div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="app.editarVenta('${v.id}')">Editar</button>
                    <button class="btn-delete" onclick="app.eliminarVenta('${v.id}')">Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    // ========== ESTADÍSTICAS ==========

    renderizarEstadisticas() {
        // Resumen general
        const totalVentas = this.ventas.reduce((sum, v) => sum + v.total, 0);
        document.getElementById('total-ventas').textContent = `$${this.formatearNumero(totalVentas)}`;
        document.getElementById('num-ventas').textContent = this.formatearNumero(this.ventas.length, 0);
        document.getElementById('total-productos').textContent = this.formatearNumero(this.productos.length, 0);
        document.getElementById('total-miembros').textContent = this.formatearNumero(this.miembros.length, 0);

        // Actualizar total de clientes si existe el elemento
        const totalClientesElement = document.getElementById('total-clientes');
        if (totalClientesElement) {
            totalClientesElement.textContent = this.formatearNumero(this.clientes.length, 0);
        }

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
                    productos: {}
                };
            }
            ventasPorVendedor[v.miembroId].total += v.total;

            // Agrupar por producto
            if (!ventasPorVendedor[v.miembroId].productos[v.productoNombre]) {
                ventasPorVendedor[v.miembroId].productos[v.productoNombre] = 0;
            }
            ventasPorVendedor[v.miembroId].productos[v.productoNombre] += v.cantidad;
        });

        const topVendedores = Object.values(ventasPorVendedor)
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);

        const contenedor = document.getElementById('top-vendedores');

        if (topVendedores.length === 0) {
            contenedor.innerHTML = '<p class="empty-message">No hay datos disponibles</p>';
            return;
        }

        contenedor.innerHTML = topVendedores.map((v, index) => {
            const productosDetalles = Object.entries(v.productos)
                .map(([producto, cantidad]) => `${this.formatearNumero(cantidad, 0)} ${producto}`)
                .join(', ');

            return `
                <div class="top-item">
                    <div>
                        <div class="top-item-name">${index + 1}. ${v.nombre}</div>
                        <div style="font-size: 0.85rem; color: #666; margin-top: 0.25rem;">${productosDetalles}</div>
                    </div>
                    <div class="top-item-value">$${this.formatearNumero(v.total)}</div>
                </div>
            `;
        }).join('');
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
                    <div style="font-size: 0.85rem; color: #666;">${this.formatearNumero(p.cantidad, 0)} unidad${p.cantidad !== 1 ? 'es' : ''} vendidas</div>
                </div>
                <div class="top-item-value">$${this.formatearNumero(p.total)}</div>
            </div>
        `).join('');
    }

    // ========== UTILIDADES ==========

    actualizarSelectores() {
        // Actualizar selector de productos
        const selectProducto = document.getElementById('producto');
        const valorActual = selectProducto.value;
        selectProducto.innerHTML = '<option value="">Selecciona un producto</option>' +
            this.productos.map(p => `<option value="${p.id}">${p.nombre} - $${this.formatearNumero(p.precio)}</option>`).join('');
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

        // Actualizar selector de compradores
        const selectComprador = document.getElementById('comprador');
        if (selectComprador) {
            const valorActualComprador = selectComprador.value;
            selectComprador.innerHTML = '<option value="">Selecciona un comprador</option>' +
                '<option value="nuevo_cliente">+ Nuevo cliente</option>' +
                this.clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
            selectComprador.value = valorActualComprador;

            // Manejar selección de "Nuevo cliente"
            selectComprador.onchange = (e) => {
                if (e.target.value === 'nuevo_cliente') {
                    // Cambiar a la pestaña de clientes
                    document.querySelector('.tab-btn[data-tab="clientes"]').click();
                    // Resetear el selector
                    setTimeout(() => {
                        selectComprador.value = '';
                    }, 100);
                }
            };
        }
    }

    formatearFecha(fecha) {
        const opciones = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', opciones);
    }

    formatearNumero(numero, decimales = 2) {
        // Formatear número con separadores de miles (comas) y decimales
        return numero.toLocaleString('en-US', {
            minimumFractionDigits: decimales,
            maximumFractionDigits: decimales
        });
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
