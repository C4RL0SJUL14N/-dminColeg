import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PerfilUsuario,
  Permiso,
  Rol,
  RolPermiso,
  RolUsuario,
  TipoPerfil,
  Usuario,
} from '@libs/database';
import { AccessControlController } from './access-control.controller';
import { AccessControlService } from './access-control.service';

@Module({
  imports: [TypeOrmModule.forFeature([PerfilUsuario, Permiso, Rol, RolPermiso, RolUsuario, TipoPerfil, Usuario])],
  controllers: [AccessControlController],
  providers: [AccessControlService],
  exports: [AccessControlService],
})
export class AccessControlServiceModule {}

