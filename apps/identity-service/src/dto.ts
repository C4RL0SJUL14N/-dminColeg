import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class CrearPersonaDto {
  @ApiProperty()
  @IsUUID()
  tipoDocumentoId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  generoId?: string;

  @ApiProperty()
  @IsString()
  numeroDocumento!: string;

  @ApiProperty()
  @IsString()
  primerNombre!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  segundoNombre?: string;

  @ApiProperty()
  @IsString()
  primerApellido!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  segundoApellido?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  correoElectronico?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telefono?: string;
}

export class ActualizarPersonaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  generoId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primerNombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  segundoNombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primerApellido?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  segundoApellido?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  correoElectronico?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telefono?: string;
}

