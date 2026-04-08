import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { configureAuditApplication } from '@libs/audit';
import { configureApplication } from '@libs/common';
import { AccessControlAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AccessControlAppModule);
  configureAuditApplication(app);
  configureApplication(app, {
    appName: 'Access Control Service',
    appDescription: 'Perfiles, roles, permisos y contexto institucional',
  });
  const configService = app.get(ConfigService);
  await app.listen(Number(configService.get('ACCESS_CONTROL_SERVICE_PORT', '3002')));
}

bootstrap();
