import "reflect-metadata";
import assert from "node:assert/strict";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { validate } from "class-validator";
import { EnrollmentController } from "@apps/enrollment-service/enrollment.controller";
import { CrearMatriculaDto } from "@apps/enrollment-service/dto";
import { AuditService } from "@libs/audit";
import {
  JwtPayload,
  RolesGuard,
  ROLES_KEY,
  ROLE_ADMINISTRATIVE,
  ROLE_ADMIN_APP,
  ROLE_COUNSELOR,
  ROLE_GROUP_DIRECTOR,
  ROLE_TEACHER,
  ROLE_TEACHER_DIRECTOR,
} from "@libs/common";

type HandlerName = keyof EnrollmentController;

function createPayload(
  roles: string[],
  superadministrador = false,
): JwtPayload {
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

function createContext(
  handlerName: HandlerName,
  user: JwtPayload,
): ExecutionContext {
  const request = {
    user,
    params: {},
    query: {},
    body: {},
    headers: {},
    method: handlerName.toString().startsWith("find") ? "GET" : "POST",
    originalUrl: `/test/${String(handlerName)}`,
    baseUrl: "",
  };

  return {
    getHandler: () => EnrollmentController.prototype[handlerName],
    getClass: () => EnrollmentController,
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
      getNext: () => undefined,
    }),
  } as unknown as ExecutionContext;
}

async function main() {
  const controller = EnrollmentController.prototype;
  assert.deepEqual(
    Reflect.getMetadata(ROLES_KEY, controller.createEstudiante),
    [ROLE_ADMIN_APP],
  );
  assert.deepEqual(Reflect.getMetadata(ROLES_KEY, controller.createAcudiente), [
    ROLE_ADMIN_APP,
  ]);
  assert.deepEqual(
    Reflect.getMetadata(ROLES_KEY, controller.vincularAcudiente),
    [ROLE_ADMIN_APP],
  );
  assert.deepEqual(Reflect.getMetadata(ROLES_KEY, controller.createMatricula), [
    ROLE_ADMIN_APP,
    ROLE_ADMINISTRATIVE,
  ]);
  assert.deepEqual(Reflect.getMetadata(ROLES_KEY, controller.assignGrupo), [
    ROLE_ADMIN_APP,
    ROLE_GROUP_DIRECTOR,
  ]);
  assert.deepEqual(
    Reflect.getMetadata(ROLES_KEY, controller.completarAcudiente),
    [ROLE_ADMIN_APP, ROLE_ADMINISTRATIVE],
  );
  assert.deepEqual(
    Reflect.getMetadata(ROLES_KEY, controller.retirarMatricula),
    [ROLE_ADMIN_APP, ROLE_ADMINISTRATIVE],
  );
  assert.deepEqual(Reflect.getMetadata(ROLES_KEY, controller.createTraslado), [
    ROLE_ADMIN_APP,
    ROLE_ADMINISTRATIVE,
  ]);
  for (const handler of [
    controller.aprobarTraslado,
    controller.rechazarTraslado,
    controller.ejecutarTraslado,
  ]) {
    assert.deepEqual(Reflect.getMetadata(ROLES_KEY, handler), [ROLE_ADMIN_APP]);
  }

  const readRoles = [
    ROLE_ADMIN_APP,
    ROLE_ADMINISTRATIVE,
    ROLE_GROUP_DIRECTOR,
    ROLE_TEACHER,
    ROLE_TEACHER_DIRECTOR,
    ROLE_COUNSELOR,
  ];
  assert.deepEqual(
    Reflect.getMetadata(ROLES_KEY, controller.findMatriculas),
    readRoles,
  );
  const transferReadRoles = [
    ROLE_ADMIN_APP,
    ROLE_ADMINISTRATIVE,
    ROLE_TEACHER_DIRECTOR,
  ];
  assert.deepEqual(
    Reflect.getMetadata(ROLES_KEY, controller.findTraslados),
    transferReadRoles,
  );
  assert.deepEqual(
    Reflect.getMetadata(ROLES_KEY, controller.findTraslado),
    transferReadRoles,
  );
  assert.deepEqual(
    Reflect.getMetadata(ROLES_KEY, controller.findMatricula),
    readRoles,
  );
  assert.deepEqual(
    Reflect.getMetadata(
      ROLES_KEY,
      controller.findMatriculasPendientesAcudiente,
    ),
    readRoles,
  );

  const dtoSinAcudiente = Object.assign(new CrearMatriculaDto(), {
    codigo: "MAT-001",
    estudianteId: "50000000-0000-4000-8000-000000000001",
    anioLectivoId: "50000000-0000-4000-8000-000000000002",
    sedeId: "50000000-0000-4000-8000-000000000003",
    jornadaId: "50000000-0000-4000-8000-000000000004",
    gradoId: "50000000-0000-4000-8000-000000000005",
    fechaMatricula: "2026-07-19",
  });
  const errores = await validate(dtoSinAcudiente);
  assert.ok(errores.some((error) => error.property === "fechaLimiteAcudiente"));
  assert.ok(
    errores.some((error) => error.property === "motivoPendienteAcudiente"),
  );

  const dtoPendienteValido = Object.assign(new CrearMatriculaDto(), {
    ...dtoSinAcudiente,
    fechaLimiteAcudiente: "2026-08-02",
    motivoPendienteAcudiente: "Documentacion del acudiente en tramite",
  });
  assert.equal((await validate(dtoPendienteValido)).length, 0);

  let deniedAudits = 0;
  const auditService = {
    registerHttpEvent: async () => {
      deniedAudits += 1;
    },
  } as unknown as AuditService;
  const guard = new RolesGuard(new Reflector(), auditService);

  assert.equal(
    await guard.canActivate(
      createContext("createMatricula", createPayload([ROLE_ADMINISTRATIVE])),
    ),
    true,
  );
  assert.equal(
    await guard.canActivate(
      createContext("createTraslado", createPayload([ROLE_ADMINISTRATIVE])),
    ),
    true,
  );
  await assert.rejects(
    guard.canActivate(
      createContext("aprobarTraslado", createPayload([ROLE_ADMINISTRATIVE])),
    ),
    ForbiddenException,
  );
  assert.equal(
    await guard.canActivate(
      createContext("assignGrupo", createPayload([ROLE_GROUP_DIRECTOR])),
    ),
    true,
  );
  await assert.rejects(
    guard.canActivate(
      createContext("createMatricula", createPayload([ROLE_TEACHER])),
    ),
    ForbiddenException,
  );
  assert.equal(
    await guard.canActivate(
      createContext("findMatriculas", createPayload([ROLE_TEACHER])),
    ),
    true,
  );
  assert.equal(
    await guard.canActivate(
      createContext("createMatricula", createPayload([], true)),
    ),
    true,
  );
  assert.equal(deniedAudits, 2);

  console.log("Enrollment authorization tests passed:");
  console.log("- la matricula admite acudiente o datos de provisionalidad");
  console.log("- completar acudiente requiere rol administrativo");
  console.log("- administrativos pueden crear matriculas");
  console.log("- directores de grupo pueden asignar grupos");
  console.log("- docentes conservan lectura pero no pueden matricular");
  console.log("- el superadministrador conserva acceso global");
  console.log(
    "- administrativos solicitan y administradores deciden traslados",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
