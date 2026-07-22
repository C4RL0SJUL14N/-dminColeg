import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  Administrativo,
  DirectorGrupo,
  DirectivoDocente,
  Docente,
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
      Administrativo,
      DirectorGrupo,
      DirectivoDocente,
      Docente,
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
