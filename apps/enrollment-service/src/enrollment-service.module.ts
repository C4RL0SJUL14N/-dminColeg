import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  Acudiente,
  AnioLectivo,
  AsignacionEstudianteGrupo,
  Estudiante,
  EstudianteAcudiente,
  Grado,
  Grupo,
  Institucion,
  Jornada,
  Matricula,
  Persona,
  Sede,
  TrasladoEstudiantil,
} from "@libs/database";
import { EnrollmentController } from "./enrollment.controller";
import { EnrollmentService } from "./enrollment.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Acudiente,
      AnioLectivo,
      AsignacionEstudianteGrupo,
      Estudiante,
      EstudianteAcudiente,
      Grado,
      Grupo,
      Institucion,
      Jornada,
      Matricula,
      Persona,
      Sede,
      TrasladoEstudiantil,
    ]),
  ],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentServiceModule {}
