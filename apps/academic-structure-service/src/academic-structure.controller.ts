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
  InstitutionScoped,
  JwtPayload,
  Roles,
  ROLE_ADMIN_APP,
} from '@libs/common';
import {
  CrearAreaConocimientoDto,
  CrearAsignaturaDto,
  CrearCargaAcademicaDocenteDto,
  CrearGradoDto,
  CrearGrupoDto,
  CrearJornadaDto,
  CrearPlanEstudioGradoDto,
} from './dto';
import { AcademicStructureService } from './academic-structure.service';

@ApiTags('Academic Structure')
@ApiBearerAuth()
@Controller()
export class AcademicStructureController {
  constructor(private readonly academicService: AcademicStructureService) {}

  @InstitutionScoped({ param: 'id' })
  @Roles(ROLE_ADMIN_APP)
  @Post('instituciones/:id/areas-conocimiento')
  @Audit({
    servicio: 'academic-structure-service',
    modulo: 'academic-structure',
    entidad: 'area-conocimiento',
    accion: 'crear-area-conocimiento',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  createAreaConocimiento(
    @Param('id', new ParseUUIDPipe()) institucionId: string,
    @Body() dto: CrearAreaConocimientoDto,
  ) {
    return this.academicService.createAreaConocimiento(institucionId, dto);
  }

  @InstitutionScoped({ param: 'id' })
  @Get('instituciones/:id/areas-conocimiento')
  findAreasConocimiento(
    @Param('id', new ParseUUIDPipe()) institucionId: string,
  ) {
    return this.academicService.findAreasConocimiento(institucionId);
  }

  @InstitutionScoped({ param: 'id' })
  @Roles(ROLE_ADMIN_APP)
  @Post('instituciones/:id/asignaturas')
  @Audit({
    servicio: 'academic-structure-service',
    modulo: 'academic-structure',
    entidad: 'asignatura',
    accion: 'crear-asignatura',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  createAsignatura(
    @Param('id', new ParseUUIDPipe()) institucionId: string,
    @Body() dto: CrearAsignaturaDto,
  ) {
    return this.academicService.createAsignatura(institucionId, dto);
  }

  @InstitutionScoped({ param: 'id' })
  @Get('instituciones/:id/asignaturas')
  findAsignaturas(@Param('id', new ParseUUIDPipe()) institucionId: string) {
    return this.academicService.findAsignaturas(institucionId);
  }

  @InstitutionScoped({ param: 'id' })
  @Roles(ROLE_ADMIN_APP)
  @Post('instituciones/:id/grados')
  @Audit({
    servicio: 'academic-structure-service',
    modulo: 'academic-structure',
    entidad: 'grado',
    accion: 'crear-grado',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  createGrado(
    @Param('id', new ParseUUIDPipe()) institucionId: string,
    @Body() dto: CrearGradoDto,
  ) {
    return this.academicService.createGrado(institucionId, dto);
  }

  @InstitutionScoped({ param: 'id' })
  @Get('instituciones/:id/grados')
  findGrados(@Param('id', new ParseUUIDPipe()) institucionId: string) {
    return this.academicService.findGrados(institucionId);
  }

  @InstitutionScoped({ param: 'id' })
  @Roles(ROLE_ADMIN_APP)
  @Post('instituciones/:id/jornadas')
  @Audit({
    servicio: 'academic-structure-service',
    modulo: 'academic-structure',
    entidad: 'jornada',
    accion: 'crear-jornada',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  createJornada(
    @Param('id', new ParseUUIDPipe()) institucionId: string,
    @Body() dto: CrearJornadaDto,
  ) {
    return this.academicService.createJornada(institucionId, dto);
  }

  @InstitutionScoped({ param: 'id' })
  @Get('instituciones/:id/jornadas')
  findJornadas(@Param('id', new ParseUUIDPipe()) institucionId: string) {
    return this.academicService.findJornadas(institucionId);
  }

  @InstitutionScoped({ param: 'id' })
  @Roles(ROLE_ADMIN_APP)
  @Post('instituciones/:id/grupos')
  @Audit({
    servicio: 'academic-structure-service',
    modulo: 'academic-structure',
    entidad: 'grupo',
    accion: 'crear-grupo',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  createGrupo(
    @Param('id', new ParseUUIDPipe()) institucionId: string,
    @Body() dto: CrearGrupoDto,
  ) {
    return this.academicService.createGrupo(institucionId, dto);
  }

  @InstitutionScoped({ param: 'id' })
  @Get('instituciones/:id/grupos')
  findGrupos(@Param('id', new ParseUUIDPipe()) institucionId: string) {
    return this.academicService.findGrupos(institucionId);
  }

  @Roles(ROLE_ADMIN_APP)
  @Post('anios-lectivos/:id/planes-estudio')
  @Audit({
    servicio: 'academic-structure-service',
    modulo: 'academic-structure',
    entidad: 'plan-estudio-grado',
    accion: 'crear-plan-estudio-grado',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  createPlanEstudio(
    @Param('id', new ParseUUIDPipe()) anioLectivoId: string,
    @Body() dto: CrearPlanEstudioGradoDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.academicService.createPlanEstudio(
      anioLectivoId,
      dto,
      currentUser,
    );
  }

  @Get('anios-lectivos/:id/planes-estudio')
  findPlanesEstudio(
    @Param('id', new ParseUUIDPipe()) anioLectivoId: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.academicService.findPlanesEstudio(anioLectivoId, currentUser);
  }

  @Roles(ROLE_ADMIN_APP)
  @Post('grupos/:id/cargas-docentes')
  @Audit({
    servicio: 'academic-structure-service',
    modulo: 'academic-structure',
    entidad: 'carga-academica-docente',
    accion: 'crear-carga-docente',
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  createCargaDocente(
    @Param('id', new ParseUUIDPipe()) grupoId: string,
    @Body() dto: CrearCargaAcademicaDocenteDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.academicService.createCargaDocente(grupoId, dto, currentUser);
  }

  @Get('grupos/:id/cargas-docentes')
  findCargasDocentes(
    @Param('id', new ParseUUIDPipe()) grupoId: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.academicService.findCargasDocentes(grupoId, currentUser);
  }
}
