# Exportar reporte de ventas a CSV

**Fecha:** 2026-07-15

## Objetivo

Permitir descargar un reporte de todas las ventas en formato CSV (abrible en
Excel / Google Sheets) que incluya, entre otras columnas, el **nombre del
vendedor** y el **nombre del comprador**.

## Contexto

Cada documento de la colección `ventas` en Firestore ya guarda los nombres
denormalizados: `miembroNombre` (vendedor) y `clienteNombre` (comprador). No se
requiere cambiar el modelo de datos.

El listener en tiempo real (`escucharVentas`) usa `limit(100)`, por lo que la
exportación NO puede reutilizar `this.ventas`: debe hacer una consulta aparte
sin límite para incluir todo el histórico.

## Alcance

- Exportar **todas** las ventas históricas (consulta dedicada, sin `limit`).
- Formato CSV con BOM UTF-8 para acentos correctos en Excel.

## Diseño

### Columnas del CSV

`Fecha` · `Producto` · `Vendedor` · `Comprador` · `Cantidad` · `Precio Unitario` · `Total` · `Notas`

### Cambios

1. **index.html** — botón "📥 Exportar a CSV" en la card "Historial de Ventas"
   de la pestaña Ventas.
2. **app-firebase.js**:
   - Método `exportarVentasCSV()`:
     - `db.collection('ventas').orderBy('fecha', 'desc').get()` (sin `limit`).
     - Construye filas escapando comillas dobles, comas y saltos de línea
       (regla CSV RFC 4180: envolver en comillas y duplicar comillas internas).
     - Antepone BOM `﻿`.
     - Descarga vía `Blob` + `<a download>` temporal, nombre
       `ventas-AAAA-MM-DD.csv` (fecha de hoy).
     - Deshabilita el botón mientras exporta; notifica éxito/error con
       `mostrarNotificacion`; si no hay ventas, avisa y no descarga.
   - Registrar el listener del botón en `init()` (o `configurarFormularios`).
3. **styles.css** — reutiliza `.btn`; se puede añadir una variante secundaria
   para el botón de exportar. Opcional.

### Manejo de errores

- Error de consulta a Firebase → notificación de error, botón re-habilitado.
- Cero ventas → notificación informativa, sin descarga.

### Formato de valores

- Fecha: se exporta el valor `fecha` crudo (`AAAA-MM-DD`) para orden/filtrado
  fiable en Excel.
- Números (`cantidad`, `precioUnitario`, `total`): valores numéricos crudos sin
  separadores de miles, para que Excel los interprete como números.
