-- El borrado de sedes es lógico. Las restricciones deben ignorar los registros
-- eliminados para permitir reutilizar su código o nombre sin perder historial.
alter table public.sedes
  drop constraint if exists sedes_codigo_key,
  drop constraint if exists uq_sedes_institucion_nombre;

create unique index if not exists uq_sedes_codigo_activas
  on public.sedes (codigo)
  where eliminado_en is null;

create unique index if not exists uq_sedes_institucion_nombre_activas
  on public.sedes (institucion_id, nombre)
  where eliminado_en is null;
