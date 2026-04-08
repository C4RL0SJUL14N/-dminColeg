import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class AuditSearchDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  institucionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  usuarioId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipoEvento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resultado?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  severidad?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entidad?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  entidadId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  servicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  modulo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  texto?: string;

  @ApiPropertyOptional({ default: 50, minimum: 1, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

export class AuditEventDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  fecha_hora!: string;

  @ApiPropertyOptional()
  usuario_id!: string | null;

  @ApiPropertyOptional()
  institucion_id!: string | null;

  @ApiProperty()
  servicio!: string;

  @ApiProperty()
  modulo!: string;

  @ApiProperty()
  entidad!: string;

  @ApiPropertyOptional()
  entidad_id!: string | null;

  @ApiProperty()
  accion!: string;

  @ApiProperty()
  tipo_evento!: string;

  @ApiProperty()
  severidad!: string;

  @ApiProperty()
  resultado!: string;

  @ApiPropertyOptional()
  codigo_http!: number | null;

  @ApiPropertyOptional()
  ruta!: string | null;

  @ApiPropertyOptional()
  error_codigo!: string | null;

  @ApiPropertyOptional()
  error_resumen!: string | null;
}

export class AuditSummaryDto extends AuditEventDto {
  @ApiPropertyOptional()
  persona_id!: string | null;

  @ApiPropertyOptional()
  sede_id!: string | null;

  @ApiProperty()
  superadministrador!: boolean;

  @ApiPropertyOptional()
  rol_efectivo_codigo!: string | null;

  @ApiPropertyOptional()
  perfil_efectivo_codigo!: string | null;

  @ApiProperty()
  ambito_operacion!: string;

  @ApiPropertyOptional()
  metodo_http!: string | null;

  @ApiPropertyOptional()
  ip!: string | null;
}

export class AuditListResponseDto {
  @ApiProperty({ type: [AuditEventDto] })
  data!: AuditEventDto[];

  @ApiProperty()
  total!: number;
}

export class AuditSummaryListResponseDto {
  @ApiProperty({ type: [AuditSummaryDto] })
  data!: AuditSummaryDto[];

  @ApiProperty()
  total!: number;
}
