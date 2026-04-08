import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
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
  login(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.login(dto, request);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto, @Req() request: Request) {
    return this.authService.refresh(dto, request);
  }

  @ApiBearerAuth()
  @Post('logout')
  logout(@CurrentUser() user: JwtPayload, @Body() dto: LogoutDto) {
    return this.authService.logout(user, dto);
  }

  @Public()
  @Post('solicitar-recuperacion')
  solicitarRecuperacion(@Body() dto: SolicitarRecuperacionDto) {
    return this.authService.solicitarRecuperacion(dto);
  }

  @Public()
  @Post('restablecer-contrasena')
  restablecerContrasena(@Body() dto: RestablecerContrasenaDto) {
    return this.authService.restablecerContrasena(dto);
  }

  @Public()
  @Post('cambiar-contrasena-inicial')
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

