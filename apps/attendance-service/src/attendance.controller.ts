import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Audit, AUDIT_EVENT_TYPE, AUDIT_SEVERITY } from "@libs/audit";
import {
  CurrentUser,
  JwtPayload,
  Roles,
  ROLE_ADMINISTRATIVE,
  ROLE_ADMIN_APP,
  ROLE_GROUP_DIRECTOR,
  ROLE_TEACHER,
  ROLE_TEACHER_DIRECTOR,
} from "@libs/common";
import {
  ConsultarSesionesAsistenciaDto,
  CrearSesionAsistenciaDto,
  RegistrarAsistenciaDto,
} from "./dto";
import { AttendanceService } from "./attendance.service";

const READ_ROLES = [
  ROLE_ADMIN_APP,
  ROLE_ADMINISTRATIVE,
  ROLE_TEACHER,
  ROLE_GROUP_DIRECTOR,
  ROLE_TEACHER_DIRECTOR,
];
const WRITE_ROLES = [ROLE_ADMIN_APP, ROLE_TEACHER, ROLE_GROUP_DIRECTOR];

@ApiTags("Attendance")
@ApiBearerAuth()
@Controller()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Roles(...WRITE_ROLES)
  @Post("grupos/:id/asistencias")
  @Audit({
    servicio: "attendance-service",
    modulo: "attendance",
    entidad: "sesion-asistencia",
    accion: "crear-sesion",
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  createSesion(
    @Param("id", new ParseUUIDPipe()) grupoId: string,
    @Body() dto: CrearSesionAsistenciaDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.attendanceService.createSesion(grupoId, dto, user);
  }

  @Roles(...READ_ROLES)
  @Get("grupos/:id/asistencias")
  findSesiones(
    @Param("id", new ParseUUIDPipe()) grupoId: string,
    @Query() query: ConsultarSesionesAsistenciaDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.attendanceService.findSesiones(grupoId, query, user);
  }

  @Roles(...READ_ROLES)
  @Get("asistencias/:id")
  findSesion(
    @Param("id", new ParseUUIDPipe()) sesionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.attendanceService.findSesion(sesionId, user);
  }

  @Roles(...WRITE_ROLES)
  @Put("asistencias/:id/registros")
  @Audit({
    servicio: "attendance-service",
    modulo: "attendance",
    entidad: "registro-asistencia",
    entidadIdParam: "id",
    accion: "registrar-asistencia",
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarPayload: true,
    capturarDespues: true,
  })
  registrar(
    @Param("id", new ParseUUIDPipe()) sesionId: string,
    @Body() dto: RegistrarAsistenciaDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.attendanceService.registrar(sesionId, dto, user);
  }

  @Roles(...WRITE_ROLES)
  @Post("asistencias/:id/cerrar")
  @Audit({
    servicio: "attendance-service",
    modulo: "attendance",
    entidad: "sesion-asistencia",
    entidadIdParam: "id",
    accion: "cerrar-sesion",
    tipoEvento: AUDIT_EVENT_TYPE.NEGOCIO,
    severidad: AUDIT_SEVERITY.INFO,
    capturarDespues: true,
  })
  cerrar(
    @Param("id", new ParseUUIDPipe()) sesionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.attendanceService.cerrar(sesionId, user);
  }
}
