# Cierre Formal De Fase 1

## 1. Checklist De Validacion Tecnica

### 1.1 Autenticacion

- Que validar: `POST /auth/login` con usuario valido
  Como probarlo:
  `POST http://localhost:3000/auth/login`
  ```json
  {
    "correo": "superadmin@plataforma.local",
    "contrasena": "AdminColeg2026!"
  }
  ```
  Resultado esperado: `200`, `accessToken`, `refreshToken`, `contextoAcceso` y `timestamp`

- Que validar: login con credenciales invalidas
  Como probarlo:
  `POST http://localhost:3000/auth/login`
  ```json
  {
    "correo": "superadmin@plataforma.local",
    "contrasena": "incorrecta123"
  }
  ```
  Resultado esperado: `401` con envelope de error consistente

- Que validar: cambio obligatorio de contrasena en primer ingreso
  Como probarlo: usar un usuario con `debe_cambiar_contrasena = true`
  Resultado esperado: `200` con `requiereCambioContrasena = true` y sin acceso funcional completo

- Que validar: `POST /auth/cambiar-contrasena-inicial`
  Como probarlo:
  `POST http://localhost:3000/auth/cambiar-contrasena-inicial`
  ```json
  {
    "correo": "superadmin@plataforma.local",
    "contrasenaActual": "1000000000",
    "nuevaContrasena": "AdminColeg2026!"
  }
  ```
  Resultado esperado: `200`, nuevos tokens, `debe_cambiar_contrasena = false`

- Que validar: `POST /auth/refresh`
  Como probarlo:
  `POST http://localhost:3000/auth/refresh`
  ```json
  {
    "refreshToken": "<refresh_token>"
  }
  ```
  Resultado esperado: `200`, nuevos `accessToken` y `refreshToken`

- Que validar: `POST /auth/logout`
  Como probarlo:
  Header: `Authorization: Bearer <access_token>`
  `POST http://localhost:3000/auth/logout`
  ```json
  {}
  ```
  Resultado esperado: `200`, `cerrado = true`, sesion revocada

- Que validar: recuperacion de contrasena
  Como probarlo:
  `POST http://localhost:3000/auth/solicitar-recuperacion`
  ```json
  {
    "correo": "superadmin@plataforma.local"
  }
  ```
  Resultado esperado: `200`, `solicitado = true`, `tokenDesarrollo` en entorno local

- Que validar: restablecimiento de contrasena
  Como probarlo:
  `POST http://localhost:3000/auth/restablecer-contrasena`
  ```json
  {
    "token": "<token_desarrollo>",
    "nuevaContrasena": "AdminColegReset2026!"
  }
  ```
  Resultado esperado: `200`, `restablecida = true`

- Que validar: `GET /auth/sesiones`
  Como probarlo:
  Header: `Authorization: Bearer <access_token>`
  `GET http://localhost:3000/auth/sesiones`
  Resultado esperado: `200`, lista de sesiones del usuario autenticado

### 1.2 Seguridad

- Que validar: endpoints protegidos sin JWT
  Como probarlo: llamar `GET /instituciones` sin header Authorization
  Resultado esperado: `401`

- Que validar: endpoints protegidos con JWT valido
  Como probarlo: llamar `GET /instituciones` con token valido
  Resultado esperado: `200`

- Que validar: control por rol
  Como probarlo: llamar `POST /instituciones` con usuario no superadmin
  Resultado esperado: `403`

- Que validar: validacion de UUID
  Como probarlo: `GET /instituciones/no-es-uuid`
  Resultado esperado: `400`

- Que validar: `whitelist` y `forbidNonWhitelisted`
  Como probarlo: enviar propiedades extra en cualquier DTO de escritura
  Resultado esperado: `400` indicando propiedad no permitida

### 1.3 Aislamiento Por Institucion

- Que validar: un usuario institucional no puede consultar otra institucion
  Como probarlo: autenticar un usuario institucional y consultar recursos de otra `institucion_id`
  Resultado esperado: `403`

- Que validar: anos lectivos y periodos respetan contexto por relacion
  Como probarlo: usar un `anio_lectivo_id` o `periodo_id` que pertenezca a otra institucion
  Resultado esperado: `403`

### 1.4 Control De Acceso

- Que validar: `GET /usuarios/:id/contexto-acceso`
  Como probarlo:
  Header: `Authorization: Bearer <access_token>`
  `GET http://localhost:3000/usuarios/<usuario_id>/contexto-acceso`
  Resultado esperado: `200`, perfiles, roles, permisos y contexto institucional

- Que validar: `GET /usuarios/:id/permisos-efectivos`
  Como probarlo:
  Header: `Authorization: Bearer <access_token>`
  `GET http://localhost:3000/usuarios/<usuario_id>/permisos-efectivos`
  Resultado esperado: `200`, permisos consolidados sin duplicados

- Que validar: asignacion de perfil funcional
  Como probarlo:
  Header: `Authorization: Bearer <superadmin_token>`
  `POST http://localhost:3000/usuarios/<usuario_id>/perfiles`
  ```json
  {
    "tipoPerfilId": "<tipo_perfil_uuid>"
  }
  ```
  Resultado esperado: `200`, perfil asignado o reactivado

- Que validar: asignacion de rol tecnico
  Como probarlo:
  Header: `Authorization: Bearer <superadmin_token>`
  `POST http://localhost:3000/usuarios/<usuario_id>/roles`
  ```json
  {
    "rolId": "<rol_uuid>"
  }
  ```
  Resultado esperado: `200`, rol asignado

- Que validar: restriccion de superadministrador unico
  Como probarlo: intentar asignar rol `superadministrador` a un usuario institucional
  Resultado esperado: `403`

- Que validar: administrador institucional solo para perfiles permitidos
  Como probarlo:
  Header: `Authorization: Bearer <superadmin_token>`
  `POST http://localhost:3000/instituciones/<institucion_id>/administradores-app`
  ```json
  {
    "usuarioId": "<usuario_uuid>"
  }
  ```
  Resultado esperado: `200` solo si el usuario tiene perfil `docente`, `docente_directivo` o `administrativo`; si no, `400`

### 1.5 Manejo De Errores

- Que validar: envelope de error uniforme
  Como probarlo: forzar `404`, `400`, `401` y `403`
  Resultado esperado:
  ```json
  {
    "statusCode": 404,
    "timestamp": "ISO_DATE",
    "path": "/ruta",
    "error": {
      "message": "..."
    }
  }
  ```

### 1.6 Consistencia De Respuestas

- Que validar: envelope exitoso
  Como probarlo: cualquier `GET` exitoso
  Resultado esperado:
  ```json
  {
    "data": {},
    "timestamp": "ISO_DATE"
  }
  ```

### 1.7 Swagger

- Que validar: documentacion expuesta
  Como probarlo: abrir `http://localhost:3000/docs`
  Resultado esperado: carga correcta de Swagger UI

- Que validar: autenticacion en Swagger
  Como probarlo: usar `Authorize` con `Bearer <access_token>`
  Resultado esperado: ejecucion correcta de endpoints protegidos

## 2. Coleccion De Pruebas

La coleccion Postman entregada en este cierre se encuentra en:

- `docs/fase-1-postman-collection.json`

Contiene carpetas para:

- `Auth`
- `Instituciones`
- `Personas`
- `Access Control`

Cada request incluye:

- URL
- metodo HTTP
- headers
- body JSON
- ejemplos de respuesta esperada en descripcion

## 3. Validacion De Seguridad

- JWT: implementado con access y refresh token separados
- expiracion: configurable por `JWT_ACCESS_TTL` y `JWT_REFRESH_TTL`
- proteccion de endpoints: aplicada con `JwtAuthGuard` global
- control por rol: aplicado con `RolesGuard`
- aislamiento institucional: aplicado con `InstitutionContextGuard` y validaciones adicionales por relacion en `institution-service`
- validacion de UUID: aplicada en rutas criticas
- proteccion contra datos no permitidos: `ValidationPipe` con `whitelist` y `forbidNonWhitelisted`

### Riesgos Y Recomendaciones

- ⚠ riesgo: `GET /usuarios/:id/contexto-acceso` y `GET /usuarios/:id/permisos-efectivos` no restringen por si mismos la consulta a solo el propio usuario o a roles administrativos
  🔧 solucion recomendada: agregar regla explicita para permitir solo al propio usuario, administradores institucionales de su institucion o superadministrador

- ⚠ riesgo: `DB_SSL_REJECT_UNAUTHORIZED=false` es correcto para algunos entornos Supabase locales o de pooler, pero reduce endurecimiento TLS
  🔧 solucion recomendada: usar `true` en entornos productivos si la cadena de certificados del entorno lo permite

- ⚠ riesgo: la recuperacion de contrasena retorna `tokenDesarrollo`
  🔧 solucion recomendada: dejar ese campo solo en desarrollo y conectar proveedor real de correo para produccion

- ⚠ riesgo: no hay suite automatizada de integracion aun
  🔧 solucion recomendada: en Fase 2 agregar pruebas e2e sobre auth, aislamiento institucional y rutas de escritura

## 4. Validacion De Base De Datos

- correspondencia entidades-tablas: validada manualmente contra el esquema real existente
- UUID: respetado en entidades y relaciones
- relaciones: `usuario -> persona`, `usuario -> institucion`, `perfil_usuario -> tipo_perfil`, `rol_usuario -> rol`, `periodo -> anio_lectivo`, `nivel -> escala`
- auditoria: alineada a columnas reales `creado_en` y `actualizado_en`
- campos criticos: `hash_contrasena`, `debe_cambiar_contrasena`, `intentos_fallidos_inicio`, `bloqueado_hasta`, `identificador_token_refresco`

### Indices Recomendados Sin Romper El Esquema

- indice por `usuarios(correo, institucion_id)` si no existe
- indice por `personas(tipo_documento_id, numero_documento)` si no existe
- indice por `sesiones_usuario(usuario_id, revocada_en)`
- indice por `tokens_recuperacion_contrasena(usuario_id, expira_en, usado_en)`
- indice por `perfiles_usuario(usuario_id, activo)`
- indice por `roles_usuario(usuario_id, rol_id)`

## 5. Estandares De Codigo

- estructura modular: correcta
- separacion de responsabilidades: correcta por servicio y por libreria
- DTOs: correctos y con validacion real
- nombres: consistentes con el dominio en espanol
- excepciones: manejo consistente via `ApiExceptionFilter`
- reutilizacion: buena en `libs/common`, `libs/auth` y `libs/database`

### Refactorizaciones Recomendadas

- extraer contratos de respuesta a `libs/contracts` a medida que crezcan integraciones internas
- agregar repositorios explicitos en servicios con mas logica de persistencia si el dominio sigue aumentando
- introducir pruebas e2e con datos controlados y limpieza automatica

## 6. Archivo .env Y Configuracion

Variables necesarias:

- `NODE_ENV`
- `DATABASE_URL`
- `DB_SSL`
- `DB_SSL_REJECT_UNAUTHORIZED`
- `DB_LOGGING`
- `API_GATEWAY_PORT`
- `AUTH_SERVICE_PORT`
- `ACCESS_CONTROL_SERVICE_PORT`
- `INSTITUTION_SERVICE_PORT`
- `IDENTITY_SERVICE_PORT`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_TTL`
- `JWT_REFRESH_TTL`
- `AUTH_MAX_FAILED_ATTEMPTS`
- `PASSWORD_RESET_TTL_MINUTES`
- `GOOGLE_OIDC_ENABLED`
- `GOOGLE_OIDC_ISSUER`
- `GOOGLE_OIDC_CLIENT_ID`
- `GOOGLE_OIDC_CLIENT_SECRET`
- `GOOGLE_OIDC_REDIRECT_URI`

Recomendaciones de seguridad:

- usar secretos largos y unicos por ambiente
- no versionar `.env`
- rotar secretos JWT antes de produccion
- diferenciar claramente configuracion de desarrollo, QA y produccion
- limitar `DB_LOGGING` a desarrollo o debugging controlado

## 7. Script De Arranque Del Proyecto

Instalacion:

```bash
npm install
```

Variables de entorno:

```bash
copy .env.example .env
```

Desarrollo:

```bash
npm run start:dev:api-gateway
```

Servicios individuales:

```bash
npm run start:dev:auth-service
npm run start:dev:access-control-service
npm run start:dev:institution-service
npm run start:dev:identity-service
```

Build:

```bash
npm run build
```

Produccion:

```bash
node dist/apps/api-gateway/src/main.js
```

Swagger:

```text
http://localhost:3000/docs
```

## 8. Documento Formal De Cierre De Fase 1

### Alcance Logrado

Se implemento y valido la columna vertebral del backend multiinstitucion sobre la base real existente en Supabase, sin modificar el esquema y respetando las reglas del negocio congeladas.

### Servicios Implementados

- `api-gateway`
- `auth-service`
- `access-control-service`
- `institution-service`
- `identity-service`

### Funcionalidades Cubiertas

- autenticacion completa con JWT access y refresh
- sesiones de usuario
- cambio inicial de contrasena
- recuperacion y restablecimiento de contrasena
- control de acceso por roles, perfiles y permisos
- aislamiento institucional
- CRUD institucional de la fase 1
- CRUD base de personas y catalogos
- documentacion Swagger

### Estado De Seguridad

La capa base de seguridad esta implementada y validada. Los endpoints protegidos exigen JWT, se validan roles y se controla el contexto institucional. No se identifico deuda critica bloqueante para pasar a Fase 2.

### Estado De La Base De Datos

Las entidades TypeORM fueron alineadas contra la base real existente. La conexion opera con `synchronize: false`, por lo que no se altera el esquema. Los nombres del dominio y tablas existentes se respetaron.

### Limitaciones Actuales

- falta automatizar pruebas e2e
- login con Google esta preparado pero no integrado extremo a extremo
- envio real de correo para recuperacion no esta conectado

### Pendiente Para Fase 2

- `academic-structure-service`
- `enrollment-service`
- reglas de estudiantes con acudiente obligatorio dentro del modulo de matriculas
- automatizacion de pruebas
- observabilidad y trazabilidad mas fina

## 9. Criterios De GO A Fase 2

- `OK` login, refresh, logout y recuperacion funcionan
- `OK` cambio obligatorio de contrasena validado
- `OK` aislamiento por institucion verificado
- `OK` endpoints protegidos con JWT
- `OK` roles, perfiles y permisos operativos
- `OK` Swagger completo y funcional
- `OK` mapeo TypeORM alineado con la BD real
- `OK` `institution-service` validado de punta a punta
- `OK` `identity-service` validado de punta a punta
- `OK` `access-control-service` validado en lectura y escritura
- `OK` no hay deuda tecnica critica bloqueante para iniciar Fase 2
