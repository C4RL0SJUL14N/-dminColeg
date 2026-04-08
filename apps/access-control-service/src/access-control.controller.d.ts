import { AsignarAdministradorAppDto, AsignarPerfilDto, AsignarRolDto } from './dto';
import { AccessControlService } from './access-control.service';
export declare class AccessControlController {
    private readonly accessControlService;
    constructor(accessControlService: AccessControlService);
    getContextoAcceso(usuarioId: string): Promise<{
        usuarioId: string;
        institucionId: string | null;
        personaId: string;
        superadministrador: boolean;
        perfiles: {
            id: string;
            tipoPerfilId: string;
            codigo: string;
            nombre: string;
            visible: boolean;
            predeterminado: boolean;
        }[];
        roles: {
            id: string;
            codigo: string;
            nombre: string;
        }[];
        permisos: {
            id: string;
            codigo: string;
            nombre: string;
            descripcion: string | null;
        }[];
    }>;
    getPermisosEfectivos(usuarioId: string): Promise<{
        id: string;
        codigo: string;
        nombre: string;
        descripcion: string | null;
    }[]>;
    asignarPerfil(usuarioId: string, dto: AsignarPerfilDto): Promise<import("../../../libs/database/src").PerfilUsuario>;
    asignarRol(usuarioId: string, dto: AsignarRolDto): Promise<import("../../../libs/database/src").RolUsuario>;
    asignarAdministradorApp(institucionId: string, dto: AsignarAdministradorAppDto): Promise<{
        usuarioId: string;
        institucionId: string | null;
        personaId: string;
        superadministrador: boolean;
        perfiles: {
            id: string;
            tipoPerfilId: string;
            codigo: string;
            nombre: string;
            visible: boolean;
            predeterminado: boolean;
        }[];
        roles: {
            id: string;
            codigo: string;
            nombre: string;
        }[];
        permisos: {
            id: string;
            codigo: string;
            nombre: string;
            descripcion: string | null;
        }[];
    }>;
}
