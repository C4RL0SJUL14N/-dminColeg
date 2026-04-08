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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessControlService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const common_2 = require("../../../libs/common/src");
const database_1 = require("../../../libs/database/src");
let AccessControlService = class AccessControlService {
    constructor(usuariosRepository, perfilesRepository, tiposPerfilRepository, rolesUsuarioRepository, rolesRepository, rolesPermisosRepository, permisosRepository) {
        this.usuariosRepository = usuariosRepository;
        this.perfilesRepository = perfilesRepository;
        this.tiposPerfilRepository = tiposPerfilRepository;
        this.rolesUsuarioRepository = rolesUsuarioRepository;
        this.rolesRepository = rolesRepository;
        this.rolesPermisosRepository = rolesPermisosRepository;
        this.permisosRepository = permisosRepository;
    }
    async getContextoAcceso(usuarioId) {
        const usuario = await this.usuariosRepository.findOneBy({ id: usuarioId });
        if (!usuario) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const perfiles = await this.perfilesRepository.find({
            where: { usuarioId, activo: true },
            relations: { tipoPerfil: true },
        });
        const roles = await this.rolesUsuarioRepository.find({
            where: { usuarioId, activo: true },
            relations: { rol: true },
        });
        const permisos = await this.getPermisosEfectivos(usuarioId);
        return {
            usuarioId: usuario.id,
            institucionId: usuario.institucionId,
            personaId: usuario.personaId,
            superadministrador: usuario.superadministrador,
            perfiles: perfiles.map((perfil) => ({
                id: perfil.id,
                tipoPerfilId: perfil.tipoPerfilId,
                codigo: perfil.tipoPerfil.codigo,
                nombre: perfil.tipoPerfil.nombre,
                visible: perfil.visible,
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
    async getPermisosEfectivos(usuarioId) {
        const usuario = await this.usuariosRepository.findOneBy({ id: usuarioId });
        if (!usuario) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const roles = await this.rolesUsuarioRepository.find({
            where: { usuarioId, activo: true },
        });
        const rolIds = roles.map((rol) => rol.rolId);
        if (!rolIds.length) {
            return [];
        }
        const rolesPermisos = await this.rolesPermisosRepository.find({
            where: { rolId: (0, typeorm_2.In)(rolIds) },
        });
        const permisoIds = [...new Set(rolesPermisos.map((item) => item.permisoId))];
        if (!permisoIds.length) {
            return [];
        }
        const permisos = await this.permisosRepository.find({
            where: { id: (0, typeorm_2.In)(permisoIds) },
            order: { codigo: 'ASC' },
        });
        return permisos.map((permiso) => ({
            id: permiso.id,
            codigo: permiso.codigo,
            nombre: permiso.nombre,
            descripcion: permiso.descripcion,
        }));
    }
    async asignarPerfil(usuarioId, dto) {
        await this.ensureUsuario(usuarioId);
        const tipoPerfil = await this.tiposPerfilRepository.findOneBy({ id: dto.tipoPerfilId });
        if (!tipoPerfil) {
            throw new common_1.NotFoundException('Tipo de perfil no encontrado');
        }
        const existente = await this.perfilesRepository.findOne({
            where: { usuarioId, tipoPerfilId: dto.tipoPerfilId },
        });
        if (existente) {
            existente.activo = true;
            return this.perfilesRepository.save(existente);
        }
        return this.perfilesRepository.save(this.perfilesRepository.create({
            usuarioId,
            tipoPerfilId: dto.tipoPerfilId,
            activo: true,
            visible: true,
            predeterminado: false,
        }));
    }
    async asignarRol(usuarioId, dto) {
        const usuario = await this.ensureUsuario(usuarioId);
        const rol = await this.rolesRepository.findOneBy({ id: dto.rolId, activo: true });
        if (!rol) {
            throw new common_1.NotFoundException('Rol no encontrado');
        }
        if (!usuario.superadministrador && rol.codigo === common_2.ROLE_SUPERADMIN) {
            throw new common_1.ForbiddenException('Solo existe un superadministrador global');
        }
        const existente = await this.rolesUsuarioRepository.findOne({
            where: { usuarioId, rolId: dto.rolId },
        });
        if (existente) {
            existente.activo = true;
            return this.rolesUsuarioRepository.save(existente);
        }
        return this.rolesUsuarioRepository.save(this.rolesUsuarioRepository.create({
            usuarioId,
            rolId: dto.rolId,
            activo: true,
        }));
    }
    async asignarAdministradorApp(institucionId, dto) {
        const usuario = await this.ensureUsuario(dto.usuarioId);
        if (usuario.institucionId !== institucionId) {
            throw new common_1.ForbiddenException('El usuario institucional solo puede administrarse dentro de su propia institucion');
        }
        const perfiles = await this.perfilesRepository.find({
            where: { usuarioId: usuario.id, activo: true, visible: true },
            relations: { tipoPerfil: true },
        });
        const allowed = perfiles.some((perfil) => common_2.PERFILES_ADMINISTRABLES.includes(perfil.tipoPerfil.codigo));
        if (!allowed) {
            throw new common_1.BadRequestException('Solo docentes, directivos docentes o administrativos pueden ser administradores institucionales');
        }
        const rolAdministrador = await this.rolesRepository.findOneBy({
            codigo: common_2.ROLE_ADMIN_APP,
            activo: true,
        });
        if (!rolAdministrador) {
            throw new common_1.NotFoundException('Rol administrador_app_institucion no configurado');
        }
        const rolUsuario = await this.rolesUsuarioRepository.findOne({
            where: { usuarioId: usuario.id, rolId: rolAdministrador.id },
        });
        if (rolUsuario) {
            rolUsuario.activo = true;
            await this.rolesUsuarioRepository.save(rolUsuario);
        }
        else {
            await this.rolesUsuarioRepository.save(this.rolesUsuarioRepository.create({
                usuarioId: usuario.id,
                rolId: rolAdministrador.id,
                activo: true,
            }));
        }
        return this.getContextoAcceso(usuario.id);
    }
    async ensureUsuario(usuarioId) {
        const usuario = await this.usuariosRepository.findOneBy({ id: usuarioId });
        if (!usuario) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        return usuario;
    }
};
exports.AccessControlService = AccessControlService;
exports.AccessControlService = AccessControlService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(database_1.Usuario)),
    __param(1, (0, typeorm_1.InjectRepository)(database_1.PerfilUsuario)),
    __param(2, (0, typeorm_1.InjectRepository)(database_1.TipoPerfil)),
    __param(3, (0, typeorm_1.InjectRepository)(database_1.RolUsuario)),
    __param(4, (0, typeorm_1.InjectRepository)(database_1.Rol)),
    __param(5, (0, typeorm_1.InjectRepository)(database_1.RolPermiso)),
    __param(6, (0, typeorm_1.InjectRepository)(database_1.Permiso)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AccessControlService);
//# sourceMappingURL=access-control.service.js.map