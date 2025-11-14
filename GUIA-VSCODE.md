# Guía Rápida - Probar Localmente con VSCode

## Paso 1: Instalar Live Server

1. Abre VSCode
2. Ve a la pestaña de Extensiones (Ctrl+Shift+X)
3. Busca "Live Server"
4. Instala "Live Server" por Ritwick Dey (tiene un icono de rayo)
5. Recarga VSCode si es necesario

## Paso 2: Crear tu Configuración de Firebase

Mientras tanto, configura Firebase:

### A. Crear Proyecto en Firebase
1. Ve a: https://console.firebase.google.com
2. Clic en "Agregar proyecto"
3. Nombre: simpleclub (o el que quieras)
4. Desactiva Analytics
5. Crear proyecto

### B. Habilitar Firestore
1. En el menú lateral: Firestore Database
2. Crear base de datos
3. Modo de prueba
4. Ubicación: us-central1 (o la más cercana)
5. Habilitar

### C. Habilitar Autenticación
1. En el menú lateral: Authentication
2. Comenzar
3. Pestaña "Sign-in method"
4. Habilitar "Anónimo"
5. Guardar

### D. Obtener Configuración
1. Ícono de engranaje > Configuración del proyecto
2. Desplázate hasta "Tus aplicaciones"
3. Clic en el ícono </> (Web)
4. Nombre: SimpleClub Web
5. Copiar el objeto firebaseConfig

## Paso 3: Crear firebase-config.js

Crea un archivo llamado `firebase-config.js` con tu configuración:

```javascript
const firebaseConfig = {
    apiKey: "TU-API-KEY-AQUI",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:xxxxx"
};

export default firebaseConfig;
```

## Paso 4: Configurar Reglas de Firestore

1. Firebase Console > Firestore Database > Reglas
2. Pega el contenido de `firestore.rules`
3. Publicar

## Paso 5: Iniciar Live Server

1. Abre index.html en VSCode
2. Clic derecho en el archivo
3. Selecciona "Open with Live Server"
4. Se abrirá en tu navegador (http://127.0.0.1:5500)

## Alternativa: Atajo de Teclado

- Windows/Linux: Alt+L Alt+O
- Mac: Cmd+L Cmd+O

## Solución de Problemas

### Puerto en uso
Si el puerto 5500 está ocupado:
1. Ctrl+Shift+P
2. Escribe "Live Server: Change Live Server Port"
3. Elige otro puerto

### No carga Firebase
- Verifica que firebase-config.js exista
- Abre la consola del navegador (F12)
- Revisa errores

### CORS Error
- Live Server maneja CORS automáticamente
- Si ves errores, verifica que uses Live Server, no file://

## ¡Listo!

Tu aplicación debería estar corriendo en:
http://127.0.0.1:5500/index.html

Prueba agregar productos, miembros y ventas.
