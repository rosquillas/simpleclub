// Script para inicializar la base de datos con datos de ejemplo
const bcrypt = require('bcrypt');
const db = require('../database');

async function inicializarBaseDatos() {
    console.log('Iniciando configuración de base de datos...\n');

    try {
        // Crear usuario administrador por defecto
        console.log('1. Creando usuario administrador...');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        try {
            await db.crearUsuario({
                username: 'admin',
                password: hashedPassword,
                nombre: 'Administrador',
                rol: 'admin'
            });
            console.log('   ✓ Usuario administrador creado');
            console.log('   Username: admin');
            console.log('   Password: admin123');
            console.log('   ⚠️  IMPORTANTE: Cambia esta contraseña después del primer inicio de sesión\n');
        } catch (error) {
            if (error.message.includes('UNIQUE')) {
                console.log('   ℹ️  El usuario administrador ya existe\n');
            } else {
                throw error;
            }
        }

        // Crear algunos productos de ejemplo (opcional)
        console.log('2. ¿Deseas agregar datos de ejemplo? (productos y miembros)');
        console.log('   Puedes agregarlos más tarde desde la interfaz web');
        console.log('   Para este ejemplo, se omitirán los datos de muestra\n');

        // Opcional: Descomentar para agregar datos de ejemplo
        /*
        console.log('2. Agregando productos de ejemplo...');
        const productos = [
            { nombre: 'Camiseta del Club', precio: 15.00, descripcion: 'Camiseta oficial con logo' },
            { nombre: 'Gorra', precio: 8.00, descripcion: 'Gorra bordada' },
            { nombre: 'Boleto Rifa', precio: 5.00, descripcion: 'Boleto para rifa mensual' }
        ];

        for (const producto of productos) {
            await db.crearProducto(producto);
            console.log(`   ✓ Producto creado: ${producto.nombre}`);
        }

        console.log('\n3. Agregando miembros de ejemplo...');
        const miembros = [
            { nombre: 'Juan Pérez', telefono: '555-0101' },
            { nombre: 'María García', telefono: '555-0102' },
            { nombre: 'Carlos López', telefono: '555-0103' }
        ];

        for (const miembro of miembros) {
            await db.crearMiembro(miembro);
            console.log(`   ✓ Miembro agregado: ${miembro.nombre}`);
        }
        */

        console.log('╔════════════════════════════════════════╗');
        console.log('║  Base de datos inicializada            ║');
        console.log('╠════════════════════════════════════════╣');
        console.log('║  Siguiente paso:                       ║');
        console.log('║  1. Ejecuta: npm start                 ║');
        console.log('║  2. Abre: http://localhost:3000        ║');
        console.log('║  3. Agrega productos y miembros        ║');
        console.log('║  4. Empieza a registrar ventas         ║');
        console.log('╚════════════════════════════════════════╝');

        process.exit(0);
    } catch (error) {
        console.error('Error al inicializar base de datos:', error);
        process.exit(1);
    }
}

// Ejecutar
inicializarBaseDatos();
