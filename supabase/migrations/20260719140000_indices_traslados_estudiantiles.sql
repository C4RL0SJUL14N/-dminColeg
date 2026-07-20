begin;

create unique index uq_traslado_abierto_matricula_origen
  on public.traslados_estudiantiles (matricula_origen_id)
  where estado in ('solicitado', 'en_revision', 'aprobado')
    and matricula_origen_id is not null;

create index idx_traslados_institucion_origen_estado
  on public.traslados_estudiantiles (institucion_origen_id, estado);

create index idx_traslados_institucion_destino_estado
  on public.traslados_estudiantiles (institucion_destino_id, estado);

create index idx_traslados_sede_origen_id
  on public.traslados_estudiantiles (sede_origen_id);
create index idx_traslados_grado_origen_id
  on public.traslados_estudiantiles (grado_origen_id);
create index idx_traslados_jornada_origen_id
  on public.traslados_estudiantiles (jornada_origen_id);
create index idx_traslados_grupo_origen_id
  on public.traslados_estudiantiles (grupo_origen_id);
create index idx_traslados_sede_destino_id
  on public.traslados_estudiantiles (sede_destino_id);
create index idx_traslados_anio_destino_id
  on public.traslados_estudiantiles (anio_lectivo_destino_id);
create index idx_traslados_grado_destino_id
  on public.traslados_estudiantiles (grado_destino_id);
create index idx_traslados_jornada_destino_id
  on public.traslados_estudiantiles (jornada_destino_id);
create index idx_traslados_grupo_destino_id
  on public.traslados_estudiantiles (grupo_destino_id);
create index idx_traslados_aprobado_por_usuario_id
  on public.traslados_estudiantiles (aprobado_por_usuario_id);

alter table public.traslados_estudiantiles enable row level security;
revoke all privileges on table public.traslados_estudiantiles
  from anon, authenticated;

commit;
