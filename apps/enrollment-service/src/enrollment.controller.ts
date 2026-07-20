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
  ROLE_ADMINISTRATIVE,
  ROLE_ADMIN_APP,
  ROLE_COUNSELOR,
  ROLE_GROUP_DIRECTOR,
  ROLE_TEACHER,
  ROLE_TEACHER_DIRECTOR,
} from "@libs/common";
import {
  AprobarTrasladoDto,
  AsignarGrupoDto,
  CompletarAcudienteMatriculaDto,
  CrearAcudienteDto,
  CrearEstudianteDto,
  CrearMatriculaDto,
  CrearTrasladoDto,
  EjecutarTrasladoDto,
  RechazarTrasladoDto,
  RetirarMatriculaDto,
  VincularAcudienteDto,
} from "./dto";
import { EnrollmentService } from "./enrollment.service";

const STAFF_READ_ROLES = [
  ROLE_ADMIN_APP,
  ROLE_ADMINISTRATIVE,
  ROLE_GROUP_DIRECTOR,
  ROLE_TEACHER,
  ROLE_TEACHER_DIRECTOR,
  ROLE_COUNSELOR,
];

const TRANSFER_READ_ROLES = [
  ROLE_ADMIN_APP,
  ROLE_ADMINISTRATIVE,
  ROLE_TEACHER_DIRECTOR,
];

@ApiTags("Enrollment")
@ApiBearerAuth()
@Controller()
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Roles(ROLE_ADMIN_APP)
  @Post("estudiantes")
  @Audit({
    servicio: "enrollment-service",
    modulo: "enrollment",
    entidad: "estudiante",
    accion: "crear-estudiante",
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  createEstudiante(@Body() dto: CrearEstudianteDto) {
    return this.enrollmentService.createEstudiante(dto);
  }

  @Roles(ROLE_ADMIN_APP)
  @Post("acudientes")
  @Audit({
    servicio: "enrollment-service",
    modulo: "enrollment",
    entidad: "acudiente",
    accion: "crear-acudiente",
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  createAcudiente(@Body() dto: CrearAcudienteDto) {
    return this.enrollmentService.createAcudiente(dto);
  }

  @Roles(ROLE_ADMIN_APP)
  @Post("estudiantes/:id/acudientes")
  @Audit({
    servicio: "enrollment-service",
    modulo: "enrollment",
    entidad: "estudiante-acudiente",
    entidadIdParam: "id",
    accion: "vincular-acudiente",
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  vincularAcudiente(
    @Param("id", new ParseUUIDPipe()) estudianteId: string,
    @Body() dto: VincularAcudienteDto,
  ) {
    return this.enrollmentService.vincularAcudiente(estudianteId, dto);
  }

  @InstitutionScoped({ param: "id" })
  @Roles(ROLE_ADMIN_APP, ROLE_ADMINISTRATIVE)
  @Post("instituciones/:id/matriculas")
  @Audit({
    servicio: "enrollment-service",
    modulo: "enrollment",
    entidad: "matricula",
    accion: "crear-matricula",
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  createMatricula(
    @Param("id", new ParseUUIDPipe()) institucionId: string,
    @Body() dto: CrearMatriculaDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.enrollmentService.createMatricula(
      institucionId,
      dto,
      currentUser,
    );
  }

  @InstitutionScoped({ param: "id" })
  @Roles(...STAFF_READ_ROLES)
  @Get("instituciones/:id/matriculas")
  findMatriculas(@Param("id", new ParseUUIDPipe()) institucionId: string) {
    return this.enrollmentService.findMatriculas(institucionId);
  }

  @InstitutionScoped({ param: "id" })
  @Roles(...STAFF_READ_ROLES)
  @Get("instituciones/:id/matriculas/pendientes-acudiente")
  findMatriculasPendientesAcudiente(
    @Param("id", new ParseUUIDPipe()) institucionId: string,
  ) {
    return this.enrollmentService.findMatriculasPendientesAcudiente(
      institucionId,
    );
  }

  @Roles(...STAFF_READ_ROLES)
  @Get("matriculas/:id")
  findMatricula(
    @Param("id", new ParseUUIDPipe()) matriculaId: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.enrollmentService.findMatricula(matriculaId, currentUser);
  }

  @Roles(ROLE_ADMIN_APP, ROLE_GROUP_DIRECTOR)
  @Post("matriculas/:id/asignaciones-grupo")
  @Audit({
    servicio: "enrollment-service",
    modulo: "enrollment",
    entidad: "asignacion-estudiante-grupo",
    entidadIdParam: "id",
    accion: "asignar-grupo",
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  assignGrupo(
    @Param("id", new ParseUUIDPipe()) matriculaId: string,
    @Body() dto: AsignarGrupoDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.enrollmentService.assignGrupo(matriculaId, dto, currentUser);
  }

  @Roles(ROLE_ADMIN_APP, ROLE_ADMINISTRATIVE)
  @Post("matriculas/:id/completar-acudiente")
  @Audit({
    servicio: "enrollment-service",
    modulo: "enrollment",
    entidad: "matricula",
    entidadIdParam: "id",
    accion: "completar-acudiente",
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  completarAcudiente(
    @Param("id", new ParseUUIDPipe()) matriculaId: string,
    @Body() dto: CompletarAcudienteMatriculaDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.enrollmentService.completarAcudiente(
      matriculaId,
      dto,
      currentUser,
    );
  }

  @Roles(ROLE_ADMIN_APP, ROLE_ADMINISTRATIVE)
  @Post("matriculas/:id/retirar")
  @Audit({
    servicio: "enrollment-service",
    modulo: "enrollment",
    entidad: "matricula",
    entidadIdParam: "id",
    accion: "retirar-matricula",
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.WARN,
    capturarPayload: true,
    capturarDespues: true,
  })
  retirarMatricula(
    @Param("id", new ParseUUIDPipe()) matriculaId: string,
    @Body() dto: RetirarMatriculaDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.enrollmentService.retirarMatricula(
      matriculaId,
      dto,
      currentUser,
    );
  }

  @Roles(ROLE_ADMIN_APP, ROLE_ADMINISTRATIVE)
  @Post("traslados")
  @Audit({
    servicio: "enrollment-service",
    modulo: "enrollment",
    entidad: "traslado-estudiantil",
    accion: "solicitar-traslado",
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  createTraslado(
    @Body() dto: CrearTrasladoDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.enrollmentService.createTraslado(dto, currentUser);
  }

  @InstitutionScoped({ param: "id" })
  @Roles(...TRANSFER_READ_ROLES)
  @Get("instituciones/:id/traslados")
  findTraslados(@Param("id", new ParseUUIDPipe()) institucionId: string) {
    return this.enrollmentService.findTraslados(institucionId);
  }

  @Roles(...TRANSFER_READ_ROLES)
  @Get("traslados/:id")
  findTraslado(
    @Param("id", new ParseUUIDPipe()) trasladoId: string,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.enrollmentService.findTraslado(trasladoId, currentUser);
  }

  @Roles(ROLE_ADMIN_APP)
  @Post("traslados/:id/aprobar")
  @Audit({
    servicio: "enrollment-service",
    modulo: "enrollment",
    entidad: "traslado-estudiantil",
    entidadIdParam: "id",
    accion: "aprobar-traslado",
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  aprobarTraslado(
    @Param("id", new ParseUUIDPipe()) trasladoId: string,
    @Body() dto: AprobarTrasladoDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.enrollmentService.aprobarTraslado(trasladoId, dto, currentUser);
  }

  @Roles(ROLE_ADMIN_APP)
  @Post("traslados/:id/rechazar")
  @Audit({
    servicio: "enrollment-service",
    modulo: "enrollment",
    entidad: "traslado-estudiantil",
    entidadIdParam: "id",
    accion: "rechazar-traslado",
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.WARN,
    capturarPayload: true,
    capturarDespues: true,
  })
  rechazarTraslado(
    @Param("id", new ParseUUIDPipe()) trasladoId: string,
    @Body() dto: RechazarTrasladoDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.enrollmentService.rechazarTraslado(
      trasladoId,
      dto,
      currentUser,
    );
  }

  @Roles(ROLE_ADMIN_APP)
  @Post("traslados/:id/ejecutar")
  @Audit({
    servicio: "enrollment-service",
    modulo: "enrollment",
    entidad: "traslado-estudiantil",
    entidadIdParam: "id",
    accion: "ejecutar-traslado",
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.WARN,
    capturarPayload: true,
    capturarDespues: true,
  })
  ejecutarTraslado(
    @Param("id", new ParseUUIDPipe()) trasladoId: string,
    @Body() dto: EjecutarTrasladoDto,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    return this.enrollmentService.ejecutarTraslado(
      trasladoId,
      dto,
      currentUser,
    );
  }
}
