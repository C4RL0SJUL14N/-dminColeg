import "reflect-metadata";
import assert from "node:assert/strict";
import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { AttendanceController } from "@apps/attendance-service/attendance.controller";
import { RegistrarAsistenciaDto } from "@apps/attendance-service/dto";
import { AttendanceService } from "@apps/attendance-service/attendance.service";
import { AuditService } from "@libs/audit";
import {
  JwtPayload,
  RolesGuard,
  ROLES_KEY,
  ROLE_ADMINISTRATIVE,
  ROLE_ADMIN_APP,
  ROLE_GROUP_DIRECTOR,
  ROLE_TEACHER,
  ROLE_TEACHER_DIRECTOR,
} from "@libs/common";

type HandlerName = keyof AttendanceController;
type AttendanceHarness = {
  validateAttendanceItems(dto: RegistrarAsistenciaDto): void;
};

function payload(roles: string[]): JwtPayload {
  return {
    sub: "20000000-0000-4000-8000-000000000001",
    usuarioId: "20000000-0000-4000-8000-000000000001",
    institucionId: "10000000-0000-4000-8000-000000000001",
    personaId: "30000000-0000-4000-8000-000000000001",
    roles,
    superadministrador: false,
    sessionId: "40000000-0000-4000-8000-000000000001",
  };
}

function context(handlerName: HandlerName, user: JwtPayload): ExecutionContext {
  return {
    getHandler: () => AttendanceController.prototype[handlerName],
    getClass: () => AttendanceController,
    switchToHttp: () => ({
      getRequest: () => ({
        user,
        params: {},
        query: {},
        body: {},
        headers: {},
        method: handlerName === "registrar" ? "PUT" : "POST",
        originalUrl: `/test/${String(handlerName)}`,
        baseUrl: "",
      }),
      getResponse: () => ({}),
      getNext: () => undefined,
    }),
  } as unknown as ExecutionContext;
}

async function main() {
  const controller = AttendanceController.prototype;
  const writeRoles = [ROLE_ADMIN_APP, ROLE_TEACHER, ROLE_GROUP_DIRECTOR];
  for (const handler of [
    controller.createSesion,
    controller.registrar,
    controller.cerrar,
  ]) {
    assert.deepEqual(Reflect.getMetadata(ROLES_KEY, handler), writeRoles);
  }
  const readRoles = [
    ROLE_ADMIN_APP,
    ROLE_ADMINISTRATIVE,
    ROLE_TEACHER,
    ROLE_GROUP_DIRECTOR,
    ROLE_TEACHER_DIRECTOR,
  ];
  for (const handler of [controller.findSesiones, controller.findSesion]) {
    assert.deepEqual(Reflect.getMetadata(ROLES_KEY, handler), readRoles);
  }

  let denied = 0;
  const guard = new RolesGuard(new Reflector(), {
    registerHttpEvent: async () => {
      denied += 1;
    },
  } as unknown as AuditService);
  assert.equal(
    await guard.canActivate(context("registrar", payload([ROLE_TEACHER]))),
    true,
  );
  await assert.rejects(
    guard.canActivate(context("registrar", payload([ROLE_ADMINISTRATIVE]))),
    ForbiddenException,
  );
  assert.equal(
    await guard.canActivate(
      context("findSesiones", payload([ROLE_ADMINISTRATIVE])),
    ),
    true,
  );
  assert.equal(denied, 1);

  const dtoInvalido = plainToInstance(RegistrarAsistenciaDto, {
    registros: [{ matriculaId: "no-es-uuid", estado: "desconocido" }],
  });
  assert.ok((await validate(dtoInvalido)).length > 0);

  const service = Object.create(
    AttendanceService.prototype,
  ) as AttendanceHarness;
  assert.throws(
    () =>
      service.validateAttendanceItems({
        registros: [
          {
            matriculaId: "50000000-0000-4000-8000-000000000001",
            estado: "tarde",
            minutosRetraso: 0,
          },
        ],
      }),
    BadRequestException,
  );
  assert.doesNotThrow(() =>
    service.validateAttendanceItems({
      registros: [
        {
          matriculaId: "50000000-0000-4000-8000-000000000001",
          estado: "tarde",
          minutosRetraso: 10,
        },
      ],
    }),
  );

  console.log("Attendance authorization tests passed:");
  console.log("- docentes y directores pueden registrar");
  console.log("- administrativos tienen lectura, no escritura");
  console.log("- estados y retrasos se validan antes de persistir");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
