import { NestFactory } from "@nestjs/core";
import { configureAuditApplication } from "@libs/audit";
import { configureApplication } from "@libs/common";
import { EnrollmentAppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(EnrollmentAppModule);
  configureAuditApplication(app);
  configureApplication(app, {
    appName: "Enrollment Service",
    appDescription:
      "Estudiantes, acudientes, matriculas y asignaciones de grupo",
  });
  await app.listen(process.env.ENROLLMENT_SERVICE_PORT ?? 3006);
}

bootstrap();
