# Seguridad De Dependencias - 2026-07-14

## Resultado De Produccion

`npm audit --omit=dev` reporta cero vulnerabilidades.

Actualizaciones principales:

- NestJS core, common y platform Express: `11.1.28`
- NestJS Config: `4.0.4`
- NestJS Swagger: `11.4.5`
- NestJS TypeORM: `11.0.3`
- TypeORM: `0.3.31`
- PostgreSQL client `pg`: `8.22.0`
- Helmet: `8.3.0`

Tambien se actualizaron Nest CLI, schematics, testing, ESLint, Prettier, TypeScript y typescript-eslint dentro de sus lineas compatibles.

## Newman

Newman `6.2.2` es la version disponible mas reciente, pero conserva dependencias transitivas con alertas conocidas. npm propone degradar a `2.1.2`, lo cual es un cambio incompatible y no constituye una correccion aceptable.

Medidas aplicadas:

- Newman permanece exclusivamente en `devDependencies`
- se retiro `newman-reporter-htmlextra` y su cadena adicional
- el reporte de Fase 1 ahora usa el reportero JSON integrado mediante `npm run test:fase1:json`
- Newman debe ejecutar solamente las colecciones versionadas y confiables del proyecto
- no se instala ni se copia al artefacto de produccion

Deuda futura: reemplazar la coleccion Newman por pruebas e2e nativas de NestJS antes de retirar definitivamente esta herramienta.

## Verificacion

- `npm run build`: correcto
- `npm run lint`: correcto
- `npm run test:audit`: correcto
- `npm run test:access-control`: correcto
- `npm run test:academic-authorization`: correcto
- `npm run audit:prod`: cero vulnerabilidades
