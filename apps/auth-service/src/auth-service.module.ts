import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MetodoAutenticacionUsuario,
  Institucion,
  PerfilUsuario,
  Permiso,
  ProveedorAutenticacion,
  Rol,
  RolPermiso,
  RolUsuario,
  SesionUsuario,
  TipoPerfil,
  TokenRecuperacionContrasena,
  Usuario,
} from '@libs/database';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MetodoAutenticacionUsuario,
      Institucion,
      PerfilUsuario,
      Permiso,
      ProveedorAutenticacion,
      Rol,
      RolPermiso,
      RolUsuario,
      SesionUsuario,
      TipoPerfil,
      TokenRecuperacionContrasena,
      Usuario,
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthServiceModule {}
