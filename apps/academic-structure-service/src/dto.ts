import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
} from "class-validator";
import { Transform, Type } from "class-transformer";

const JORNADA_NOMBRES = [
  "mañana",
  "tarde",
  "única",
  "nocturna",
  "sabatina",
] as const;

function normalizeJornadaNombre(value: unknown): unknown {
  if (typeof value !== "string") return value;

  const key = value
    .trim()
    .toLocaleLowerCase("es-CO")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  const names: Record<string, (typeof JORNADA_NOMBRES)[number]> = {
    manana: "mañana",
    tarde: "tarde",
    unica: "única",
    nocturna: "nocturna",
    sabatina: "sabatina",
  };
  return names[key] ?? value.trim().toLocaleLowerCase("es-CO");
}

export class CrearAsignaturaDto {
  @ApiProperty()
  @IsString()
  codigo!: string;

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

  @ApiProperty({
    enum: [
      "preescolar",
      "primaria",
      "secundaria",
      "media",
      "tecnica",
      "adultos",
      "otro",
    ],
  })
  @IsIn([
    "preescolar",
    "primaria",
    "secundaria",
    "media",
    "tecnica",
    "adultos",
    "otro",
  ])
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

  @ApiProperty({ enum: JORNADA_NOMBRES })
  @Transform(({ value }) => normalizeJornadaNombre(value))
  @IsIn(JORNADA_NOMBRES)
  nombre!: string;

  @ApiPropertyOptional({ example: "07:00" })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
  horaInicio?: string;

  @ApiPropertyOptional({ example: "13:00" })
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
