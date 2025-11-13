# 💰 SimpleClub - Sistema de Control de Ventas con Base de Datos

Sistema web profesional para llevar el control de ventas de tu club con base de datos real, API REST y acceso multiusuario.

## 🌟 Características

### Nueva Versión 2.0 con Base de Datos

- ✅ **Base de Datos Real**: SQLite para almacenamiento persistente y centralizado
- ✅ **API REST**: Backend profesional con Express.js
- ✅ **Multiusuario**: Varios usuarios pueden acceder simultáneamente
- ✅ **Sincronización**: Los datos se comparten entre todos los dispositivos
- ✅ **Responsive**: Funciona perfectamente en celular, tablet y computadora
- ✅ **Control completo**: Gestiona ventas, productos y miembros
- ✅ **Estadísticas avanzadas**: Visualiza el desempeño en tiempo real
- ✅ **Seguro**: Autenticación con JWT (opcional)

## 🚀 Instalación y Configuración

### Requisitos Previos

- Node.js versión 14 o superior ([Descargar aquí](https://nodejs.org/))
- npm (viene incluido con Node.js)

### Instalación Paso a Paso

#### 1. Clonar o descargar el repositorio

```bash
git clone https://github.com/rosquillas/simpleclub.git
cd simpleclub
```

#### 2. Instalar dependencias

```bash
npm install
```

Este comando instalará todas las dependencias necesarias:
- Express (servidor web)
- SQLite3 (base de datos)
- bcrypt (encriptación de contraseñas)
- JWT (autenticación)
- CORS (acceso desde diferentes dominios)

#### 3. Configurar variables de entorno (opcional)

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

Edita `.env` si deseas cambiar el puerto o la clave secreta:

```env
PORT=3000
JWT_SECRET=tu-clave-secreta-aqui
NODE_ENV=development
```

#### 4. Inicializar la base de datos

```bash
npm run init-db
```

Este comando:
- Crea la base de datos SQLite
- Crea las tablas necesarias
- Crea un usuario administrador por defecto
  - **Usuario**: admin
  - **Contraseña**: admin123
  - ⚠️ **IMPORTANTE**: Cambia esta contraseña en producción

#### 5. Iniciar el servidor

```bash
npm start
```

Para desarrollo con auto-recarga:

```bash
npm run dev
```

#### 6. Acceder a la aplicación

Abre tu navegador en: **http://localhost:3000**

## 📱 Guía de Uso

### Primeros Pasos

1. **Agregar Productos**
   - Ve a la pestaña "Productos"
   - Haz clic en el formulario
   - Ingresa: nombre, precio sugerido y descripción (opcional)
   - Haz clic en "Agregar Producto"

2. **Agregar Miembros/Vendedores**
   - Ve a la pestaña "Miembros"
   - Ingresa: nombre y teléfono (opcional)
   - Haz clic en "Agregar Miembro"

3. **Registrar Ventas**
   - Ve a la pestaña "Ventas"
   - Completa el formulario:
     - Selecciona el producto (el precio se llena automáticamente)
     - Selecciona el vendedor
     - Indica la cantidad vendida
     - Ajusta el precio si es necesario
     - Selecciona la fecha
     - Agrega notas opcionales
   - Haz clic en "Registrar Venta"

4. **Ver Estadísticas**
   - Ve a la pestaña "Estadísticas"
   - Visualiza:
     - Total vendido
     - Número de ventas
     - Top vendedores
     - Productos más vendidos

### Funcionalidades Avanzadas

#### Búsqueda de Ventas

En la pestaña "Ventas", usa la barra de búsqueda para filtrar por:
- Nombre del producto
- Nombre del vendedor
- Notas de la venta

La búsqueda se actualiza automáticamente mientras escribes.

#### Eliminar Registros

Cada item tiene un botón "Eliminar":
- **Ventas**: Se pueden eliminar sin restricciones
- **Productos**: Solo si no tienen ventas asociadas
- **Miembros**: Solo si no tienen ventas asociadas

## 🗄️ Estructura de la Base de Datos

### Tablas

#### `productos`
- id (clave primaria)
- nombre
- precio
- descripcion
- activo (soft delete)
- created_at, updated_at

#### `miembros`
- id (clave primaria)
- nombre
- telefono
- email
- activo (soft delete)
- created_at, updated_at

#### `ventas`
- id (clave primaria)
- producto_id (relación)
- miembro_id (relación)
- cantidad
- precio_unitario
- total (calculado)
- fecha
- notas
- created_at
- created_by (usuario que creó)

#### `usuarios`
- id (clave primaria)
- username (único)
- password (encriptado)
- nombre
- rol (admin, vendedor)
- activo
- created_at

## 🔌 API REST

El sistema expone una API REST completa en `/api`:

### Endpoints de Productos

```
GET    /api/productos          - Listar todos los productos
GET    /api/productos/:id      - Obtener un producto
POST   /api/productos          - Crear producto
PUT    /api/productos/:id      - Actualizar producto
DELETE /api/productos/:id      - Eliminar producto
```

### Endpoints de Miembros

```
GET    /api/miembros           - Listar todos los miembros
GET    /api/miembros/:id       - Obtener un miembro
POST   /api/miembros           - Crear miembro
PUT    /api/miembros/:id       - Actualizar miembro
DELETE /api/miembros/:id       - Eliminar miembro
```

### Endpoints de Ventas

```
GET    /api/ventas                    - Listar todas las ventas
GET    /api/ventas/buscar/:termino    - Buscar ventas
GET    /api/ventas/:id                - Obtener una venta
POST   /api/ventas                    - Crear venta
DELETE /api/ventas/:id                - Eliminar venta
```

### Endpoints de Estadísticas

```
GET    /api/estadisticas              - Estadísticas generales
GET    /api/estadisticas/vendedores   - Top vendedores
GET    /api/estadisticas/productos    - Top productos
```

### Autenticación (Opcional)

```
POST   /api/auth/register    - Registrar usuario
POST   /api/auth/login       - Iniciar sesión
GET    /api/auth/verify      - Verificar token
```

## 🌐 Despliegue en Producción

### Opción 1: Servidor VPS (Recomendado para acceso externo)

1. **Preparar el servidor**
   ```bash
   # Actualizar sistema
   sudo apt update && sudo apt upgrade -y

   # Instalar Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Copiar archivos**
   ```bash
   scp -r simpleclub usuario@tu-servidor:/home/usuario/
   ```

3. **Configurar en el servidor**
   ```bash
   cd /home/usuario/simpleclub
   npm install --production
   npm run init-db
   ```

4. **Usar PM2 para mantener el servidor activo**
   ```bash
   npm install -g pm2
   pm2 start server.js --name simpleclub
   pm2 startup
   pm2 save
   ```

5. **Configurar Nginx (opcional, para HTTPS)**
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Opción 2: Heroku

1. Crear `Procfile`:
   ```
   web: node server.js
   ```

2. Desplegar:
   ```bash
   heroku create simpleclub-ventas
   git push heroku main
   heroku run npm run init-db
   ```

### Opción 3: Railway / Render

Estos servicios detectan automáticamente aplicaciones Node.js.
Solo necesitas conectar tu repositorio de GitHub.

### Opción 4: Red Local (sin internet)

Si solo necesitas acceso dentro de tu red local:

1. Inicia el servidor normalmente: `npm start`
2. Encuentra la IP de tu computadora:
   - Windows: `ipconfig`
   - Linux/Mac: `ifconfig` o `ip addr`
3. Accede desde otros dispositivos en la misma red:
   - Ejemplo: `http://192.168.1.100:3000`

## 💾 Respaldo y Restauración

### Respaldo Manual

La base de datos está en el archivo `simpleclub.db`. Para respaldo:

```bash
# Copiar base de datos
cp simpleclub.db simpleclub_backup_$(date +%Y%m%d).db
```

### Respaldo Automático (Linux/Mac)

Crea un cron job:

```bash
crontab -e
```

Agrega:

```
0 2 * * * cp /ruta/a/simpleclub.db /ruta/backups/simpleclub_$(date +\%Y\%m\%d).db
```

### Restauración

```bash
# Detener servidor
pm2 stop simpleclub  # o Ctrl+C si está corriendo

# Restaurar base de datos
cp simpleclub_backup_20241113.db simpleclub.db

# Reiniciar servidor
pm2 start simpleclub  # o npm start
```

## 🔒 Seguridad

### Mejores Prácticas

1. **Cambiar contraseñas por defecto**
   - Nunca uses admin/admin123 en producción

2. **Usar HTTPS**
   - Configura SSL/TLS con Let's Encrypt
   - Usa nginx o Caddy como proxy reverso

3. **Cambiar JWT_SECRET**
   - Usa una clave larga y aleatoria
   - Guárdala en `.env` y no la versiones

4. **Firewall**
   - Solo abre el puerto necesario (3000 o 80/443)

5. **Respaldos regulares**
   - Configura respaldos automáticos diarios

## 🛠️ Desarrollo

### Estructura del Proyecto

```
simpleclub/
├── server.js          # Servidor Express y API
├── database.js        # Módulo de base de datos
├── app-db.js          # Frontend con conexión a API
├── app.js             # Frontend sin base de datos (legacy)
├── index.html         # Interfaz web
├── styles.css         # Estilos responsive
├── manifest.json      # Configuración PWA
├── sw.js              # Service Worker
├── package.json       # Dependencias
├── .env.example       # Variables de entorno (ejemplo)
├── .gitignore         # Archivos ignorados por Git
├── scripts/
│   └── init-db.js     # Script de inicialización
└── README.md          # Esta documentación
```

### Comandos Disponibles

```bash
npm start              # Iniciar servidor (producción)
npm run dev            # Iniciar con nodemon (desarrollo)
npm run init-db        # Inicializar base de datos
```

### Agregar Nuevas Funcionalidades

1. **Agregar endpoint a la API**: Edita `server.js`
2. **Agregar función de BD**: Edita `database.js`
3. **Actualizar frontend**: Edita `app-db.js`

## 📊 Casos de Uso

Perfecto para:
- Clubes deportivos que venden uniformes, rifas o productos
- Grupos escolares con ventas para eventos
- Pequeños grupos que organizan ventas para recaudar fondos
- ONGs que necesitan control de ventas
- Grupos comunitarios
- Equipos deportivos
- Cualquier organización de 5-50 personas

## ⚠️ Solución de Problemas

### El servidor no inicia

**Error**: `Error: listen EADDRINUSE`
- **Solución**: El puerto 3000 está en uso. Cambia PORT en `.env` o mata el proceso:
  ```bash
  # Linux/Mac
  lsof -ti:3000 | xargs kill -9

  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```

### Error al instalar dependencias

**Error**: `node-gyp` o problemas con bcrypt/sqlite3
- **Solución**: Instala herramientas de compilación:
  ```bash
  # Linux
  sudo apt-get install build-essential

  # Mac
  xcode-select --install

  # Windows
  npm install --global windows-build-tools
  ```

### No puedo acceder desde otro dispositivo

- Verifica que estén en la misma red
- Usa la IP de tu computadora, no `localhost`
- Verifica que el firewall no esté bloqueando el puerto
- En Windows: Configura regla de firewall para el puerto 3000

### La base de datos se corrompió

```bash
# Restaurar desde respaldo
cp simpleclub_backup.db simpleclub.db

# Si no hay respaldo, reinicializar
rm simpleclub.db
npm run init-db
```

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
1. Revisa esta documentación
2. Verifica los logs del servidor
3. Abre un issue en GitHub
4. Revisa la consola del navegador (F12)

## 🎯 Roadmap (Futuras Mejoras)

- [ ] Panel de administración avanzado
- [ ] Reportes en PDF
- [ ] Gráficas de ventas por período
- [ ] Notificaciones push
- [ ] Integración con WhatsApp para enviar resúmenes
- [ ] Sistema de metas de ventas
- [ ] Multi-tenancy (múltiples clubes en una instancia)
- [ ] App móvil nativa (React Native)

---

## 📈 Comparación de Versiones

| Característica | v1.0 (LocalStorage) | v2.0 (Base de Datos) |
|----------------|---------------------|----------------------|
| Almacenamiento | Navegador | Servidor centralizado |
| Multiusuario | ❌ No | ✅ Sí |
| Sincronización | ❌ No | ✅ Sí |
| API REST | ❌ No | ✅ Sí |
| Escalabilidad | Baja | Alta |
| Respaldos | Manual | Automático |
| Acceso remoto | ❌ No | ✅ Sí |

---

Hecho con ❤️ para SimpleClub

**Versión 2.0** - Sistema con Base de Datos
