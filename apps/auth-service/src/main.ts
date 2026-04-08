import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { configureAuditApplication } from '@libs/audit';
import { configureApplication } from '@libs/common';
import { AuthAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthAppModule);
  configureAuditApplication(app);
  configureApplication(app, {
    appName: 'Auth Service',
    appDescription: 'Autenticacion, sesiones y recuperacion de contrasena',
  });
  const configService = app.get(ConfigService);
  await app.listen(Number(configService.get('AUTH_SERVICE_PORT', '3001')));
}

bootstrap();
