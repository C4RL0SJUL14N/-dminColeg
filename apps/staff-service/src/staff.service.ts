import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { setAuditAfterState, setAuditEntityId } from "@libs/audit";
import { JwtPayload } from "@libs/common";
import {
  Administrativo,
  AreaConocimiento,
  DirectorGrupo,
  DirectivoDocente,
  Docente,
  DocenteAreaConocimiento,
  DocenteSede,
  Grupo,
  Institucion,
  Persona,
  Sede,
  TituloAcademicoDocente,
} from "@libs/database";
import { DataSource, IsNull, QueryFailedError, Repository } from "typeorm";
import {
  AsignarAreaDocenteDto,
  AsignarDirectorGrupoDto,
  AsignarSedeDocenteDto,
  CrearDocenteDto,
  CrearAdministrativoDto,
  CrearDirectivoDocenteDto,
  CrearTituloDocenteDto,
} from "./dto";

@Injectable()
export class StaffService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Docente)
    private readonly docentesRepository: Repository<Docente>,
  ) {}

  async createDocente(institucionId: string, dto: CrearDocenteDto) {
    const [institucion, persona] = await Promise.all([
      this.dataSource.getRepository(Institucion).findOneBy({
        id: institucionId,
        activo: true,
        eliminadoEn: IsNull(),
      }),
      this.dataSource.getRepository(Persona).findOneBy({
        id: dto.personaId,
        activo: true,
        eliminadoEn: IsNull(),
      }),
    ]);
    if (!institucion || !persona) {
      throw new BadRequestException(
        "La institucion y la persona deben existir y estar activas",
      );
    }

    try {
      const docente = await this.docentesRepository.save(
        this.docentesRepository.create({
          codigo: dto.codigo,
          institucionId,
          personaId: dto.personaId,
          estado: "activo",
          eliminadoEn: null,
          version: 1,
        }),
      );
      this.audit(docente);
      return docente;
    } catch (error) {
      this.unique(error, "La persona ya es docente o el codigo ya existe");
      throw error;
    }
  }

  findDocentes(institucionId: string) {
    return this.docentesRepository.find({
      where: { institucionId, eliminadoEn: IsNull() },
      relations: { persona: true },
      order: { codigo: "ASC" },
    });
  }

  async findDocente(docenteId: string, user: JwtPayload) {
    const docente = await this.docentesRepository.findOne({
      where: { id: docenteId, eliminadoEn: IsNull() },
      relations: { persona: true },
    });
    if (!docente) throw new NotFoundException("Docente no encontrado");
    this.assertInstitution(docente.institucionId, user);

    const [sedes, areas, titulos] = await Promise.all([
      this.dataSource.getRepository(DocenteSede).find({
        where: { docenteId, activo: true },
        relations: { sede: true },
      }),
      this.dataSource.getRepository(DocenteAreaConocimiento).find({
        where: { docenteId },
        relations: { areaConocimiento: true },
      }),
      this.dataSource.getRepository(TituloAcademicoDocente).find({
        where: { docenteId },
        order: { esTituloPrincipal: "DESC", anioObtencion: "DESC" },
      }),
    ]);
    return { ...docente, sedes, areas, titulos };
  }

  async assignSede(
    docenteId: string,
    dto: AsignarSedeDocenteDto,
    user: JwtPayload,
  ) {
    try {
      const asignacion = await this.dataSource.transaction(async (manager) => {
        const docente = await this.findActiveTeacher(manager, docenteId, user);
        const sede = await manager.findOneBy(Sede, {
          id: dto.sedeId,
          institucionId: docente.institucionId,
          activo: true,
          eliminadoEn: IsNull(),
        });
        if (!sede) {
          throw new BadRequestException(
            "La sede no pertenece a la institucion del docente",
          );
        }
        if (dto.esPrincipal) {
          await manager.update(
            DocenteSede,
            { docenteId, esPrincipal: true, activo: true },
            { esPrincipal: false },
          );
        }
        const existente = await manager.findOneBy(DocenteSede, {
          docenteId,
          sedeId: dto.sedeId,
        });
        return manager.save(
          existente
            ? manager.merge(DocenteSede, existente, {
                activo: true,
                esPrincipal: dto.esPrincipal ?? existente.esPrincipal,
              })
            : manager.create(DocenteSede, {
                docenteId,
                sedeId: dto.sedeId,
                esPrincipal: dto.esPrincipal ?? false,
                activo: true,
              }),
        );
      });
      this.audit(asignacion);
      return asignacion;
    } catch (error) {
      this.unique(error, "El docente ya tiene una sede principal activa");
      throw error;
    }
  }

  async assignArea(
    docenteId: string,
    dto: AsignarAreaDocenteDto,
    user: JwtPayload,
  ) {
    try {
      const asignacion = await this.dataSource.transaction(async (manager) => {
        const docente = await this.findActiveTeacher(manager, docenteId, user);
        const area = await manager.findOneBy(AreaConocimiento, {
          id: dto.areaConocimientoId,
          institucionId: docente.institucionId,
          activo: true,
        });
        if (!area) {
          throw new BadRequestException(
            "El area no pertenece a la institucion del docente",
          );
        }
        return manager.save(
          manager.create(DocenteAreaConocimiento, {
            docenteId,
            areaConocimientoId: dto.areaConocimientoId,
          }),
        );
      });
      this.audit(asignacion);
      return asignacion;
    } catch (error) {
      this.unique(error, "El area ya esta asignada al docente");
      throw error;
    }
  }

  async createTitulo(
    docenteId: string,
    dto: CrearTituloDocenteDto,
    user: JwtPayload,
  ) {
    try {
      const titulo = await this.dataSource.transaction(async (manager) => {
        await this.findActiveTeacher(manager, docenteId, user);
        if (dto.esTituloPrincipal) {
          await manager.update(
            TituloAcademicoDocente,
            { docenteId, esTituloPrincipal: true },
            { esTituloPrincipal: false },
          );
        }
        return manager.save(
          manager.create(TituloAcademicoDocente, {
            docenteId,
            titulo: dto.titulo,
            anioObtencion: dto.anioObtencion ?? null,
            institucionOtorgante: dto.institucionOtorgante ?? null,
            pais: dto.pais ?? null,
            esTituloPrincipal: dto.esTituloPrincipal ?? false,
          }),
        );
      });
      this.audit(titulo);
      return titulo;
    } catch (error) {
      this.unique(error, "El docente ya tiene un titulo principal");
      throw error;
    }
  }

  async assignDirector(
    grupoId: string,
    dto: AsignarDirectorGrupoDto,
    user: JwtPayload,
  ) {
    try {
      const director = await this.dataSource.transaction(async (manager) => {
        const grupo = await manager.findOne(Grupo, {
          where: { id: grupoId, activo: true, eliminadoEn: IsNull() },
          lock: { mode: "pessimistic_write" },
        });
        if (!grupo) throw new NotFoundException("Grupo activo no encontrado");
        this.assertInstitution(grupo.institucionId, user);
        const docente = await this.findActiveTeacher(
          manager,
          dto.docenteId,
          user,
        );
        if (docente.institucionId !== grupo.institucionId) {
          throw new BadRequestException(
            "El docente y el grupo deben pertenecer a la misma institucion",
          );
        }
        const sede = await manager.findOneBy(DocenteSede, {
          docenteId: docente.id,
          sedeId: grupo.sedeId,
          activo: true,
        });
        if (!sede) {
          throw new BadRequestException(
            "El docente debe estar asignado a la sede del grupo",
          );
        }
        const actual = await manager.findOne(DirectorGrupo, {
          where: { grupoId, activo: true },
          lock: { mode: "pessimistic_write" },
        });
        if (actual?.docenteId === docente.id) {
          throw new ConflictException("El docente ya dirige este grupo");
        }
        if (actual) {
          actual.activo = false;
          await manager.save(actual);
        }
        return manager.save(
          manager.create(DirectorGrupo, {
            grupoId,
            docenteId: docente.id,
            activo: true,
          }),
        );
      });
      this.audit(director);
      return director;
    } catch (error) {
      this.unique(error, "El grupo ya tiene un director activo");
      throw error;
    }
  }

  async findDirector(grupoId: string, user: JwtPayload) {
    const grupo = await this.dataSource.getRepository(Grupo).findOneBy({
      id: grupoId,
      eliminadoEn: IsNull(),
    });
    if (!grupo) throw new NotFoundException("Grupo no encontrado");
    this.assertInstitution(grupo.institucionId, user);
    return this.dataSource.getRepository(DirectorGrupo).findOne({
      where: { grupoId, activo: true },
      relations: { docente: true },
    });
  }

  async createAdministrativo(
    institucionId: string,
    dto: CrearAdministrativoDto,
  ) {
    await this.validateInstitutionAndPerson(institucionId, dto.personaId);
    try {
      const repository = this.dataSource.getRepository(Administrativo);
      const administrativo = await repository.save(
        repository.create({
          codigo: dto.codigo,
          institucionId,
          personaId: dto.personaId,
          tipoEmpleado: dto.tipoEmpleado,
          cargo: dto.cargo,
          dependencia: dto.dependencia ?? null,
          fechaVinculacion: dto.fechaVinculacion ?? null,
          estado: "activo",
          eliminadoEn: null,
          version: 1,
        }),
      );
      this.audit(administrativo);
      return administrativo;
    } catch (error) {
      this.unique(
        error,
        "La persona ya es administrativa en la institucion o el codigo existe",
      );
      throw error;
    }
  }

  findAdministrativos(institucionId: string) {
    return this.dataSource.getRepository(Administrativo).find({
      where: { institucionId, eliminadoEn: IsNull() },
      relations: { persona: true },
      order: { codigo: "ASC" },
    });
  }

  async findAdministrativo(administrativoId: string, user: JwtPayload) {
    const administrativo = await this.dataSource
      .getRepository(Administrativo)
      .findOne({
        where: { id: administrativoId, eliminadoEn: IsNull() },
        relations: { persona: true },
      });
    if (!administrativo) {
      throw new NotFoundException("Administrativo no encontrado");
    }
    this.assertInstitution(administrativo.institucionId, user);
    return administrativo;
  }

  async createDirectivoDocente(
    institucionId: string,
    dto: CrearDirectivoDocenteDto,
    user: JwtPayload,
  ) {
    try {
      const directivo = await this.dataSource.transaction(async (manager) => {
        const institucion = await manager.findOneBy(Institucion, {
          id: institucionId,
          activo: true,
          eliminadoEn: IsNull(),
        });
        if (!institucion) {
          throw new NotFoundException("Institucion activa no encontrada");
        }
        const docente = await this.findActiveTeacher(
          manager,
          dto.docenteId,
          user,
        );
        if (docente.institucionId !== institucionId) {
          throw new BadRequestException(
            "El docente no pertenece a la institucion del cargo directivo",
          );
        }
        return manager.save(
          manager.create(DirectivoDocente, {
            codigo: dto.codigo,
            institucionId,
            docenteId: dto.docenteId,
            cargo: dto.cargo,
            estado: "activo",
          }),
        );
      });
      this.audit(directivo);
      return directivo;
    } catch (error) {
      this.unique(
        error,
        "El docente ya tiene ese cargo directivo o el codigo existe",
      );
      throw error;
    }
  }

  findDirectivosDocentes(institucionId: string) {
    return this.dataSource.getRepository(DirectivoDocente).find({
      where: { institucionId },
      relations: { docente: { persona: true } },
      order: { cargo: "ASC", codigo: "ASC" },
    });
  }

  async findDirectivoDocente(directivoId: string, user: JwtPayload) {
    const directivo = await this.dataSource
      .getRepository(DirectivoDocente)
      .findOne({
        where: { id: directivoId },
        relations: { docente: { persona: true } },
      });
    if (!directivo) {
      throw new NotFoundException("Directivo docente no encontrado");
    }
    this.assertInstitution(directivo.institucionId, user);
    return directivo;
  }

  private async validateInstitutionAndPerson(
    institucionId: string,
    personaId: string,
  ): Promise<void> {
    const [institucion, persona] = await Promise.all([
      this.dataSource.getRepository(Institucion).findOneBy({
        id: institucionId,
        activo: true,
        eliminadoEn: IsNull(),
      }),
      this.dataSource.getRepository(Persona).findOneBy({
        id: personaId,
        activo: true,
        eliminadoEn: IsNull(),
      }),
    ]);
    if (!institucion || !persona) {
      throw new BadRequestException(
        "La institucion y la persona deben existir y estar activas",
      );
    }
  }

  private async findActiveTeacher(
    manager: DataSource["manager"],
    docenteId: string,
    user: JwtPayload,
  ) {
    const docente = await manager.findOne(Docente, {
      where: { id: docenteId, estado: "activo", eliminadoEn: IsNull() },
      lock: { mode: "pessimistic_write" },
    });
    if (!docente) throw new NotFoundException("Docente activo no encontrado");
    this.assertInstitution(docente.institucionId, user);
    return docente;
  }

  private assertInstitution(institucionId: string, user: JwtPayload): void {
    if (user.superadministrador) return;
    if (!user.institucionId || user.institucionId !== institucionId) {
      throw new ForbiddenException(
        "No puede operar sobre personal de otra institucion",
      );
    }
  }

  private unique(error: unknown, message: string): void {
    if (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string }).code === "23505"
    ) {
      throw new ConflictException(message);
    }
  }

  private audit(entity: { id: string }): void {
    setAuditEntityId(entity.id);
    setAuditAfterState(entity);
  }
}
