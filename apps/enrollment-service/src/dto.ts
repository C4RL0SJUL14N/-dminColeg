import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateIf,
} from "class-validator";

export class CrearEstudianteDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  codigo!: string;

  @ApiProperty()
  @IsUUID()
  personaId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaIngreso?: string;
}

export class CrearAcudienteDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  codigo!: string;

  @ApiProperty()
  @IsUUID()
  personaId!: string;
}

export class VincularAcudienteDto {
  @ApiProperty()
  @IsUUID()
  acudienteId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  tipoParentesco!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  esContactoPrincipal?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autorizadoRecoger?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  contactoEmergencia?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  conviveConEstudiante?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  esResponsableLegal?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  esResponsableFinanciero?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autorizadoPorPadre?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class CrearMatriculaDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  codigo!: string;

  @ApiProperty()
  @IsUUID()
  estudianteId!: string;

  @ApiPropertyOptional({
    description:
      "Acudiente activo y vinculado; si se omite, la matricula queda pendiente",
  })
  @IsOptional()
  @IsUUID()
  acudienteId?: string;

  @ApiPropertyOptional({
    description: "Obligatoria cuando no se proporciona acudienteId",
  })
  @ValidateIf((dto: CrearMatriculaDto) => !dto.acudienteId)
  @IsDateString()
  fechaLimiteAcudiente?: string;

  @ApiPropertyOptional({
    description: "Obligatorio cuando no se proporciona acudienteId",
  })
  @ValidateIf((dto: CrearMatriculaDto) => !dto.acudienteId)
  @IsString()
  @MinLength(1)
  motivoPendienteAcudiente?: string;

  @ApiProperty()
  @IsUUID()
  anioLectivoId!: string;

  @ApiProperty()
  @IsUUID()
  sedeId!: string;

  @ApiProperty()
  @IsUUID()
  jornadaId!: string;

  @ApiProperty()
  @IsUUID()
  gradoId!: string;

  @ApiProperty()
  @IsDateString()
  fechaMatricula!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  grupoId?: string;
}

export class CompletarAcudienteMatriculaDto {
  @ApiProperty()
  @IsUUID()
  acudienteId!: string;
}

export class AsignarGrupoDto {
  @ApiProperty()
  @IsUUID()
  grupoId!: string;

  @ApiProperty()
  @IsDateString()
  fechaAsignacion!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class RetirarMatriculaDto {
  @ApiProperty()
  @IsDateString()
  fechaRetiro!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  motivoRetiro!: string;
}

export class CrearTrasladoDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  codigo!: string;

  @ApiProperty()
  @IsUUID()
  matriculaOrigenId!: string;

  @ApiProperty()
  @IsUUID()
  institucionDestinoId!: string;

  @ApiProperty()
  @IsUUID()
  sedeDestinoId!: string;

  @ApiProperty()
  @IsUUID()
  anioLectivoDestinoId!: string;

  @ApiProperty()
  @IsUUID()
  gradoDestinoId!: string;

  @ApiProperty()
  @IsUUID()
  jornadaDestinoId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  grupoDestinoId?: string;

  @ApiProperty()
  @IsDateString()
  fechaSolicitud!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  motivoTraslado!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class AprobarTrasladoDto {
  @ApiProperty()
  @IsDateString()
  fechaAprobacion!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class RechazarTrasladoDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  observaciones!: string;
}

export class EjecutarTrasladoDto {
  @ApiProperty()
  @IsDateString()
  fechaEfectiva!: string;

  @ApiPropertyOptional({
    description: "Obligatorio para traslados entre instituciones",
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  codigoMatriculaDestino?: string;
}
