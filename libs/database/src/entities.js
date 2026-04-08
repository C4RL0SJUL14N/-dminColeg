"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATABASE_ENTITIES = exports.NivelEscalaValoracion = exports.EscalaValoracion = exports.ConfiguracionInstitucion = exports.PeriodoAcademico = exports.AnioLectivo = exports.Sede = exports.SesionUsuario = exports.TokenRecuperacionContrasena = exports.MetodoAutenticacionUsuario = exports.ProveedorAutenticacion = exports.RolPermiso = exports.Permiso = exports.RolUsuario = exports.Rol = exports.PerfilUsuario = exports.TipoPerfil = exports.Usuario = exports.Institucion = exports.Persona = exports.Genero = exports.TipoDocumento = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
let TipoDocumento = class TipoDocumento extends base_entity_1.BaseUuidEntity {
};
exports.TipoDocumento = TipoDocumento;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], TipoDocumento.prototype, "codigo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TipoDocumento.prototype, "nombre", void 0);
exports.TipoDocumento = TipoDocumento = __decorate([
    (0, typeorm_1.Entity)({ name: 'tipos_documento' })
], TipoDocumento);
let Genero = class Genero extends base_entity_1.BaseUuidEntity {
};
exports.Genero = Genero;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Genero.prototype, "codigo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Genero.prototype, "nombre", void 0);
exports.Genero = Genero = __decorate([
    (0, typeorm_1.Entity)({ name: 'generos' })
], Genero);
let Persona = class Persona extends base_entity_1.BaseUuidEntity {
};
exports.Persona = Persona;
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_documento_id', type: 'uuid' }),
    __metadata("design:type", String)
], Persona.prototype, "tipoDocumentoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'genero_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Persona.prototype, "generoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'numero_documento' }),
    __metadata("design:type", String)
], Persona.prototype, "numeroDocumento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'primer_nombre' }),
    __metadata("design:type", String)
], Persona.prototype, "primerNombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'segundo_nombre', nullable: true }),
    __metadata("design:type", Object)
], Persona.prototype, "segundoNombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'primer_apellido' }),
    __metadata("design:type", String)
], Persona.prototype, "primerApellido", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'segundo_apellido', nullable: true }),
    __metadata("design:type", Object)
], Persona.prototype, "segundoApellido", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'correo_electronico', nullable: true }),
    __metadata("design:type", Object)
], Persona.prototype, "correoElectronico", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], Persona.prototype, "telefono", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TipoDocumento),
    (0, typeorm_1.JoinColumn)({ name: 'tipo_documento_id' }),
    __metadata("design:type", TipoDocumento)
], Persona.prototype, "tipoDocumento", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Genero, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'genero_id' }),
    __metadata("design:type", Object)
], Persona.prototype, "genero", void 0);
exports.Persona = Persona = __decorate([
    (0, typeorm_1.Entity)({ name: 'personas' })
], Persona);
let Institucion = class Institucion extends base_entity_1.BaseUuidEntity {
};
exports.Institucion = Institucion;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Institucion.prototype, "codigo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Institucion.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], Institucion.prototype, "nit", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Institucion.prototype, "activo", void 0);
exports.Institucion = Institucion = __decorate([
    (0, typeorm_1.Entity)({ name: 'instituciones' })
], Institucion);
let Usuario = class Usuario extends base_entity_1.BaseUuidEntity {
};
exports.Usuario = Usuario;
__decorate([
    (0, typeorm_1.Column)({ name: 'persona_id', type: 'uuid' }),
    __metadata("design:type", String)
], Usuario.prototype, "personaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'institucion_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Usuario.prototype, "institucionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Usuario.prototype, "correo", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Usuario.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'debe_cambiar_contrasena', default: true }),
    __metadata("design:type", Boolean)
], Usuario.prototype, "debeCambiarContrasena", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'superadministrador', default: false }),
    __metadata("design:type", Boolean)
], Usuario.prototype, "superadministrador", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ultimo_acceso_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Usuario.prototype, "ultimoAccesoAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Persona),
    (0, typeorm_1.JoinColumn)({ name: 'persona_id' }),
    __metadata("design:type", Persona)
], Usuario.prototype, "persona", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Institucion, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'institucion_id' }),
    __metadata("design:type", Object)
], Usuario.prototype, "institucion", void 0);
exports.Usuario = Usuario = __decorate([
    (0, typeorm_1.Entity)({ name: 'usuarios' })
], Usuario);
let TipoPerfil = class TipoPerfil extends base_entity_1.BaseUuidEntity {
};
exports.TipoPerfil = TipoPerfil;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], TipoPerfil.prototype, "codigo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TipoPerfil.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'es_funcional', default: true }),
    __metadata("design:type", Boolean)
], TipoPerfil.prototype, "esFuncional", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], TipoPerfil.prototype, "activo", void 0);
exports.TipoPerfil = TipoPerfil = __decorate([
    (0, typeorm_1.Entity)({ name: 'tipos_perfil' })
], TipoPerfil);
let PerfilUsuario = class PerfilUsuario extends base_entity_1.BaseUuidEntity {
};
exports.PerfilUsuario = PerfilUsuario;
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_id', type: 'uuid' }),
    __metadata("design:type", String)
], PerfilUsuario.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_perfil_id', type: 'uuid' }),
    __metadata("design:type", String)
], PerfilUsuario.prototype, "tipoPerfilId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], PerfilUsuario.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], PerfilUsuario.prototype, "visible", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], PerfilUsuario.prototype, "predeterminado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Usuario),
    (0, typeorm_1.JoinColumn)({ name: 'usuario_id' }),
    __metadata("design:type", Usuario)
], PerfilUsuario.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TipoPerfil),
    (0, typeorm_1.JoinColumn)({ name: 'tipo_perfil_id' }),
    __metadata("design:type", TipoPerfil)
], PerfilUsuario.prototype, "tipoPerfil", void 0);
exports.PerfilUsuario = PerfilUsuario = __decorate([
    (0, typeorm_1.Entity)({ name: 'perfiles_usuario' })
], PerfilUsuario);
let Rol = class Rol extends base_entity_1.BaseUuidEntity {
};
exports.Rol = Rol;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Rol.prototype, "codigo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Rol.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'es_global', default: false }),
    __metadata("design:type", Boolean)
], Rol.prototype, "esGlobal", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Rol.prototype, "activo", void 0);
exports.Rol = Rol = __decorate([
    (0, typeorm_1.Entity)({ name: 'roles' })
], Rol);
let RolUsuario = class RolUsuario extends base_entity_1.BaseUuidEntity {
};
exports.RolUsuario = RolUsuario;
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_id', type: 'uuid' }),
    __metadata("design:type", String)
], RolUsuario.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rol_id', type: 'uuid' }),
    __metadata("design:type", String)
], RolUsuario.prototype, "rolId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], RolUsuario.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Usuario),
    (0, typeorm_1.JoinColumn)({ name: 'usuario_id' }),
    __metadata("design:type", Usuario)
], RolUsuario.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Rol),
    (0, typeorm_1.JoinColumn)({ name: 'rol_id' }),
    __metadata("design:type", Rol)
], RolUsuario.prototype, "rol", void 0);
exports.RolUsuario = RolUsuario = __decorate([
    (0, typeorm_1.Entity)({ name: 'roles_usuario' })
], RolUsuario);
let Permiso = class Permiso extends base_entity_1.BaseUuidEntity {
};
exports.Permiso = Permiso;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Permiso.prototype, "codigo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Permiso.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], Permiso.prototype, "descripcion", void 0);
exports.Permiso = Permiso = __decorate([
    (0, typeorm_1.Entity)({ name: 'permisos' })
], Permiso);
let RolPermiso = class RolPermiso extends base_entity_1.BaseUuidEntity {
};
exports.RolPermiso = RolPermiso;
__decorate([
    (0, typeorm_1.Column)({ name: 'rol_id', type: 'uuid' }),
    __metadata("design:type", String)
], RolPermiso.prototype, "rolId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'permiso_id', type: 'uuid' }),
    __metadata("design:type", String)
], RolPermiso.prototype, "permisoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Rol),
    (0, typeorm_1.JoinColumn)({ name: 'rol_id' }),
    __metadata("design:type", Rol)
], RolPermiso.prototype, "rol", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Permiso),
    (0, typeorm_1.JoinColumn)({ name: 'permiso_id' }),
    __metadata("design:type", Permiso)
], RolPermiso.prototype, "permiso", void 0);
exports.RolPermiso = RolPermiso = __decorate([
    (0, typeorm_1.Entity)({ name: 'roles_permisos' })
], RolPermiso);
let ProveedorAutenticacion = class ProveedorAutenticacion extends base_entity_1.BaseUuidEntity {
};
exports.ProveedorAutenticacion = ProveedorAutenticacion;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], ProveedorAutenticacion.prototype, "codigo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProveedorAutenticacion.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'oidc_issuer', nullable: true }),
    __metadata("design:type", Object)
], ProveedorAutenticacion.prototype, "oidcIssuer", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ProveedorAutenticacion.prototype, "activo", void 0);
exports.ProveedorAutenticacion = ProveedorAutenticacion = __decorate([
    (0, typeorm_1.Entity)({ name: 'proveedores_autenticacion' })
], ProveedorAutenticacion);
let MetodoAutenticacionUsuario = class MetodoAutenticacionUsuario extends base_entity_1.BaseUuidEntity {
};
exports.MetodoAutenticacionUsuario = MetodoAutenticacionUsuario;
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_id', type: 'uuid' }),
    __metadata("design:type", String)
], MetodoAutenticacionUsuario.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'proveedor_autenticacion_id', type: 'uuid' }),
    __metadata("design:type", String)
], MetodoAutenticacionUsuario.prototype, "proveedorAutenticacionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hash_contrasena', nullable: true }),
    __metadata("design:type", Object)
], MetodoAutenticacionUsuario.prototype, "hashContrasena", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'refresh_token_hash', nullable: true }),
    __metadata("design:type", Object)
], MetodoAutenticacionUsuario.prototype, "refreshTokenHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'intentos_fallidos', default: 0 }),
    __metadata("design:type", Number)
], MetodoAutenticacionUsuario.prototype, "intentosFallidos", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bloqueado_hasta', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], MetodoAutenticacionUsuario.prototype, "bloqueadoHasta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ultimo_login_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], MetodoAutenticacionUsuario.prototype, "ultimoLoginAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], MetodoAutenticacionUsuario.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Usuario),
    (0, typeorm_1.JoinColumn)({ name: 'usuario_id' }),
    __metadata("design:type", Usuario)
], MetodoAutenticacionUsuario.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ProveedorAutenticacion),
    (0, typeorm_1.JoinColumn)({ name: 'proveedor_autenticacion_id' }),
    __metadata("design:type", ProveedorAutenticacion)
], MetodoAutenticacionUsuario.prototype, "proveedor", void 0);
exports.MetodoAutenticacionUsuario = MetodoAutenticacionUsuario = __decorate([
    (0, typeorm_1.Entity)({ name: 'metodos_autenticacion_usuario' })
], MetodoAutenticacionUsuario);
let TokenRecuperacionContrasena = class TokenRecuperacionContrasena extends base_entity_1.BaseUuidEntity {
};
exports.TokenRecuperacionContrasena = TokenRecuperacionContrasena;
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_id', type: 'uuid' }),
    __metadata("design:type", String)
], TokenRecuperacionContrasena.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'token_hash' }),
    __metadata("design:type", String)
], TokenRecuperacionContrasena.prototype, "tokenHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expira_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], TokenRecuperacionContrasena.prototype, "expiraAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usado_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], TokenRecuperacionContrasena.prototype, "usadoAt", void 0);
exports.TokenRecuperacionContrasena = TokenRecuperacionContrasena = __decorate([
    (0, typeorm_1.Entity)({ name: 'tokens_recuperacion_contrasena' })
], TokenRecuperacionContrasena);
let SesionUsuario = class SesionUsuario extends base_entity_1.BaseUuidEntity {
};
exports.SesionUsuario = SesionUsuario;
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_id', type: 'uuid' }),
    __metadata("design:type", String)
], SesionUsuario.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'refresh_token_hash' }),
    __metadata("design:type", String)
], SesionUsuario.prototype, "refreshTokenHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], SesionUsuario.prototype, "ip", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_agent', nullable: true }),
    __metadata("design:type", Object)
], SesionUsuario.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expira_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], SesionUsuario.prototype, "expiraAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'revocada_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], SesionUsuario.prototype, "revocadaAt", void 0);
exports.SesionUsuario = SesionUsuario = __decorate([
    (0, typeorm_1.Entity)({ name: 'sesiones_usuario' })
], SesionUsuario);
let Sede = class Sede extends base_entity_1.BaseUuidEntity {
};
exports.Sede = Sede;
__decorate([
    (0, typeorm_1.Column)({ name: 'institucion_id', type: 'uuid' }),
    __metadata("design:type", String)
], Sede.prototype, "institucionId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Sede.prototype, "codigo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Sede.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Sede.prototype, "principal", void 0);
exports.Sede = Sede = __decorate([
    (0, typeorm_1.Entity)({ name: 'sedes' })
], Sede);
let AnioLectivo = class AnioLectivo extends base_entity_1.BaseUuidEntity {
};
exports.AnioLectivo = AnioLectivo;
__decorate([
    (0, typeorm_1.Column)({ name: 'institucion_id', type: 'uuid' }),
    __metadata("design:type", String)
], AnioLectivo.prototype, "institucionId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AnioLectivo.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_inicio', type: 'date' }),
    __metadata("design:type", String)
], AnioLectivo.prototype, "fechaInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_fin', type: 'date' }),
    __metadata("design:type", String)
], AnioLectivo.prototype, "fechaFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], AnioLectivo.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], AnioLectivo.prototype, "cerrado", void 0);
exports.AnioLectivo = AnioLectivo = __decorate([
    (0, typeorm_1.Entity)({ name: 'anios_lectivos' })
], AnioLectivo);
let PeriodoAcademico = class PeriodoAcademico extends base_entity_1.BaseUuidEntity {
};
exports.PeriodoAcademico = PeriodoAcademico;
__decorate([
    (0, typeorm_1.Column)({ name: 'anio_lectivo_id', type: 'uuid' }),
    __metadata("design:type", String)
], PeriodoAcademico.prototype, "anioLectivoId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PeriodoAcademico.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_inicio', type: 'date' }),
    __metadata("design:type", String)
], PeriodoAcademico.prototype, "fechaInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_fin', type: 'date' }),
    __metadata("design:type", String)
], PeriodoAcademico.prototype, "fechaFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], PeriodoAcademico.prototype, "cerrado", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], PeriodoAcademico.prototype, "orden", void 0);
exports.PeriodoAcademico = PeriodoAcademico = __decorate([
    (0, typeorm_1.Entity)({ name: 'periodos_academicos' })
], PeriodoAcademico);
let ConfiguracionInstitucion = class ConfiguracionInstitucion extends base_entity_1.BaseUuidEntity {
};
exports.ConfiguracionInstitucion = ConfiguracionInstitucion;
__decorate([
    (0, typeorm_1.Column)({ name: 'institucion_id', type: 'uuid', unique: true }),
    __metadata("design:type", String)
], ConfiguracionInstitucion.prototype, "institucionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'zona_horaria', default: 'America/Bogota' }),
    __metadata("design:type", String)
], ConfiguracionInstitucion.prototype, "zonaHoraria", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'es-CO' }),
    __metadata("design:type", String)
], ConfiguracionInstitucion.prototype, "idioma", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ConfiguracionInstitucion.prototype, "configuracion", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Institucion),
    (0, typeorm_1.JoinColumn)({ name: 'institucion_id' }),
    __metadata("design:type", Institucion)
], ConfiguracionInstitucion.prototype, "institucion", void 0);
exports.ConfiguracionInstitucion = ConfiguracionInstitucion = __decorate([
    (0, typeorm_1.Entity)({ name: 'configuraciones_institucion' })
], ConfiguracionInstitucion);
let EscalaValoracion = class EscalaValoracion extends base_entity_1.BaseUuidEntity {
};
exports.EscalaValoracion = EscalaValoracion;
__decorate([
    (0, typeorm_1.Column)({ name: 'institucion_id', type: 'uuid' }),
    __metadata("design:type", String)
], EscalaValoracion.prototype, "institucionId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EscalaValoracion.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], EscalaValoracion.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], EscalaValoracion.prototype, "activa", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => NivelEscalaValoracion, (nivel) => nivel.escala),
    __metadata("design:type", Array)
], EscalaValoracion.prototype, "niveles", void 0);
exports.EscalaValoracion = EscalaValoracion = __decorate([
    (0, typeorm_1.Entity)({ name: 'escalas_valoracion' })
], EscalaValoracion);
let NivelEscalaValoracion = class NivelEscalaValoracion extends base_entity_1.BaseUuidEntity {
};
exports.NivelEscalaValoracion = NivelEscalaValoracion;
__decorate([
    (0, typeorm_1.Column)({ name: 'escala_valoracion_id', type: 'uuid' }),
    __metadata("design:type", String)
], NivelEscalaValoracion.prototype, "escalaValoracionId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NivelEscalaValoracion.prototype, "codigo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NivelEscalaValoracion.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'valor_minimo', type: 'numeric' }),
    __metadata("design:type", String)
], NivelEscalaValoracion.prototype, "valorMinimo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'valor_maximo', type: 'numeric' }),
    __metadata("design:type", String)
], NivelEscalaValoracion.prototype, "valorMaximo", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], NivelEscalaValoracion.prototype, "aprobado", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], NivelEscalaValoracion.prototype, "orden", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EscalaValoracion, (escala) => escala.niveles),
    (0, typeorm_1.JoinColumn)({ name: 'escala_valoracion_id' }),
    __metadata("design:type", EscalaValoracion)
], NivelEscalaValoracion.prototype, "escala", void 0);
exports.NivelEscalaValoracion = NivelEscalaValoracion = __decorate([
    (0, typeorm_1.Entity)({ name: 'niveles_escala_valoracion' })
], NivelEscalaValoracion);
exports.DATABASE_ENTITIES = [
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
];
//# sourceMappingURL=entities.js.map