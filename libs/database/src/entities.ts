import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseUuidEntity } from './base.entity';

@Entity({ name: 'tipos_documento' })
export class TipoDocumento extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column()
  nombre!: string;

  @Column({ default: true })
  activo!: boolean;
}

@Entity({ name: 'generos' })
export class Genero extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column()
  nombre!: string;

  @Column({ default: true })
  activo!: boolean;
}

@Entity({ name: 'personas' })
export class Persona extends BaseUuidEntity {
  @Column()
  codigo!: string;

  @Column({ name: 'tipo_documento_id', type: 'uuid' })
  tipoDocumentoId!: string;

  @Column({ name: 'genero_id', type: 'uuid', nullable: true })
  generoId!: string | null;

  @Column({ name: 'numero_documento' })
  numeroDocumento!: string;

  @Column({ name: 'primer_nombre' })
  primerNombre!: string;

  @Column({ name: 'segundo_nombre', type: 'varchar', nullable: true })
  segundoNombre!: string | null;

  @Column({ name: 'primer_apellido' })
  primerApellido!: string;

  @Column({ name: 'segundo_apellido', type: 'varchar', nullable: true })
  segundoApellido!: string | null;

  @Column({ name: 'correo_personal', type: 'varchar', nullable: true })
  correoPersonal!: string | null;

  @Column({ name: 'correo_institucional', type: 'varchar', nullable: true })
  correoInstitucional!: string | null;

  @Column({ type: 'varchar', nullable: true })
  telefono!: string | null;

  @Column({ default: true })
  activo!: boolean;

  @Column({ name: 'eliminado_en', type: 'timestamptz', nullable: true })
  eliminadoEn!: Date | null;

  @Column({ default: 1 })
  version!: number;

  @ManyToOne(() => TipoDocumento)
  @JoinColumn({ name: 'tipo_documento_id' })
  tipoDocumento!: TipoDocumento;

  @ManyToOne(() => Genero, { nullable: true })
  @JoinColumn({ name: 'genero_id' })
  genero!: Genero | null;
}

@Entity({ name: 'instituciones' })
export class Institucion extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column()
  nombre!: string;

  @Column({ default: true })
  activo!: boolean;

  @Column({ name: 'eliminado_en', type: 'timestamptz', nullable: true })
  eliminadoEn!: Date | null;

  @Column({ default: 1 })
  version!: number;
}

@Entity({ name: 'usuarios' })
export class Usuario extends BaseUuidEntity {
  @Column()
  codigo!: string;

  @Column({ name: 'persona_id', type: 'uuid' })
  personaId!: string;

  @Column({ name: 'institucion_id', type: 'uuid', nullable: true })
  institucionId!: string | null;

  @Column({ unique: true })
  correo!: string;

  @Column({ name: 'hash_contrasena', type: 'text' })
  hashContrasena!: string;

  @Column({ name: 'debe_cambiar_contrasena', default: true })
  debeCambiarContrasena!: boolean;

  @Column({ name: 'correo_verificado', default: false })
  correoVerificado!: boolean;

  @Column()
  estado!: string;

  @Column({ name: 'ultimo_inicio_sesion_en', type: 'timestamptz', nullable: true })
  ultimoInicioSesionEn!: Date | null;

  @Column({
    name: 'ultima_actualizacion_contrasena_en',
    type: 'timestamptz',
    nullable: true,
  })
  ultimaActualizacionContrasenaEn!: Date | null;

  @Column({ name: 'intentos_fallidos_inicio', default: 0 })
  intentosFallidosInicio!: number;

  @Column({ name: 'bloqueado_hasta', type: 'timestamptz', nullable: true })
  bloqueadoHasta!: Date | null;

  @Column({ name: 'eliminado_en', type: 'timestamptz', nullable: true })
  eliminadoEn!: Date | null;

  @Column({ default: 1 })
  version!: number;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: 'persona_id' })
  persona!: Persona;

  @ManyToOne(() => Institucion, { nullable: true })
  @JoinColumn({ name: 'institucion_id' })
  institucion!: Institucion | null;
}

@Entity({ name: 'tipos_perfil' })
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

@Entity({ name: 'perfiles_usuario' })
export class PerfilUsuario extends BaseUuidEntity {
  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId!: string;

  @Column({ name: 'tipo_perfil_id', type: 'uuid' })
  tipoPerfilId!: string;

  @Column({ default: true })
  activo!: boolean;

  @Column({ name: 'sede_id', type: 'uuid', nullable: true })
  sedeId!: string | null;

  @Column({ name: 'es_predeterminado', default: false })
  predeterminado!: boolean;

  @Column({ name: 'asignado_por_usuario_id', type: 'uuid', nullable: true })
  asignadoPorUsuarioId!: string | null;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @ManyToOne(() => TipoPerfil)
  @JoinColumn({ name: 'tipo_perfil_id' })
  tipoPerfil!: TipoPerfil;
}

@Entity({ name: 'roles' })
export class Rol extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column()
  nombre!: string;

  @Column({ default: true })
  activo!: boolean;
}

@Entity({ name: 'roles_usuario' })
export class RolUsuario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId!: string;

  @Column({ name: 'rol_id', type: 'uuid' })
  rolId!: string;

  @Column({ name: 'sede_id', type: 'uuid', nullable: true })
  sedeId!: string | null;

  @Column({ name: 'asignado_por_usuario_id', type: 'uuid', nullable: true })
  asignadoPorUsuarioId!: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @ManyToOne(() => Rol)
  @JoinColumn({ name: 'rol_id' })
  rol!: Rol;
}

@Entity({ name: 'permisos' })
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

@Entity({ name: 'roles_permisos' })
export class RolPermiso {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'rol_id', type: 'uuid' })
  rolId!: string;

  @Column({ name: 'permiso_id', type: 'uuid' })
  permisoId!: string;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Rol)
  @JoinColumn({ name: 'rol_id' })
  rol!: Rol;

  @ManyToOne(() => Permiso)
  @JoinColumn({ name: 'permiso_id' })
  permiso!: Permiso;
}

@Entity({ name: 'proveedores_autenticacion' })
export class ProveedorAutenticacion extends BaseUuidEntity {
  @Column({ unique: true })
  codigo!: string;

  @Column()
  nombre!: string;

  @Column({ default: true })
  activo!: boolean;
}

@Entity({ name: 'metodos_autenticacion_usuario' })
export class MetodoAutenticacionUsuario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId!: string;

  @Column({ name: 'proveedor_autenticacion_id', type: 'uuid' })
  proveedorAutenticacionId!: string;

  @Column({ name: 'identificador_proveedor', type: 'varchar', nullable: true })
  identificadorProveedor!: string | null;

  @Column({ name: 'correo_proveedor', type: 'varchar', nullable: true })
  correoProveedor!: string | null;

  @Column({ name: 'es_principal', default: false })
  esPrincipal!: boolean;

  @Column({ default: false })
  verificado!: boolean;

  @Column({ default: true })
  activo!: boolean;

  @Column({ name: 'ultimo_uso_en', type: 'timestamptz', nullable: true })
  ultimoUsoEn!: Date | null;

  @Column({ name: 'metadatos_json', type: 'jsonb', nullable: true })
  metadatosJson!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario!: Usuario;

  @ManyToOne(() => ProveedorAutenticacion)
  @JoinColumn({ name: 'proveedor_autenticacion_id' })
  proveedor!: ProveedorAutenticacion;
}

@Entity({ name: 'tokens_recuperacion_contrasena' })
export class TokenRecuperacionContrasena {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId!: string;

  @Column({ name: 'hash_token', type: 'text' })
  tokenHash!: string;

  @Column({ name: 'expira_en', type: 'timestamptz' })
  expiraAt!: Date;

  @Column({ name: 'usado_en', type: 'timestamptz', nullable: true })
  usadoAt!: Date | null;

  @Column({ name: 'ip_solicitud', type: 'inet', nullable: true })
  ipSolicitud!: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity({ name: 'sesiones_usuario' })
export class SesionUsuario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId!: string;

  @Column({ name: 'perfil_usuario_id', type: 'uuid', nullable: true })
  perfilUsuarioId!: string | null;

  @Column({ name: 'identificador_token_acceso' })
  identificadorTokenAcceso!: string;

  @Column({ name: 'identificador_token_refresco', type: 'varchar', nullable: true })
  identificadorTokenRefresco!: string | null;

  @Column({ name: 'tipo_dispositivo', type: 'varchar', nullable: true })
  tipoDispositivo!: string | null;

  @Column({ type: 'varchar', nullable: true })
  plataforma!: string | null;

  @Column({ name: 'version_app', type: 'varchar', nullable: true })
  versionApp!: string | null;

  @Column({ type: 'inet', nullable: true })
  ip!: string | null;

  @Column({ name: 'agente_usuario', type: 'text', nullable: true })
  agenteUsuario!: string | null;

  @Column({ name: 'iniciada_en', type: 'timestamptz' })
  iniciadaEn!: Date;

  @Column({ name: 'ultima_actividad_en', type: 'timestamptz', nullable: true })
  ultimaActividadEn!: Date | null;

  @Column({ name: 'revocada_en', type: 'timestamptz', nullable: true })
  revocadaEn!: Date | null;

  @Column({ name: 'motivo_revocacion', type: 'varchar', nullable: true })
  motivoRevocacion!: string | null;
}

@Entity({ name: 'sedes' })
export class Sede extends BaseUuidEntity {
  @Column()
  codigo!: string;

  @Column({ name: 'institucion_id', type: 'uuid' })
  institucionId!: string;

  @Column()
  nombre!: string;

  @Column({ default: true })
  activo!: boolean;

  @Column({ name: 'eliminado_en', type: 'timestamptz', nullable: true })
  eliminadoEn!: Date | null;

  @Column({ default: 1 })
  version!: number;
}

@Entity({ name: 'anios_lectivos' })
export class AnioLectivo extends BaseUuidEntity {
  @Column()
  codigo!: string;

  @Column({ name: 'institucion_id', type: 'uuid' })
  institucionId!: string;

  @Column({ type: 'varchar', nullable: true })
  nombre!: string | null;

  @Column()
  anio!: number;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio!: string;

  @Column({ name: 'fecha_fin', type: 'date' })
  fechaFin!: string;

  @Column()
  estado!: string;

  @Column({ name: 'eliminado_en', type: 'timestamptz', nullable: true })
  eliminadoEn!: Date | null;

  @Column({ default: 1 })
  version!: number;
}

@Entity({ name: 'periodos_academicos' })
export class PeriodoAcademico extends BaseUuidEntity {
  @Column()
  codigo!: string;

  @Column({ name: 'anio_lectivo_id', type: 'uuid' })
  anioLectivoId!: string;

  @Column()
  nombre!: string;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio!: string;

  @Column({ name: 'fecha_fin', type: 'date' })
  fechaFin!: string;

  @Column({ name: 'numero_secuencia', default: 1 })
  orden!: number;

  @Column()
  estado!: string;

  @Column({ name: 'modo_cierre' })
  modoCierre!: string;

  @Column({ name: 'cerrado_por_usuario_id', type: 'uuid', nullable: true })
  cerradoPorUsuarioId!: string | null;

  @Column({ name: 'eliminado_en', type: 'timestamptz', nullable: true })
  eliminadoEn!: Date | null;

  @Column({ default: 1 })
  version!: number;
}

@Entity({ name: 'configuraciones_institucion' })
export class ConfiguracionInstitucion extends BaseUuidEntity {
  @Column({ name: 'institucion_id', type: 'uuid' })
  institucionId!: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl!: string | null;

  @Column({ name: 'modelo_pedagogico', type: 'varchar', nullable: true })
  modeloPedagogico!: string | null;

  @Column({ name: 'enfoque_pedagogico', type: 'varchar', nullable: true })
  enfoquePedagogico!: string | null;

  @Column({ name: 'tipo_escala_valoracion' })
  tipoEscalaValoracion!: string;

  @Column({ name: 'actualizado_por_usuario_id', type: 'uuid', nullable: true })
  actualizadoPorUsuarioId!: string | null;

  @Column({ default: 1 })
  version!: number;

  @OneToOne(() => Institucion)
  @JoinColumn({ name: 'institucion_id' })
  institucion!: Institucion;
}

@Entity({ name: 'escalas_valoracion' })
export class EscalaValoracion extends BaseUuidEntity {
  @Column({ name: 'institucion_id', type: 'uuid' })
  institucionId!: string;

  @Column()
  nombre!: string;

  @Column()
  tipo!: string;

  @Column({ name: 'valor_minimo', type: 'numeric', nullable: true })
  valorMinimo!: string | null;

  @Column({ name: 'valor_maximo', type: 'numeric', nullable: true })
  valorMaximo!: string | null;

  @Column({ name: 'valor_aprobacion', type: 'numeric', nullable: true })
  valorAprobacion!: string | null;

  @Column({ name: 'es_predeterminada', default: false })
  esPredeterminada!: boolean;

  @Column({ default: true })
  activo!: boolean;

  @OneToMany(() => NivelEscalaValoracion, (nivel) => nivel.escala)
  niveles!: NivelEscalaValoracion[];
}

@Entity({ name: 'niveles_escala_valoracion' })
export class NivelEscalaValoracion extends BaseUuidEntity {
  @Column({ name: 'escala_valoracion_id', type: 'uuid' })
  escalaValoracionId!: string;

  @Column()
  nombre!: string;

  @Column({ name: 'etiqueta_corta', type: 'varchar', nullable: true })
  etiquetaCorta!: string | null;

  @Column({ name: 'valor_minimo', type: 'numeric' })
  valorMinimo!: string;

  @Column({ name: 'valor_maximo', type: 'numeric' })
  valorMaximo!: string;

  @Column({ default: 1 })
  orden!: number;

  @Column({ name: 'color_hex', type: 'varchar', nullable: true })
  colorHex!: string | null;

  @ManyToOne(() => EscalaValoracion, (escala) => escala.niveles)
  @JoinColumn({ name: 'escala_valoracion_id' })
  escala!: EscalaValoracion;
}

export const DATABASE_ENTITIES = [
  AnioLectivo,
  ConfiguracionInstitucion,
  EscalaValoracion,
  Genero,
  Institucion,
  MetodoAutenticacionUsuario,
  NivelEscalaValoracion,
  PerfilUsuario,
  Permiso,
  PeriodoAcademico,
  Persona,
  ProveedorAutenticacion,
  Rol,
  RolPermiso,
  RolUsuario,
  Sede,
  SesionUsuario,
  TipoDocumento,
  TipoPerfil,
  TokenRecuperacionContrasena,
  Usuario,
] as const;
