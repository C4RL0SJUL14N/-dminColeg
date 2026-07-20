# AdminColeg

Plataforma educativa multiinstitución con backend NestJS, frontend React y PostgreSQL en Supabase.

## Stack

- NestJS
- TypeScript
- PostgreSQL en Supabase
- TypeORM
- JWT
- Swagger / OpenAPI
- class-validator
- Newman / Postman para validación automatizada de Fase 1
- React + Vite para la aplicación web

## Servicios Implementados En Fase 1

- `api-gateway`
- `auth-service`
- `access-control-service`
- `institution-service`
- `identity-service`
- `academic-structure-service` (inicio Fase 2)
- `enrollment-service` (Fase 2)
- `staff-service` (Fase 2)
- `attendance-service` (Fase 2)

## Arquitectura

```text
apps/
  web/
  api-gateway/
  auth-service/
  access-control-service/
  institution-service/
  identity-service/
  academic-structure-service/
  enrollment-service/
  staff-service/
  attendance-service/
libs/
  common/
  database/
  auth/
  contracts/
  testing/
docs/
  fase-1-postman-collection.json
  fase1.local.postman_environment.json
  qa-fase1.md
  fase-1-cierre-operativo.md
  resumen-fase-1-backend.md
  evidencias/
```

## Instalación

```bash
npm install
```

## Variables De Entorno

1. Crea tu archivo local:

```bash
copy .env.example .env
```

2. Configura al menos:

- `DATABASE_URL`
- `DB_SSL`
- `DB_SSL_REJECT_UNAUTHORIZED`
- `API_GATEWAY_PORT`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_TTL`
- `JWT_REFRESH_TTL`
- `AUTH_MAX_FAILED_ATTEMPTS`
- `PASSWORD_RESET_TTL_MINUTES`

3. Para Google OIDC quedan preparados:

- `GOOGLE_OIDC_ENABLED`
- `GOOGLE_OIDC_ISSUER`
- `GOOGLE_OIDC_CLIENT_ID`
- `GOOGLE_OIDC_CLIENT_SECRET`
- `GOOGLE_OIDC_REDIRECT_URI`

## Scripts Principales

Build:

```bash
npm run build
npm run build:web
```

Desarrollo:

```bash
npm run start:dev:api-gateway
npm run start:dev:auth-service
npm run start:dev:access-control-service
npm run start:dev:institution-service
npm run start:dev:identity-service
npm run start:dev:academic-structure-service
npm run start:dev:enrollment-service
npm run start:dev:staff-service
npm run start:dev:attendance-service
npm run start:dev:web
```

La aplicación web queda disponible en `http://127.0.0.1:5173`. Su gateway se configura en `apps/web/.env` mediante `VITE_API_URL`; puedes partir de `apps/web/.env.example`. El acceso permite usar credenciales reales del backend o entrar en modo demostración para revisar la interfaz sin datos locales.

Validación automatizada Fase 1:

```bash
npm run test:access-control
npm run test:academic-authorization
npm run test:enrollment-authorization
npm run test:staff-authorization
npm run test:attendance-authorization
npm run test:fase1
npm run test:fase1:json
npm run audit:prod
```

## Swagger

Gateway principal:

```text
http://localhost:3000/docs
```

Puertos por servicio:

- `3000` api-gateway
- `3001` auth-service
- `3002` access-control-service
- `3003` institution-service
- `3004` identity-service
- `3005` academic-structure-service
- `3006` enrollment-service
- `3007` staff-service
- `3008` attendance-service

## Estado De Fase 1

La Fase 1 quedó completada y validada sobre la base real existente en Supabase.

Cobertura validada:

- autenticación con access token y refresh token
- cambio obligatorio de contraseña en primer ingreso
- recuperación y restablecimiento de contraseña
- manejo de sesiones
- guards globales: `JwtAuthGuard`, `RolesGuard`, `InstitutionContextGuard`
- aislamiento multiinstitución
- CRUD institucional
- CRUD de personas
- contexto de acceso, roles, perfiles y permisos
- validación automatizada con Postman + Newman

Documentación relacionada:

- [fase-1-cierre-operativo.md](docs/fase-1-cierre-operativo.md)
- [qa-fase1.md](docs/qa-fase1.md)
- [resumen-fase-1-backend.md](docs/resumen-fase-1-backend.md)

## Fase 2

La base quedó lista para continuar con:

- `academic-structure-service` iniciado
- `enrollment-service` iniciado con estudiantes, acudientes, matriculas y grupos

Sin rediseñar la arquitectura ni modificar el esquema existente.
