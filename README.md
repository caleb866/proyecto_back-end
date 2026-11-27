# API de Productos (Back-end)

API REST construida con Node.js y Express para gestionar un catálogo de productos. Incluye registro e inicio de sesión de usuarios con contraseñas cifradas (bcrypt) y autenticación con tokens JWT. Las rutas de crear, editar y borrar están protegidas.

Este repositorio es el **back-end** del proyecto final. El front-end que consume esta API está en: `PEGA_AQUI_EL_LINK_DEL_REPO_FRONT`

## Tecnologías

- Node.js y Express
- MySQL con `mysql2`
- bcrypt (cifrado de contraseñas)
- jsonwebtoken (tokens JWT)
- dotenv (variables de entorno)
- cors

## Requisitos previos

- Node.js 18 o superior
- MySQL (XAMPP, MySQL Workbench u otro)
- Postman (opcional, para probar los endpoints)

## Instalación y ejecución

1. Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/caleb866/proyecto_back-end.git
cd proyecto_back-end
npm install
```

2. Crea la base de datos y las tablas ejecutando el archivo `database/tienda_api.sql` en MySQL (Workbench, phpMyAdmin o terminal):

```bash
mysql -u root -p < database/tienda_api.sql
```

3. Crea tu archivo `.env` a partir del ejemplo y completa tus datos:

```bash
cp .env.example .env
```

En Windows (PowerShell): `copy .env.example .env`

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_clave_de_mysql
DB_NAME=tienda_api
JWT_SECRET=una_frase_larga_y_dificil_de_adivinar
JWT_EXPIRES_IN=2h
```

4. Inicia el servidor:

```bash
npm run dev     # con nodemon (se reinicia solo)
npm start       # modo normal
```

La API queda en `http://localhost:3000`. Para comprobar la conexión con la base de datos, abre `http://localhost:3000/health`.

## Endpoints

### Autenticación

| Método | Ruta | Descripción | Códigos |
|---|---|---|---|
| POST | `/auth/registro` | Registra un usuario | 201, 400 |
| POST | `/auth/login` | Inicia sesión y devuelve un token JWT | 200, 400, 401 |

### Productos

| Método | Ruta | Descripción | Protegida | Códigos |
|---|---|---|---|---|
| GET | `/productos` | Lista todos los productos | No | 200 |
| GET | `/productos/:id` | Obtiene un producto | No | 200, 400, 404 |
| POST | `/productos` | Crea un producto | Sí | 201, 400, 401 |
| PUT | `/productos/:id` | Reemplaza un producto completo | Sí | 200, 400, 401, 404 |
| PATCH | `/productos/:id` | Actualiza campos de un producto | Sí | 200, 400, 401, 404 |
| DELETE | `/productos/:id` | Elimina un producto | Sí | 204, 400, 401, 404 |

## Autenticación

1. Registra un usuario en `POST /auth/registro`.
2. Inicia sesión en `POST /auth/login`: la respuesta incluye un `token`.
3. En las rutas protegidas envía el token en el encabezado:

```
Authorization: Bearer <token>
```

El token vence según `JWT_EXPIRES_IN` (por defecto, 2 horas).

## Ejemplos de body

Registro:

```json
{
  "nombre": "Caleb Ochoa",
  "email": "caleb@correo.com",
  "password": "clave12345"
}
```

Producto (POST y PUT):

```json
{
  "nombre": "Audífonos Bluetooth",
  "precio": 89000,
  "stock": 20,
  "categoria": "Audio"
}
```

## Errores de validación

Cuando los datos llegan mal, la API responde `400` con un mensaje por cada campo con error:

```json
{
  "mensaje": "Datos inválidos",
  "errores": {
    "nombre": "El nombre es obligatorio",
    "precio": "El precio no puede ser negativo"
  }
}
```

## Estructura del proyecto

```
proyecto_back-end/
├── config/
│   └── db.js                  conexión a MySQL (pool)
├── database/
│   └── tienda_api.sql         creación de la base de datos y tablas
├── middlewares/
│   ├── asyncHandler.js        manejo de errores en funciones async
│   ├── auth.js                verificación del token JWT
│   └── validaciones.js        validaciones por campo
├── postman/
│   └── API-Productos.postman_collection.json
├── routes/
│   ├── auth.js                registro y login
│   └── productos.js           CRUD de productos
├── .env.example
├── package.json
└── server.js
```

## Pruebas con Postman

Importa el archivo `postman/API-Productos.postman_collection.json` en Postman. Primero haz login: el token se guarda en la variable `token` de la colección y se envía automáticamente en las rutas protegidas.

## Autor

Caleb Ochoa Ramírez