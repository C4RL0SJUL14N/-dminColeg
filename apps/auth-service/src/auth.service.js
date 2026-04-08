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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const crypto_1 = require("crypto");
const typeorm_2 = require("typeorm");
const auth_1 = require("../../../libs/auth/src");
const database_1 = require("../../../libs/database/src");
let AuthService = class AuthService {
    constructor(usuariosRepository, metodosRepository, proveedoresRepository, perfilesRepository, tiposPerfilRepository, rolesUsuarioRepository, rolesRepository, rolesPermisosRepository, permisosRepository, sesionesRepository, tokensRecuperacionRepository, passwordService, tokenService, configService) {
        this.usuariosRepository = usuariosRepository;
        this.metodosRepository = metodosRepository;
        this.proveedoresRepository = proveedoresRepository;
        this.perfilesRepository = perfilesRepository;
        this.tiposPerfilRepository = tiposPerfilRepository;
        this.rolesUsuarioRepository = rolesUsuarioRepository;
        this.rolesRepository = rolesRepository;
        this.rolesPermisosRepository = rolesPermisosRepository;
        this.permisosRepository = permisosRepository;
        this.sesionesRepository = sesionesRepository;
        this.tokensRecuperacionRepository = tokensRecuperacionRepository;
        this.passwordService = passwordService;
        this.tokenService = tokenService;
        this.configService = configService;
    }
    async login(dto, request) {
        const usuario = await this.resolveUsuarioParaLogin(dto.correo, dto.institucionId);
        const metodo = await this.obtenerMetodoLocal(usuario.id);
        if (metodo.bloqueadoHasta && metodo.bloqueadoHasta > new Date()) {
            throw new common_1.ForbiddenException('Usuario temporalmente bloqueado por intentos fallidos');
        }
        if (!metodo.hashContrasena) {
            throw new common_1.UnauthorizedException('El usuario no tiene autenticacion local habilitada');
        }
        const validPassword = await this.passwordService.compare(dto.contrasena, metodo.hashContrasena);
        if (!validPassword) {
            await this.registrarIntentoFallido(metodo);
            throw new common_1.UnauthorizedException('Credenciales invalidas');
        }
        metodo.intentosFallidos = 0;
        metodo.bloqueadoHasta = null;
        metodo.ultimoLoginAt = new Date();
        await this.metodosRepository.save(metodo);
        const contexto = await this.resolveContextoAcceso(usuario.id);
        const perfilSeleccionado = this.resolvePerfilSeleccionado(contexto.perfiles, dto.perfilIdSeleccionado);
        if (usuario.debeCambiarContrasena) {
            return {
                requiereCambioContrasena: true,
                usuarioId: usuario.id,
                institucionId: usuario.institucionId,
                perfilesDisponibles: contexto.perfiles,
            };
        }
        if (!perfilSeleccionado && contexto.perfiles.length > 1) {
            return {
                requiereSeleccionPerfil: true,
                perfilesDisponibles: contexto.perfiles,
                contextoAcceso: contexto,
            };
        }
        return this.emitirSesion(usuario, contexto, perfilSeleccionado?.id ?? null, request);
    }
    async refresh(dto, request) {
        const payload = await this.tokenService.verifyRefreshToken(dto.refreshToken);
        const sesion = await this.sesionesRepository.findOne({
            where: { id: payload.sessionId, usuarioId: payload.usuarioId },
        });
        if (!sesion || sesion.revocadaAt || sesion.expiraAt < new Date()) {
            throw new common_1.UnauthorizedException('La sesion ya no es valida');
        }
        const metodo = await this.obtenerMetodoLocal(payload.usuarioId);
        if (!metodo.refreshTokenHash) {
            throw new common_1.UnauthorizedException('No existe refresh token activo');
        }
        const matches = await this.passwordService.compare(dto.refreshToken, metodo.refreshTokenHash);
        if (!matches) {
            throw new common_1.UnauthorizedException('Refresh token invalido');
        }
        const contexto = await this.resolveContextoAcceso(payload.usuarioId);
        return this.emitirSesionDesdePayload(payload, contexto, request, sesion.id);
    }
    async logout(currentUser, dto) {
        const sessionId = currentUser.sessionId;
        const sesion = await this.sesionesRepository.findOne({
            where: { id: sessionId, usuarioId: currentUser.usuarioId },
        });
        if (sesion) {
            sesion.revocadaAt = new Date();
            await this.sesionesRepository.save(sesion);
        }
        const metodo = await this.obtenerMetodoLocal(currentUser.usuarioId);
        metodo.refreshTokenHash = dto.refreshToken ? null : metodo.refreshTokenHash;
        await this.metodosRepository.save(metodo);
        return { cerrado: true };
    }
    async solicitarRecuperacion(dto) {
        const usuario = await this.resolveUsuarioParaLogin(dto.correo, dto.institucionId);
        const tokenPlano = (0, crypto_1.randomUUID)();
        const tokenHash = await this.passwordService.hash(tokenPlano);
        const ttlMinutes = Number(this.configService.get('PASSWORD_RESET_TTL_MINUTES', '30'));
        await this.tokensRecuperacionRepository.save(this.tokensRecuperacionRepository.create({
            usuarioId: usuario.id,
            tokenHash,
            expiraAt: new Date(Date.now() + ttlMinutes * 60_000),
        }));
        return {
            solicitado: true,
            mensaje: 'Token de recuperacion generado. Integre el proveedor de correo para el envio real.',
            tokenDesarrollo: tokenPlano,
        };
    }
    async restablecerContrasena(dto) {
        const tokens = await this.tokensRecuperacionRepository.find({
            where: {},
            order: { createdAt: 'DESC' },
            take: 20,
        });
        const tokenEntity = await this.findMatchingRecoveryToken(tokens, dto.token);
        if (!tokenEntity || tokenEntity.usadoAt || tokenEntity.expiraAt < new Date()) {
            throw new common_1.BadRequestException('Token de recuperacion invalido o expirado');
        }
        const metodo = await this.obtenerMetodoLocal(tokenEntity.usuarioId);
        metodo.hashContrasena = await this.passwordService.hash(dto.nuevaContrasena);
        metodo.intentosFallidos = 0;
        metodo.bloqueadoHasta = null;
        await this.metodosRepository.save(metodo);
        await this.usuariosRepository.update(tokenEntity.usuarioId, {
            debeCambiarContrasena: false,
        });
        tokenEntity.usadoAt = new Date();
        await this.tokensRecuperacionRepository.save(tokenEntity);
        return { restablecida: true };
    }
    async cambiarContrasenaInicial(dto, request) {
        const usuario = await this.resolveUsuarioParaLogin(dto.correo, dto.institucionId);
        const metodo = await this.obtenerMetodoLocal(usuario.id);
        if (!metodo.hashContrasena) {
            throw new common_1.UnauthorizedException('Metodo local no configurado');
        }
        const validPassword = await this.passwordService.compare(dto.contrasenaActual, metodo.hashContrasena);
        if (!validPassword) {
            throw new common_1.UnauthorizedException('La contrasena actual no coincide');
        }
        metodo.hashContrasena = await this.passwordService.hash(dto.nuevaContrasena);
        metodo.intentosFallidos = 0;
        metodo.bloqueadoHasta = null;
        await this.metodosRepository.save(metodo);
        usuario.debeCambiarContrasena = false;
        await this.usuariosRepository.save(usuario);
        const contexto = await this.resolveContextoAcceso(usuario.id);
        const perfilSeleccionado = contexto.perfiles.find((perfil) => perfil.predeterminado) ?? contexto.perfiles[0] ?? null;
        return this.emitirSesion(usuario, contexto, perfilSeleccionado?.id ?? null, request);
    }
    async listarSesiones(currentUser) {
        return this.sesionesRepository.find({
            where: { usuarioId: currentUser.usuarioId },
            order: { createdAt: 'DESC' },
        });
    }
    async resolveContextoAcceso(usuarioId) {
        const usuario = await this.usuariosRepository.findOne({ where: { id: usuarioId } });
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
        const rolIds = roles.map((rolUsuario) => rolUsuario.rolId);
        const rolesPermisos = rolIds.length
            ? await this.rolesPermisosRepository.find({
                where: rolIds.map((rolId) => ({ rolId })),
            })
            : [];
        const permisoIds = [...new Set(rolesPermisos.map((item) => item.permisoId))];
        const permisos = permisoIds.length
            ? await this.permisosRepository.findByIds(permisoIds)
            : [];
        return {
            usuarioId: usuario.id,
            institucionId: usuario.institucionId,
            personaId: usuario.personaId,
            superadministrador: usuario.superadministrador,
            perfiles: perfiles.map((perfil) => ({
                id: perfil.id,
                codigo: perfil.tipoPerfil.codigo,
                nombre: perfil.tipoPerfil.nombre,
                predeterminado: perfil.predeterminado,
            })),
            roles: roles.map((rolUsuario) => ({
                id: rolUsuario.rol.id,
                codigo: rolUsuario.rol.codigo,
                nombre: rolUsuario.rol.nombre,
            })),
            permisos: permisos.map((permiso) => permiso.codigo),
        };
    }
    async resolveUsuarioParaLogin(correo, institucionId) {
        const usuarios = await this.usuariosRepository.find({
            where: { correo, activo: true },
        });
        if (!usuarios.length) {
            throw new common_1.UnauthorizedException('No existe un usuario activo con ese correo');
        }
        if (institucionId) {
            const usuario = usuarios.find((item) => item.institucionId === institucionId);
            if (!usuario) {
                throw new common_1.UnauthorizedException('El usuario no pertenece a la institucion indicada');
            }
            return usuario;
        }
        if (usuarios.length > 1) {
            throw new common_1.BadRequestException('Debe indicar la institucion porque el correo tiene multiples usuarios');
        }
        return usuarios[0];
    }
    async obtenerMetodoLocal(usuarioId) {
        const proveedor = await this.proveedoresRepository.findOne({
            where: { codigo: 'local' },
        });
        if (!proveedor) {
            throw new common_1.NotFoundException('Proveedor local no configurado');
        }
        const metodo = await this.metodosRepository.findOne({
            where: {
                usuarioId,
                proveedorAutenticacionId: proveedor.id,
                activo: true,
            },
        });
        if (!metodo) {
            throw new common_1.NotFoundException('Metodo de autenticacion local no encontrado');
        }
        return metodo;
    }
    async registrarIntentoFallido(metodo) {
        metodo.intentosFallidos += 1;
        const maxIntentos = Number(this.configService.get('AUTH_MAX_FAILED_ATTEMPTS', '5'));
        if (metodo.intentosFallidos >= maxIntentos) {
            metodo.bloqueadoHasta = new Date(Date.now() + 15 * 60_000);
            metodo.intentosFallidos = 0;
        }
        await this.metodosRepository.save(metodo);
    }
    resolvePerfilSeleccionado(perfiles, perfilIdSeleccionado) {
        if (perfilIdSeleccionado) {
            const perfil = perfiles.find((item) => item.id === perfilIdSeleccionado);
            if (!perfil) {
                throw new common_1.BadRequestException('El perfil seleccionado no pertenece al usuario');
            }
            return perfil;
        }
        if (perfiles.length === 1) {
            return perfiles[0];
        }
        return perfiles.find((item) => item.predeterminado);
    }
    async emitirSesion(usuario, contexto, perfilIdSeleccionado, request) {
        const sessionId = (0, crypto_1.randomUUID)();
        const payload = {
            sub: usuario.id,
            usuarioId: usuario.id,
            institucionId: usuario.institucionId,
            personaId: usuario.personaId,
            perfilIdSeleccionado,
            perfilCodigoSeleccionado: contexto.perfiles.find((perfil) => perfil.id === perfilIdSeleccionado)?.codigo ?? null,
            roles: contexto.roles.map((rol) => rol.codigo),
            superadministrador: usuario.superadministrador,
            sessionId,
        };
        const accessToken = await this.tokenService.generateAccessToken(payload);
        const refreshToken = await this.tokenService.generateRefreshToken(payload);
        const metodo = await this.obtenerMetodoLocal(usuario.id);
        metodo.refreshTokenHash = await this.passwordService.hash(refreshToken);
        await this.metodosRepository.save(metodo);
        await this.sesionesRepository.save(this.sesionesRepository.create({
            id: sessionId,
            usuarioId: usuario.id,
            refreshTokenHash: metodo.refreshTokenHash,
            ip: request.ip ?? null,
            userAgent: request.headers['user-agent'] ?? null,
            expiraAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }));
        usuario.ultimoAccesoAt = new Date();
        await this.usuariosRepository.save(usuario);
        return {
            accessToken,
            refreshToken,
            contextoAcceso: contexto,
            perfilPredeterminado: contexto.perfiles.find((perfil) => perfil.id === perfilIdSeleccionado) ?? null,
            googleLogin: {
                habilitado: this.configService.get('GOOGLE_OIDC_ENABLED', 'false') === 'true',
                issuer: this.configService.get('GOOGLE_OIDC_ISSUER'),
            },
        };
    }
    async emitirSesionDesdePayload(payload, contexto, request, sessionId) {
        const nextPayload = { ...payload, sessionId };
        const accessToken = await this.tokenService.generateAccessToken(nextPayload);
        const refreshToken = await this.tokenService.generateRefreshToken(nextPayload);
        const metodo = await this.obtenerMetodoLocal(payload.usuarioId);
        metodo.refreshTokenHash = await this.passwordService.hash(refreshToken);
        await this.metodosRepository.save(metodo);
        const sesion = await this.sesionesRepository.findOneByOrFail({ id: sessionId });
        sesion.refreshTokenHash = metodo.refreshTokenHash;
        sesion.ip = request.ip ?? sesion.ip;
        sesion.userAgent = request.headers['user-agent'] ?? sesion.userAgent;
        await this.sesionesRepository.save(sesion);
        return {
            accessToken,
            refreshToken,
            contextoAcceso: contexto,
        };
    }
    async findMatchingRecoveryToken(candidates, rawToken) {
        for (const token of candidates) {
            const matches = await this.passwordService.compare(rawToken, token.tokenHash);
            if (matches) {
                return token;
            }
        }
        return null;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(database_1.Usuario)),
    __param(1, (0, typeorm_1.InjectRepository)(database_1.MetodoAutenticacionUsuario)),
    __param(2, (0, typeorm_1.InjectRepository)(database_1.ProveedorAutenticacion)),
    __param(3, (0, typeorm_1.InjectRepository)(database_1.PerfilUsuario)),
    __param(4, (0, typeorm_1.InjectRepository)(database_1.TipoPerfil)),
    __param(5, (0, typeorm_1.InjectRepository)(database_1.RolUsuario)),
    __param(6, (0, typeorm_1.InjectRepository)(database_1.Rol)),
    __param(7, (0, typeorm_1.InjectRepository)(database_1.RolPermiso)),
    __param(8, (0, typeorm_1.InjectRepository)(database_1.Permiso)),
    __param(9, (0, typeorm_1.InjectRepository)(database_1.SesionUsuario)),
    __param(10, (0, typeorm_1.InjectRepository)(database_1.TokenRecuperacionContrasena)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        auth_1.PasswordService,
        auth_1.TokenService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map