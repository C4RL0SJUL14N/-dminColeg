import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { configureApplication } from '@libs/common';
import { InstitutionAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(InstitutionAppModule);
  configureApplication(app, {
    appName: 'Institution Service',
    appDescription: 'Instituciones, sedes, anios lectivos y configuracion',
  });
  const configService = app.get(ConfigService);
  await app.listen(Number(configService.get('INSTITUTION_SERVICE_PORT', '3003')));
}

bootstrap();
