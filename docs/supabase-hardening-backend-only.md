# Endurecimiento Supabase Para Acceso Exclusivo Por Backend

Fecha de aplicacion: 2026-07-14.

## Decision De Arquitectura

El frontend no accedera directamente a la Data API de Supabase. Todo acceso al dominio pasa por el backend NestJS, que aplica JWT, roles y aislamiento institucional.

## Estado Inicial

- 47 tablas propias del esquema `public` sin RLS
- 8 vistas propias expuestas
- 385 privilegios para `anon` y 385 para `authenticated`
- permisos expuestos incluian lectura, escritura, borrado y `TRUNCATE`
- funciones propias del esquema ejecutables desde roles de Data API

## Cambios Aplicados

- RLS habilitado en las 47 tablas propias
- todos los privilegios sobre tablas, vistas y secuencias revocados para `anon` y `authenticated`
- ejecucion de funciones propias revocada para `PUBLIC`, `anon` y `authenticated`
- privilegios predeterminados del rol `postgres` ajustados para no exponer tablas, secuencias ni funciones nuevas
- funciones pertenecientes a extensiones, como `pg_trgm`, excluidas de la revocacion directa

## Verificacion

- `anon`: sin `SELECT`, `INSERT`, `DELETE` ni `TRUNCATE` sobre objetos propios
- `authenticated`: sin `SELECT`, `INSERT`, `DELETE` ni `TRUNCATE` sobre objetos propios
- funciones propias expuestas a esos roles: 0
- tablas propias sin RLS: 0
- conexion del backend con rol `postgres`: operativa
- `npm run test:audit`: correcto
- `npm run test:access-control`: correcto
- `npm run test:academic-authorization`: correcto
- `npm run build`: correcto
- `npm run lint`: correcto

## Objetos Futuros

Una tabla de prueba creada por el rol `postgres` no recibio permisos para `anon` ni `authenticated`; la transaccion de prueba fue revertida. PostgreSQL no habilita RLS automaticamente, por lo que cada migracion futura debe incluir explicitamente:

```sql
alter table public.nombre_tabla enable row level security;
revoke all privileges on public.nombre_tabla from anon, authenticated;
```

Supabase conserva reglas predeterminadas internas propiedad de `supabase_admin`. La conexion del proyecto no puede modificarlas y no afectan objetos creados por `postgres`; cualquier objeto creado mediante herramientas que operen como `supabase_admin` debe auditarse despues de su creacion.

## Acceso Directo Futuro

Si se decide habilitar la Data API mas adelante, no se deben restaurar privilegios globales. Primero se diseñan politicas RLS por institucion y operacion; despues se conceden solo los privilegios minimos requeridos.
