# 💰 SimpleClub - Sistema de Control de Ventas con Firebase

Sistema web profesional para llevar el control de ventas de tu club con base de datos en la nube Firebase. **No necesitas instalar nada** - funciona directo en tu navegador.

## 🌟 Características

### Versión 3.0 con Firebase

- ✅ **Sin instalación**: No necesitas Node.js ni ningún software
- ✅ **Base de Datos en la Nube**: Firebase Firestore gratuito
- ✅ **Sincronización en Tiempo Real**: Los cambios se ven instantáneamente en todos los dispositivos
- ✅ **Multiusuario**: Todos los miembros del club acceden simultáneamente
- ✅ **Acceso desde Cualquier Lugar**: Solo necesitas internet
- ✅ **Responsive**: Funciona en celular, tablet y computadora
- ✅ **Gratis**: Firebase tiene un plan generoso gratuito
- ✅ **Seguro**: Reglas de seguridad de Firestore

## 🚀 Configuración (Solo 10 minutos)

### Paso 1: Crear Proyecto en Firebase

1. **Ve a Firebase Console**
   - Abre: https://console.firebase.google.com
   - Inicia sesión con tu cuenta de Google

2. **Crear Nuevo Proyecto**
   - Haz clic en "Agregar proyecto"
   - Nombre del proyecto: `simpleclub` (o el que prefieras)
   - Desactiva Google Analytics (no es necesario para este proyecto)
   - Haz clic en "Crear proyecto"

3. **Espera** a que Firebase termine de configurar (1-2 minutos)

### Paso 2: Configurar Firestore Database

1. **En Firebase Console, ve a "Firestore Database"** (menú lateral izquierdo)

2. **Haz clic en "Crear base de datos"**

3. **Selecciona el modo**:
   - Elige "Comenzar en modo de prueba" (cambiaremos las reglas después)
   - Selecciona una ubicación cercana (ej: `us-central1` para América)
   - Haz clic en "Habilitar"

4. **Configurar Reglas de Seguridad**:
   - Ve a la pestaña "Reglas"
   - Copia y pega el contenido del archivo `firestore.rules` de este proyecto
   - Haz clic en "Publicar"

### Paso 3: Habilitar Autenticación Anónima

1. **En Firebase Console, ve a "Authentication"** (menú lateral)

2. **Haz clic en "Comenzar"**

3. **Ve a la pestaña "Sign-in method"**

4. **Habilitar Autenticación Anónima**:
   - Haz clic en "Anónimo"
   - Activa el interruptor
   - Guarda

### Paso 4: Obtener Configuración de Firebase

1. **En Firebase Console, ve a "Configuración del proyecto"** (ícono de engranaje)

2. **Desplázate hacia abajo hasta "Tus aplicaciones"**

3. **Haz clic en el ícono `</>`** (Web)

4. **Registrar app**:
   - Nombre de la app: `SimpleClub Web`
   - NO marques "Firebase Hosting"
   - Haz clic en "Registrar app"

5. **Copiar la configuración**:
   Verás algo como:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX",
     authDomain: "simpleclub-xxxxx.firebaseapp.com",
     projectId: "simpleclub-xxxxx",
     storageBucket: "simpleclub-xxxxx.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:xxxxxxxxxxxxx"
   };
   ```

### Paso 5: Configurar tu Aplicación

1. **Copia `firebase-config.example.js` a `firebase-config.js`**:
   ```bash
   cp firebase-config.example.js firebase-config.js
   ```

2. **Abre `firebase-config.js` y pega tu configuración**:
   ```javascript
   const firebaseConfig = {
       apiKey: "TU_API_KEY_AQUI",  // ← Pega tus valores aquí
       authDomain: "tu-proyecto.firebaseapp.com",
       projectId: "tu-proyecto-id",
       storageBucket: "tu-proyecto.appspot.com",
       messagingSenderId: "123456789012",
       appId: "1:123456789012:web:abcdef123456"
   };

   export default firebaseConfig;
   ```

3. **Guarda el archivo**

### Paso 6: Desplegar tu Aplicación

#### Opción A: GitHub Pages (Gratis y Fácil) ⭐

1. **Sube tu código a GitHub**:
   ```bash
   git add .
   git commit -m "Configurar Firebase"
   git push
   ```

2. **Activa GitHub Pages**:
   - Ve a tu repositorio en GitHub
   - Settings > Pages
   - Source: selecciona tu branch principal
   - Guarda

3. **Accede a tu app**:
   - URL: `https://tu-usuario.github.io/simpleclub`
   - En 2-3 minutos estará disponible

#### Opción B: Netlify (Muy Fácil)

1. **Ve a** https://netlify.com

2. **Arrastra tu carpeta** del proyecto a Netlify

3. **Listo** - Te dará una URL automáticamente

#### Opción C: Vercel

1. **Ve a** https://vercel.com

2. **Importa tu repositorio** de GitHub

3. **Deploy** automático

### Paso 7: ¡Usar la Aplicación!

1. **Abre la URL** de tu aplicación

2. **Agregar productos y miembros** primero

3. **Empezar a registrar ventas**

4. **Compartir la URL** con los miembros de tu club

## 📱 Guía de Uso

### Primeros Pasos

1. **Agregar Productos**
   - Ve a la pestaña "Productos"
   - Ingresa: nombre, precio sugerido y descripción
   - Los productos aparecerán instantáneamente para todos los usuarios

2. **Agregar Miembros (Vendedores)**
   - Ve a la pestaña "Miembros"
   - Ingresa: nombre y teléfono (opcional)
   - Los miembros son quienes venden los productos

3. **Agregar Clientes (Compradores)**
   - Ve a la pestaña "Clientes"
   - Ingresa: nombre, teléfono y email (opcionales)
   - Los clientes son quienes compran los productos

4. **Registrar Ventas**
   - Ve a la pestaña "Ventas"
   - Selecciona producto, vendedor (miembro) y comprador (cliente)
   - El precio se llena automáticamente
   - Ajusta cantidad y fecha
   - ¡Listo! La venta se registra en la nube

5. **Ver Estadísticas**
   - Pestaña "Estadísticas"
   - Total vendido, top vendedores, productos más vendidos
   - Se actualiza en tiempo real

### Funcionalidades Avanzadas

#### Sincronización en Tiempo Real

- Cuando alguien registra una venta, **todos los dispositivos se actualizan automáticamente**
- No necesitas recargar la página
- Perfecto para eventos donde varios miembros venden simultáneamente

#### Búsqueda Rápida

- Barra de búsqueda en ventas
- Filtra por producto, vendedor, comprador o notas
- Resultados instantáneos

#### Eliminación Segura

- Productos, miembros y clientes solo se pueden eliminar si no tienen ventas asociadas
- Ventas se pueden eliminar sin restricciones
- Confirmación antes de eliminar

## 🏗️ Estructura de Firebase

### Colecciones en Firestore

#### `productos`
```javascript
{
  nombre: "Camiseta del Club",
  precio: 15.00,
  descripcion: "Camiseta oficial con logo",
  activo: true,
  createdAt: Timestamp
}
```

#### `miembros` (Vendedores)
```javascript
{
  nombre: "Juan Pérez",
  telefono: "555-0101",
  activo: true,
  createdAt: Timestamp
}
```

#### `clientes` (Compradores)
```javascript
{
  nombre: "María González",
  telefono: "555-0102",
  email: "maria@example.com",
  activo: true,
  createdAt: Timestamp
}
```

#### `ventas`
```javascript
{
  productoId: "abc123",
  productoNombre: "Camiseta del Club",
  miembroId: "def456",
  miembroNombre: "Juan Pérez",
  clienteId: "ghi789",
  clienteNombre: "María González",
  cantidad: 2,
  precioUnitario: 15.00,
  total: 30.00,
  fecha: "2024-11-13",
  notas: "Venta en efectivo",
  timestamp: Timestamp
}
```

## 🔒 Seguridad

### Reglas de Firestore

Las reglas en `firestore.rules` aseguran que:

- ✅ Solo usuarios autenticados pueden leer/escribir
- ✅ No se pueden crear productos con precios negativos
- ✅ Los totales de ventas se calculan correctamente
- ✅ Los datos requeridos siempre están presentes
- ✅ Soft delete (no se pierden datos permanentemente)

### Mejores Prácticas

1. **API Keys son públicas** (está bien, Firebase las protege con reglas)
2. **No compartas tu `firebase-config.js`** en repositorios públicos con límites de cuota personalizados
3. **Revisa el uso** mensualmente en Firebase Console
4. **Haz respaldos** exportando desde Firestore si tienes datos críticos

## 💰 Costos (Firebase Plan Gratuito)

Firebase ofrece un plan gratuito muy generoso:

| Recurso | Límite Gratuito | Suficiente para |
|---------|-----------------|-----------------|
| Documentos leídos | 50,000/día | ~1,600 ventas consultadas/día |
| Documentos escritos | 20,000/día | ~600 ventas nuevas/día |
| Documentos eliminados | 20,000/día | Muy amplio |
| Almacenamiento | 1 GB | Millones de ventas |
| Ancho de banda | 10 GB/mes | Muchos usuarios |

**Para un club de 20 personas**: El plan gratuito es más que suficiente incluso con uso intensivo.

## 📊 Casos de Uso Perfectos

- Clubes deportivos que venden uniformes, rifas o productos
- Grupos escolares con ventas para eventos
- Pequeños grupos que organizan ventas para recaudar fondos
- ONGs con múltiples puntos de venta
- Eventos con varios vendedores simultáneos
- Equipos que necesitan ver ventas en tiempo real
- Organizaciones de 5-100 personas

## ⚠️ Solución de Problemas

### "Firebase is not defined"

**Problema**: Los scripts no se cargan correctamente

**Solución**:
- Verifica que tengas internet
- Abre la consola del navegador (F12) y revisa errores
- Asegúrate de que el archivo se sirva vía HTTP/HTTPS, no `file://`

### "Permission denied"

**Problema**: Las reglas de Firestore no están configuradas

**Solución**:
1. Ve a Firebase Console > Firestore > Reglas
2. Copia el contenido de `firestore.rules`
3. Publica las reglas

### "Module not found: firebase-config.js"

**Problema**: No creaste el archivo de configuración

**Solución**:
1. Copia `firebase-config.example.js` a `firebase-config.js`
2. Pega tu configuración de Firebase
3. Asegúrate de que el archivo tenga `export default firebaseConfig;`

### No se sincronizan los datos

**Problema**: Problemas de conexión o configuración

**Solución**:
- Verifica tu conexión a internet
- Revisa que el `projectId` en `firebase-config.js` sea correcto
- Abre la consola de Firebase y verifica que haya datos

### Error al abrir localmente (file://)

**Problema**: Los módulos ES6 no funcionan con `file://`

**Solución**:
Usa un servidor local simple:

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# PHP
php -S localhost:8000
```

Luego abre: `http://localhost:8000`

## 🎯 Ventajas sobre Versiones Anteriores

| Característica | v1.0 LocalStorage | v2.0 Node.js+SQLite | v3.0 Firebase |
|----------------|-------------------|---------------------|---------------|
| Instalación | Abrir HTML | npm install | Solo configurar |
| Base de datos | Navegador | SQLite local | Cloud Firestore |
| Sincronización | ❌ No | ❌ No | ✅ Tiempo real |
| Multiusuario | ❌ No | ✅ Sí (mismo servidor) | ✅ Sí (desde cualquier lugar) |
| Mantenimiento | Ninguno | Servidor 24/7 | Firebase lo maneja |
| Costo | Gratis | Hosting ($5-10/mes) | Gratis hasta límites |
| Escalabilidad | Muy baja | Media | Alta |
| Respaldos | Manual | Copiar .db | Automático en Firebase |
| Acceso remoto | ❌ No | ✅ Sí (si despliegas) | ✅ Sí (siempre) |

## 📦 Archivos del Proyecto

```
simpleclub/
├── index.html                    # Interfaz web
├── styles.css                    # Estilos responsive
├── app-firebase.js               # Lógica con Firebase
├── firebase-config.example.js    # Template de configuración
├── firebase-config.js            # Tu configuración (no versionar)
├── firestore.rules               # Reglas de seguridad
├── manifest.json                 # PWA manifest
├── sw.js                         # Service worker
└── README.md                     # Esta documentación
```

### Archivos Legacy (versiones anteriores)

Puedes eliminarlos si solo usarás Firebase:
- `app.js` (v1.0 - LocalStorage)
- `app-db.js` (v2.0 - Node.js)
- `server.js` (v2.0 - Backend)
- `database.js` (v2.0 - SQLite)
- `package.json` (v2.0 - Node.js)

## 🤝 Contribuciones

Este es un proyecto de código abierto. Siéntete libre de:
- Reportar bugs en GitHub Issues
- Sugerir mejoras
- Hacer fork y contribuir con código
- Compartir con otros clubes

## 📄 Licencia

MIT License - Uso libre para fines personales y comerciales.

## 📞 Soporte

Si tienes dudas o necesitas ayuda:
1. Revisa esta documentación paso a paso
2. Verifica la consola del navegador (F12) para errores
3. Revisa Firebase Console para ver si los datos llegan
4. Abre un issue en GitHub con capturas de pantalla

## 🎯 Próximas Mejoras

- [ ] Exportar reportes a PDF
- [ ] Gráficas de ventas por período
- [ ] Sistema de metas de ventas
- [ ] Notificaciones push cuando hay nuevas ventas
- [ ] Multi-tenancy (varios clubes en una instancia)
- [ ] App móvil nativa
- [ ] Integración con WhatsApp
- [ ] Dashboard de administración avanzado

---

## 🚀 Inicio Rápido (Resumen)

1. **Crear proyecto en Firebase Console**
2. **Habilitar Firestore + Auth Anónima**
3. **Copiar configuración a `firebase-config.js`**
4. **Subir reglas de seguridad**
5. **Desplegar en GitHub Pages / Netlify / Vercel**
6. **¡Empezar a usarlo!**

---

Hecho con ❤️ para SimpleClub

**Versión 3.0** - Firebase Cloud Edition

*Última actualización: Noviembre 2024*
