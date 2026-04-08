# AdminColeg Backend

Backend monorepo en NestJS para una plataforma educativa multiinstitución, construido sobre una base PostgreSQL existente en Supabase y respetando el dominio real ya definido.

## Stack

- NestJS
- TypeScript
- PostgreSQL en Supabase
- TypeORM
- JWT
- Swagger / OpenAPI
- class-validator
- Newman / Postman para validación automatizada de Fase 1

## Servicios Implementados En Fase 1

- `api-gateway`
- `auth-service`
- `access-control-service`
- `institution-service`
- `identity-service`

## Arquitectura

```text
apps/
  api-gateway/
  auth-service/
  access-control-service/
  institution-service/
  identity-service/
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
```

Desarrollo:

```bash
npm run start:dev:api-gateway
npm run start:dev:auth-service
npm run start:dev:access-control-service
npm run start:dev:institution-service
npm run start:dev:identity-service
```

Validación automatizada Fase 1:

```bash
npm run test:fase1
npm run test:fase1:html
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

- `academic-structure-service`
- `enrollment-service`

Sin rediseñar la arquitectura ni modificar el esquema existente.
