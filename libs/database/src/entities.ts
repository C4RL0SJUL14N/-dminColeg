import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { BaseUuidEntity } from "./base.entity";

@Entity({ name: "tipos_documento" })
export class TipoDocumento extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column()
  nombre!: string;

  @Column({ default: true })
  activo!: boolean;
}

@Entity({ name: "generos" })
export class Genero extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column()
  nombre!: string;

  @Column({ default: true })
  activo!: boolean;
}

@Entity({ name: "personas" })
export class Persona extends BaseUuidEntity {
  @Column()
  codigo!: string;

  @Column({ name: "tipo_documento_id", type: "uuid" })
  tipoDocumentoId!: string;

  @Column({ name: "genero_id", type: "uuid", nullable: true })
  generoId!: string | null;

  @Column({ name: "numero_documento" })
  numeroDocumento!: string;

  @Column({ name: "primer_nombre" })
  primerNombre!: string;

  @Column({ name: "segundo_nombre", type: "varchar", nullable: true })
  segundoNombre!: string | null;

  @Column({ name: "primer_apellido" })
  primerApellido!: string;

  @Column({ name: "segundo_apellido", type: "varchar", nullable: true })
  segundoApellido!: string | null;

  @Column({ name: "correo_personal", type: "varchar", nullable: true })
  correoPersonal!: string | null;

  @Column({ name: "correo_institucional", type: "varchar", nullable: true })
  correoInstitucional!: string | null;

  @Column({ type: "varchar", nullable: true })
  telefono!: string | null;

  @Column({ default: true })
  activo!: boolean;

  @Column({ name: "eliminado_en", type: "timestamptz", nullable: true })
  eliminadoEn!: Date | null;

  @Column({ default: 1 })
  version!: number;

  @ManyToOne(() => TipoDocumento)
  @JoinColumn({ name: "tipo_documento_id" })
  tipoDocumento!: TipoDocumento;

  @ManyToOne(() => Genero, { nullable: true })
  @JoinColumn({ name: "genero_id" })
  genero!: Genero | null;
}

@Entity({ name: "instituciones" })
export class Institucion extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column()
  nombre!: string;

  @Column({ default: true })
  activo!: boolean;

  @Column({ name: "eliminado_en", type: "timestamptz", nullable: true })
  eliminadoEn!: Date | null;

  @Column({ default: 1 })
  version!: number;
}

@Entity({ name: "usuarios" })
export class Usuario extends BaseUuidEntity {
  @Column()
  codigo!: string;

  @Column({ name: "persona_id", type: "uuid" })
  personaId!: string;

  @Column({ name: "institucion_id", type: "uuid", nullable: true })
  institucionId!: string | null;

  @Column({ unique: true })
  correo!: string;

  @Column({ name: "hash_contrasena", type: "text" })
  hashContrasena!: string;

  @Column({ name: "debe_cambiar_contrasena", default: true })
  debeCambiarContrasena!: boolean;

  @Column({ name: "correo_verificado", default: false })
  correoVerificado!: boolean;

  @Column()
  estado!: string;

  @Column({
    name: "ultimo_inicio_sesion_en",
    type: "timestamptz",
    nullable: true,
  })
  ultimoInicioSesionEn!: Date | null;

  @Column({
    name: "ultima_actualizacion_contrasena_en",
    type: "timestamptz",
    nullable: true,
  })
  ultimaActualizacionContrasenaEn!: Date | null;

  @Column({ name: "intentos_fallidos_inicio", default: 0 })
  intentosFallidosInicio!: number;

  @Column({ name: "bloqueado_hasta", type: "timestamptz", nullable: true })
  bloqueadoHasta!: Date | null;

  @Column({ name: "eliminado_en", type: "timestamptz", nullable: true })
  eliminadoEn!: Date | null;

  @Column({ default: 1 })
  version!: number;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: "persona_id" })
  persona!: Persona;

  @ManyToOne(() => Institucion, { nullable: true })
  @JoinColumn({ name: "institucion_id" })
  institucion!: Institucion | null;
}

@Entity({ name: "tipos_perfil" })
export class TipoPerfil extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column()
  nombre!: string;

  @Column({ default: 0 })
  orden!: number;

  @Column({ default: true })
  activo!: boolean;
}

@Entity({ name: "perfiles_usuario" })
export class PerfilUsuario extends BaseUuidEntity {
  @Column({ name: "usuario_id", type: "uuid" })
  usuarioId!: string;

  @Column({ name: "tipo_perfil_id", type: "uuid" })
  tipoPerfilId!: string;

  @Column({ default: true })
  activo!: boolean;

  @Column({ name: "sede_id", type: "uuid", nullable: true })
  sedeId!: string | null;

  @Column({ name: "es_predeterminado", default: false })
  predeterminado!: boolean;

  @Column({ name: "asignado_por_usuario_id", type: "uuid", nullable: true })
  asignadoPorUsuarioId!: string | null;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "usuario_id" })
  usuario!: Usuario;

  @ManyToOne(() => TipoPerfil)
  @JoinColumn({ name: "tipo_perfil_id" })
  tipoPerfil!: TipoPerfil;
}

@Entity({ name: "roles" })
export class Rol extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column()
  nombre!: string;

  @Column({ default: true })
  activo!: boolean;
}

@Entity({ name: "roles_usuario" })
export class RolUsuario {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "usuario_id", type: "uuid" })
  usuarioId!: string;

  @Column({ name: "rol_id", type: "uuid" })
  rolId!: string;

  @Column({ name: "sede_id", type: "uuid", nullable: true })
  sedeId!: string | null;

  @Column({ name: "asignado_por_usuario_id", type: "uuid", nullable: true })
  asignadoPorUsuarioId!: string | null;

  @CreateDateColumn({ name: "creado_en", type: "timestamptz" })
  createdAt!: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "usuario_id" })
  usuario!: Usuario;

  @ManyToOne(() => Rol)
  @JoinColumn({ name: "rol_id" })
  rol!: Rol;
}

@Entity({ name: "permisos" })
export class Permiso extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column()
  modulo!: string;

  @Column()
  accion!: string;

  @Column({ default: true })
  activo!: boolean;
}

@Entity({ name: "roles_permisos" })
export class RolPermiso {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "rol_id", type: "uuid" })
  rolId!: string;

  @Column({ name: "permiso_id", type: "uuid" })
  permisoId!: string;

  @CreateDateColumn({ name: "creado_en", type: "timestamptz" })
  createdAt!: Date;

  @ManyToOne(() => Rol)
  @JoinColumn({ name: "rol_id" })
  rol!: Rol;

  @ManyToOne(() => Permiso)
  @JoinColumn({ name: "permiso_id" })
  permiso!: Permiso;
}

@Entity({ name: "proveedores_autenticacion" })
export class ProveedorAutenticacion extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column()
  nombre!: string;

  @Column({ default: true })
  activo!: boolean;
}

@Entity({ name: "metodos_autenticacion_usuario" })
export class MetodoAutenticacionUsuario {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "usuario_id", type: "uuid" })
  usuarioId!: string;

  @Column({ name: "proveedor_autenticacion_id", type: "uuid" })
  proveedorAutenticacionId!: string;

  @Column({ name: "identificador_proveedor", type: "varchar", nullable: true })
  identificadorProveedor!: string | null;

  @Column({ name: "correo_proveedor", type: "varchar", nullable: true })
  correoProveedor!: string | null;

  @Column({ name: "es_principal", default: false })
  esPrincipal!: boolean;

  @Column({ default: false })
  verificado!: boolean;

  @Column({ default: true })
  activo!: boolean;

  @Column({ name: "ultimo_uso_en", type: "timestamptz", nullable: true })
  ultimoUsoEn!: Date | null;

  @Column({ name: "metadatos_json", type: "jsonb", nullable: true })
  metadatosJson!: Record<string, unknown> | null;

  @CreateDateColumn({ name: "creado_en", type: "timestamptz" })
  createdAt!: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: "usuario_id" })
  usuario!: Usuario;

  @ManyToOne(() => ProveedorAutenticacion)
  @JoinColumn({ name: "proveedor_autenticacion_id" })
  proveedor!: ProveedorAutenticacion;
}

@Entity({ name: "tokens_recuperacion_contrasena" })
export class TokenRecuperacionContrasena {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "usuario_id", type: "uuid" })
  usuarioId!: string;

  @Column({ name: "hash_token", type: "text" })
  tokenHash!: string;

  @Column({ name: "expira_en", type: "timestamptz" })
  expiraAt!: Date;

  @Column({ name: "usado_en", type: "timestamptz", nullable: true })
  usadoAt!: Date | null;

  @Column({ name: "ip_solicitud", type: "inet", nullable: true })
  ipSolicitud!: string | null;

  @CreateDateColumn({ name: "creado_en", type: "timestamptz" })
  createdAt!: Date;
}

@Entity({ name: "sesiones_usuario" })
export class SesionUsuario {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "usuario_id", type: "uuid" })
  usuarioId!: string;

  @Column({ name: "perfil_usuario_id", type: "uuid", nullable: true })
  perfilUsuarioId!: string | null;

  @Column({ name: "identificador_token_acceso" })
  identificadorTokenAcceso!: string;

  @Column({
    name: "identificador_token_refresco",
    type: "varchar",
    nullable: true,
  })
  identificadorTokenRefresco!: string | null;

  @Column({ name: "tipo_dispositivo", type: "varchar", nullable: true })
  tipoDispositivo!: string | null;

  @Column({ type: "varchar", nullable: true })
  plataforma!: string | null;

  @Column({ name: "version_app", type: "varchar", nullable: true })
  versionApp!: string | null;

  @Column({ type: "inet", nullable: true })
  ip!: string | null;

  @Column({ name: "agente_usuario", type: "text", nullable: true })
  agenteUsuario!: string | null;

  @Column({ name: "iniciada_en", type: "timestamptz" })
  iniciadaEn!: Date;

  @Column({ name: "ultima_actividad_en", type: "timestamptz", nullable: true })
  ultimaActividadEn!: Date | null;

  @Column({ name: "revocada_en", type: "timestamptz", nullable: true })
  revocadaEn!: Date | null;

  @Column({ name: "motivo_revocacion", type: "varchar", nullable: true })
  motivoRevocacion!: string | null;
}

@Entity({ name: "sedes" })
export class Sede extends BaseUuidEntity {
  @Column()
  codigo!: string;

  @Column({ name: "institucion_id", type: "uuid" })
  institucionId!: string;

  @Column()
  nombre!: string;

  @Column({ default: true })
  activo!: boolean;

  @Column({ name: "eliminado_en", type: "timestamptz", nullable: true })
  eliminadoEn!: Date | null;

  @Column({ default: 1 })
  version!: number;
}

@Entity({ name: "anios_lectivos" })
export class AnioLectivo extends BaseUuidEntity {
  @Column()
  codigo!: string;

  @Column({ name: "institucion_id", type: "uuid" })
  institucionId!: string;

  @Column({ type: "varchar", nullable: true })
  nombre!: string | null;

  @Column()
  anio!: number;

  @Column({ name: "fecha_inicio", type: "date" })
  fechaInicio!: string;

  @Column({ name: "fecha_fin", type: "date" })
  fechaFin!: string;

  @Column()
  estado!: string;

  @Column({ name: "eliminado_en", type: "timestamptz", nullable: true })
  eliminadoEn!: Date | null;

  @Column({ default: 1 })
  version!: number;
}

@Entity({ name: "periodos_academicos" })
export class PeriodoAcademico extends BaseUuidEntity {
  @Column()
  codigo!: string;

  @Column({ name: "anio_lectivo_id", type: "uuid" })
  anioLectivoId!: string;

  @Column()
  nombre!: string;

  @Column({ name: "fecha_inicio", type: "date" })
  fechaInicio!: string;

  @Column({ name: "fecha_fin", type: "date" })
  fechaFin!: string;

  @Column({ name: "numero_secuencia", default: 1 })
  orden!: number;

  @Column()
  estado!: string;

  @Column({ name: "modo_cierre" })
  modoCierre!: string;

  @Column({ name: "cerrado_por_usuario_id", type: "uuid", nullable: true })
  cerradoPorUsuarioId!: string | null;

  @Column({ name: "eliminado_en", type: "timestamptz", nullable: true })
  eliminadoEn!: Date | null;

  @Column({ default: 1 })
  version!: number;
}

@Entity({ name: "configuraciones_institucion" })
export class ConfiguracionInstitucion extends BaseUuidEntity {
  @Column({ name: "institucion_id", type: "uuid" })
  institucionId!: string;

  @Column({ name: "logo_url", type: "text", nullable: true })
  logoUrl!: string | null;

  @Column({ name: "modelo_pedagogico", type: "varchar", nullable: true })
  modeloPedagogico!: string | null;

  @Column({ name: "enfoque_pedagogico", type: "varchar", nullable: true })
  enfoquePedagogico!: string | null;

  @Column({ name: "tipo_escala_valoracion" })
  tipoEscalaValoracion!: string;

  @Column({ name: "actualizado_por_usuario_id", type: "uuid", nullable: true })
  actualizadoPorUsuarioId!: string | null;

  @Column({ default: 1 })
  version!: number;

  @OneToOne(() => Institucion)
  @JoinColumn({ name: "institucion_id" })
  institucion!: Institucion;
}

@Entity({ name: "escalas_valoracion" })
export class EscalaValoracion extends BaseUuidEntity {
  @Column({ name: "institucion_id", type: "uuid" })
  institucionId!: string;

  @Column()
  nombre!: string;

  @Column()
  tipo!: string;

  @Column({ name: "valor_minimo", type: "numeric", nullable: true })
  valorMinimo!: string | null;

  @Column({ name: "valor_maximo", type: "numeric", nullable: true })
  valorMaximo!: string | null;

  @Column({ name: "valor_aprobacion", type: "numeric", nullable: true })
  valorAprobacion!: string | null;

  @Column({ name: "es_predeterminada", default: false })
  esPredeterminada!: boolean;

  @Column({ default: true })
  activo!: boolean;

  @OneToMany(() => NivelEscalaValoracion, (nivel) => nivel.escala)
  niveles!: NivelEscalaValoracion[];
}

@Entity({ name: "niveles_escala_valoracion" })
export class NivelEscalaValoracion extends BaseUuidEntity {
  @Column({ name: "escala_valoracion_id", type: "uuid" })
  escalaValoracionId!: string;

  @Column()
  nombre!: string;

  @Column({ name: "etiqueta_corta", type: "varchar", nullable: true })
  etiquetaCorta!: string | null;

  @Column({ name: "valor_minimo", type: "numeric" })
  valorMinimo!: string;

  @Column({ name: "valor_maximo", type: "numeric" })
  valorMaximo!: string;

  @Column({ default: 1 })
  orden!: number;

  @Column({ name: "color_hex", type: "varchar", nullable: true })
  colorHex!: string | null;

  @ManyToOne(() => EscalaValoracion, (escala) => escala.niveles)
  @JoinColumn({ name: "escala_valoracion_id" })
  escala!: EscalaValoracion;
}

@Entity({ name: "asignaturas" })
export class Asignatura extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column({ name: "institucion_id", type: "uuid" })
  institucionId!: string;

  @Column()
  nombre!: string;

  @Column({ default: true })
  activo!: boolean;
}

@Entity({ name: "grados" })
export class Grado extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column({ name: "institucion_id", type: "uuid" })
  institucionId!: string;

  @Column()
  nombre!: string;

  @Column({ name: "nombre_corto", type: "varchar", nullable: true })
  nombreCorto!: string | null;

  @Column({ name: "nivel_educativo" })
  nivelEducativo!: string;

  @Column()
  orden!: number;

  @Column({ default: true })
  activo!: boolean;

  @Column({ name: "eliminado_en", type: "timestamptz", nullable: true })
  eliminadoEn!: Date | null;

  @Column({ default: 1 })
  version!: number;
}

@Entity({ name: "jornadas" })
export class Jornada extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column({ name: "institucion_id", type: "uuid" })
  institucionId!: string;

  @Column()
  nombre!: string;

  @Column({ name: "hora_inicio", type: "time", nullable: true })
  horaInicio!: string | null;

  @Column({ name: "hora_fin", type: "time", nullable: true })
  horaFin!: string | null;

  @Column({ default: true })
  activo!: boolean;
}

@Entity({ name: "grupos" })
export class Grupo extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column({ name: "institucion_id", type: "uuid" })
  institucionId!: string;

  @Column({ name: "sede_id", type: "uuid" })
  sedeId!: string;

  @Column({ name: "anio_lectivo_id", type: "uuid" })
  anioLectivoId!: string;

  @Column({ name: "grado_id", type: "uuid" })
  gradoId!: string;

  @Column({ name: "jornada_id", type: "uuid" })
  jornadaId!: string;

  @Column()
  nombre!: string;

  @Column({ default: true })
  activo!: boolean;

  @Column({ name: "eliminado_en", type: "timestamptz", nullable: true })
  eliminadoEn!: Date | null;

  @Column({ default: 1 })
  version!: number;

  @ManyToOne(() => Sede)
  @JoinColumn({ name: "sede_id" })
  sede!: Sede;

  @ManyToOne(() => AnioLectivo)
  @JoinColumn({ name: "anio_lectivo_id" })
  anioLectivo!: AnioLectivo;

  @ManyToOne(() => Grado)
  @JoinColumn({ name: "grado_id" })
  grado!: Grado;

  @ManyToOne(() => Jornada)
  @JoinColumn({ name: "jornada_id" })
  jornada!: Jornada;
}

@Entity({ name: "planes_estudio_grados" })
export class PlanEstudioGrado extends BaseUuidEntity {
  @Column({ name: "anio_lectivo_id", type: "uuid" })
  anioLectivoId!: string;

  @Column({ name: "grado_id", type: "uuid" })
  gradoId!: string;

  @Column({ name: "asignatura_id", type: "uuid" })
  asignaturaId!: string;

  @Column({ name: "horas_semanales" })
  horasSemanales!: number;

  @Column({ default: true })
  activo!: boolean;

  @ManyToOne(() => AnioLectivo)
  @JoinColumn({ name: "anio_lectivo_id" })
  anioLectivo!: AnioLectivo;

  @ManyToOne(() => Grado)
  @JoinColumn({ name: "grado_id" })
  grado!: Grado;

  @ManyToOne(() => Asignatura)
  @JoinColumn({ name: "asignatura_id" })
  asignatura!: Asignatura;
}

@Entity({ name: "docentes" })
export class Docente extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column({ name: "institucion_id", type: "uuid" })
  institucionId!: string;

  @Column({ name: "persona_id", type: "uuid" })
  personaId!: string;

  @Column()
  estado!: string;

  @Column({ name: "eliminado_en", type: "timestamptz", nullable: true })
  eliminadoEn!: Date | null;

  @Column({ default: 1 })
  version!: number;

  @ManyToOne(() => Institucion)
  @JoinColumn({ name: "institucion_id" })
  institucion!: Institucion;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: "persona_id" })
  persona!: Persona;
}

@Entity({ name: "docentes_sedes" })
export class DocenteSede extends BaseUuidEntity {
  @Column({ name: "docente_id", type: "uuid" })
  docenteId!: string;

  @Column({ name: "sede_id", type: "uuid" })
  sedeId!: string;

  @Column({ name: "es_principal", default: false })
  esPrincipal!: boolean;

  @Column({ default: true })
  activo!: boolean;

  @ManyToOne(() => Docente)
  @JoinColumn({ name: "docente_id" })
  docente!: Docente;

  @ManyToOne(() => Sede)
  @JoinColumn({ name: "sede_id" })
  sede!: Sede;
}

@Entity({ name: "titulos_academicos_docente" })
export class TituloAcademicoDocente extends BaseUuidEntity {
  @Column({ name: "docente_id", type: "uuid" })
  docenteId!: string;

  @Column()
  titulo!: string;

  @Column({ name: "anio_obtencion", type: "integer", nullable: true })
  anioObtencion!: number | null;

  @Column({ name: "institucion_otorgante", type: "varchar", nullable: true })
  institucionOtorgante!: string | null;

  @Column({ type: "varchar", nullable: true })
  pais!: string | null;

  @Column({ name: "es_titulo_principal", default: false })
  esTituloPrincipal!: boolean;

  @ManyToOne(() => Docente)
  @JoinColumn({ name: "docente_id" })
  docente!: Docente;
}

@Entity({ name: "directores_grupo" })
export class DirectorGrupo extends BaseUuidEntity {
  @Column({ name: "grupo_id", type: "uuid" })
  grupoId!: string;

  @Column({ name: "docente_id", type: "uuid" })
  docenteId!: string;

  @Column({ default: true })
  activo!: boolean;

  @ManyToOne(() => Grupo)
  @JoinColumn({ name: "grupo_id" })
  grupo!: Grupo;

  @ManyToOne(() => Docente)
  @JoinColumn({ name: "docente_id" })
  docente!: Docente;
}

@Entity({ name: "administrativos" })
export class Administrativo extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column({ name: "institucion_id", type: "uuid" })
  institucionId!: string;

  @Column({ name: "persona_id", type: "uuid" })
  personaId!: string;

  @Column({ name: "tipo_empleado" })
  tipoEmpleado!: string;

  @Column()
  cargo!: string;

  @Column({ type: "varchar", nullable: true })
  dependencia!: string | null;

  @Column({ name: "fecha_vinculacion", type: "date", nullable: true })
  fechaVinculacion!: string | null;

  @Column()
  estado!: string;

  @Column({ name: "eliminado_en", type: "timestamptz", nullable: true })
  eliminadoEn!: Date | null;

  @Column({ default: 1 })
  version!: number;

  @ManyToOne(() => Institucion)
  @JoinColumn({ name: "institucion_id" })
  institucion!: Institucion;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: "persona_id" })
  persona!: Persona;
}

@Entity({ name: "directivos_docentes" })
export class DirectivoDocente extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column({ name: "institucion_id", type: "uuid" })
  institucionId!: string;

  @Column({ name: "docente_id", type: "uuid" })
  docenteId!: string;

  @Column()
  cargo!: string;

  @Column()
  estado!: string;

  @ManyToOne(() => Institucion)
  @JoinColumn({ name: "institucion_id" })
  institucion!: Institucion;

  @ManyToOne(() => Docente)
  @JoinColumn({ name: "docente_id" })
  docente!: Docente;
}

@Entity({ name: "cargas_academicas_docentes" })
export class CargaAcademicaDocente extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column({ name: "grupo_id", type: "uuid" })
  grupoId!: string;

  @Column({ name: "plan_estudio_grado_id", type: "uuid" })
  planEstudioGradoId!: string;

  @Column({ name: "docente_id", type: "uuid" })
  docenteId!: string;

  @Column({ default: true })
  activo!: boolean;

  @Column({ name: "eliminado_en", type: "timestamptz", nullable: true })
  eliminadoEn!: Date | null;

  @Column({ default: 1 })
  version!: number;

  @ManyToOne(() => Grupo)
  @JoinColumn({ name: "grupo_id" })
  grupo!: Grupo;

  @ManyToOne(() => PlanEstudioGrado)
  @JoinColumn({ name: "plan_estudio_grado_id" })
  planEstudioGrado!: PlanEstudioGrado;

  @ManyToOne(() => Docente)
  @JoinColumn({ name: "docente_id" })
  docente!: Docente;
}

@Entity({ name: "estudiantes" })
export class Estudiante extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column({ name: "persona_id", type: "uuid", unique: true })
  personaId!: string;

  @Column()
  estado!: string;

  @Column({ name: "fecha_ingreso", type: "date", nullable: true })
  fechaIngreso!: string | null;

  @Column({ name: "fecha_retiro", type: "date", nullable: true })
  fechaRetiro!: string | null;

  @Column({ name: "eliminado_en", type: "timestamptz", nullable: true })
  eliminadoEn!: Date | null;

  @Column({ default: 1 })
  version!: number;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: "persona_id" })
  persona!: Persona;
}

@Entity({ name: "acudientes" })
export class Acudiente extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column({ name: "persona_id", type: "uuid", unique: true })
  personaId!: string;

  @Column()
  estado!: string;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: "persona_id" })
  persona!: Persona;
}

@Entity({ name: "estudiantes_acudientes" })
export class EstudianteAcudiente extends BaseUuidEntity {
  @Column({ name: "estudiante_id", type: "uuid" })
  estudianteId!: string;

  @Column({ name: "acudiente_id", type: "uuid" })
  acudienteId!: string;

  @Column({ name: "tipo_parentesco" })
  tipoParentesco!: string;

  @Column({ name: "es_contacto_principal", default: false })
  esContactoPrincipal!: boolean;

  @Column({ name: "autorizado_recoger", default: false })
  autorizadoRecoger!: boolean;

  @Column({ name: "contacto_emergencia", default: false })
  contactoEmergencia!: boolean;

  @Column({ name: "convive_con_estudiante", default: false })
  conviveConEstudiante!: boolean;

  @Column({ name: "es_responsable_legal", default: false })
  esResponsableLegal!: boolean;

  @Column({ name: "es_responsable_financiero", default: false })
  esResponsableFinanciero!: boolean;

  @Column({ name: "autorizado_por_padre", default: false })
  autorizadoPorPadre!: boolean;

  @Column({ type: "varchar", nullable: true })
  observaciones!: string | null;

  @Column({ default: true })
  activo!: boolean;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: "estudiante_id" })
  estudiante!: Estudiante;

  @ManyToOne(() => Acudiente)
  @JoinColumn({ name: "acudiente_id" })
  acudiente!: Acudiente;
}

@Entity({ name: "matriculas" })
export class Matricula extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column({ name: "institucion_id", type: "uuid" })
  institucionId!: string;

  @Column({ name: "estudiante_id", type: "uuid" })
  estudianteId!: string;

  @Column({ name: "acudiente_id", type: "uuid", nullable: true })
  acudienteId!: string | null;

  @Column({ name: "anio_lectivo_id", type: "uuid" })
  anioLectivoId!: string;

  @Column({ name: "sede_id", type: "uuid" })
  sedeId!: string;

  @Column({ name: "jornada_id", type: "uuid" })
  jornadaId!: string;

  @Column({ name: "grado_id", type: "uuid" })
  gradoId!: string;

  @Column()
  estado!: string;

  @Column({ name: "fecha_matricula", type: "date" })
  fechaMatricula!: string;

  @Column({ name: "fecha_limite_acudiente", type: "date", nullable: true })
  fechaLimiteAcudiente!: string | null;

  @Column({
    name: "motivo_pendiente_acudiente",
    type: "text",
    nullable: true,
  })
  motivoPendienteAcudiente!: string | null;

  @Column({
    name: "acudiente_completado_en",
    type: "timestamptz",
    nullable: true,
  })
  acudienteCompletadoEn!: Date | null;

  @Column({ name: "fecha_retiro", type: "date", nullable: true })
  fechaRetiro!: string | null;

  @Column({ name: "motivo_retiro", type: "varchar", nullable: true })
  motivoRetiro!: string | null;

  @Column({ name: "matricula_origen_id", type: "uuid", nullable: true })
  matriculaOrigenId!: string | null;

  @Column({ name: "traslado_entrante_id", type: "uuid", nullable: true })
  trasladoEntranteId!: string | null;

  @Column({ name: "eliminado_en", type: "timestamptz", nullable: true })
  eliminadoEn!: Date | null;

  @Column({ default: 1 })
  version!: number;

  @ManyToOne(() => Institucion)
  @JoinColumn({ name: "institucion_id" })
  institucion!: Institucion;

  @ManyToOne(() => Estudiante)
  @JoinColumn({ name: "estudiante_id" })
  estudiante!: Estudiante;

  @ManyToOne(() => Acudiente, { nullable: true })
  @JoinColumn({ name: "acudiente_id" })
  acudiente!: Acudiente | null;

  @ManyToOne(() => AnioLectivo)
  @JoinColumn({ name: "anio_lectivo_id" })
  anioLectivo!: AnioLectivo;

  @ManyToOne(() => Sede)
  @JoinColumn({ name: "sede_id" })
  sede!: Sede;

  @ManyToOne(() => Jornada)
  @JoinColumn({ name: "jornada_id" })
  jornada!: Jornada;

  @ManyToOne(() => Grado)
  @JoinColumn({ name: "grado_id" })
  grado!: Grado;
}

@Entity({ name: "asignaciones_estudiantes_grupos" })
export class AsignacionEstudianteGrupo extends BaseUuidEntity {
  @Column({ name: "matricula_id", type: "uuid" })
  matriculaId!: string;

  @Column({ name: "grupo_id", type: "uuid" })
  grupoId!: string;

  @Column({ name: "fecha_asignacion", type: "date" })
  fechaAsignacion!: string;

  @Column()
  estado!: string;

  @Column({ type: "varchar", nullable: true })
  observaciones!: string | null;

  @ManyToOne(() => Matricula)
  @JoinColumn({ name: "matricula_id" })
  matricula!: Matricula;

  @ManyToOne(() => Grupo)
  @JoinColumn({ name: "grupo_id" })
  grupo!: Grupo;
}

@Entity({ name: "traslados_estudiantiles" })
export class TrasladoEstudiantil extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column({ name: "estudiante_id", type: "uuid" })
  estudianteId!: string;

  @Column({ name: "institucion_origen_id", type: "uuid", nullable: true })
  institucionOrigenId!: string | null;

  @Column({ name: "sede_origen_id", type: "uuid", nullable: true })
  sedeOrigenId!: string | null;

  @Column({ name: "grado_origen_id", type: "uuid", nullable: true })
  gradoOrigenId!: string | null;

  @Column({ name: "jornada_origen_id", type: "uuid", nullable: true })
  jornadaOrigenId!: string | null;

  @Column({ name: "grupo_origen_id", type: "uuid", nullable: true })
  grupoOrigenId!: string | null;

  @Column({ name: "matricula_origen_id", type: "uuid", nullable: true })
  matriculaOrigenId!: string | null;

  @Column({ name: "institucion_destino_id", type: "uuid", nullable: true })
  institucionDestinoId!: string | null;

  @Column({ name: "sede_destino_id", type: "uuid", nullable: true })
  sedeDestinoId!: string | null;

  @Column({ name: "anio_lectivo_destino_id", type: "uuid", nullable: true })
  anioLectivoDestinoId!: string | null;

  @Column({ name: "grado_destino_id", type: "uuid", nullable: true })
  gradoDestinoId!: string | null;

  @Column({ name: "jornada_destino_id", type: "uuid", nullable: true })
  jornadaDestinoId!: string | null;

  @Column({ name: "grupo_destino_id", type: "uuid", nullable: true })
  grupoDestinoId!: string | null;

  @Column({ name: "tipo_traslado" })
  tipoTraslado!: string;

  @Column({ name: "motivo_traslado", type: "varchar", nullable: true })
  motivoTraslado!: string | null;

  @Column({ name: "fecha_solicitud", type: "date" })
  fechaSolicitud!: string;

  @Column({ name: "fecha_aprobacion", type: "date", nullable: true })
  fechaAprobacion!: string | null;

  @Column({ name: "fecha_efectiva", type: "date", nullable: true })
  fechaEfectiva!: string | null;

  @Column()
  estado!: string;

  @Column({ type: "text", nullable: true })
  observaciones!: string | null;

  @Column({ name: "aprobado_por_usuario_id", type: "uuid", nullable: true })
  aprobadoPorUsuarioId!: string | null;
}

@Entity({ name: "sesiones_asistencia" })
export class SesionAsistencia extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column({ name: "institucion_id", type: "uuid" })
  institucionId!: string;

  @Column({ name: "grupo_id", type: "uuid" })
  grupoId!: string;

  @Column({ name: "carga_academica_docente_id", type: "uuid", nullable: true })
  cargaAcademicaDocenteId!: string | null;

  @Column({ type: "date" })
  fecha!: string;

  @Column({ name: "numero_sesion", type: "smallint", default: 1 })
  numeroSesion!: number;

  @Column()
  tipo!: string;

  @Column({ name: "hora_inicio", type: "time", nullable: true })
  horaInicio!: string | null;

  @Column()
  estado!: string;

  @Column({ name: "registrado_por_usuario_id", type: "uuid" })
  registradoPorUsuarioId!: string;

  @Column({ name: "cerrado_por_usuario_id", type: "uuid", nullable: true })
  cerradoPorUsuarioId!: string | null;

  @Column({ name: "cerrado_en", type: "timestamptz", nullable: true })
  cerradoEn!: Date | null;

  @Column({ type: "text", nullable: true })
  observaciones!: string | null;

  @Column({ name: "eliminado_en", type: "timestamptz", nullable: true })
  eliminadoEn!: Date | null;

  @Column({ default: 1 })
  version!: number;

  @ManyToOne(() => Grupo)
  @JoinColumn({ name: "grupo_id" })
  grupo!: Grupo;

  @ManyToOne(() => CargaAcademicaDocente, { nullable: true })
  @JoinColumn({ name: "carga_academica_docente_id" })
  cargaAcademicaDocente!: CargaAcademicaDocente | null;
}

@Entity({ name: "registros_asistencia" })
export class RegistroAsistencia extends BaseUuidEntity {
  @Column({ name: "sesion_asistencia_id", type: "uuid" })
  sesionAsistenciaId!: string;

  @Column({ name: "matricula_id", type: "uuid" })
  matriculaId!: string;

  @Column()
  estado!: string;

  @Column({ name: "minutos_retraso", type: "smallint", default: 0 })
  minutosRetraso!: number;

  @Column({ type: "text", nullable: true })
  observaciones!: string | null;

  @Column({ name: "registrado_por_usuario_id", type: "uuid" })
  registradoPorUsuarioId!: string;

  @ManyToOne(() => SesionAsistencia)
  @JoinColumn({ name: "sesion_asistencia_id" })
  sesionAsistencia!: SesionAsistencia;

  @ManyToOne(() => Matricula)
  @JoinColumn({ name: "matricula_id" })
  matricula!: Matricula;
}

export const DATABASE_ENTITIES = [
  Acudiente,
  Administrativo,
  AnioLectivo,
  AsignacionEstudianteGrupo,
  Asignatura,
  CargaAcademicaDocente,
  ConfiguracionInstitucion,
  Docente,
  DocenteSede,
  DirectorGrupo,
  DirectivoDocente,
  EscalaValoracion,
  Estudiante,
  EstudianteAcudiente,
  Genero,
  Grado,
  Grupo,
  Institucion,
  Jornada,
  Matricula,
  MetodoAutenticacionUsuario,
  NivelEscalaValoracion,
  PerfilUsuario,
  Permiso,
  PeriodoAcademico,
  PlanEstudioGrado,
  Persona,
  ProveedorAutenticacion,
  RegistroAsistencia,
  Rol,
  RolPermiso,
  RolUsuario,
  Sede,
  SesionUsuario,
  SesionAsistencia,
  TipoDocumento,
  TipoPerfil,
  TituloAcademicoDocente,
  TokenRecuperacionContrasena,
  TrasladoEstudiantil,
  Usuario,
] as const;
