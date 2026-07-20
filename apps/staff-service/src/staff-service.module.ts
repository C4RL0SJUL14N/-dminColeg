import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  Administrativo,
  AreaConocimiento,
  DirectorGrupo,
  DirectivoDocente,
  Docente,
  DocenteAreaConocimiento,
  DocenteSede,
  Grupo,
  Institucion,
  Persona,
  Sede,
  TituloAcademicoDocente,
} from "@libs/database";
import { StaffController } from "./staff.controller";
import { StaffService } from "./staff.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AreaConocimiento,
      Administrativo,
      DirectorGrupo,
      DirectivoDocente,
      Docente,
      DocenteAreaConocimiento,
      DocenteSede,
      Grupo,
      Institucion,
      Persona,
      Sede,
      TituloAcademicoDocente,
    ]),
  ],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffServiceModule {}
