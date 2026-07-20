import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { setAuditAfterState, setAuditEntityId } from "@libs/audit";
import { JwtPayload, ROLE_ADMIN_APP } from "@libs/common";
import {
  AsignacionEstudianteGrupo,
  CargaAcademicaDocente,
  DirectorGrupo,
  Docente,
  Grupo,
  Matricula,
  RegistroAsistencia,
  SesionAsistencia,
} from "@libs/database";
import {
  DataSource,
  EntityManager,
  In,
  IsNull,
  QueryFailedError,
  Repository,
} from "typeorm";
import {
  ConsultarSesionesAsistenciaDto,
  CrearSesionAsistenciaDto,
  RegistrarAsistenciaDto,
} from "./dto";

@Injectable()
export class AttendanceService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(SesionAsistencia)
    private readonly sesionesRepository: Repository<SesionAsistencia>,
    @InjectRepository(RegistroAsistencia)
    private readonly registrosRepository: Repository<RegistroAsistencia>,
  ) {}

  async createSesion(
    grupoId: string,
    dto: CrearSesionAsistenciaDto,
    user: JwtPayload,
  ) {
    try {
      const sesion = await this.dataSource.transaction(async (manager) => {
        const grupo = await this.findGrupo(manager, grupoId);
        this.assertInstitution(grupo.institucionId, user);
        await this.assertCanWrite(
          manager,
          grupo,
          dto.cargaAcademicaDocenteId ?? null,
          user,
        );

        return manager.save(
          manager.create(SesionAsistencia, {
            codigo: dto.codigo,
            institucionId: grupo.institucionId,
            grupoId,
            cargaAcademicaDocenteId: dto.cargaAcademicaDocenteId ?? null,
            fecha: dto.fecha,
            numeroSesion: dto.numeroSesion ?? 1,
            tipo: dto.cargaAcademicaDocenteId ? "clase" : "diaria",
            horaInicio: dto.horaInicio ?? null,
            estado: "abierta",
            registradoPorUsuarioId: user.usuarioId,
            cerradoPorUsuarioId: null,
            cerradoEn: null,
            observaciones: dto.observaciones ?? null,
            eliminadoEn: null,
            version: 1,
          }),
        );
      });
      this.audit(sesion);
      return sesion;
    } catch (error) {
      this.unique(
        error,
        "Ya existe una sesion equivalente para el grupo o el codigo esta registrado",
      );
      throw error;
    }
  }

  async findSesiones(
    grupoId: string,
    query: ConsultarSesionesAsistenciaDto,
    user: JwtPayload,
  ) {
    const grupo = await this.dataSource.getRepository(Grupo).findOneBy({
      id: grupoId,
      eliminadoEn: IsNull(),
    });
    if (!grupo) throw new NotFoundException("Grupo no encontrado");
    this.assertInstitution(grupo.institucionId, user);
    if (
      query.fechaDesde &&
      query.fechaHasta &&
      query.fechaDesde > query.fechaHasta
    ) {
      throw new BadRequestException(
        "La fecha desde no puede ser posterior a la fecha hasta",
      );
    }

    const builder = this.sesionesRepository
      .createQueryBuilder("sesion")
      .leftJoinAndSelect("sesion.cargaAcademicaDocente", "carga")
      .where("sesion.grupo_id = :grupoId", { grupoId })
      .andWhere("sesion.eliminado_en is null")
      .orderBy("sesion.fecha", "DESC")
      .addOrderBy("sesion.numero_sesion", "ASC");
    if (query.fechaDesde) {
      builder.andWhere("sesion.fecha >= :fechaDesde", {
        fechaDesde: query.fechaDesde,
      });
    }
    if (query.fechaHasta) {
      builder.andWhere("sesion.fecha <= :fechaHasta", {
        fechaHasta: query.fechaHasta,
      });
    }
    return builder.getMany();
  }

  async findSesion(sesionId: string, user: JwtPayload) {
    const sesion = await this.sesionesRepository.findOne({
      where: { id: sesionId, eliminadoEn: IsNull() },
      relations: { grupo: true, cargaAcademicaDocente: true },
    });
    if (!sesion)
      throw new NotFoundException("Sesion de asistencia no encontrada");
    this.assertInstitution(sesion.institucionId, user);
    const registros = await this.registrosRepository.find({
      where: { sesionAsistenciaId: sesionId },
      relations: { matricula: { estudiante: { persona: true } } },
      order: { matriculaId: "ASC" },
    });
    return { ...sesion, registros };
  }

  async registrar(
    sesionId: string,
    dto: RegistrarAsistenciaDto,
    user: JwtPayload,
  ) {
    const registros = await this.dataSource.transaction(async (manager) => {
      const sesion = await this.findOpenSession(manager, sesionId);
      const grupo = await this.findGrupo(manager, sesion.grupoId);
      this.assertInstitution(sesion.institucionId, user);
      await this.assertCanWrite(
        manager,
        grupo,
        sesion.cargaAcademicaDocenteId,
        user,
      );

      const matriculaIds = dto.registros.map((item) => item.matriculaId);
      if (new Set(matriculaIds).size !== matriculaIds.length) {
        throw new BadRequestException(
          "No puede enviar la misma matricula mas de una vez",
        );
      }
      this.validateAttendanceItems(dto);

      const matriculas = await manager.find(Matricula, {
        where: {
          id: In(matriculaIds),
          estado: In(["activa", "pendiente_acudiente"]),
          eliminadoEn: IsNull(),
        },
      });
      const asignaciones = await manager.find(AsignacionEstudianteGrupo, {
        where: {
          matriculaId: In(matriculaIds),
          grupoId: sesion.grupoId,
          estado: "activo",
        },
      });
      if (
        matriculas.length !== matriculaIds.length ||
        asignaciones.length !== matriculaIds.length
      ) {
        throw new BadRequestException(
          "Todas las matriculas deben estar vigentes y asignadas activamente al grupo",
        );
      }

      await manager.upsert(
        RegistroAsistencia,
        dto.registros.map((item) => ({
          sesionAsistenciaId: sesionId,
          matriculaId: item.matriculaId,
          estado: item.estado,
          minutosRetraso: item.minutosRetraso ?? 0,
          observaciones: item.observaciones ?? null,
          registradoPorUsuarioId: user.usuarioId,
        })),
        {
          conflictPaths: ["sesionAsistenciaId", "matriculaId"],
          skipUpdateIfNoValuesChanged: true,
        },
      );
      return manager.find(RegistroAsistencia, {
        where: { sesionAsistenciaId: sesionId },
        order: { matriculaId: "ASC" },
      });
    });

    setAuditEntityId(sesionId);
    setAuditAfterState({ totalRegistros: registros.length });
    return registros;
  }

  async cerrar(sesionId: string, user: JwtPayload) {
    const sesion = await this.dataSource.transaction(async (manager) => {
      const actual = await this.findOpenSession(manager, sesionId);
      const grupo = await this.findGrupo(manager, actual.grupoId);
      this.assertInstitution(actual.institucionId, user);
      await this.assertCanWrite(
        manager,
        grupo,
        actual.cargaAcademicaDocenteId,
        user,
      );

      const totalEsperado = await manager
        .getRepository(AsignacionEstudianteGrupo)
        .createQueryBuilder("asignacion")
        .innerJoin(
          Matricula,
          "matricula",
          "matricula.id = asignacion.matricula_id and matricula.estado in (:...estados) and matricula.eliminado_en is null",
          { estados: ["activa", "pendiente_acudiente"] },
        )
        .where("asignacion.grupo_id = :grupoId", { grupoId: actual.grupoId })
        .andWhere("asignacion.estado = :estado", { estado: "activo" })
        .getCount();
      const totalRegistrado = await manager.countBy(RegistroAsistencia, {
        sesionAsistenciaId: sesionId,
      });
      if (totalRegistrado !== totalEsperado) {
        throw new BadRequestException(
          `No se puede cerrar: hay ${totalRegistrado} registros de ${totalEsperado} matriculas activas`,
        );
      }

      actual.estado = "cerrada";
      actual.cerradoPorUsuarioId = user.usuarioId;
      actual.cerradoEn = new Date();
      return manager.save(actual);
    });
    this.audit(sesion);
    return sesion;
  }

  private async findGrupo(manager: EntityManager, grupoId: string) {
    const grupo = await manager.findOneBy(Grupo, {
      id: grupoId,
      activo: true,
      eliminadoEn: IsNull(),
    });
    if (!grupo) throw new NotFoundException("Grupo activo no encontrado");
    return grupo;
  }

  private async findOpenSession(manager: EntityManager, sesionId: string) {
    const sesion = await manager.findOne(SesionAsistencia, {
      where: { id: sesionId, estado: "abierta", eliminadoEn: IsNull() },
      lock: { mode: "pessimistic_write" },
    });
    if (!sesion) {
      throw new NotFoundException("Sesion de asistencia abierta no encontrada");
    }
    return sesion;
  }

  private async assertCanWrite(
    manager: EntityManager,
    grupo: Grupo,
    cargaId: string | null,
    user: JwtPayload,
  ): Promise<void> {
    let carga: CargaAcademicaDocente | null = null;
    if (cargaId) {
      carga = await manager.findOneBy(CargaAcademicaDocente, {
        id: cargaId,
        grupoId: grupo.id,
        activo: true,
        eliminadoEn: IsNull(),
      });
      if (!carga) {
        throw new BadRequestException(
          "La carga academica no pertenece al grupo o no esta activa",
        );
      }
    }

    if (user.superadministrador || user.roles.includes(ROLE_ADMIN_APP)) return;
    const docente = await manager.findOneBy(Docente, {
      personaId: user.personaId,
      institucionId: grupo.institucionId,
      estado: "activo",
      eliminadoEn: IsNull(),
    });
    if (!docente) {
      throw new ForbiddenException(
        "El usuario no corresponde a un docente activo de la institucion",
      );
    }
    if (carga?.docenteId === docente.id) return;
    const direccion = await manager.findOneBy(DirectorGrupo, {
      grupoId: grupo.id,
      docenteId: docente.id,
      activo: true,
    });
    if (direccion) return;
    throw new ForbiddenException(
      carga
        ? "Solo el docente de la carga o el director del grupo puede registrar esta asistencia"
        : "La asistencia diaria requiere ser director del grupo",
    );
  }

  private assertInstitution(institucionId: string, user: JwtPayload): void {
    if (user.superadministrador) return;
    if (!user.institucionId || user.institucionId !== institucionId) {
      throw new ForbiddenException(
        "No puede consultar o registrar asistencia de otra institucion",
      );
    }
  }

  private validateAttendanceItems(dto: RegistrarAsistenciaDto): void {
    for (const item of dto.registros) {
      const minutos = item.minutosRetraso ?? 0;
      if (
        (item.estado === "tarde" && minutos <= 0) ||
        (item.estado !== "tarde" && minutos !== 0)
      ) {
        throw new BadRequestException(
          "Los minutos de retraso solo aplican al estado tarde y deben ser mayores que cero",
        );
      }
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
