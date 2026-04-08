import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomUUID } from 'crypto';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { PasswordService, TokenService } from '@libs/auth';
import { mergeAuditMetadata, setAuditAfterState, setAuditEntityId } from '@libs/audit';
import { JwtPayload } from '@libs/common';
import {
  MetodoAutenticacionUsuario,
  PerfilUsuario,
  Permiso,
  ProveedorAutenticacion,
  Rol,
  RolPermiso,
  RolUsuario,
  SesionUsuario,
  TipoPerfil,
  TokenRecuperacionContrasena,
  Usuario,
} from '@libs/database';
import {
  CambiarContrasenaInicialDto,
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  RestablecerContrasenaDto,
  SolicitarRecuperacionDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    @InjectRepository(MetodoAutenticacionUsuario)
    private readonly metodosRepository: Repository<MetodoAutenticacionUsuario>,
    @InjectRepository(ProveedorAutenticacion)
    private readonly proveedoresRepository: Repository<ProveedorAutenticacion>,
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
    @InjectRepository(SesionUsuario)
    private readonly sesionesRepository: Repository<SesionUsuario>,
    @InjectRepository(TokenRecuperacionContrasena)
    private readonly tokensRecuperacionRepository: Repository<TokenRecuperacionContrasena>,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto, request: Request) {
    const usuario = await this.resolveUsuarioParaLogin(dto.correo, dto.institucionId);
    setAuditEntityId(usuario.id);
    mergeAuditMetadata({ correo: dto.correo });
    if (usuario.bloqueadoHasta && usuario.bloqueadoHasta > new Date()) {
      throw new ForbiddenException('Usuario temporalmente bloqueado por intentos fallidos');
    }

    if (!usuario.hashContrasena) {
      throw new UnauthorizedException('El usuario no tiene autenticacion local habilitada');
    }

    const validPassword = await this.passwordService.compare(
      dto.contrasena,
      usuario.hashContrasena,
    );

    if (!validPassword) {
      await this.registrarIntentoFallidoUsuario(usuario);
      throw new UnauthorizedException('Credenciales invalidas');
    }

    usuario.intentosFallidosInicio = 0;
    usuario.bloqueadoHasta = null;
    usuario.ultimoInicioSesionEn = new Date();
    await this.usuariosRepository.save(usuario);

    const contexto = await this.resolveContextoAcceso(usuario.id);
    const perfilSeleccionado = this.resolvePerfilSeleccionado(
      contexto.perfiles,
      dto.perfilIdSeleccionado,
    );

    if (usuario.debeCambiarContrasena) {
      setAuditAfterState({
        requiereCambioContrasena: true,
        usuarioId: usuario.id,
        institucionId: usuario.institucionId,
      });
      return {
        requiereCambioContrasena: true,
        usuarioId: usuario.id,
        institucionId: usuario.institucionId,
        perfilesDisponibles: contexto.perfiles,
      };
    }

    if (!perfilSeleccionado && contexto.perfiles.length > 1) {
      setAuditAfterState({
        requiereSeleccionPerfil: true,
        usuarioId: usuario.id,
        perfilesDisponibles: contexto.perfiles.length,
      });
      return {
        requiereSeleccionPerfil: true,
        perfilesDisponibles: contexto.perfiles,
        contextoAcceso: contexto,
      };
    }

    return this.emitirSesion(usuario, contexto, perfilSeleccionado?.id ?? null, request);
  }

  async refresh(dto: RefreshTokenDto, request: Request) {
    const payload = await this.tokenService.verifyRefreshToken(dto.refreshToken);
    setAuditEntityId(payload.usuarioId);
    const sesion = await this.sesionesRepository.findOne({
      where: { id: payload.sessionId, usuarioId: payload.usuarioId },
    });

    if (!sesion || sesion.revocadaEn) {
      throw new UnauthorizedException('La sesion ya no es valida');
    }

    const refreshJti = this.hashToken(dto.refreshToken);
    if (sesion.identificadorTokenRefresco !== refreshJti) {
      throw new UnauthorizedException('Refresh token invalido');
    }

    const contexto = await this.resolveContextoAcceso(payload.usuarioId);
    return this.emitirSesionDesdePayload(payload, contexto, request, sesion.id);
  }

  async logout(currentUser: JwtPayload, dto: LogoutDto) {
    setAuditEntityId(currentUser.usuarioId);
    mergeAuditMetadata({ sessionId: currentUser.sessionId, tieneRefreshToken: Boolean(dto.refreshToken) });
    const sessionId = currentUser.sessionId;
    const sesion = await this.sesionesRepository.findOne({
      where: { id: sessionId, usuarioId: currentUser.usuarioId },
    });

    if (sesion) {
      sesion.revocadaEn = new Date();
      await this.sesionesRepository.save(sesion);
    }

    setAuditAfterState({ cerrado: true, sessionId });
    return { cerrado: true };
  }

  async solicitarRecuperacion(dto: SolicitarRecuperacionDto) {
    const usuario = await this.resolveUsuarioParaLogin(dto.correo, dto.institucionId);
    setAuditEntityId(usuario.id);
    const tokenPlano = randomUUID();
    const tokenHash = await this.passwordService.hash(tokenPlano);
    const ttlMinutes = Number(this.configService.get('PASSWORD_RESET_TTL_MINUTES', '30'));

    await this.tokensRecuperacionRepository.save(
      this.tokensRecuperacionRepository.create({
        usuarioId: usuario.id,
        tokenHash,
        expiraAt: new Date(Date.now() + ttlMinutes * 60_000),
      }),
    );

    setAuditAfterState({ solicitado: true, usuarioId: usuario.id });
    return {
      solicitado: true,
      mensaje:
        'Token de recuperacion generado. Integre el proveedor de correo para el envio real.',
      tokenDesarrollo: tokenPlano,
    };
  }

  async restablecerContrasena(dto: RestablecerContrasenaDto) {
    const tokens = await this.tokensRecuperacionRepository.find({
      where: {},
      order: { createdAt: 'DESC' },
      take: 20,
    });

    const tokenEntity = await this.findMatchingRecoveryToken(tokens, dto.token);
    if (!tokenEntity || tokenEntity.usadoAt || tokenEntity.expiraAt < new Date()) {
      throw new BadRequestException('Token de recuperacion invalido o expirado');
    }

    const usuario = await this.usuariosRepository.findOneByOrFail({ id: tokenEntity.usuarioId });
    setAuditEntityId(usuario.id);
    usuario.hashContrasena = await this.passwordService.hash(dto.nuevaContrasena);
    usuario.intentosFallidosInicio = 0;
    usuario.bloqueadoHasta = null;
    usuario.debeCambiarContrasena = false;
    usuario.ultimaActualizacionContrasenaEn = new Date();
    await this.usuariosRepository.save(usuario);

    tokenEntity.usadoAt = new Date();
    await this.tokensRecuperacionRepository.save(tokenEntity);

    setAuditAfterState({ restablecida: true, usuarioId: usuario.id });
    return { restablecida: true };
  }

  async cambiarContrasenaInicial(dto: CambiarContrasenaInicialDto, request: Request) {
    const usuario = await this.resolveUsuarioParaLogin(dto.correo, dto.institucionId);
    setAuditEntityId(usuario.id);
    if (!usuario.hashContrasena) {
      throw new UnauthorizedException('Metodo local no configurado');
    }

    const validPassword = await this.passwordService.compare(
      dto.contrasenaActual,
      usuario.hashContrasena,
    );
    if (!validPassword) {
      throw new UnauthorizedException('La contrasena actual no coincide');
    }

    usuario.hashContrasena = await this.passwordService.hash(dto.nuevaContrasena);
    usuario.intentosFallidosInicio = 0;
    usuario.bloqueadoHasta = null;
    usuario.debeCambiarContrasena = false;
    usuario.ultimaActualizacionContrasenaEn = new Date();
    await this.usuariosRepository.save(usuario);

    const contexto = await this.resolveContextoAcceso(usuario.id);
    const perfilSeleccionado =
      contexto.perfiles.find((perfil) => perfil.predeterminado) ?? contexto.perfiles[0] ?? null;

    return this.emitirSesion(usuario, contexto, perfilSeleccionado?.id ?? null, request);
  }

  async listarSesiones(currentUser: JwtPayload) {
    return this.sesionesRepository.find({
      where: { usuarioId: currentUser.usuarioId },
      order: { iniciadaEn: 'DESC' },
    });
  }

  async resolveContextoAcceso(usuarioId: string) {
    const usuario = await this.usuariosRepository.findOne({ where: { id: usuarioId } });
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
        superadministrador:
          usuario.institucionId === null ||
        roles.some((rolUsuario) => rolUsuario.rol.codigo === 'superadministrador'),
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

  private async resolveUsuarioParaLogin(correo: string, institucionId?: string) {
    const usuarios = await this.usuariosRepository.find({
      where: { correo },
    });

    if (!usuarios.length) {
      throw new UnauthorizedException('No existe un usuario activo con ese correo');
    }

    if (institucionId) {
      const usuario = usuarios.find(
        (item) => item.institucionId === institucionId && item.estado === 'activo',
      );
      if (!usuario) {
        throw new UnauthorizedException('El usuario no pertenece a la institucion indicada');
      }
      return usuario;
    }

    if (usuarios.length > 1) {
      throw new BadRequestException(
        'Debe indicar la institucion porque el correo tiene multiples usuarios',
      );
    }

    const activo = usuarios.find((item) => item.estado === 'activo');
    if (!activo) {
      throw new UnauthorizedException('No existe un usuario activo con ese correo');
    }

    return activo;
  }

  private async obtenerMetodoLocal(usuarioId: string) {
    const proveedor = await this.proveedoresRepository.findOne({
      where: { codigo: 'local' },
    });
    if (!proveedor) {
      throw new NotFoundException('Proveedor local no configurado');
    }

    const metodo = await this.metodosRepository.findOne({
      where: {
        usuarioId,
        proveedorAutenticacionId: proveedor.id,
        activo: true,
      },
    });

    if (!metodo) {
      throw new NotFoundException('Metodo de autenticacion local no encontrado');
    }

    return metodo;
  }

  private async registrarIntentoFallidoUsuario(usuario: Usuario) {
    usuario.intentosFallidosInicio += 1;
    const maxIntentos = Number(this.configService.get('AUTH_MAX_FAILED_ATTEMPTS', '5'));
    if (usuario.intentosFallidosInicio >= maxIntentos) {
      usuario.bloqueadoHasta = new Date(Date.now() + 15 * 60_000);
      usuario.intentosFallidosInicio = 0;
    }
    await this.usuariosRepository.save(usuario);
  }

  private resolvePerfilSeleccionado(
    perfiles: Array<{ id: string; predeterminado: boolean }>,
    perfilIdSeleccionado?: string,
  ) {
    if (perfilIdSeleccionado) {
      const perfil = perfiles.find((item) => item.id === perfilIdSeleccionado);
      if (!perfil) {
        throw new BadRequestException('El perfil seleccionado no pertenece al usuario');
      }
      return perfil;
    }

    if (perfiles.length === 1) {
      return perfiles[0];
    }

    return perfiles.find((item) => item.predeterminado);
  }

  private async emitirSesion(
    usuario: Usuario,
    contexto: Awaited<ReturnType<AuthService['resolveContextoAcceso']>>,
    perfilIdSeleccionado: string | null,
    request: Request,
  ) {
    const sessionId = randomUUID();
    const payload: JwtPayload = {
      sub: usuario.id,
      usuarioId: usuario.id,
      institucionId: usuario.institucionId,
      personaId: usuario.personaId,
      perfilIdSeleccionado,
      perfilCodigoSeleccionado:
        contexto.perfiles.find((perfil) => perfil.id === perfilIdSeleccionado)?.codigo ?? null,
        roles: contexto.roles.map((rol) => rol.codigo),
        superadministrador:
          usuario.institucionId === null ||
        contexto.roles.some((rol) => rol.codigo === 'superadministrador'),
        sessionId,
      };

    const accessToken = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload);
    const accessJti = this.hashToken(accessToken);
    const refreshJti = this.hashToken(refreshToken);

    await this.sesionesRepository.save(
      this.sesionesRepository.create({
        id: sessionId,
        usuarioId: usuario.id,
        perfilUsuarioId: perfilIdSeleccionado,
        identificadorTokenAcceso: accessJti,
        identificadorTokenRefresco: refreshJti,
        tipoDispositivo: null,
        plataforma: null,
        versionApp: null,
        ip: request.ip ?? null,
        agenteUsuario: String(request.headers['user-agent'] ?? ''),
        iniciadaEn: new Date(),
        ultimaActividadEn: new Date(),
        revocadaEn: null,
        motivoRevocacion: null,
      }),
    );

    usuario.ultimoInicioSesionEn = new Date();
    await this.usuariosRepository.save(usuario);

    setAuditAfterState({
      sessionId,
      usuarioId: usuario.id,
      institucionId: usuario.institucionId,
      perfilIdSeleccionado,
    });

    return {
      accessToken,
      refreshToken,
      contextoAcceso: contexto,
      perfilPredeterminado:
        contexto.perfiles.find((perfil) => perfil.id === perfilIdSeleccionado) ?? null,
      googleLogin: {
        habilitado: this.configService.get('GOOGLE_OIDC_ENABLED', 'false') === 'true',
        issuer: this.configService.get('GOOGLE_OIDC_ISSUER'),
      },
    };
  }

  private async emitirSesionDesdePayload(
    payload: JwtPayload,
    contexto: Awaited<ReturnType<AuthService['resolveContextoAcceso']>>,
    request: Request,
    sessionId: string,
  ) {
    const nextPayload: JwtPayload = { ...payload, sessionId };
    const accessToken = await this.tokenService.generateAccessToken(nextPayload);
    const refreshToken = await this.tokenService.generateRefreshToken(nextPayload);

    const sesion = await this.sesionesRepository.findOneByOrFail({ id: sessionId });
    sesion.identificadorTokenAcceso = this.hashToken(accessToken);
    sesion.identificadorTokenRefresco = this.hashToken(refreshToken);
    sesion.ip = request.ip ?? sesion.ip;
    sesion.agenteUsuario = String(request.headers['user-agent'] ?? sesion.agenteUsuario ?? '');
    sesion.ultimaActividadEn = new Date();
    await this.sesionesRepository.save(sesion);

    setAuditAfterState({
      sessionId,
      usuarioId: payload.usuarioId,
    });

    return {
      accessToken,
      refreshToken,
      contextoAcceso: contexto,
    };
  }

  private async findMatchingRecoveryToken(
    candidates: TokenRecuperacionContrasena[],
    rawToken: string,
  ) {
    for (const token of candidates) {
      const matches = await this.passwordService.compare(rawToken, token.tokenHash);
      if (matches) {
        return token;
      }
    }

    return null;
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
