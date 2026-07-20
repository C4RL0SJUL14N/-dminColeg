import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CrearAreaConocimientoDto {
  @ApiProperty()
  @IsString()
  codigo!: string;

  @ApiProperty()
  @IsString()
  nombre!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  orden?: number;
}

export class CrearAsignaturaDto {
  @ApiProperty()
  @IsString()
  codigo!: string;

  @ApiProperty()
  @IsUUID()
  areaConocimientoId!: string;

  @ApiProperty()
  @IsString()
  nombre!: string;
}

export class CrearGradoDto {
  @ApiProperty()
  @IsString()
  codigo!: string;

  @ApiProperty()
  @IsString()
  nombre!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombreCorto?: string;

  @ApiProperty()
  @IsString()
  nivelEducativo!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  orden!: number;
}

export class CrearJornadaDto {
  @ApiProperty()
  @IsString()
  codigo!: string;

  @ApiProperty()
  @IsString()
  nombre!: string;

  @ApiPropertyOptional({ example: '07:00' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
  horaInicio?: string;

  @ApiPropertyOptional({ example: '13:00' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
  horaFin?: string;
}

export class CrearGrupoDto {
  @ApiProperty()
  @IsString()
  codigo!: string;

  @ApiProperty()
  @IsUUID()
  sedeId!: string;

  @ApiProperty()
  @IsUUID()
  anioLectivoId!: string;

  @ApiProperty()
  @IsUUID()
  gradoId!: string;

  @ApiProperty()
  @IsUUID()
  jornadaId!: string;

  @ApiProperty()
  @IsString()
  nombre!: string;
}

export class CrearPlanEstudioGradoDto {
  @ApiProperty()
  @IsUUID()
  gradoId!: string;

  @ApiProperty()
  @IsUUID()
  asignaturaId!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  horasSemanales!: number;
}

export class CrearCargaAcademicaDocenteDto {
  @ApiProperty()
  @IsString()
  codigo!: string;

  @ApiProperty()
  @IsUUID()
  planEstudioGradoId!: string;

  @ApiProperty()
  @IsUUID()
  docenteId!: string;
}

export class ActualizarActivoDto {
  @ApiProperty()
  @IsBoolean()
  activo!: boolean;
}
