begin;

create table public.sesiones_asistencia (
  id uuid primary key default gen_random_uuid(),
  codigo varchar not null unique,
  institucion_id uuid not null references public.instituciones(id) on update cascade on delete restrict,
  grupo_id uuid not null references public.grupos(id) on update cascade on delete restrict,
  carga_academica_docente_id uuid null references public.cargas_academicas_docentes(id) on update cascade on delete restrict,
  fecha date not null,
  numero_sesion smallint not null default 1,
  tipo varchar not null,
  hora_inicio time null,
  estado varchar not null default 'abierta',
  registrado_por_usuario_id uuid not null references public.usuarios(id) on update cascade on delete restrict,
  cerrado_por_usuario_id uuid null references public.usuarios(id) on update cascade on delete set null,
  cerrado_en timestamptz null,
  observaciones text null,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  eliminado_en timestamptz null,
  version integer not null default 1,
  constraint chk_sesiones_asistencia_tipo check (
    (tipo = 'diaria' and carga_academica_docente_id is null)
    or (tipo = 'clase' and carga_academica_docente_id is not null)
  ),
  constraint chk_sesiones_asistencia_estado check (estado in ('abierta', 'cerrada')),
  constraint chk_sesiones_asistencia_numero check (numero_sesion > 0),
  constraint chk_sesiones_asistencia_cierre check (
    (estado = 'abierta' and cerrado_por_usuario_id is null and cerrado_en is null)
    or (estado = 'cerrada' and cerrado_por_usuario_id is not null and cerrado_en is not null)
  )
);

create table public.registros_asistencia (
  id uuid primary key default gen_random_uuid(),
  sesion_asistencia_id uuid not null references public.sesiones_asistencia(id) on update cascade on delete cascade,
  matricula_id uuid not null references public.matriculas(id) on update cascade on delete restrict,
  estado varchar not null,
  minutos_retraso smallint not null default 0,
  observaciones text null,
  registrado_por_usuario_id uuid not null references public.usuarios(id) on update cascade on delete restrict,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint uq_registro_asistencia_sesion_matricula unique (sesion_asistencia_id, matricula_id),
  constraint chk_registros_asistencia_estado check (estado in ('presente', 'ausente', 'tarde', 'excusado')),
  constraint chk_registros_asistencia_retraso check (
    minutos_retraso between 0 and 600
    and (estado = 'tarde' or minutos_retraso = 0)
  )
);

create unique index uq_sesion_asistencia_diaria
  on public.sesiones_asistencia (grupo_id, fecha, numero_sesion)
  where tipo = 'diaria' and eliminado_en is null;
create unique index uq_sesion_asistencia_clase
  on public.sesiones_asistencia (grupo_id, carga_academica_docente_id, fecha, numero_sesion)
  where tipo = 'clase' and eliminado_en is null;
create index idx_sesiones_asistencia_institucion_fecha
  on public.sesiones_asistencia (institucion_id, fecha desc)
  where eliminado_en is null;
create index idx_sesiones_asistencia_grupo_fecha
  on public.sesiones_asistencia (grupo_id, fecha desc)
  where eliminado_en is null;
create index idx_sesiones_asistencia_carga_id on public.sesiones_asistencia (carga_academica_docente_id);
create index idx_sesiones_asistencia_registrado_por on public.sesiones_asistencia (registrado_por_usuario_id);
create index idx_sesiones_asistencia_cerrado_por on public.sesiones_asistencia (cerrado_por_usuario_id);
create index idx_registros_asistencia_matricula on public.registros_asistencia (matricula_id);
create index idx_registros_asistencia_usuario on public.registros_asistencia (registrado_por_usuario_id);

create trigger trg_sesiones_asistencia_actualizado_en
before update on public.sesiones_asistencia
for each row execute function public.establecer_actualizado_en();
create trigger trg_sesiones_asistencia_version
before update on public.sesiones_asistencia
for each row execute function public.incrementar_version();
create trigger trg_registros_asistencia_actualizado_en
before update on public.registros_asistencia
for each row execute function public.establecer_actualizado_en();

alter table public.sesiones_asistencia enable row level security;
alter table public.registros_asistencia enable row level security;
revoke all privileges on table public.sesiones_asistencia, public.registros_asistencia from anon, authenticated;

insert into public.permisos (codigo, modulo, accion, activo)
values
  ('asistencia.ver', 'asistencia', 'ver', true),
  ('asistencia.registrar', 'asistencia', 'registrar', true),
  ('asistencia.cerrar', 'asistencia', 'cerrar', true)
on conflict (codigo) do update set activo = excluded.activo;

insert into public.roles_permisos (rol_id, permiso_id)
select r.id, p.id
from public.roles r
cross join public.permisos p
where p.codigo = 'asistencia.ver'
  and r.codigo in ('superadministrador', 'administrador_app_institucion', 'administrativo', 'docente', 'director_grupo', 'docente_directivo')
on conflict (rol_id, permiso_id) do nothing;

insert into public.roles_permisos (rol_id, permiso_id)
select r.id, p.id
from public.roles r
cross join public.permisos p
where p.codigo in ('asistencia.registrar', 'asistencia.cerrar')
  and r.codigo in ('superadministrador', 'administrador_app_institucion', 'docente', 'director_grupo')
on conflict (rol_id, permiso_id) do nothing;

commit;
