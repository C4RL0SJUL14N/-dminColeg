import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  AnioLectivo,
  Asignatura,
  CargaAcademicaDocente,
  Docente,
  Grado,
  Grupo,
  Institucion,
  Jornada,
  PlanEstudioGrado,
  Sede,
} from "@libs/database";
import { AcademicStructureController } from "./academic-structure.controller";
import { AcademicStructureService } from "./academic-structure.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnioLectivo,
      Asignatura,
      CargaAcademicaDocente,
      Docente,
      Grado,
      Grupo,
      Institucion,
      Jornada,
      PlanEstudioGrado,
      Sede,
    ]),
  ],
  controllers: [AcademicStructureController],
  providers: [AcademicStructureService],
  exports: [AcademicStructureService],
})
export class AcademicStructureServiceModule {}
