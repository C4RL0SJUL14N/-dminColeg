import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Audit, AUDIT_EVENT_TYPE, AUDIT_SEVERITY } from '@libs/audit';
import {
  CurrentUser,
  InstitutionScoped,
  JwtPayload,
  ROLE_SUPERADMIN,
  Roles,
} from '@libs/common';
import {
  ActualizarInstitucionDto,
  ActualizarAnioLectivoDto,
  ActualizarEscalaValoracionDto,
  ActualizarSedeDto,
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
  @Audit({
    servicio: 'institution-service',
    modulo: 'institution',
    entidad: 'institucion',
    accion: 'crear-institucion',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.WARN,
    capturarPayload: true,
    capturarDespues: true,
  })
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
  @Audit({
    servicio: 'institution-service',
    modulo: 'institution',
    entidad: 'institucion',
    entidadIdParam: 'id',
    accion: 'actualizar-institucion',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.WARN,
    capturarPayload: true,
    capturarAntes: true,
    capturarDespues: true,
  })
  updateInstitucion(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ActualizarInstitucionDto,
  ) {
    return this.institutionService.updateInstitucion(id, dto);
  }

  @Roles(ROLE_SUPERADMIN)
  @Delete('instituciones/:id')
  @Audit({
    servicio: 'institution-service',
    modulo: 'institution',
    entidad: 'institucion',
    entidadIdParam: 'id',
    accion: 'eliminar-institucion',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.WARN,
    capturarAntes: true,
    capturarDespues: true,
  })
  deleteInstitucion(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.institutionService.deleteInstitucion(id);
  }

  @InstitutionScoped({ param: 'id' })
  @Post('instituciones/:id/sedes')
  @Audit({
    servicio: 'institution-service',
    modulo: 'institution',
    entidad: 'sede',
    entidadIdParam: 'id',
    accion: 'crear-sede',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  createSede(
    @Param('id', new ParseUUIDPipe()) institucionId: string,
    @Body() dto: CrearSedeDto,
  ) {
    return this.institutionService.createSede(institucionId, dto);
  }

  @InstitutionScoped({ param: 'id' })
  @Get('instituciones/:id/sedes')
  findSedes(@Param('id', new ParseUUIDPipe()) institucionId: string) {
    return this.institutionService.findSedes(institucionId);
  }

  @InstitutionScoped({ param: 'institucionId' })
  @Patch('instituciones/:institucionId/sedes/:sedeId')
  @Audit({
    servicio: 'institution-service',
    modulo: 'institution',
    entidad: 'sede',
    entidadIdParam: 'sedeId',
    accion: 'actualizar-sede',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarAntes: true,
    capturarDespues: true,
  })
  updateSede(
    @Param('institucionId', new ParseUUIDPipe()) institucionId: string,
    @Param('sedeId', new ParseUUIDPipe()) sedeId: string,
    @Body() dto: ActualizarSedeDto,
  ) {
    return this.institutionService.updateSede(institucionId, sedeId, dto);
  }

  @InstitutionScoped({ param: 'institucionId' })
  @Delete('instituciones/:institucionId/sedes/:sedeId')
  @Audit({
    servicio: 'institution-service',
    modulo: 'institution',
    entidad: 'sede',
    entidadIdParam: 'sedeId',
    accion: 'eliminar-sede',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.WARN,
    capturarAntes: true,
    capturarDespues: true,
  })
  deleteSede(
    @Param('institucionId', new ParseUUIDPipe()) institucionId: string,
    @Param('sedeId', new ParseUUIDPipe()) sedeId: string,
  ) {
    return this.institutionService.deleteSede(institucionId, sedeId);
  }

  @InstitutionScoped({ param: 'id' })
  @Post('instituciones/:id/anios-lectivos')
  @Audit({
    servicio: 'institution-service',
    modulo: 'institution',
    entidad: 'anio-lectivo',
    entidadIdParam: 'id',
    accion: 'crear-anio-lectivo',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
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

  @InstitutionScoped({ param: 'institucionId' })
  @Patch('instituciones/:institucionId/anios-lectivos/:anioId')
  @Audit({
    servicio: 'institution-service',
    modulo: 'institution',
    entidad: 'anio-lectivo',
    entidadIdParam: 'anioId',
    accion: 'actualizar-anio-lectivo',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.WARN,
    capturarPayload: true,
    capturarAntes: true,
    capturarDespues: true,
  })
  updateAnioLectivo(
    @Param('institucionId', new ParseUUIDPipe()) institucionId: string,
    @Param('anioId', new ParseUUIDPipe()) anioId: string,
    @Body() dto: ActualizarAnioLectivoDto,
  ) {
    return this.institutionService.updateAnioLectivo(
      institucionId,
      anioId,
      dto,
    );
  }

  @InstitutionScoped({ param: 'institucionId' })
  @Delete('instituciones/:institucionId/anios-lectivos/:anioId')
  @Audit({
    servicio: 'institution-service',
    modulo: 'institution',
    entidad: 'anio-lectivo',
    entidadIdParam: 'anioId',
    accion: 'eliminar-anio-lectivo',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.WARN,
    capturarAntes: true,
    capturarDespues: true,
  })
  deleteAnioLectivo(
    @Param('institucionId', new ParseUUIDPipe()) institucionId: string,
    @Param('anioId', new ParseUUIDPipe()) anioId: string,
  ) {
    return this.institutionService.deleteAnioLectivo(institucionId, anioId);
  }

  @Post('anios-lectivos/:id/periodos')
  @Audit({
    servicio: 'institution-service',
    modulo: 'institution',
    entidad: 'periodo-academico',
    entidadIdParam: 'id',
    accion: 'crear-periodo',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  createPeriodo(
    @Param('id', new ParseUUIDPipe()) anioLectivoId: string,
    @Body() dto: CrearPeriodoAcademicoDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.institutionService.createPeriodo(
      anioLectivoId,
      dto,
      currentUser,
    );
  }

  @Get('anios-lectivos/:id/periodos')
  findPeriodos(
    @Param('id', new ParseUUIDPipe()) anioLectivoId: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.institutionService.findPeriodos(anioLectivoId, currentUser);
  }

  @Post('periodos/:id/cerrar')
  @Audit({
    servicio: 'institution-service',
    modulo: 'institution',
    entidad: 'periodo-academico',
    entidadIdParam: 'id',
    accion: 'cerrar-periodo',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.WARN,
    capturarAntes: true,
    capturarDespues: true,
  })
  cerrarPeriodo(
    @Param('id', new ParseUUIDPipe()) periodoId: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.institutionService.cerrarPeriodo(periodoId, currentUser);
  }

  @InstitutionScoped({ param: 'id' })
  @Put('instituciones/:id/configuracion')
  @Audit({
    servicio: 'institution-service',
    modulo: 'institution',
    entidad: 'configuracion-institucion',
    entidadIdParam: 'id',
    accion: 'actualizar-configuracion-institucional',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.WARN,
    capturarPayload: true,
    capturarAntes: true,
    capturarDespues: true,
  })
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
  findEscalasValoracion(
    @Param('id', new ParseUUIDPipe()) institucionId: string,
  ) {
    return this.institutionService.findEscalasValoracion(institucionId);
  }

  @InstitutionScoped({ param: 'institucionId' })
  @Patch('instituciones/:institucionId/escalas-valoracion/:escalaId')
  @Audit({
    servicio: 'institution-service',
    modulo: 'institution',
    entidad: 'escala-valoracion',
    entidadIdParam: 'escalaId',
    accion: 'actualizar-escala-valoracion',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.WARN,
    capturarPayload: true,
    capturarAntes: true,
    capturarDespues: true,
  })
  updateEscalaValoracion(
    @Param('institucionId', new ParseUUIDPipe()) institucionId: string,
    @Param('escalaId', new ParseUUIDPipe()) escalaId: string,
    @Body() dto: ActualizarEscalaValoracionDto,
  ) {
    return this.institutionService.updateEscalaValoracion(
      institucionId,
      escalaId,
      dto,
    );
  }

  @InstitutionScoped({ param: 'institucionId' })
  @Delete('instituciones/:institucionId/escalas-valoracion/:escalaId')
  @Audit({
    servicio: 'institution-service',
    modulo: 'institution',
    entidad: 'escala-valoracion',
    entidadIdParam: 'escalaId',
    accion: 'eliminar-escala-valoracion',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.WARN,
    capturarAntes: true,
    capturarDespues: true,
  })
  deleteEscalaValoracion(
    @Param('institucionId', new ParseUUIDPipe()) institucionId: string,
    @Param('escalaId', new ParseUUIDPipe()) escalaId: string,
  ) {
    return this.institutionService.deleteEscalaValoracion(
      institucionId,
      escalaId,
    );
  }
}
