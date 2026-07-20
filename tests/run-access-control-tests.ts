import 'reflect-metadata';
import assert from 'node:assert/strict';
import { ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AccessControlService } from '@apps/access-control-service/access-control.service';
import { JwtPayload, ROLE_ADMIN_APP } from '@libs/common';
import {
  PerfilUsuario,
  Permiso,
  Rol,
  RolPermiso,
  RolUsuario,
  TipoPerfil,
  Usuario,
} from '@libs/database';

const INSTITUTION_A = '10000000-0000-4000-8000-000000000001';
const INSTITUTION_B = '10000000-0000-4000-8000-000000000002';
const USER_A = '20000000-0000-4000-8000-000000000001';
const USER_B = '20000000-0000-4000-8000-000000000002';
const USER_C = '20000000-0000-4000-8000-000000000003';

function createUser(id: string, institucionId: string): Usuario {
  return {
    id,
    institucionId,
    personaId: `30000000-0000-4000-8000-00000000000${id.slice(-1)}`,
  } as Usuario;
}

function createPayload(
  usuarioId: string,
  institucionId: string | null,
  roles: string[] = [],
  superadministrador = false,
): JwtPayload {
  return {
    sub: usuarioId,
    usuarioId,
    institucionId,
    personaId: '30000000-0000-4000-8000-000000000099',
    roles,
    superadministrador,
    sessionId: '40000000-0000-4000-8000-000000000001',
  };
}

function createService() {
  const users = [
    createUser(USER_A, INSTITUTION_A),
    createUser(USER_B, INSTITUTION_A),
    createUser(USER_C, INSTITUTION_B),
  ];

  const usuariosRepository = {
    findOneBy: async ({ id }: { id: string }) =>
      users.find((user) => user.id === id) ?? null,
  } as unknown as Repository<Usuario>;

  const emptyFindRepository = {
    find: async () => [],
  };

  return new AccessControlService(
    usuariosRepository,
    emptyFindRepository as unknown as Repository<PerfilUsuario>,
    {} as Repository<TipoPerfil>,
    emptyFindRepository as unknown as Repository<RolUsuario>,
    {} as Repository<Rol>,
    emptyFindRepository as unknown as Repository<RolPermiso>,
    emptyFindRepository as unknown as Repository<Permiso>,
  );
}

async function main() {
  const service = createService();

  const ownContext = await service.getContextoAcceso(
    USER_A,
    createPayload(USER_A, INSTITUTION_A),
  );
  assert.equal(ownContext.usuarioId, USER_A);

  const adminContext = await service.getContextoAcceso(
    USER_B,
    createPayload(USER_A, INSTITUTION_A, [ROLE_ADMIN_APP]),
  );
  assert.equal(adminContext.usuarioId, USER_B);

  const superadminPermissions = await service.getPermisosEfectivos(
    USER_C,
    createPayload(USER_A, null, [], true),
  );
  assert.deepEqual(superadminPermissions, []);

  await assert.rejects(
    service.getContextoAcceso(
      USER_C,
      createPayload(USER_A, INSTITUTION_A, [ROLE_ADMIN_APP]),
    ),
    ForbiddenException,
  );

  await assert.rejects(
    service.getPermisosEfectivos(
      USER_B,
      createPayload(USER_A, INSTITUTION_A),
    ),
    ForbiddenException,
  );

  console.log('Access-control authorization tests passed:');
  console.log('- consulta del propio usuario');
  console.log('- administrador dentro de su institucion');
  console.log('- superadministrador entre instituciones');
  console.log('- bloqueo entre instituciones');
  console.log('- bloqueo entre usuarios sin rol administrativo');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
