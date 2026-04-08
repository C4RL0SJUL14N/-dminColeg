import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles, ROLE_SUPERADMIN } from '@libs/common';
import {
  AsignarAdministradorAppDto,
  AsignarPerfilDto,
  AsignarRolDto,
} from './dto';
import { AccessControlService } from './access-control.service';

@ApiTags('Access Control')
@ApiBearerAuth()
@Controller()
export class AccessControlController {
  constructor(private readonly accessControlService: AccessControlService) {}

  @Get('usuarios/:id/contexto-acceso')
  getContextoAcceso(@Param('id') usuarioId: string) {
    return this.accessControlService.getContextoAcceso(usuarioId);
  }

  @Get('usuarios/:id/permisos-efectivos')
  getPermisosEfectivos(@Param('id') usuarioId: string) {
    return this.accessControlService.getPermisosEfectivos(usuarioId);
  }

  @Roles(ROLE_SUPERADMIN)
  @Post('usuarios/:id/perfiles')
  asignarPerfil(@Param('id') usuarioId: string, @Body() dto: AsignarPerfilDto) {
    return this.accessControlService.asignarPerfil(usuarioId, dto);
  }

  @Roles(ROLE_SUPERADMIN)
  @Post('usuarios/:id/roles')
  asignarRol(@Param('id') usuarioId: string, @Body() dto: AsignarRolDto) {
    return this.accessControlService.asignarRol(usuarioId, dto);
  }

  @Roles(ROLE_SUPERADMIN)
  @Post('instituciones/:id/administradores-app')
  asignarAdministradorApp(
    @Param('id') institucionId: string,
    @Body() dto: AsignarAdministradorAppDto,
  ) {
    return this.accessControlService.asignarAdministradorApp(institucionId, dto);
  }
}

