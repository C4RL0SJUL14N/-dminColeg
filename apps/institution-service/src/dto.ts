import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CrearInstitucionDto {
  @ApiProperty()
  @IsString()
  codigo!: string;

  @ApiProperty()
  @IsString()
  nombre!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nit?: string;
}

export class ActualizarInstitucionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class CrearSedeDto {
  @ApiProperty()
  @IsString()
  codigo!: string;

  @ApiProperty()
  @IsString()
  nombre!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  principal?: boolean;
}

export class ActualizarSedeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class CrearAnioLectivoDto {
  @ApiProperty()
  @IsString()
  nombre!: string;

  @ApiProperty()
  @IsDateString()
  fechaInicio!: string;

  @ApiProperty()
  @IsDateString()
  fechaFin!: string;
}

export class ActualizarAnioLectivoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiPropertyOptional({ enum: ['borrador', 'activo'] })
  @IsOptional()
  @IsIn(['borrador', 'activo'])
  estado?: 'borrador' | 'activo';
}

export class CrearPeriodoAcademicoDto {
  @ApiProperty()
  @IsString()
  nombre!: string;

  @ApiProperty()
  @IsDateString()
  fechaInicio!: string;

  @ApiProperty()
  @IsDateString()
  fechaFin!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  orden!: number;
}

export class ConfiguracionInstitucionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zonaHoraria?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idioma?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  configuracion?: Record<string, unknown>;
}

export class CrearNivelEscalaDto {
  @ApiProperty()
  @IsString()
  codigo!: string;

  @ApiProperty()
  @IsString()
  nombre!: string;

  @ApiProperty()
  @IsNumberString()
  valorMinimo!: string;

  @ApiProperty()
  @IsNumberString()
  valorMaximo!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  aprobado?: boolean;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  orden!: number;
}

export class CrearEscalaValoracionDto {
  @ApiProperty()
  @IsString()
  nombre!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ type: [CrearNivelEscalaDto] })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => CrearNivelEscalaDto)
  niveles!: CrearNivelEscalaDto[];
}

export class ActualizarNivelEscalaDto extends CrearNivelEscalaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  id?: string;
}

export class ActualizarEscalaValoracionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({ type: [ActualizarNivelEscalaDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => ActualizarNivelEscalaDto)
  niveles?: ActualizarNivelEscalaDto[];
}
