import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { PasswordService, TokenService } from '@libs/auth';
import { JwtPayload } from '@libs/common';
import { MetodoAutenticacionUsuario, PerfilUsuario, Permiso, ProveedorAutenticacion, Rol, RolPermiso, RolUsuario, SesionUsuario, TipoPerfil, TokenRecuperacionContrasena, Usuario } from '@libs/database';
import { CambiarContrasenaInicialDto, LoginDto, LogoutDto, RefreshTokenDto, RestablecerContrasenaDto, SolicitarRecuperacionDto } from './dto';
export declare class AuthService {
    private readonly usuariosRepository;
    private readonly metodosRepository;
    private readonly proveedoresRepository;
    private readonly perfilesRepository;
    private readonly tiposPerfilRepository;
    private readonly rolesUsuarioRepository;
    private readonly rolesRepository;
    private readonly rolesPermisosRepository;
    private readonly permisosRepository;
    private readonly sesionesRepository;
    private readonly tokensRecuperacionRepository;
    private readonly passwordService;
    private readonly tokenService;
    private readonly configService;
    constructor(usuariosRepository: Repository<Usuario>, metodosRepository: Repository<MetodoAutenticacionUsuario>, proveedoresRepository: Repository<ProveedorAutenticacion>, perfilesRepository: Repository<PerfilUsuario>, tiposPerfilRepository: Repository<TipoPerfil>, rolesUsuarioRepository: Repository<RolUsuario>, rolesRepository: Repository<Rol>, rolesPermisosRepository: Repository<RolPermiso>, permisosRepository: Repository<Permiso>, sesionesRepository: Repository<SesionUsuario>, tokensRecuperacionRepository: Repository<TokenRecuperacionContrasena>, passwordService: PasswordService, tokenService: TokenService, configService: ConfigService);
    login(dto: LoginDto, request: Request): Promise<{
        accessToken: string;
        refreshToken: string;
        contextoAcceso: {
            usuarioId: string;
            institucionId: string | null;
            personaId: string;
            superadministrador: boolean;
            perfiles: {
                id: string;
                codigo: string;
                nombre: string;
                predeterminado: boolean;
            }[];
            roles: {
                id: string;
                codigo: string;
                nombre: string;
            }[];
            permisos: string[];
        };
        perfilPredeterminado: {
            id: string;
            codigo: string;
            nombre: string;
            predeterminado: boolean;
        } | null;
        googleLogin: {
            habilitado: boolean;
            issuer: any;
        };
    } | {
        requiereCambioContrasena: boolean;
        usuarioId: string;
        institucionId: string | null;
        perfilesDisponibles: {
            id: string;
            codigo: string;
            nombre: string;
            predeterminado: boolean;
        }[];
        requiereSeleccionPerfil?: undefined;
        contextoAcceso?: undefined;
    } | {
        requiereSeleccionPerfil: boolean;
        perfilesDisponibles: {
            id: string;
            codigo: string;
            nombre: string;
            predeterminado: boolean;
        }[];
        contextoAcceso: {
            usuarioId: string;
            institucionId: string | null;
            personaId: string;
            superadministrador: boolean;
            perfiles: {
                id: string;
                codigo: string;
                nombre: string;
                predeterminado: boolean;
            }[];
            roles: {
                id: string;
                codigo: string;
                nombre: string;
            }[];
            permisos: string[];
        };
        requiereCambioContrasena?: undefined;
        usuarioId?: undefined;
        institucionId?: undefined;
    }>;
    refresh(dto: RefreshTokenDto, request: Request): Promise<{
        accessToken: string;
        refreshToken: string;
        contextoAcceso: {
            usuarioId: string;
            institucionId: string | null;
            personaId: string;
            superadministrador: boolean;
            perfiles: {
                id: string;
                codigo: string;
                nombre: string;
                predeterminado: boolean;
            }[];
            roles: {
                id: string;
                codigo: string;
                nombre: string;
            }[];
            permisos: string[];
        };
    }>;
    logout(currentUser: JwtPayload, dto: LogoutDto): Promise<{
        cerrado: boolean;
    }>;
    solicitarRecuperacion(dto: SolicitarRecuperacionDto): Promise<{
        solicitado: boolean;
        mensaje: string;
        tokenDesarrollo: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    restablecerContrasena(dto: RestablecerContrasenaDto): Promise<{
        restablecida: boolean;
    }>;
    cambiarContrasenaInicial(dto: CambiarContrasenaInicialDto, request: Request): Promise<{
        accessToken: string;
        refreshToken: string;
        contextoAcceso: {
            usuarioId: string;
            institucionId: string | null;
            personaId: string;
            superadministrador: boolean;
            perfiles: {
                id: string;
                codigo: string;
                nombre: string;
                predeterminado: boolean;
            }[];
            roles: {
                id: string;
                codigo: string;
                nombre: string;
            }[];
            permisos: string[];
        };
        perfilPredeterminado: {
            id: string;
            codigo: string;
            nombre: string;
            predeterminado: boolean;
        } | null;
        googleLogin: {
            habilitado: boolean;
            issuer: any;
        };
    }>;
    listarSesiones(currentUser: JwtPayload): Promise<SesionUsuario[]>;
    resolveContextoAcceso(usuarioId: string): Promise<{
        usuarioId: string;
        institucionId: string | null;
        personaId: string;
        superadministrador: boolean;
        perfiles: {
            id: string;
            codigo: string;
            nombre: string;
            predeterminado: boolean;
        }[];
        roles: {
            id: string;
            codigo: string;
            nombre: string;
        }[];
        permisos: string[];
    }>;
    private resolveUsuarioParaLogin;
    private obtenerMetodoLocal;
    private registrarIntentoFallido;
    private resolvePerfilSeleccionado;
    private emitirSesion;
    private emitirSesionDesdePayload;
    private findMatchingRecoveryToken;
}
