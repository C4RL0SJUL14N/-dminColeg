import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  correo!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  contrasena!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  institucionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  perfilIdSeleccionado?: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}

export class SolicitarRecuperacionDto {
  @ApiProperty()
  @IsEmail()
  correo!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  institucionId?: string;
}

export class RestablecerContrasenaDto {
  @ApiProperty()
  @IsString()
  token!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  nuevaContrasena!: string;
}

export class CambiarContrasenaInicialDto {
  @ApiProperty()
  @IsEmail()
  correo!: string;

  @ApiProperty()
  @IsString()
  contrasenaActual!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  nuevaContrasena!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  institucionId?: string;
}

export class LogoutDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

