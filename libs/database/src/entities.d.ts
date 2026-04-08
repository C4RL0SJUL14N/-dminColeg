import { BaseUuidEntity } from './base.entity';
export declare class TipoDocumento extends BaseUuidEntity {
    codigo: string;
    nombre: string;
}
export declare class Genero extends BaseUuidEntity {
    codigo: string;
    nombre: string;
}
export declare class Persona extends BaseUuidEntity {
    tipoDocumentoId: string;
    generoId: string | null;
    numeroDocumento: string;
    primerNombre: string;
    segundoNombre: string | null;
    primerApellido: string;
    segundoApellido: string | null;
    correoElectronico: string | null;
    telefono: string | null;
    tipoDocumento: TipoDocumento;
    genero: Genero | null;
}
export declare class Institucion extends BaseUuidEntity {
    codigo: string;
    nombre: string;
    nit: string | null;
    activo: boolean;
}
export declare class Usuario extends BaseUuidEntity {
    personaId: string;
    institucionId: string | null;
    correo: string;
    activo: boolean;
    debeCambiarContrasena: boolean;
    superadministrador: boolean;
    ultimoAccesoAt: Date | null;
    persona: Persona;
    institucion: Institucion | null;
}
export declare class TipoPerfil extends BaseUuidEntity {
    codigo: string;
    nombre: string;
    esFuncional: boolean;
    activo: boolean;
}
export declare class PerfilUsuario extends BaseUuidEntity {
    usuarioId: string;
    tipoPerfilId: string;
    activo: boolean;
    visible: boolean;
    predeterminado: boolean;
    usuario: Usuario;
    tipoPerfil: TipoPerfil;
}
export declare class Rol extends BaseUuidEntity {
    codigo: string;
    nombre: string;
    esGlobal: boolean;
    activo: boolean;
}
export declare class RolUsuario extends BaseUuidEntity {
    usuarioId: string;
    rolId: string;
    activo: boolean;
    usuario: Usuario;
    rol: Rol;
}
export declare class Permiso extends BaseUuidEntity {
    codigo: string;
    nombre: string;
    descripcion: string | null;
}
export declare class RolPermiso extends BaseUuidEntity {
    rolId: string;
    permisoId: string;
    rol: Rol;
    permiso: Permiso;
}
export declare class ProveedorAutenticacion extends BaseUuidEntity {
    codigo: string;
    nombre: string;
    oidcIssuer: string | null;
    activo: boolean;
}
export declare class MetodoAutenticacionUsuario extends BaseUuidEntity {
    usuarioId: string;
    proveedorAutenticacionId: string;
    hashContrasena: string | null;
    refreshTokenHash: string | null;
    intentosFallidos: number;
    bloqueadoHasta: Date | null;
    ultimoLoginAt: Date | null;
    activo: boolean;
    usuario: Usuario;
    proveedor: ProveedorAutenticacion;
}
export declare class TokenRecuperacionContrasena extends BaseUuidEntity {
    usuarioId: string;
    tokenHash: string;
    expiraAt: Date;
    usadoAt: Date | null;
}
export declare class SesionUsuario extends BaseUuidEntity {
    usuarioId: string;
    refreshTokenHash: string;
    ip: string | null;
    userAgent: string | null;
    expiraAt: Date;
    revocadaAt: Date | null;
}
export declare class Sede extends BaseUuidEntity {
    institucionId: string;
    codigo: string;
    nombre: string;
    principal: boolean;
}
export declare class AnioLectivo extends BaseUuidEntity {
    institucionId: string;
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    activo: boolean;
    cerrado: boolean;
}
export declare class PeriodoAcademico extends BaseUuidEntity {
    anioLectivoId: string;
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    cerrado: boolean;
    orden: number;
}
export declare class ConfiguracionInstitucion extends BaseUuidEntity {
    institucionId: string;
    zonaHoraria: string;
    idioma: string;
    configuracion: Record<string, unknown> | null;
    institucion: Institucion;
}
export declare class EscalaValoracion extends BaseUuidEntity {
    institucionId: string;
    nombre: string;
    descripcion: string | null;
    activa: boolean;
    niveles: NivelEscalaValoracion[];
}
export declare class NivelEscalaValoracion extends BaseUuidEntity {
    escalaValoracionId: string;
    codigo: string;
    nombre: string;
    valorMinimo: string;
    valorMaximo: string;
    aprobado: boolean;
    orden: number;
    escala: EscalaValoracion;
}
export declare const DATABASE_ENTITIES: readonly [typeof AnioLectivo, typeof ConfiguracionInstitucion, typeof EscalaValoracion, typeof Genero, typeof Institucion, typeof MetodoAutenticacionUsuario, typeof NivelEscalaValoracion, typeof PerfilUsuario, typeof Permiso, typeof PeriodoAcademico, typeof Persona, typeof ProveedorAutenticacion, typeof Rol, typeof RolPermiso, typeof RolUsuario, typeof Sede, typeof SesionUsuario, typeof TipoDocumento, typeof TipoPerfil, typeof TokenRecuperacionContrasena, typeof Usuario];
