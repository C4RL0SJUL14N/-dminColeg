import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Audit, AUDIT_EVENT_TYPE, AUDIT_SEVERITY } from '@libs/audit';
import { Public } from '@libs/common';
import { ActualizarPersonaDto, CrearPersonaDto } from './dto';
import { IdentityService } from './identity.service';

@ApiTags('Identity')
@Controller()
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @ApiBearerAuth()
  @Post('personas')
  @Audit({
    servicio: 'identity-service',
    modulo: 'identity',
    entidad: 'persona',
    accion: 'crear-persona',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  createPersona(@Body() dto: CrearPersonaDto) {
    return this.identityService.createPersona(dto);
  }

  @ApiBearerAuth()
  @Get('personas/buscar-por-documento')
  @Audit({
    servicio: 'identity-service',
    modulo: 'identity',
    entidad: 'persona',
    accion: 'buscar-por-documento',
    tipoEvento: AUDIT_EVENT_TYPE.SEGURIDAD,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
  })
  buscarPorDocumento(
    @Query('tipoDocumentoId') tipoDocumentoId: string,
    @Query('numeroDocumento') numeroDocumento: string,
  ) {
    return this.identityService.buscarPorDocumento(tipoDocumentoId, numeroDocumento);
  }

  @ApiBearerAuth()
  @Get('personas/:id')
  getPersonaById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.identityService.getPersonaById(id);
  }

  @ApiBearerAuth()
  @Patch('personas/:id')
  @Audit({
    servicio: 'identity-service',
    modulo: 'identity',
    entidad: 'persona',
    entidadIdParam: 'id',
    accion: 'actualizar-persona',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.WARN,
    capturarPayload: true,
    capturarAntes: true,
    capturarDespues: true,
  })
  updatePersona(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ActualizarPersonaDto,
  ) {
    return this.identityService.updatePersona(id, dto);
  }

  @Public()
  @Get('tipos-documento')
  getTiposDocumento() {
    return this.identityService.getTiposDocumento();
  }

  @Public()
  @Get('generos')
  getGeneros() {
    return this.identityService.getGeneros();
  }
}
