# API TecnoRedes

## Requisitos

- Node.js 20.19 o superior (Mongoose 9).
- MongoDB Community Server activo localmente en `127.0.0.1:27017` o una URI de MongoDB Atlas.

## Primera ejecución en Windows

1. Abra PowerShell o la terminal integrada de Visual Studio Code en la carpeta del API.
2. Ejecute `Copy-Item .env.example .env` y revise `MONGO_URI`.
3. Ejecute `npm.cmd ci` para instalar dependencias.
4. En una terminal ejecute `npm.cmd run dev`.
5. En una segunda terminal ejecute `npm.cmd run seed` una sola vez. El seed es idempotente: puede repetirse sin duplicar los registros demo.
6. Abra `http://localhost:3000/api/health`; el campo `mongodb` debe indicar `conectado`.

## Cuentas demo

- Encargado: `docente@tecnoredes.local` o el nombre `Docente encargado`.
- Estudiante: `estudiante@tecnoredes.local`.

Son identidades de muestra sin autenticación por contraseña; no usarlas como cuentas reales.

## Comandos de verificación

- `npm.cmd test`: pruebas unitarias de intervalos, no necesita MongoDB.
- `npm.cmd run test:integracion`: prueba del API contra la base `tecnoredes_prestamos_test`; al terminar borra esa base. Revisar la URI antes de ejecutar y no apuntarla a una base de producción.

## Aplicación Android

- Emulador: base URL `http://10.0.2.2:3000`.
- Dispositivo físico: `http://IP-LOCAL-DEL-PC:3000`; PC y teléfono en la misma red y puerto 3000 permitido por el Firewall de Windows.
- En el dispositivo se puede modificar desde Perfil → Servidor de la API.
