import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { setAuditAfterState, setAuditEntityId } from '@libs/audit';
import {
  PERFILES_ADMINISTRABLES,
  ROLE_ADMIN_APP,
  ROLE_SUPERADMIN,
} from '@libs/common';
import {
  PerfilUsuario,
  Permiso,
  Rol,
  RolPermiso,
  RolUsuario,
  TipoPerfil,
  Usuario,
} from '@libs/database';
import {
  AsignarAdministradorAppDto,
  AsignarPerfilDto,
  AsignarRolDto,
} from './dto';

@Injectable()
export class AccessControlService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    @InjectRepository(PerfilUsuario)
    private readonly perfilesRepository: Repository<PerfilUsuario>,
    @InjectRepository(TipoPerfil)
    private readonly tiposPerfilRepository: Repository<TipoPerfil>,
    @InjectRepository(RolUsuario)
    private readonly rolesUsuarioRepository: Repository<RolUsuario>,
    @InjectRepository(Rol)
    private readonly rolesRepository: Repository<Rol>,
    @InjectRepository(RolPermiso)
    private readonly rolesPermisosRepository: Repository<RolPermiso>,
    @InjectRepository(Permiso)
    private readonly permisosRepository: Repository<Permiso>,
  ) {}

  async getContextoAcceso(usuarioId: string) {
    setAuditEntityId(usuarioId);
    const usuario = await this.usuariosRepository.findOneBy({ id: usuarioId });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const perfiles = await this.perfilesRepository.find({
      where: { usuarioId, activo: true },
      relations: { tipoPerfil: true },
    });
    const roles = await this.rolesUsuarioRepository.find({
      where: { usuarioId },
      relations: { rol: true },
    });

    const superadministrador = this.isSuperadministrador(usuario, roles.map((r) => r.rol.codigo));

    const permisos = await this.getPermisosEfectivos(usuarioId);

    return {
      usuarioId: usuario.id,
      institucionId: usuario.institucionId,
      personaId: usuario.personaId,
      superadministrador,
      perfiles: perfiles.map((perfil) => ({
        id: perfil.id,
        tipoPerfilId: perfil.tipoPerfilId,
        codigo: perfil.tipoPerfil.codigo,
        nombre: perfil.tipoPerfil.nombre,
        predeterminado: perfil.predeterminado,
      })),
      roles: roles.map((rol) => ({
        id: rol.rol.id,
        codigo: rol.rol.codigo,
        nombre: rol.rol.nombre,
      })),
      permisos,
    };
  }

  async getPermisosEfectivos(usuarioId: string) {
    setAuditEntityId(usuarioId);
    const usuario = await this.usuariosRepository.findOneBy({ id: usuarioId });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const roles = await this.rolesUsuarioRepository.find({
      where: { usuarioId },
    });
    const rolIds = roles.map((rol) => rol.rolId);
    if (!rolIds.length) {
      return [];
    }

    const rolesPermisos = await this.rolesPermisosRepository.find({
      where: { rolId: In(rolIds) },
    });
    const permisoIds = [...new Set(rolesPermisos.map((item) => item.permisoId))];
    if (!permisoIds.length) {
      return [];
    }

    const permisos = await this.permisosRepository.find({
      where: { id: In(permisoIds) },
      order: { codigo: 'ASC' },
    });

    return permisos.map((permiso) => ({
      id: permiso.id,
      codigo: permiso.codigo,
      nombre: `${permiso.modulo}:${permiso.accion}`,
      descripcion: null,
    }));
  }

  async asignarPerfil(usuarioId: string, dto: AsignarPerfilDto) {
    setAuditEntityId(usuarioId);
    await this.ensureUsuario(usuarioId);
    const tipoPerfil = await this.tiposPerfilRepository.findOneBy({ id: dto.tipoPerfilId });
    if (!tipoPerfil) {
      throw new NotFoundException('Tipo de perfil no encontrado');
    }

    const existente = await this.perfilesRepository.findOne({
      where: { usuarioId, tipoPerfilId: dto.tipoPerfilId },
    });
    if (existente) {
      existente.activo = true;
      const perfil = await this.perfilesRepository.save(existente);
      setAuditAfterState(perfil);
      return perfil;
    }

    const perfil = await this.perfilesRepository.save(
      this.perfilesRepository.create({
        usuarioId,
        tipoPerfilId: dto.tipoPerfilId,
        activo: true,
        predeterminado: false,
        sedeId: null,
        asignadoPorUsuarioId: null,
      }),
    );
    setAuditAfterState(perfil);
    return perfil;
  }

  async asignarRol(usuarioId: string, dto: AsignarRolDto) {
    setAuditEntityId(usuarioId);
    const usuario = await this.ensureUsuario(usuarioId);
    const rol = await this.rolesRepository.findOneBy({ id: dto.rolId, activo: true });
    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }

    if (!this.isSuperadministrador(usuario) && rol.codigo === ROLE_SUPERADMIN) {
      throw new ForbiddenException('Solo existe un superadministrador global');
    }

    const existente = await this.rolesUsuarioRepository.findOne({
      where: { usuarioId, rolId: dto.rolId },
    });
    if (existente) {
      const rolAsignado = await this.rolesUsuarioRepository.save(existente);
      setAuditAfterState(rolAsignado);
      return rolAsignado;
    }

    const rolAsignado = await this.rolesUsuarioRepository.save(
      this.rolesUsuarioRepository.create({
        usuarioId,
        rolId: dto.rolId,
        sedeId: null,
        asignadoPorUsuarioId: null,
      }),
    );
    setAuditAfterState(rolAsignado);
    return rolAsignado;
  }

  async asignarAdministradorApp(institucionId: string, dto: AsignarAdministradorAppDto) {
    setAuditEntityId(institucionId);
    const usuario = await this.ensureUsuario(dto.usuarioId);
    if (usuario.institucionId !== institucionId) {
      throw new ForbiddenException(
        'El usuario institucional solo puede administrarse dentro de su propia institucion',
      );
    }

    const perfiles = await this.perfilesRepository.find({
      where: { usuarioId: usuario.id, activo: true },
      relations: { tipoPerfil: true },
    });

    const allowed = perfiles.some((perfil) =>
      PERFILES_ADMINISTRABLES.includes(perfil.tipoPerfil.codigo),
    );

    if (!allowed) {
      throw new BadRequestException(
        'Solo docentes, directivos docentes o administrativos pueden ser administradores institucionales',
      );
    }

    const rolAdministrador = await this.rolesRepository.findOneBy({
      codigo: ROLE_ADMIN_APP,
      activo: true,
    });

    if (!rolAdministrador) {
      throw new NotFoundException('Rol administrador_app_institucion no configurado');
    }

    const rolUsuario = await this.rolesUsuarioRepository.findOne({
      where: { usuarioId: usuario.id, rolId: rolAdministrador.id },
    });

    if (rolUsuario) {
      await this.rolesUsuarioRepository.save(rolUsuario);
    } else {
      await this.rolesUsuarioRepository.save(
        this.rolesUsuarioRepository.create({
          usuarioId: usuario.id,
          rolId: rolAdministrador.id,
          sedeId: null,
          asignadoPorUsuarioId: null,
        }),
      );
    }

    const contexto = await this.getContextoAcceso(usuario.id);
    setAuditAfterState(contexto);
    return contexto;
  }

  private async ensureUsuario(usuarioId: string) {
    const usuario = await this.usuariosRepository.findOneBy({ id: usuarioId });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return usuario;
  }

  private isSuperadministrador(usuario: Usuario, roleCodes: string[] = []) {
    return usuario.institucionId === null || roleCodes.includes(ROLE_SUPERADMIN);
  }
}
