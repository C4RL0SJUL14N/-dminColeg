import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  AsignacionEstudianteGrupo,
  CargaAcademicaDocente,
  DirectorGrupo,
  Docente,
  Grupo,
  Matricula,
  RegistroAsistencia,
  SesionAsistencia,
} from "@libs/database";
import { AttendanceController } from "./attendance.controller";
import { AttendanceService } from "./attendance.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AsignacionEstudianteGrupo,
      CargaAcademicaDocente,
      DirectorGrupo,
      Docente,
      Grupo,
      Matricula,
      RegistroAsistencia,
      SesionAsistencia,
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceServiceModule {}
