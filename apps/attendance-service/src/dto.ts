import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

export class CrearSesionAsistenciaDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  codigo!: string;

  @ApiProperty()
  @IsDateString()
  fecha!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  numeroSesion?: number;

  @ApiPropertyOptional({ description: "Si se omite, la sesion es diaria" })
  @IsOptional()
  @IsUUID()
  cargaAcademicaDocenteId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  horaInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class RegistroAsistenciaItemDto {
  @ApiProperty()
  @IsUUID()
  matriculaId!: string;

  @ApiProperty({ enum: ["presente", "ausente", "tarde", "excusado"] })
  @IsIn(["presente", "ausente", "tarde", "excusado"])
  estado!: "presente" | "ausente" | "tarde" | "excusado";

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(600)
  minutosRetraso?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class RegistrarAsistenciaDto {
  @ApiProperty({ type: [RegistroAsistenciaItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RegistroAsistenciaItemDto)
  registros!: RegistroAsistenciaItemDto[];
}

export class ConsultarSesionesAsistenciaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}
