# QA Fase 1

## Que Valida La Suite

La suite automatiza la validacion operativa de Fase 1 sobre:

- autenticacion base: login, refresh, sesiones, logout
- recuperacion de contrasena
- catalogos base: tipos de documento y generos
- flujo institucional principal: crear, listar, consultar y actualizar institucion
- flujo de personas: crear, consultar, actualizar y buscar por documento
- access control base: contexto de acceso, permisos efectivos, asignacion idempotente de perfil y rol
- pruebas negativas principales: `401`, `400` y casos opcionales de `403`

## Archivos Relevantes

- `docs/fase-1-postman-collection.json`
- `docs/fase1.local.postman_environment.json`
- `docs/fase-1-cierre-operativo.md`

## Prerrequisitos

- Node.js instalado
- dependencias del proyecto instaladas
- backend levantado en `http://localhost:3000`
- base de datos Supabase accesible
- usuario superadministrador operativo

## Configuracion Minima

Edita:

- `docs/fase1.local.postman_environment.json`

Variables que debes revisar:

- `baseUrl`
- `adminEmail`
- `adminPassword`

Variables opcionales para ampliar cobertura negativa y de administracion institucional:

- `runOptionalAdminApp`
- `runOptionalInstitutionalNegatives`
- `institutionalAccessToken`
- `adminAppTargetUserId`
- `foreignInstitutionId`

## Ejecucion

Ejecucion CLI:

```bash
npm run test:fase1
```

Ejecucion con reporte HTML:

```bash
npm run test:fase1:html
```

Reporte esperado:

- CLI en consola
- HTML en `docs/reports/fase1-report.html`
- si el backend no esta arriba o una request no responde, Newman falla rapido por `--timeout-request` y `--bail`

## Como Resuelve Variables Dinamicas

La coleccion captura automaticamente:

- `accessToken`
- `refreshToken`
- `recoveryToken`
- `usuarioId`
- `institucionId`
- `personaId`
- `personaNumeroDocumento`
- `tipoDocumentoId`
- `generoId`
- `tipoPerfilId`
- `rolId`

Se usan principalmente `pm.collectionVariables.set(...)` para que la ejecucion secuencial en Newman no dependa de carga manual.

## Limitaciones Reales

- No existe endpoint en Fase 1 para listar todos los `roles` o `tipos_perfil`.
  Por eso la suite resuelve automaticamente el rol y el perfil actuales del superadministrador desde `GET /usuarios/:id/contexto-acceso` y usa asignaciones idempotentes para validar esos endpoints.

- No existe endpoint en Fase 1 para crear usuarios institucionales.
  Por eso:
  - `POST /instituciones/:id/administradores-app` solo puede automatizarse completamente si se provee `adminAppTargetUserId`
  - la prueba negativa `crear institución sin rol suficiente -> 403` requiere `institutionalAccessToken`
  - la prueba negativa `acceso a recurso de otra institución -> 403` requiere `institutionalAccessToken` y `foreignInstitutionId`

Si esas variables opcionales no se configuran, la coleccion salta esos requests y sigue la ejecucion.

Por defecto vienen desactivadas:

- `runOptionalAdminApp=false`
- `runOptionalInstitutionalNegatives=false`

Activalas solo si ya tienes:

- un usuario institucional valido para `adminAppTargetUserId`
- un token institucional no superadministrador para `institutionalAccessToken`
- un `foreignInstitutionId` real para la prueba cross-tenant

## Datos De Prueba Que Genera La Suite

La suite genera automaticamente:

- codigo y nombre unicos de institucion por corrida
- numero de documento unico para persona de prueba
- correo unico para persona de prueba

No se crea ni modifica estructura de base de datos. Solo se insertan datos compatibles con la API existente.

## Recomendaciones Operativas

- usa una base de QA o un proyecto Supabase de pruebas si no quieres acumular datos funcionales
- conserva un superadministrador semilla estable
- si quieres cobertura negativa completa por institucion, prepara un usuario institucional semilla y exporta su token para la suite

## Resultado Esperado

La suite deja validada la Fase 1 por consola con Newman y sirve como base de regresion para iniciar Fase 2 sin depender solo de pruebas manuales.
