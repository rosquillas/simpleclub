# 💰 SimpleClub - Sistema de Control de Ventas

Sistema web simple y eficiente para llevar el control de ventas de tu club. Funciona en línea y en dispositivos móviles.

## 🌟 Características

- ✅ **Responsive**: Funciona perfectamente en celular, tablet y computadora
- ✅ **Offline**: Se puede instalar como app y funciona sin conexión
- ✅ **Fácil de usar**: Interfaz intuitiva y amigable
- ✅ **Control completo**: Gestiona ventas, productos y miembros
- ✅ **Estadísticas**: Visualiza el desempeño de ventas en tiempo real
- ✅ **Exportar/Importar**: Respalda tus datos fácilmente

## 🚀 Inicio Rápido

### Opción 1: Usar en línea

1. Sube los archivos a un servicio de hosting web (GitHub Pages, Netlify, Vercel, etc.)
2. Abre la URL en tu navegador
3. ¡Empieza a usar la aplicación!

### Opción 2: Usar localmente

1. Descarga todos los archivos del repositorio
2. Abre `index.html` en tu navegador web
3. ¡Listo para usar!

### Instalar en el celular (PWA)

1. Abre la aplicación en tu navegador móvil (Chrome, Safari, etc.)
2. En el menú del navegador, busca "Agregar a pantalla de inicio" o "Instalar app"
3. La app se instalará como una aplicación nativa
4. Ahora puedes usarla offline desde tu pantalla de inicio

## 📱 Guía de Uso

### 1. Primeros Pasos

Antes de registrar ventas, necesitas:

1. **Agregar Productos**: Ve a la pestaña "Productos" y agrega los productos que vende tu club
   - Nombre del producto
   - Precio sugerido
   - Descripción (opcional)

2. **Agregar Miembros**: Ve a la pestaña "Miembros" y agrega a los miembros vendedores
   - Nombre del miembro
   - Teléfono (opcional)

### 2. Registrar Ventas

1. Ve a la pestaña "Ventas"
2. Completa el formulario:
   - Selecciona el producto (se llenará automáticamente el precio)
   - Selecciona el vendedor
   - Indica la cantidad vendida
   - Ajusta el precio si es necesario
   - Selecciona la fecha
   - Agrega notas si lo deseas
3. Haz clic en "Registrar Venta"
4. La venta aparecerá en el historial inmediatamente

### 3. Ver Estadísticas

En la pestaña "Estadísticas" puedes ver:

- **Resumen General**:
  - Total vendido en dinero
  - Número total de ventas
  - Cantidad de productos
  - Cantidad de miembros

- **Top Vendedores**: Ranking de los mejores vendedores
- **Productos Más Vendidos**: Los productos que más se venden

### 4. Buscar Ventas

En la pestaña "Ventas", usa la barra de búsqueda para filtrar por:
- Nombre del producto
- Nombre del vendedor
- Notas de la venta

### 5. Gestión de Datos

En la pestaña "Estadísticas", en la sección "Gestión de Datos" puedes:

- **Exportar Datos**: Descarga un archivo JSON con todos tus datos (respaldo)
- **Importar Datos**: Restaura datos desde un archivo JSON
- **Limpiar Datos**: Elimina todos los datos (¡usa con precaución!)

## 💾 Almacenamiento de Datos

- Los datos se guardan automáticamente en el navegador (LocalStorage)
- No necesitas conexión a internet para que funcione
- Los datos persisten incluso si cierras la pestaña
- **IMPORTANTE**: Si borras los datos del navegador, perderás la información. Exporta respaldos regularmente

## 🔒 Privacidad y Seguridad

- ✅ Todos los datos se almacenan localmente en tu dispositivo
- ✅ No se envía información a ningún servidor externo
- ✅ No se recopilan datos personales
- ✅ Funciona completamente offline

## 📦 Estructura del Proyecto

```
simpleclub/
├── index.html      # Estructura HTML de la aplicación
├── styles.css      # Estilos y diseño responsive
├── app.js          # Lógica de la aplicación
├── manifest.json   # Configuración PWA
├── sw.js           # Service Worker para funcionalidad offline
└── README.md       # Este archivo
```

## 🛠️ Tecnologías Utilizadas

- HTML5
- CSS3 (con diseño responsive)
- JavaScript (Vanilla JS, sin frameworks)
- LocalStorage API
- Service Workers (PWA)

## 📊 Casos de Uso

Perfecto para:
- Clubes deportivos que venden uniformes, rifas o productos
- Grupos escolares con ventas para eventos
- Pequeños grupos que organizan ventas para recaudar fondos
- Cualquier organización pequeña que necesite control de ventas simple

## 🎯 Ventajas

1. **Sin costos**: No necesitas pagar por servicios de hosting o bases de datos
2. **Sin configuración**: Funciona inmediatamente sin configuración técnica
3. **Multiplataforma**: Funciona en cualquier dispositivo con navegador
4. **Sin dependencias**: No requiere instalación de software adicional
5. **Portable**: Puedes mover los archivos a cualquier lugar

## ⚠️ Consideraciones

- Los datos se almacenan solo en el navegador donde los creas
- Si usas diferentes dispositivos, cada uno tendrá sus propios datos
- Usa la función de exportar/importar para sincronizar entre dispositivos
- Haz respaldos regulares exportando los datos

## 🆘 Solución de Problemas

### Los datos desaparecieron
- Verifica que no hayas borrado los datos del navegador
- Restaura desde un respaldo exportado si lo tienes

### No puedo agregar más datos
- El LocalStorage tiene un límite (generalmente 5-10MB)
- Exporta y limpia datos antiguos
- Considera mantener solo los datos del período actual

### La app no se instala en el celular
- Asegúrate de estar usando HTTPS (si estás en línea)
- Usa un navegador compatible (Chrome, Safari, Edge)
- Para uso local, copia los archivos y ábrelos directamente

## 🤝 Contribuciones

Este es un proyecto de código abierto. Siéntete libre de:
- Reportar bugs
- Sugerir mejoras
- Contribuir con código

## 📄 Licencia

Este proyecto es de uso libre para fines educativos y personales.

## 📞 Soporte

Si tienes dudas o necesitas ayuda:
1. Revisa esta documentación
2. Verifica que todos los archivos estén presentes
3. Asegúrate de estar usando un navegador moderno

---

Hecho con ❤️ para SimpleClub
