-- El código identifica históricamente a una sede y no debe reutilizarse,
-- incluso después de un borrado lógico.
drop index if exists public.uq_sedes_codigo_activas;

create unique index if not exists uq_sedes_codigo
  on public.sedes (codigo);
