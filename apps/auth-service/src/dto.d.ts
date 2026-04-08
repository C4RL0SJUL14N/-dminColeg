export declare class LoginDto {
    correo: string;
    contrasena: string;
    institucionId?: string;
    perfilIdSeleccionado?: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class SolicitarRecuperacionDto {
    correo: string;
    institucionId?: string;
}
export declare class RestablecerContrasenaDto {
    token: string;
    nuevaContrasena: string;
}
export declare class CambiarContrasenaInicialDto {
    correo: string;
    contrasenaActual: string;
    nuevaContrasena: string;
    institucionId?: string;
}
export declare class LogoutDto {
    refreshToken?: string;
}
