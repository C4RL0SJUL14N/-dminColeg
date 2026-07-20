import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Audit, AUDIT_EVENT_TYPE, AUDIT_SEVERITY } from "@libs/audit";
import {
  CurrentUser,
  InstitutionScoped,
  JwtPayload,
  Roles,
  ROLE_ADMIN_APP,
  ROLE_TEACHER,
  ROLE_TEACHER_DIRECTOR,
} from "@libs/common";
import {
  AsignarAreaDocenteDto,
  AsignarDirectorGrupoDto,
  AsignarSedeDocenteDto,
  CrearAdministrativoDto,
  CrearDirectivoDocenteDto,
  CrearDocenteDto,
  CrearTituloDocenteDto,
} from "./dto";
import { StaffService } from "./staff.service";

const STAFF_READ_ROLES = [ROLE_ADMIN_APP, ROLE_TEACHER, ROLE_TEACHER_DIRECTOR];
const MANAGEMENT_READ_ROLES = [ROLE_ADMIN_APP, ROLE_TEACHER_DIRECTOR];

@ApiTags("Staff")
@ApiBearerAuth()
@Controller()
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @InstitutionScoped({ param: "id" })
  @Roles(ROLE_ADMIN_APP)
  @Post("instituciones/:id/docentes")
  @Audit({
    servicio: "staff-service",
    modulo: "staff",
    entidad: "docente",
    accion: "crear-docente",
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  createDocente(
    @Param("id", new ParseUUIDPipe()) institucionId: string,
    @Body() dto: CrearDocenteDto,
  ) {
    return this.staffService.createDocente(institucionId, dto);
  }

  @InstitutionScoped({ param: "id" })
  @Roles(...STAFF_READ_ROLES)
  @Get("instituciones/:id/docentes")
  findDocentes(@Param("id", new ParseUUIDPipe()) institucionId: string) {
    return this.staffService.findDocentes(institucionId);
  }

  @Roles(...STAFF_READ_ROLES)
  @Get("docentes/:id")
  findDocente(
    @Param("id", new ParseUUIDPipe()) docenteId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.staffService.findDocente(docenteId, user);
  }

  @Roles(ROLE_ADMIN_APP)
  @Post("docentes/:id/sedes")
  @Audit({
    servicio: "staff-service",
    modulo: "staff",
    entidad: "docente-sede",
    entidadIdParam: "id",
    accion: "asignar-sede",
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  assignSede(
    @Param("id", new ParseUUIDPipe()) docenteId: string,
    @Body() dto: AsignarSedeDocenteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.staffService.assignSede(docenteId, dto, user);
  }

  @Roles(ROLE_ADMIN_APP)
  @Post("docentes/:id/areas-conocimiento")
  @Audit({
    servicio: "staff-service",
    modulo: "staff",
    entidad: "docente-area",
    entidadIdParam: "id",
    accion: "asignar-area",
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  assignArea(
    @Param("id", new ParseUUIDPipe()) docenteId: string,
    @Body() dto: AsignarAreaDocenteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.staffService.assignArea(docenteId, dto, user);
  }

  @Roles(ROLE_ADMIN_APP)
  @Post("docentes/:id/titulos")
  @Audit({
    servicio: "staff-service",
    modulo: "staff",
    entidad: "titulo-docente",
    entidadIdParam: "id",
    accion: "crear-titulo",
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  createTitulo(
    @Param("id", new ParseUUIDPipe()) docenteId: string,
    @Body() dto: CrearTituloDocenteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.staffService.createTitulo(docenteId, dto, user);
  }

  @Roles(ROLE_ADMIN_APP)
  @Post("grupos/:id/director")
  @Audit({
    servicio: "staff-service",
    modulo: "staff",
    entidad: "director-grupo",
    entidadIdParam: "id",
    accion: "asignar-director",
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  assignDirector(
    @Param("id", new ParseUUIDPipe()) grupoId: string,
    @Body() dto: AsignarDirectorGrupoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.staffService.assignDirector(grupoId, dto, user);
  }

  @Roles(...STAFF_READ_ROLES)
  @Get("grupos/:id/director")
  findDirector(
    @Param("id", new ParseUUIDPipe()) grupoId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.staffService.findDirector(grupoId, user);
  }

  @InstitutionScoped({ param: "id" })
  @Roles(ROLE_ADMIN_APP)
  @Post("instituciones/:id/administrativos")
  @Audit({
    servicio: "staff-service",
    modulo: "staff",
    entidad: "administrativo",
    accion: "crear-administrativo",
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  createAdministrativo(
    @Param("id", new ParseUUIDPipe()) institucionId: string,
    @Body() dto: CrearAdministrativoDto,
  ) {
    return this.staffService.createAdministrativo(institucionId, dto);
  }

  @InstitutionScoped({ param: "id" })
  @Roles(...MANAGEMENT_READ_ROLES)
  @Get("instituciones/:id/administrativos")
  findAdministrativos(@Param("id", new ParseUUIDPipe()) institucionId: string) {
    return this.staffService.findAdministrativos(institucionId);
  }

  @Roles(...MANAGEMENT_READ_ROLES)
  @Get("administrativos/:id")
  findAdministrativo(
    @Param("id", new ParseUUIDPipe()) administrativoId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.staffService.findAdministrativo(administrativoId, user);
  }

  @InstitutionScoped({ param: "id" })
  @Roles(ROLE_ADMIN_APP)
  @Post("instituciones/:id/directivos-docentes")
  @Audit({
    servicio: "staff-service",
    modulo: "staff",
    entidad: "directivo-docente",
    accion: "crear-directivo-docente",
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  createDirectivoDocente(
    @Param("id", new ParseUUIDPipe()) institucionId: string,
    @Body() dto: CrearDirectivoDocenteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.staffService.createDirectivoDocente(institucionId, dto, user);
  }

  @InstitutionScoped({ param: "id" })
  @Roles(...MANAGEMENT_READ_ROLES)
  @Get("instituciones/:id/directivos-docentes")
  findDirectivosDocentes(
    @Param("id", new ParseUUIDPipe()) institucionId: string,
  ) {
    return this.staffService.findDirectivosDocentes(institucionId);
  }

  @Roles(...MANAGEMENT_READ_ROLES)
  @Get("directivos-docentes/:id")
  findDirectivoDocente(
    @Param("id", new ParseUUIDPipe()) directivoId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.staffService.findDirectivoDocente(directivoId, user);
  }
}
