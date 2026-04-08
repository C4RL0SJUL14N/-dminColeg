import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AsignarPerfilDto {
  @ApiProperty()
  @IsUUID()
  tipoPerfilId!: string;
}

export class AsignarRolDto {
  @ApiProperty()
  @IsUUID()
  rolId!: string;
}

export class AsignarAdministradorAppDto {
  @ApiProperty()
  @IsUUID()
  usuarioId!: string;
}

