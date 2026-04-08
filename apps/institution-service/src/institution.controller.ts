import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  InstitutionScoped,
  JwtPayload,
  ROLE_SUPERADMIN,
  Roles,
} from '@libs/common';
import {
  ActualizarInstitucionDto,
  ConfiguracionInstitucionDto,
  CrearAnioLectivoDto,
  CrearEscalaValoracionDto,
  CrearInstitucionDto,
  CrearPeriodoAcademicoDto,
  CrearSedeDto,
} from './dto';
import { InstitutionService } from './institution.service';

@ApiTags('Institution')
@ApiBearerAuth()
@Controller()
export class InstitutionController {
  constructor(private readonly institutionService: InstitutionService) {}

  @Roles(ROLE_SUPERADMIN)
  @Post('instituciones')
  createInstitucion(
    @Body() dto: CrearInstitucionDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.institutionService.createInstitucion(dto, currentUser);
  }

  @Get('instituciones')
  findInstituciones(@CurrentUser() currentUser: JwtPayload) {
    return this.institutionService.findInstituciones(currentUser);
  }

  @InstitutionScoped({ param: 'id' })
  @Get('instituciones/:id')
  findInstitucionById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.institutionService.findInstitucionById(id);
  }

  @InstitutionScoped({ param: 'id' })
  @Patch('instituciones/:id')
  updateInstitucion(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ActualizarInstitucionDto,
  ) {
    return this.institutionService.updateInstitucion(id, dto);
  }

  @InstitutionScoped({ param: 'id' })
  @Post('instituciones/:id/sedes')
  createSede(@Param('id', new ParseUUIDPipe()) institucionId: string, @Body() dto: CrearSedeDto) {
    return this.institutionService.createSede(institucionId, dto);
  }

  @InstitutionScoped({ param: 'id' })
  @Get('instituciones/:id/sedes')
  findSedes(@Param('id', new ParseUUIDPipe()) institucionId: string) {
    return this.institutionService.findSedes(institucionId);
  }

  @InstitutionScoped({ param: 'id' })
  @Post('instituciones/:id/anios-lectivos')
  createAnioLectivo(
    @Param('id', new ParseUUIDPipe()) institucionId: string,
    @Body() dto: CrearAnioLectivoDto,
  ) {
    return this.institutionService.createAnioLectivo(institucionId, dto);
  }

  @InstitutionScoped({ param: 'id' })
  @Get('instituciones/:id/anios-lectivos')
  findAniosLectivos(@Param('id', new ParseUUIDPipe()) institucionId: string) {
    return this.institutionService.findAniosLectivos(institucionId);
  }

  @Post('anios-lectivos/:id/periodos')
  createPeriodo(
    @Param('id', new ParseUUIDPipe()) anioLectivoId: string,
    @Body() dto: CrearPeriodoAcademicoDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.institutionService.createPeriodo(anioLectivoId, dto, currentUser);
  }

  @Get('anios-lectivos/:id/periodos')
  findPeriodos(
    @Param('id', new ParseUUIDPipe()) anioLectivoId: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.institutionService.findPeriodos(anioLectivoId, currentUser);
  }

  @Post('periodos/:id/cerrar')
  cerrarPeriodo(
    @Param('id', new ParseUUIDPipe()) periodoId: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.institutionService.cerrarPeriodo(periodoId, currentUser);
  }

  @InstitutionScoped({ param: 'id' })
  @Put('instituciones/:id/configuracion')
  upsertConfiguracion(
    @Param('id', new ParseUUIDPipe()) institucionId: string,
    @Body() dto: ConfiguracionInstitucionDto,
  ) {
    return this.institutionService.upsertConfiguracion(institucionId, dto);
  }

  @InstitutionScoped({ param: 'id' })
  @Get('instituciones/:id/configuracion')
  getConfiguracion(@Param('id', new ParseUUIDPipe()) institucionId: string) {
    return this.institutionService.getConfiguracion(institucionId);
  }

  @InstitutionScoped({ param: 'id' })
  @Post('instituciones/:id/escalas-valoracion')
  createEscalaValoracion(
    @Param('id', new ParseUUIDPipe()) institucionId: string,
    @Body() dto: CrearEscalaValoracionDto,
  ) {
    return this.institutionService.createEscalaValoracion(institucionId, dto);
  }

  @InstitutionScoped({ param: 'id' })
  @Get('instituciones/:id/escalas-valoracion')
  findEscalasValoracion(@Param('id', new ParseUUIDPipe()) institucionId: string) {
    return this.institutionService.findEscalasValoracion(institucionId);
  }
}
