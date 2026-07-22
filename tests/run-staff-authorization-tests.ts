import "reflect-metadata";
import assert from "node:assert/strict";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { validate } from "class-validator";
import { CrearDirectivoDocenteDto } from "@apps/staff-service/dto";
import { StaffController } from "@apps/staff-service/staff.controller";
import { AuditService } from "@libs/audit";
import {
  JwtPayload,
  RolesGuard,
  ROLES_KEY,
  ROLE_ADMIN_APP,
  ROLE_TEACHER,
  ROLE_TEACHER_DIRECTOR,
} from "@libs/common";

type HandlerName = keyof StaffController;

function payload(roles: string[], superadministrador = false): JwtPayload {
  return {
    sub: "20000000-0000-4000-8000-000000000001",
    usuarioId: "20000000-0000-4000-8000-000000000001",
    institucionId: superadministrador
      ? null
      : "10000000-0000-4000-8000-000000000001",
    personaId: "30000000-0000-4000-8000-000000000001",
    roles,
    superadministrador,
    sessionId: "40000000-0000-4000-8000-000000000001",
  };
}

function context(handlerName: HandlerName, user: JwtPayload): ExecutionContext {
  return {
    getHandler: () => StaffController.prototype[handlerName],
    getClass: () => StaffController,
    switchToHttp: () => ({
      getRequest: () => ({
        user,
        params: {},
        query: {},
        body: {},
        headers: {},
        method: handlerName.toString().startsWith("find") ? "GET" : "POST",
        originalUrl: `/test/${String(handlerName)}`,
        baseUrl: "",
      }),
      getResponse: () => ({}),
      getNext: () => undefined,
    }),
  } as unknown as ExecutionContext;
}

async function main() {
  const controller = StaffController.prototype;
  for (const handler of [
    controller.createDocente,
    controller.assignSede,
    controller.createTitulo,
    controller.assignDirector,
    controller.createAdministrativo,
    controller.createDirectivoDocente,
  ]) {
    assert.deepEqual(Reflect.getMetadata(ROLES_KEY, handler), [ROLE_ADMIN_APP]);
  }

  const readRoles = [ROLE_ADMIN_APP, ROLE_TEACHER, ROLE_TEACHER_DIRECTOR];
  for (const handler of [
    controller.findDocentes,
    controller.findDocente,
    controller.findDirector,
  ]) {
    assert.deepEqual(Reflect.getMetadata(ROLES_KEY, handler), readRoles);
  }

  const managementReadRoles = [ROLE_ADMIN_APP, ROLE_TEACHER_DIRECTOR];
  for (const handler of [
    controller.findAdministrativos,
    controller.findAdministrativo,
    controller.findDirectivosDocentes,
    controller.findDirectivoDocente,
  ]) {
    assert.deepEqual(
      Reflect.getMetadata(ROLES_KEY, handler),
      managementReadRoles,
    );
  }

  let denied = 0;
  const guard = new RolesGuard(new Reflector(), {
    registerHttpEvent: async () => {
      denied += 1;
    },
  } as unknown as AuditService);
  assert.equal(
    await guard.canActivate(
      context("createDocente", payload([ROLE_ADMIN_APP])),
    ),
    true,
  );
  assert.equal(
    await guard.canActivate(context("createDocente", payload([], true))),
    true,
  );
  await assert.rejects(
    guard.canActivate(context("assignDirector", payload([ROLE_TEACHER]))),
    ForbiddenException,
  );
  assert.equal(
    await guard.canActivate(context("findDocentes", payload([ROLE_TEACHER]))),
    true,
  );
  await assert.rejects(
    guard.canActivate(context("findAdministrativos", payload([ROLE_TEACHER]))),
    ForbiddenException,
  );
  assert.equal(
    await guard.canActivate(
      context("findAdministrativos", payload([ROLE_TEACHER_DIRECTOR])),
    ),
    true,
  );
  assert.equal(denied, 1);

  const cargoInvalido = Object.assign(new CrearDirectivoDocenteDto(), {
    codigo: "DIR-001",
    docenteId: "50000000-0000-4000-8000-000000000001",
    cargo: "secretario",
  });
  assert.ok(
    (await validate(cargoInvalido)).some((error) => error.property === "cargo"),
  );

  console.log("Staff authorization tests passed:");
  console.log("- escrituras reservadas al administrador institucional");
  console.log("- docentes y directivos conservan lectura");
  console.log("- superadministrador conserva acceso global");
  console.log("- informacion administrativa reservada a admin y directivos");
  console.log("- cargos directivos restringidos al catalogo de la base");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
