do $migration$
begin
  perform set_config('lock_timeout', '10s', true);

  execute 'drop view if exists public.vw_diag_asignaturas_inconsistentes';
  execute 'drop view if exists public.vw_carga_academica_operativa';
  execute 'drop table if exists public.docentes_areas_conocimiento';
  execute 'alter table public.asignaturas drop column if exists area_conocimiento_id';
  execute 'drop table if exists public.areas_conocimiento';

  execute $view$
    create view public.vw_carga_academica_operativa
    with (security_invoker = true)
    as
    select
      cad.id as carga_academica_id,
      cad.codigo as carga_academica_codigo,
      cad.docente_id,
      d.persona_id as docente_persona_id,
      d.institucion_id as docente_institucion_id,
      cad.grupo_id,
      g.institucion_id as grupo_institucion_id,
      g.sede_id,
      g.anio_lectivo_id,
      g.grado_id,
      g.jornada_id,
      cad.plan_estudio_grado_id,
      peg.asignatura_id,
      a.nombre as asignatura_nombre
    from public.cargas_academicas_docentes cad
    join public.docentes d on d.id = cad.docente_id
    join public.grupos g on g.id = cad.grupo_id
    join public.planes_estudio_grados peg on peg.id = cad.plan_estudio_grado_id
    join public.asignaturas a on a.id = peg.asignatura_id
  $view$;

  execute 'revoke all on public.vw_carga_academica_operativa from public, anon, authenticated';
  execute 'grant select on public.vw_carga_academica_operativa to service_role';
end
$migration$;
