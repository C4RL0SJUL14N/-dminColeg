import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AnioLectivo,
  ConfiguracionInstitucion,
  EscalaValoracion,
  Institucion,
  NivelEscalaValoracion,
  PeriodoAcademico,
  Sede,
} from '@libs/database';
import { InstitutionController } from './institution.controller';
import { InstitutionService } from './institution.service';

@Module({
  imports: [TypeOrmModule.forFeature([AnioLectivo, ConfiguracionInstitucion, EscalaValoracion, Institucion, NivelEscalaValoracion, PeriodoAcademico, Sede])],
  controllers: [InstitutionController],
  providers: [InstitutionService],
  exports: [InstitutionService],
})
export class InstitutionServiceModule {}

