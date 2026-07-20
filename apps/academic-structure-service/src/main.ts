import { NestFactory } from '@nestjs/core';
import { configureApplication } from '@libs/common';
import { configureAuditApplication } from '@libs/audit';
import { AcademicStructureAppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AcademicStructureAppModule);
  configureAuditApplication(app);
  configureApplication(app, {
    appName: 'Academic Structure Service',
    appDescription: 'Estructura academica, grados, grupos y cargas docentes',
  });
  await app.listen(process.env.ACADEMIC_STRUCTURE_SERVICE_PORT ?? 3005);
}

bootstrap();
