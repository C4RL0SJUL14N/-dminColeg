begin;

alter table public.matriculas
  add column acudiente_id uuid null,
  add column fecha_limite_acudiente date null,
  add column motivo_pendiente_acudiente text null,
  add column acudiente_completado_en timestamptz null;

alter table public.matriculas
  add constraint matriculas_acudiente_id_fkey
  foreign key (acudiente_id)
  references public.acudientes(id)
  on update cascade
  on delete restrict;

alter table public.matriculas
  drop constraint chk_matriculas_estado,
  add constraint chk_matriculas_estado
    check (
      estado in (
        'activa',
        'pendiente_acudiente',
        'retirada',
        'cancelada',
        'finalizada',
        'trasladada'
      )
    ),
  add constraint chk_matriculas_acudiente_activa
    check (estado <> 'activa' or acudiente_id is not null),
  add constraint chk_matriculas_acudiente_pendiente
    check (
      estado <> 'pendiente_acudiente'
      or (
        acudiente_id is null
        and fecha_limite_acudiente is not null
        and fecha_limite_acudiente >= fecha_matricula
        and nullif(btrim(motivo_pendiente_acudiente), '') is not null
        and acudiente_completado_en is null
      )
    );

drop index public.uq_matricula_activa_estudiante_institucion_anio;

create unique index uq_matricula_vigente_estudiante_institucion_anio
  on public.matriculas (estudiante_id, institucion_id, anio_lectivo_id)
  where estado in ('activa', 'pendiente_acudiente')
    and eliminado_en is null;

create index idx_matriculas_acudiente_id
  on public.matriculas (acudiente_id);

create index idx_matriculas_pendientes_acudiente
  on public.matriculas (institucion_id, fecha_limite_acudiente)
  where estado = 'pendiente_acudiente'
    and eliminado_en is null;

alter table public.matriculas enable row level security;
revoke all privileges on table public.matriculas from anon, authenticated;

commit;
