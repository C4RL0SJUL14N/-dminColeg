import { Repository } from 'typeorm';
import { PerfilUsuario, Permiso, Rol, RolPermiso, RolUsuario, TipoPerfil, Usuario } from '@libs/database';
import { AsignarAdministradorAppDto, AsignarPerfilDto, AsignarRolDto } from './dto';
export declare class AccessControlService {
    private readonly usuariosRepository;
    private readonly perfilesRepository;
    private readonly tiposPerfilRepository;
    private readonly rolesUsuarioRepository;
    private readonly rolesRepository;
    private readonly rolesPermisosRepository;
    private readonly permisosRepository;
    constructor(usuariosRepository: Repository<Usuario>, perfilesRepository: Repository<PerfilUsuario>, tiposPerfilRepository: Repository<TipoPerfil>, rolesUsuarioRepository: Repository<RolUsuario>, rolesRepository: Repository<Rol>, rolesPermisosRepository: Repository<RolPermiso>, permisosRepository: Repository<Permiso>);
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
    asignarPerfil(usuarioId: string, dto: AsignarPerfilDto): Promise<PerfilUsuario>;
    asignarRol(usuarioId: string, dto: AsignarRolDto): Promise<RolUsuario>;
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
    private ensureUsuario;
}
