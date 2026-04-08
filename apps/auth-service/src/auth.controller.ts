import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Audit, AUDIT_EVENT_TYPE, AUDIT_SEVERITY } from '@libs/audit';
import { CurrentUser, JwtPayload, Public } from '@libs/common';
import {
  CambiarContrasenaInicialDto,
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  RestablecerContrasenaDto,
  SolicitarRecuperacionDto,
} from './dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @Audit({
    servicio: 'auth-service',
    modulo: 'auth',
    entidad: 'usuario',
    accion: 'login',
    tipoEvento: AUDIT_EVENT_TYPE.SEGURIDAD,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
  })
  login(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.login(dto, request);
  }

  @Public()
  @Post('refresh')
  @Audit({
    servicio: 'auth-service',
    modulo: 'auth',
    entidad: 'sesion',
    accion: 'refresh',
    tipoEvento: AUDIT_EVENT_TYPE.SEGURIDAD,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
  })
  refresh(@Body() dto: RefreshTokenDto, @Req() request: Request) {
    return this.authService.refresh(dto, request);
  }

  @ApiBearerAuth()
  @Post('logout')
  @Audit({
    servicio: 'auth-service',
    modulo: 'auth',
    entidad: 'sesion',
    accion: 'logout',
    tipoEvento: AUDIT_EVENT_TYPE.SEGURIDAD,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
  })
  logout(@CurrentUser() user: JwtPayload, @Body() dto: LogoutDto) {
    return this.authService.logout(user, dto);
  }

  @Public()
  @Post('solicitar-recuperacion')
  @Audit({
    servicio: 'auth-service',
    modulo: 'auth',
    entidad: 'usuario',
    accion: 'solicitar-recuperacion',
    tipoEvento: AUDIT_EVENT_TYPE.SEGURIDAD,
    severidad: AUDIT_SEVERITY.WARN,
    capturarPayload: true,
  })
  solicitarRecuperacion(@Body() dto: SolicitarRecuperacionDto) {
    return this.authService.solicitarRecuperacion(dto);
  }

  @Public()
  @Post('restablecer-contrasena')
  @Audit({
    servicio: 'auth-service',
    modulo: 'auth',
    entidad: 'usuario',
    accion: 'restablecer-contrasena',
    tipoEvento: AUDIT_EVENT_TYPE.SEGURIDAD,
    severidad: AUDIT_SEVERITY.WARN,
    capturarPayload: true,
  })
  restablecerContrasena(@Body() dto: RestablecerContrasenaDto) {
    return this.authService.restablecerContrasena(dto);
  }

  @Public()
  @Post('cambiar-contrasena-inicial')
  @Audit({
    servicio: 'auth-service',
    modulo: 'auth',
    entidad: 'usuario',
    accion: 'cambiar-contrasena-inicial',
    tipoEvento: AUDIT_EVENT_TYPE.SEGURIDAD,
    severidad: AUDIT_SEVERITY.WARN,
    capturarPayload: true,
  })
  cambiarContrasenaInicial(
    @Body() dto: CambiarContrasenaInicialDto,
    @Req() request: Request,
  ) {
    return this.authService.cambiarContrasenaInicial(dto, request);
  }

  @ApiBearerAuth()
  @Get('sesiones')
  sesiones(@CurrentUser() user: JwtPayload) {
    return this.authService.listarSesiones(user);
  }
}
