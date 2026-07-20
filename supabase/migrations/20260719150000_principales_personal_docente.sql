begin;

create unique index uq_docente_sede_principal_activa
  on public.docentes_sedes (docente_id)
  where es_principal = true and activo = true;

create unique index uq_titulo_principal_docente
  on public.titulos_academicos_docente (docente_id)
  where es_titulo_principal = true;

alter table public.docentes_sedes enable row level security;
alter table public.titulos_academicos_docente enable row level security;
revoke all privileges on table public.docentes_sedes from anon, authenticated;
revoke all privileges on table public.titulos_academicos_docente from anon, authenticated;

commit;
