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
  Acudiente,
  AnioLectivo,
  AsignacionEstudianteGrupo,
  Estudiante,
  EstudianteAcudiente,
  Grado,
  Grupo,
  Institucion,
  Jornada,
  Matricula,
  Persona,
  Sede,
  TrasladoEstudiantil,
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
  AprobarTrasladoDto,
  AsignarGrupoDto,
  CompletarAcudienteMatriculaDto,
  CrearAcudienteDto,
  CrearEstudianteDto,
  CrearMatriculaDto,
  CrearTrasladoDto,
  EjecutarTrasladoDto,
  RechazarTrasladoDto,
  RetirarMatriculaDto,
  VincularAcudienteDto,
} from "./dto";

@Injectable()
export class EnrollmentService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Persona)
    private readonly personasRepository: Repository<Persona>,
    @InjectRepository(Estudiante)
    private readonly estudiantesRepository: Repository<Estudiante>,
    @InjectRepository(Acudiente)
    private readonly acudientesRepository: Repository<Acudiente>,
    @InjectRepository(EstudianteAcudiente)
    private readonly estudiantesAcudientesRepository: Repository<EstudianteAcudiente>,
    @InjectRepository(Matricula)
    private readonly matriculasRepository: Repository<Matricula>,
    @InjectRepository(TrasladoEstudiantil)
    private readonly trasladosRepository: Repository<TrasladoEstudiantil>,
  ) {}

  async createEstudiante(dto: CrearEstudianteDto) {
    await this.findPersonaActiva(dto.personaId);

    try {
      const estudiante = await this.estudiantesRepository.save(
        this.estudiantesRepository.create({
          codigo: dto.codigo,
          personaId: dto.personaId,
          estado: "activo",
          fechaIngreso: dto.fechaIngreso ?? null,
          fechaRetiro: null,
          eliminadoEn: null,
          version: 1,
        }),
      );
      this.setAuditResult(estudiante);
      return estudiante;
    } catch (error) {
      this.throwIfUniqueViolation(
        error,
        "Ya existe un estudiante con ese codigo o persona",
      );
      throw error;
    }
  }

  async createAcudiente(dto: CrearAcudienteDto) {
    await this.findPersonaActiva(dto.personaId);

    try {
      const acudiente = await this.acudientesRepository.save(
        this.acudientesRepository.create({
          codigo: dto.codigo,
          personaId: dto.personaId,
          estado: "activo",
        }),
      );
      this.setAuditResult(acudiente);
      return acudiente;
    } catch (error) {
      this.throwIfUniqueViolation(
        error,
        "Ya existe un acudiente con ese codigo o persona",
      );
      throw error;
    }
  }

  async vincularAcudiente(estudianteId: string, dto: VincularAcudienteDto) {
    await this.findEstudianteActivo(estudianteId);
    await this.findAcudienteActivo(dto.acudienteId);

    const datos = {
      estudianteId,
      acudienteId: dto.acudienteId,
      tipoParentesco: dto.tipoParentesco,
      esContactoPrincipal: dto.esContactoPrincipal ?? false,
      autorizadoRecoger: dto.autorizadoRecoger ?? false,
      contactoEmergencia: dto.contactoEmergencia ?? false,
      conviveConEstudiante: dto.conviveConEstudiante ?? false,
      esResponsableLegal: dto.esResponsableLegal ?? false,
      esResponsableFinanciero: dto.esResponsableFinanciero ?? false,
      autorizadoPorPadre: dto.autorizadoPorPadre ?? false,
      observaciones: dto.observaciones ?? null,
      activo: true,
    };

    try {
      const existente = await this.estudiantesAcudientesRepository.findOneBy({
        estudianteId,
        acudienteId: dto.acudienteId,
        tipoParentesco: dto.tipoParentesco,
      });
      const vinculo = await this.estudiantesAcudientesRepository.save(
        existente
          ? this.estudiantesAcudientesRepository.merge(existente, datos)
          : this.estudiantesAcudientesRepository.create(datos),
      );
      this.setAuditResult(vinculo);
      return vinculo;
    } catch (error) {
      this.throwIfUniqueViolation(error, "El acudiente ya esta vinculado");
      throw error;
    }
  }

  async createMatricula(
    institucionId: string,
    dto: CrearMatriculaDto,
    currentUser: JwtPayload,
  ) {
    this.assertInstitutionAccess(institucionId, currentUser);

    try {
      const matricula = await this.dataSource.transaction(async (manager) => {
        await this.findInstitucionActiva(manager, institucionId);
        await this.findEstudianteActivoConBloqueo(manager, dto.estudianteId);
        if (dto.acudienteId) {
          await this.findVinculoAcudienteActivo(
            manager,
            dto.estudianteId,
            dto.acudienteId,
          );
        } else {
          this.validatePendingGuardianData(dto);
        }
        await this.validateAcademicReferences(manager, institucionId, dto);

        const pendienteAcudiente = !dto.acudienteId;

        const nuevaMatricula = await manager.save(
          manager.create(Matricula, {
            codigo: dto.codigo,
            institucionId,
            estudianteId: dto.estudianteId,
            acudienteId: dto.acudienteId ?? null,
            anioLectivoId: dto.anioLectivoId,
            sedeId: dto.sedeId,
            jornadaId: dto.jornadaId,
            gradoId: dto.gradoId,
            estado: pendienteAcudiente ? "pendiente_acudiente" : "activa",
            fechaMatricula: dto.fechaMatricula,
            fechaLimiteAcudiente: pendienteAcudiente
              ? dto.fechaLimiteAcudiente!
              : null,
            motivoPendienteAcudiente: pendienteAcudiente
              ? dto.motivoPendienteAcudiente!
              : null,
            acudienteCompletadoEn: null,
            fechaRetiro: null,
            motivoRetiro: null,
            matriculaOrigenId: null,
            trasladoEntranteId: null,
            eliminadoEn: null,
            version: 1,
          }),
        );

        if (dto.grupoId) {
          const grupo = await this.findGrupoCompatible(
            manager,
            dto.grupoId,
            nuevaMatricula,
          );
          await manager.save(
            manager.create(AsignacionEstudianteGrupo, {
              matriculaId: nuevaMatricula.id,
              grupoId: grupo.id,
              fechaAsignacion: dto.fechaMatricula,
              estado: "activo",
              observaciones: null,
            }),
          );
        }

        return nuevaMatricula;
      });

      this.setAuditResult(matricula);
      return matricula;
    } catch (error) {
      this.throwIfUniqueViolation(
        error,
        "Ya existe una matricula vigente para el estudiante en ese anio lectivo o el codigo ya esta registrado",
      );
      throw error;
    }
  }

  findMatriculas(institucionId: string) {
    return this.matriculasRepository.find({
      where: { institucionId, eliminadoEn: IsNull() },
      relations: {
        estudiante: true,
        acudiente: true,
        anioLectivo: true,
        sede: true,
        jornada: true,
        grado: true,
      },
      order: { fechaMatricula: "DESC", codigo: "ASC" },
    });
  }

  findMatriculasPendientesAcudiente(institucionId: string) {
    return this.matriculasRepository.find({
      where: {
        institucionId,
        estado: "pendiente_acudiente",
        eliminadoEn: IsNull(),
      },
      relations: {
        estudiante: true,
        acudiente: true,
        anioLectivo: true,
        sede: true,
        jornada: true,
        grado: true,
      },
      order: { fechaLimiteAcudiente: "ASC", fechaMatricula: "ASC" },
    });
  }

  async findMatricula(matriculaId: string, currentUser: JwtPayload) {
    const matricula = await this.matriculasRepository.findOne({
      where: { id: matriculaId, eliminadoEn: IsNull() },
      relations: {
        estudiante: true,
        acudiente: true,
        anioLectivo: true,
        sede: true,
        jornada: true,
        grado: true,
      },
    });
    if (!matricula) {
      throw new NotFoundException("Matricula no encontrada");
    }

    this.assertInstitutionAccess(matricula.institucionId, currentUser);
    const asignacionGrupo = await this.dataSource
      .getRepository(AsignacionEstudianteGrupo)
      .findOne({
        where: { matriculaId, estado: "activo" },
        relations: { grupo: true },
      });

    return { ...matricula, asignacionGrupo };
  }

  async assignGrupo(
    matriculaId: string,
    dto: AsignarGrupoDto,
    currentUser: JwtPayload,
  ) {
    try {
      const asignacion = await this.dataSource.transaction(async (manager) => {
        const matricula = await this.findMatriculaVigenteConBloqueo(
          manager,
          matriculaId,
        );
        this.assertInstitutionAccess(matricula.institucionId, currentUser);
        const grupo = await this.findGrupoCompatible(
          manager,
          dto.grupoId,
          matricula,
        );

        const asignacionActual = await manager.findOne(
          AsignacionEstudianteGrupo,
          {
            where: { matriculaId, estado: "activo" },
            lock: { mode: "pessimistic_write" },
          },
        );
        if (asignacionActual?.grupoId === grupo.id) {
          throw new ConflictException(
            "El estudiante ya esta asignado a este grupo",
          );
        }
        if (asignacionActual) {
          asignacionActual.estado = "trasladado";
          await manager.save(asignacionActual);
        }

        return manager.save(
          manager.create(AsignacionEstudianteGrupo, {
            matriculaId,
            grupoId: grupo.id,
            fechaAsignacion: dto.fechaAsignacion,
            estado: "activo",
            observaciones: dto.observaciones ?? null,
          }),
        );
      });

      this.setAuditResult(asignacion);
      return asignacion;
    } catch (error) {
      this.throwIfUniqueViolation(
        error,
        "La matricula ya tiene una asignacion de grupo activa",
      );
      throw error;
    }
  }

  async completarAcudiente(
    matriculaId: string,
    dto: CompletarAcudienteMatriculaDto,
    currentUser: JwtPayload,
  ) {
    const matricula = await this.dataSource.transaction(async (manager) => {
      const pendiente = await manager.findOne(Matricula, {
        where: {
          id: matriculaId,
          estado: "pendiente_acudiente",
          eliminadoEn: IsNull(),
        },
        lock: { mode: "pessimistic_write" },
      });
      if (!pendiente) {
        throw new NotFoundException(
          "Matricula pendiente de acudiente no encontrada",
        );
      }

      this.assertInstitutionAccess(pendiente.institucionId, currentUser);
      await this.findVinculoAcudienteActivo(
        manager,
        pendiente.estudianteId,
        dto.acudienteId,
      );

      pendiente.acudienteId = dto.acudienteId;
      pendiente.estado = "activa";
      pendiente.acudienteCompletadoEn = new Date();
      pendiente.version += 1;
      return manager.save(pendiente);
    });

    this.setAuditResult(matricula);
    return matricula;
  }

  async retirarMatricula(
    matriculaId: string,
    dto: RetirarMatriculaDto,
    currentUser: JwtPayload,
  ) {
    const matricula = await this.dataSource.transaction(async (manager) => {
      const actual = await this.findMatriculaVigenteConBloqueo(
        manager,
        matriculaId,
      );
      this.assertInstitutionAccess(actual.institucionId, currentUser);

      actual.estado = "retirada";
      actual.fechaRetiro = dto.fechaRetiro;
      actual.motivoRetiro = dto.motivoRetiro;
      actual.version += 1;
      await manager.save(actual);

      const asignacion = await manager.findOne(AsignacionEstudianteGrupo, {
        where: { matriculaId, estado: "activo" },
        lock: { mode: "pessimistic_write" },
      });
      if (asignacion) {
        asignacion.estado = "retirado";
        await manager.save(asignacion);
      }

      return actual;
    });

    this.setAuditResult(matricula);
    return matricula;
  }

  async createTraslado(dto: CrearTrasladoDto, currentUser: JwtPayload) {
    try {
      const traslado = await this.dataSource.transaction(async (manager) => {
        const matricula = await this.findMatriculaVigenteConBloqueo(
          manager,
          dto.matriculaOrigenId,
        );
        this.assertInstitutionAccess(matricula.institucionId, currentUser);
        await this.validateTransferDestination(manager, dto);

        const asignacionOrigen = await manager.findOne(
          AsignacionEstudianteGrupo,
          { where: { matriculaId: matricula.id, estado: "activo" } },
        );
        const tipoTraslado = this.resolveTransferType(
          matricula,
          asignacionOrigen?.grupoId ?? null,
          dto,
        );

        return manager.save(
          manager.create(TrasladoEstudiantil, {
            codigo: dto.codigo,
            estudianteId: matricula.estudianteId,
            institucionOrigenId: matricula.institucionId,
            sedeOrigenId: matricula.sedeId,
            gradoOrigenId: matricula.gradoId,
            jornadaOrigenId: matricula.jornadaId,
            grupoOrigenId: asignacionOrigen?.grupoId ?? null,
            matriculaOrigenId: matricula.id,
            institucionDestinoId: dto.institucionDestinoId,
            sedeDestinoId: dto.sedeDestinoId,
            anioLectivoDestinoId: dto.anioLectivoDestinoId,
            gradoDestinoId: dto.gradoDestinoId,
            jornadaDestinoId: dto.jornadaDestinoId,
            grupoDestinoId: dto.grupoDestinoId ?? null,
            tipoTraslado,
            motivoTraslado: dto.motivoTraslado,
            fechaSolicitud: dto.fechaSolicitud,
            fechaAprobacion: null,
            fechaEfectiva: null,
            estado: "solicitado",
            observaciones: dto.observaciones ?? null,
            aprobadoPorUsuarioId: null,
          }),
        );
      });

      this.setAuditResult(traslado);
      return traslado;
    } catch (error) {
      this.throwIfUniqueViolation(
        error,
        "Ya existe un traslado abierto para la matricula o el codigo esta registrado",
      );
      throw error;
    }
  }

  findTraslados(institucionId: string) {
    return this.trasladosRepository.find({
      where: [
        { institucionOrigenId: institucionId },
        { institucionDestinoId: institucionId },
      ],
      order: { fechaSolicitud: "DESC", codigo: "ASC" },
    });
  }

  async findTraslado(trasladoId: string, currentUser: JwtPayload) {
    const traslado = await this.trasladosRepository.findOneBy({
      id: trasladoId,
    });
    if (!traslado) {
      throw new NotFoundException("Traslado no encontrado");
    }
    this.assertTransferReadAccess(traslado, currentUser);
    return traslado;
  }

  async aprobarTraslado(
    trasladoId: string,
    dto: AprobarTrasladoDto,
    currentUser: JwtPayload,
  ) {
    const traslado = await this.dataSource.transaction(async (manager) => {
      const actual = await this.findTrasladoConBloqueo(manager, trasladoId, [
        "solicitado",
        "en_revision",
      ]);
      this.assertDestinationAccess(actual, currentUser);
      if (dto.fechaAprobacion < actual.fechaSolicitud) {
        throw new BadRequestException(
          "La fecha de aprobacion no puede ser anterior a la solicitud",
        );
      }

      actual.estado = "aprobado";
      actual.fechaAprobacion = dto.fechaAprobacion;
      actual.aprobadoPorUsuarioId = currentUser.usuarioId;
      if (dto.observaciones !== undefined) {
        actual.observaciones = dto.observaciones;
      }
      return manager.save(actual);
    });

    this.setAuditResult(traslado);
    return traslado;
  }

  async rechazarTraslado(
    trasladoId: string,
    dto: RechazarTrasladoDto,
    currentUser: JwtPayload,
  ) {
    const traslado = await this.dataSource.transaction(async (manager) => {
      const actual = await this.findTrasladoConBloqueo(manager, trasladoId, [
        "solicitado",
        "en_revision",
      ]);
      this.assertDestinationAccess(actual, currentUser);
      actual.estado = "rechazado";
      actual.observaciones = dto.observaciones;
      return manager.save(actual);
    });

    this.setAuditResult(traslado);
    return traslado;
  }

  async ejecutarTraslado(
    trasladoId: string,
    dto: EjecutarTrasladoDto,
    currentUser: JwtPayload,
  ) {
    try {
      const resultado = await this.dataSource.transaction(async (manager) => {
        const traslado = await this.findTrasladoConBloqueo(
          manager,
          trasladoId,
          ["aprobado"],
        );
        this.assertDestinationAccess(traslado, currentUser);
        if (
          traslado.fechaAprobacion &&
          dto.fechaEfectiva < traslado.fechaAprobacion
        ) {
          throw new BadRequestException(
            "La fecha efectiva no puede ser anterior a la aprobacion",
          );
        }

        const matriculaOrigen = await this.findMatriculaVigenteConBloqueo(
          manager,
          traslado.matriculaOrigenId!,
        );
        await this.validateStoredTransferDestination(manager, traslado);
        const asignacionOrigen = await manager.findOne(
          AsignacionEstudianteGrupo,
          {
            where: { matriculaId: matriculaOrigen.id, estado: "activo" },
            lock: { mode: "pessimistic_write" },
          },
        );

        let matriculaDestino: Matricula;
        if (matriculaOrigen.institucionId === traslado.institucionDestinoId) {
          matriculaOrigen.sedeId = traslado.sedeDestinoId!;
          matriculaOrigen.anioLectivoId = traslado.anioLectivoDestinoId!;
          matriculaOrigen.gradoId = traslado.gradoDestinoId!;
          matriculaOrigen.jornadaId = traslado.jornadaDestinoId!;
          matriculaOrigen.version += 1;
          matriculaDestino = await manager.save(matriculaOrigen);
        } else {
          if (!dto.codigoMatriculaDestino?.trim()) {
            throw new BadRequestException(
              "El traslado entre instituciones requiere codigo de matricula destino",
            );
          }
          const estadoDestino = matriculaOrigen.estado;
          matriculaOrigen.estado = "trasladada";
          matriculaOrigen.fechaRetiro = dto.fechaEfectiva;
          matriculaOrigen.motivoRetiro = `Traslado ${traslado.codigo}`;
          matriculaOrigen.version += 1;
          await manager.save(matriculaOrigen);

          matriculaDestino = await manager.save(
            manager.create(Matricula, {
              codigo: dto.codigoMatriculaDestino,
              institucionId: traslado.institucionDestinoId!,
              estudianteId: matriculaOrigen.estudianteId,
              acudienteId: matriculaOrigen.acudienteId,
              anioLectivoId: traslado.anioLectivoDestinoId!,
              sedeId: traslado.sedeDestinoId!,
              jornadaId: traslado.jornadaDestinoId!,
              gradoId: traslado.gradoDestinoId!,
              estado: estadoDestino,
              fechaMatricula: dto.fechaEfectiva,
              fechaLimiteAcudiente:
                estadoDestino === "pendiente_acudiente"
                  ? this.maxDate(
                      matriculaOrigen.fechaLimiteAcudiente!,
                      dto.fechaEfectiva,
                    )
                  : null,
              motivoPendienteAcudiente:
                estadoDestino === "pendiente_acudiente"
                  ? matriculaOrigen.motivoPendienteAcudiente
                  : null,
              acudienteCompletadoEn: matriculaOrigen.acudienteCompletadoEn,
              fechaRetiro: null,
              motivoRetiro: null,
              matriculaOrigenId: matriculaOrigen.id,
              trasladoEntranteId: traslado.id,
              eliminadoEn: null,
              version: 1,
            }),
          );
        }

        if (
          asignacionOrigen &&
          asignacionOrigen.grupoId !== traslado.grupoDestinoId
        ) {
          asignacionOrigen.estado = "trasladado";
          await manager.save(asignacionOrigen);
        }
        if (
          traslado.grupoDestinoId &&
          asignacionOrigen?.grupoId !== traslado.grupoDestinoId
        ) {
          await manager.save(
            manager.create(AsignacionEstudianteGrupo, {
              matriculaId: matriculaDestino.id,
              grupoId: traslado.grupoDestinoId,
              fechaAsignacion: dto.fechaEfectiva,
              estado: "activo",
              observaciones: `Asignacion por traslado ${traslado.codigo}`,
            }),
          );
        }

        traslado.estado = "ejecutado";
        traslado.fechaEfectiva = dto.fechaEfectiva;
        await manager.save(traslado);
        return { traslado, matriculaDestino };
      });

      this.setAuditResult(resultado.traslado);
      return resultado;
    } catch (error) {
      this.throwIfUniqueViolation(
        error,
        "La matricula destino o la asignacion de grupo entra en conflicto con un registro vigente",
      );
      throw error;
    }
  }

  private async findPersonaActiva(personaId: string) {
    const persona = await this.personasRepository.findOneBy({
      id: personaId,
      activo: true,
      eliminadoEn: IsNull(),
    });
    if (!persona) {
      throw new NotFoundException("Persona activa no encontrada");
    }
    return persona;
  }

  private async findEstudianteActivo(estudianteId: string) {
    const estudiante = await this.estudiantesRepository.findOneBy({
      id: estudianteId,
      estado: "activo",
      eliminadoEn: IsNull(),
    });
    if (!estudiante) {
      throw new NotFoundException("Estudiante activo no encontrado");
    }
    return estudiante;
  }

  private async findAcudienteActivo(acudienteId: string) {
    const acudiente = await this.acudientesRepository.findOneBy({
      id: acudienteId,
      estado: "activo",
    });
    if (!acudiente) {
      throw new NotFoundException("Acudiente activo no encontrado");
    }
    return acudiente;
  }

  private async findInstitucionActiva(
    manager: EntityManager,
    institucionId: string,
  ) {
    const institucion = await manager.findOneBy(Institucion, {
      id: institucionId,
      activo: true,
      eliminadoEn: IsNull(),
    });
    if (!institucion) {
      throw new NotFoundException("Institucion activa no encontrada");
    }
    return institucion;
  }

  private async findEstudianteActivoConBloqueo(
    manager: EntityManager,
    estudianteId: string,
  ) {
    const estudiante = await manager.findOne(Estudiante, {
      where: { id: estudianteId, estado: "activo", eliminadoEn: IsNull() },
      lock: { mode: "pessimistic_write" },
    });
    if (!estudiante) {
      throw new NotFoundException("Estudiante activo no encontrado");
    }
    return estudiante;
  }

  private async findVinculoAcudienteActivo(
    manager: EntityManager,
    estudianteId: string,
    acudienteId: string,
  ) {
    const vinculo = await manager
      .getRepository(EstudianteAcudiente)
      .createQueryBuilder("vinculo")
      .innerJoin(
        Acudiente,
        "acudiente",
        "acudiente.id = vinculo.acudiente_id AND acudiente.estado = :estado",
        { estado: "activo" },
      )
      .where("vinculo.estudiante_id = :estudianteId", { estudianteId })
      .andWhere("vinculo.acudiente_id = :acudienteId", { acudienteId })
      .andWhere("vinculo.activo = true")
      .getOne();
    if (!vinculo) {
      throw new BadRequestException(
        "La matricula requiere un acudiente activo vinculado al estudiante",
      );
    }
    return vinculo;
  }

  private async validateAcademicReferences(
    manager: EntityManager,
    institucionId: string,
    dto: CrearMatriculaDto,
  ) {
    const [anio, sede, jornada, grado] = await Promise.all([
      manager.findOneBy(AnioLectivo, {
        id: dto.anioLectivoId,
        institucionId,
        eliminadoEn: IsNull(),
      }),
      manager.findOneBy(Sede, {
        id: dto.sedeId,
        institucionId,
        activo: true,
        eliminadoEn: IsNull(),
      }),
      manager.findOneBy(Jornada, {
        id: dto.jornadaId,
        institucionId,
        activo: true,
      }),
      manager.findOneBy(Grado, {
        id: dto.gradoId,
        institucionId,
        activo: true,
        eliminadoEn: IsNull(),
      }),
    ]);
    if (!anio || !sede || !jornada || !grado) {
      throw new BadRequestException(
        "El anio lectivo, sede, jornada y grado deben pertenecer a la institucion y estar activos",
      );
    }
  }

  private validatePendingGuardianData(dto: CrearMatriculaDto): void {
    if (!dto.fechaLimiteAcudiente || !dto.motivoPendienteAcudiente?.trim()) {
      throw new BadRequestException(
        "La matricula sin acudiente requiere fecha limite y motivo",
      );
    }
    if (dto.fechaLimiteAcudiente < dto.fechaMatricula) {
      throw new BadRequestException(
        "La fecha limite del acudiente no puede ser anterior a la fecha de matricula",
      );
    }
  }

  private async findGrupoCompatible(
    manager: EntityManager,
    grupoId: string,
    matricula: Matricula,
  ) {
    const grupo = await manager.findOneBy(Grupo, {
      id: grupoId,
      institucionId: matricula.institucionId,
      sedeId: matricula.sedeId,
      anioLectivoId: matricula.anioLectivoId,
      jornadaId: matricula.jornadaId,
      gradoId: matricula.gradoId,
      activo: true,
      eliminadoEn: IsNull(),
    });
    if (!grupo) {
      throw new BadRequestException(
        "El grupo no corresponde a la institucion, sede, anio lectivo, jornada y grado de la matricula",
      );
    }
    return grupo;
  }

  private validateTransferDestination(
    manager: EntityManager,
    dto: CrearTrasladoDto,
  ) {
    return this.validateDestinationReferences(manager, {
      institucionId: dto.institucionDestinoId,
      sedeId: dto.sedeDestinoId,
      anioLectivoId: dto.anioLectivoDestinoId,
      gradoId: dto.gradoDestinoId,
      jornadaId: dto.jornadaDestinoId,
      grupoId: dto.grupoDestinoId ?? null,
    });
  }

  private validateStoredTransferDestination(
    manager: EntityManager,
    traslado: TrasladoEstudiantil,
  ) {
    if (
      !traslado.institucionDestinoId ||
      !traslado.sedeDestinoId ||
      !traslado.anioLectivoDestinoId ||
      !traslado.gradoDestinoId ||
      !traslado.jornadaDestinoId
    ) {
      throw new BadRequestException(
        "El traslado no tiene un destino academico completo",
      );
    }
    return this.validateDestinationReferences(manager, {
      institucionId: traslado.institucionDestinoId,
      sedeId: traslado.sedeDestinoId,
      anioLectivoId: traslado.anioLectivoDestinoId,
      gradoId: traslado.gradoDestinoId,
      jornadaId: traslado.jornadaDestinoId,
      grupoId: traslado.grupoDestinoId,
    });
  }

  private async validateDestinationReferences(
    manager: EntityManager,
    destino: {
      institucionId: string;
      sedeId: string;
      anioLectivoId: string;
      gradoId: string;
      jornadaId: string;
      grupoId: string | null;
    },
  ) {
    const institucion = await manager.findOneBy(Institucion, {
      id: destino.institucionId,
      activo: true,
      eliminadoEn: IsNull(),
    });
    const sede = await manager.findOneBy(Sede, {
      id: destino.sedeId,
      institucionId: destino.institucionId,
      activo: true,
      eliminadoEn: IsNull(),
    });
    const anio = await manager.findOneBy(AnioLectivo, {
      id: destino.anioLectivoId,
      institucionId: destino.institucionId,
      eliminadoEn: IsNull(),
    });
    const grado = await manager.findOneBy(Grado, {
      id: destino.gradoId,
      institucionId: destino.institucionId,
      activo: true,
      eliminadoEn: IsNull(),
    });
    const jornada = await manager.findOneBy(Jornada, {
      id: destino.jornadaId,
      institucionId: destino.institucionId,
      activo: true,
    });
    if (!institucion || !sede || !anio || !grado || !jornada) {
      throw new BadRequestException(
        "El destino del traslado debe pertenecer a una institucion activa y ser academicamente consistente",
      );
    }

    if (destino.grupoId) {
      const grupo = await manager.findOneBy(Grupo, {
        id: destino.grupoId,
        institucionId: destino.institucionId,
        sedeId: destino.sedeId,
        anioLectivoId: destino.anioLectivoId,
        gradoId: destino.gradoId,
        jornadaId: destino.jornadaId,
        activo: true,
        eliminadoEn: IsNull(),
      });
      if (!grupo) {
        throw new BadRequestException(
          "El grupo destino no corresponde a la estructura academica indicada",
        );
      }
    }
  }

  private resolveTransferType(
    matricula: Matricula,
    grupoOrigenId: string | null,
    dto: CrearTrasladoDto,
  ): string {
    if (matricula.institucionId !== dto.institucionDestinoId) {
      return "entre_instituciones";
    }

    const sedeCambia = matricula.sedeId !== dto.sedeDestinoId;
    const jornadaCambia = matricula.jornadaId !== dto.jornadaDestinoId;
    const grupoCambia = grupoOrigenId !== (dto.grupoDestinoId ?? null);
    const otrasDimensionesCambian =
      matricula.anioLectivoId !== dto.anioLectivoDestinoId ||
      matricula.gradoId !== dto.gradoDestinoId;
    const cambios = [
      sedeCambia,
      jornadaCambia,
      grupoCambia,
      otrasDimensionesCambian,
    ].filter(Boolean).length;

    if (cambios === 0) {
      throw new BadRequestException(
        "El destino del traslado es igual a la ubicacion actual",
      );
    }
    if (cambios > 1 || otrasDimensionesCambian) {
      return "mixto";
    }
    if (sedeCambia) {
      return "entre_sedes";
    }
    if (jornadaCambia) {
      return "entre_jornadas";
    }
    return "entre_grupos";
  }

  private async findTrasladoConBloqueo(
    manager: EntityManager,
    trasladoId: string,
    estados: string[],
  ) {
    const traslado = await manager.findOne(TrasladoEstudiantil, {
      where: { id: trasladoId, estado: In(estados) },
      lock: { mode: "pessimistic_write" },
    });
    if (!traslado) {
      throw new NotFoundException(
        "Traslado no encontrado en un estado valido para la operacion",
      );
    }
    return traslado;
  }

  private assertTransferReadAccess(
    traslado: TrasladoEstudiantil,
    currentUser: JwtPayload,
  ): void {
    if (currentUser.superadministrador) {
      return;
    }
    if (
      !currentUser.institucionId ||
      (currentUser.institucionId !== traslado.institucionOrigenId &&
        currentUser.institucionId !== traslado.institucionDestinoId)
    ) {
      throw new ForbiddenException(
        "No puede consultar traslados ajenos a su institucion",
      );
    }
  }

  private assertDestinationAccess(
    traslado: TrasladoEstudiantil,
    currentUser: JwtPayload,
  ): void {
    if (currentUser.superadministrador) {
      return;
    }
    if (
      !currentUser.institucionId ||
      currentUser.institucionId !== traslado.institucionDestinoId
    ) {
      throw new ForbiddenException(
        "Solo la institucion destino puede decidir o ejecutar el traslado",
      );
    }
  }

  private maxDate(first: string, second: string): string {
    return first > second ? first : second;
  }

  private async findMatriculaVigenteConBloqueo(
    manager: EntityManager,
    matriculaId: string,
  ) {
    const matricula = await manager.findOne(Matricula, {
      where: {
        id: matriculaId,
        estado: In(["activa", "pendiente_acudiente"]),
        eliminadoEn: IsNull(),
      },
      lock: { mode: "pessimistic_write" },
    });
    if (!matricula) {
      throw new NotFoundException("Matricula vigente no encontrada");
    }
    return matricula;
  }

  private assertInstitutionAccess(
    institucionId: string,
    currentUser: JwtPayload,
  ) {
    if (currentUser.superadministrador) {
      return;
    }
    if (
      !currentUser.institucionId ||
      currentUser.institucionId !== institucionId
    ) {
      throw new ForbiddenException(
        "No puede operar fuera de la institucion asociada a su usuario",
      );
    }
  }

  private throwIfUniqueViolation(error: unknown, message: string): void {
    if (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string }).code === "23505"
    ) {
      throw new ConflictException(message);
    }
  }

  private setAuditResult(entity: { id: string }): void {
    setAuditEntityId(entity.id);
    setAuditAfterState(entity);
  }
}
