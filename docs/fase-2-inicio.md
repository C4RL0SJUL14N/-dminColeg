# Inicio Fase 2

## Alcance Implementado

Se inicio `academic-structure-service` sobre el esquema real existente en Supabase, sin modificar la estructura de base de datos.

Tablas mapeadas en TypeORM:

- `asignaturas`
- `grados`
- `jornadas`
- `grupos`
- `planes_estudio_grados`
- `docentes`
- `cargas_academicas_docentes`

## Endpoints Base

- `POST /instituciones/:id/asignaturas`
- `GET /instituciones/:id/asignaturas`
- `POST /instituciones/:id/grados`
- `GET /instituciones/:id/grados`
- `POST /instituciones/:id/jornadas`
- `GET /instituciones/:id/jornadas`
- `POST /instituciones/:id/grupos`
- `GET /instituciones/:id/grupos`
- `POST /anios-lectivos/:id/planes-estudio`
- `GET /anios-lectivos/:id/planes-estudio`
- `POST /grupos/:id/cargas-docentes`
- `GET /grupos/:id/cargas-docentes`

## Validaciones Incluidas

- sede, anio lectivo, grado y jornada deben pertenecer a la institucion del grupo
- la asignatura debe pertenecer a la institucion
- plan de estudio debe corresponder al anio lectivo, grado y asignatura de la misma institucion
- carga docente debe corresponder al mismo anio lectivo y grado del grupo
- docente debe pertenecer a la institucion del grupo
- usuarios institucionales no pueden operar fuera de su institucion

## Verificacion Local

Comandos ejecutados:

```bash
npm run build
npm run lint
npm run test:audit
npm run build:academic-structure-service
```

Smoke test:

- `GET http://127.0.0.1:3000/docs` respondio `200` con el gateway levantado temporalmente.

## Estabilizacion Para Retomar El Proyecto

- las consultas de contexto y permisos permiten al propio usuario, al superadministrador y al administrador institucional dentro de su institucion
- se bloquean consultas entre instituciones y entre usuarios sin rol administrativo
- se agrego la prueba local `npm run test:access-control`
- las siete operaciones de escritura de estructura academica requieren el rol `administrador_app_institucion`; el superadministrador conserva acceso global
- docentes y otros roles sin administracion mantienen acceso de lectura, pero reciben `403` al intentar escribir
- se agrego la prueba local `npm run test:academic-authorization`
- se retiraron de `src` los artefactos compilados `.js`, `.d.ts` y `.js.map`; la salida compilada queda exclusivamente en `dist`
- se retiraron `prisma` y `@prisma/client` porque el proyecto utiliza exclusivamente TypeORM
- se actualizaron NestJS, Swagger, TypeORM, PostgreSQL client y herramientas de desarrollo a versiones compatibles corregidas
- `npm run audit:prod` reporta cero vulnerabilidades en dependencias de produccion
- el reporte HTML de Newman se reemplazo por JSON para retirar `newman-reporter-htmlextra`
- Newman conserva alertas transitivas exclusivas de desarrollo; debe ejecutar solo colecciones confiables y se reemplazara por pruebas e2e nativas

## Enrollment Service

Se implemento el primer corte funcional de `enrollment-service` usando las tablas:

- `estudiantes`
- `acudientes`
- `estudiantes_acudientes`
- `matriculas`
- `asignaciones_estudiantes_grupos`
- `traslados_estudiantiles`

Endpoints incorporados:

- `POST /estudiantes`
- `POST /acudientes`
- `POST /estudiantes/:id/acudientes`
- `POST /instituciones/:id/matriculas`
- `GET /instituciones/:id/matriculas`
- `GET /matriculas/:id`
- `POST /matriculas/:id/asignaciones-grupo`
- `POST /matriculas/:id/completar-acudiente`
- `POST /matriculas/:id/retirar`
- `GET /instituciones/:id/matriculas/pendientes-acudiente`
- `POST /traslados`
- `GET /instituciones/:id/traslados`
- `GET /traslados/:id`
- `POST /traslados/:id/aprobar`
- `POST /traslados/:id/rechazar`
- `POST /traslados/:id/ejecutar`

Reglas incluidas:

- una matricula con acudiente queda activa y guarda el acudiente seleccionado
- una matricula sin acudiente queda en estado `pendiente_acudiente` y exige fecha limite y motivo
- completar el acudiente valida el vinculo activo y convierte atomicamente la matricula en activa
- solo puede existir una matricula vigente, activa o pendiente, por estudiante, institucion y anio lectivo
- sede, jornada, grado, anio lectivo y grupo deben corresponder a la misma institucion
- solo puede existir una asignacion de grupo activa por matricula
- cambiar de grupo cierra atomicamente la asignacion anterior
- retirar una matricula retira atomicamente su asignacion de grupo activa
- las escrituras respetan los roles reales de administracion y direccion de grupo
- las consultas y operaciones por identificador validan el aislamiento institucional

El flujo de traslados estudiantiles incluye:

- la institucion origen solicita el traslado desde una matricula vigente
- la institucion destino aprueba o rechaza la solicitud
- solo puede existir un traslado abierto por matricula origen
- el tipo de traslado se calcula a partir de las diferencias de institucion, sede, jornada y grupo
- dentro de una institucion se actualiza atomicamente la matricula y su asignacion de grupo
- entre instituciones se cierra la matricula origen y se crea una matricula destino enlazada al traslado
- una matricula pendiente de acudiente conserva esa condicion al trasladarse
- las referencias academicas del destino se vuelven a validar al solicitar y al ejecutar

## Staff Service

Se implemento el primer corte de gestion de personal docente sobre las tablas
existentes de Supabase:

- `docentes`
- `docentes_sedes`
- `titulos_academicos_docente`
- `directores_grupo`
- `administrativos`
- `directivos_docentes`

Endpoints incorporados:

- `POST /instituciones/:id/docentes`
- `GET /instituciones/:id/docentes`
- `GET /docentes/:id`
- `POST /docentes/:id/sedes`
- `POST /docentes/:id/titulos`
- `POST /grupos/:id/director`
- `GET /grupos/:id/director`
- `POST /instituciones/:id/administrativos`
- `GET /instituciones/:id/administrativos`
- `GET /administrativos/:id`
- `POST /instituciones/:id/directivos-docentes`
- `GET /instituciones/:id/directivos-docentes`
- `GET /directivos-docentes/:id`

Reglas incluidas:

- el docente se crea desde una persona activa y no puede repetirse en la institucion
- las sedes deben pertenecer a la misma institucion del docente
- solo puede existir una sede principal activa y un titulo principal por docente
- el director debe ser un docente activo asignado a la sede del grupo
- reemplazar director cierra atomicamente la asignacion anterior
- las escrituras requieren administrador institucional; docentes y directivos conservan lectura
- administrativos se crean desde personas activas y son unicos por persona e institucion
- un directivo docente requiere un docente activo de la misma institucion y un cargo permitido
- la informacion administrativa es visible solo para administradores y docentes directivos

## Attendance Service

Se creo el primer dominio nuevo de Fase 2 mediante la migracion
`20260719160000_asistencia_mvp.sql`.

Tablas incorporadas:

- `sesiones_asistencia`
- `registros_asistencia`

Endpoints incorporados:

- `POST /grupos/:id/asistencias`
- `GET /grupos/:id/asistencias`
- `GET /asistencias/:id`
- `PUT /asistencias/:id/registros`
- `POST /asistencias/:id/cerrar`

Reglas incluidas:

- una sesion diaria pertenece al grupo y una sesion de clase exige carga academica
- solo puede existir una sesion equivalente por grupo, fecha y numero de sesion
- el docente de la carga o el director del grupo puede registrar sesiones de clase
- las sesiones diarias requieren director de grupo, salvo administradores institucionales
- los registros se guardan con upsert atomico y no duplican matricula por sesion
- solo se aceptan matriculas vigentes con asignacion activa al grupo
- minutos de retraso solo se permiten para el estado `tarde`
- una sesion solo puede cerrarse cuando cubre todas las matriculas activas del grupo
- las tablas tienen RLS activo y no conceden acceso a `anon` ni `authenticated`

Verificacion ejecutada:

```bash
npm run build
npm run build:enrollment-service
npm run test:enrollment-authorization
npm run lint
```

El servicio independiente inicio correctamente contra Supabase y `GET /docs`
respondio `200`. La migracion de matricula provisional se aplico y verifico en
Supabase; no se insertaron ni modificaron matriculas reales.

## Endurecimiento Supabase Aplicado

- se confirmo que el frontend accedera exclusivamente mediante el backend NestJS
- se habilito RLS en las 47 tablas propias del esquema `public`
- se revocaron los 770 privilegios de tablas y vistas concedidos a `anon` y `authenticated`
- se revocaron privilegios sobre secuencias y ejecucion de funciones propias para esos roles
- se protegieron los objetos futuros creados por el rol `postgres` mediante privilegios predeterminados restrictivos
- la conexion del backend conserva acceso y las pruebas reales de auditoria pasan correctamente
- todas las claves foraneas academicas cuentan con indices; no se detectaron indices FK faltantes
- cada tabla futura debe habilitar RLS explicitamente en su migracion

Detalle operativo: [supabase-hardening-backend-only.md](supabase-hardening-backend-only.md)
