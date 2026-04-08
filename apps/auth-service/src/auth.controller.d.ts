import { Request } from 'express';
import { JwtPayload } from '@libs/common';
import { CambiarContrasenaInicialDto, LoginDto, LogoutDto, RefreshTokenDto, RestablecerContrasenaDto, SolicitarRecuperacionDto } from './dto';
import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    logout(user: JwtPayload, dto: LogoutDto): Promise<{
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
    sesiones(user: JwtPayload): Promise<import("../../../libs/database/src").SesionUsuario[]>;
}
