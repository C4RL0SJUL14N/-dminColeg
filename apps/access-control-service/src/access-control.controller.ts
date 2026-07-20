import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Audit, AUDIT_EVENT_TYPE, AUDIT_SEVERITY } from '@libs/audit';
import {
  CurrentUser,
  JwtPayload,
  Roles,
  ROLE_SUPERADMIN,
} from '@libs/common';
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
  @Audit({
    servicio: 'access-control-service',
    modulo: 'access-control',
    entidad: 'usuario',
    entidadIdParam: 'id',
    accion: 'consultar-contexto-acceso',
    tipoEvento: AUDIT_EVENT_TYPE.SEGURIDAD,
    severidad: AUDIT_SEVERITY.INFO,
  })
  getContextoAcceso(
    @Param('id', new ParseUUIDPipe()) usuarioId: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.accessControlService.getContextoAcceso(usuarioId, currentUser);
  }

  @Get('usuarios/:id/permisos-efectivos')
  @Audit({
    servicio: 'access-control-service',
    modulo: 'access-control',
    entidad: 'usuario',
    entidadIdParam: 'id',
    accion: 'consultar-permisos-efectivos',
    tipoEvento: AUDIT_EVENT_TYPE.SEGURIDAD,
    severidad: AUDIT_SEVERITY.INFO,
  })
  getPermisosEfectivos(
    @Param('id', new ParseUUIDPipe()) usuarioId: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.accessControlService.getPermisosEfectivos(
      usuarioId,
      currentUser,
    );
  }

  @Roles(ROLE_SUPERADMIN)
  @Post('usuarios/:id/perfiles')
  @Audit({
    servicio: 'access-control-service',
    modulo: 'access-control',
    entidad: 'usuario',
    entidadIdParam: 'id',
    accion: 'asignar-perfil',
    tipoEvento: AUDIT_EVENT_TYPE.SEGURIDAD,
    severidad: AUDIT_SEVERITY.WARN,
    capturarPayload: true,
    capturarDespues: true,
  })
  asignarPerfil(@Param('id') usuarioId: string, @Body() dto: AsignarPerfilDto) {
    return this.accessControlService.asignarPerfil(usuarioId, dto);
  }

  @Roles(ROLE_SUPERADMIN)
  @Post('usuarios/:id/roles')
  @Audit({
    servicio: 'access-control-service',
    modulo: 'access-control',
    entidad: 'usuario',
    entidadIdParam: 'id',
    accion: 'asignar-rol',
    tipoEvento: AUDIT_EVENT_TYPE.SEGURIDAD,
    severidad: AUDIT_SEVERITY.WARN,
    capturarPayload: true,
    capturarDespues: true,
  })
  asignarRol(@Param('id') usuarioId: string, @Body() dto: AsignarRolDto) {
    return this.accessControlService.asignarRol(usuarioId, dto);
  }

  @Roles(ROLE_SUPERADMIN)
  @Post('instituciones/:id/administradores-app')
  @Audit({
    servicio: 'access-control-service',
    modulo: 'access-control',
    entidad: 'institucion',
    entidadIdParam: 'id',
    accion: 'asignar-administrador-app',
    tipoEvento: AUDIT_EVENT_TYPE.SEGURIDAD,
    severidad: AUDIT_SEVERITY.WARN,
    capturarPayload: true,
    capturarDespues: true,
  })
  asignarAdministradorApp(
    @Param('id') institucionId: string,
    @Body() dto: AsignarAdministradorAppDto,
  ) {
    return this.accessControlService.asignarAdministradorApp(institucionId, dto);
  }
}
