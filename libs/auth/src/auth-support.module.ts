import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

@Global()
@Module({
  imports: [ConfigModule, JwtModule.register({})],
  providers: [PasswordService, TokenService],
  exports: [PasswordService, TokenService, JwtModule],
})
export class AuthSupportModule {}

