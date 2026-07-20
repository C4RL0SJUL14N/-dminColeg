import { NestFactory } from "@nestjs/core";
import { configureAuditApplication } from "@libs/audit";
import { configureApplication } from "@libs/common";
import { AttendanceAppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AttendanceAppModule);
  configureAuditApplication(app);
  configureApplication(app, {
    appName: "Attendance Service",
    appDescription: "Sesiones y registros de asistencia estudiantil",
  });
  await app.listen(process.env.ATTENDANCE_SERVICE_PORT ?? 3008);
}

bootstrap();
