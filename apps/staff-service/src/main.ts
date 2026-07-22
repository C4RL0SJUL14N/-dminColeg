import { NestFactory } from "@nestjs/core";
import { configureAuditApplication } from "@libs/audit";
import { configureApplication } from "@libs/common";
import { StaffAppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(StaffAppModule);
  configureAuditApplication(app);
  configureApplication(app, {
    appName: "Staff Service",
    appDescription: "Docentes, sedes, titulos y directores de grupo",
  });
  await app.listen(process.env.STAFF_SERVICE_PORT ?? 3007);
}

bootstrap();
