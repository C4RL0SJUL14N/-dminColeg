import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
} from "class-validator";

export class CrearDocenteDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  codigo!: string;

  @ApiProperty()
  @IsUUID()
  personaId!: string;
}

export class AsignarSedeDocenteDto {
  @ApiProperty()
  @IsUUID()
  sedeId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;
}

export class AsignarAreaDocenteDto {
  @ApiProperty()
  @IsUUID()
  areaConocimientoId!: string;
}

export class CrearTituloDocenteDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  titulo!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2200)
  anioObtencion?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  institucionOtorgante?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pais?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  esTituloPrincipal?: boolean;
}

export class AsignarDirectorGrupoDto {
  @ApiProperty()
  @IsUUID()
  docenteId!: string;
}

export class CrearAdministrativoDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  codigo!: string;

  @ApiProperty()
  @IsUUID()
  personaId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  tipoEmpleado!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  cargo!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dependencia?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaVinculacion?: string;
}

export class CrearDirectivoDocenteDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  codigo!: string;

  @ApiProperty()
  @IsUUID()
  docenteId!: string;

  @ApiProperty({ enum: ["rector", "director_rural", "coordinador"] })
  @IsIn(["rector", "director_rural", "coordinador"])
  cargo!: "rector" | "director_rural" | "coordinador";
}
