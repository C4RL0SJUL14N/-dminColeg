import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { JwtPayload } from '@libs/common';
import {
  AnioLectivo,
  ConfiguracionInstitucion,
  EscalaValoracion,
  Institucion,
  NivelEscalaValoracion,
  PeriodoAcademico,
  Sede,
} from '@libs/database';
import {
  ActualizarInstitucionDto,
  ConfiguracionInstitucionDto,
  CrearAnioLectivoDto,
  CrearEscalaValoracionDto,
  CrearInstitucionDto,
  CrearPeriodoAcademicoDto,
  CrearSedeDto,
} from './dto';

@Injectable()
export class InstitutionService {
  constructor(
    @InjectRepository(Institucion)
    private readonly institucionesRepository: Repository<Institucion>,
    @InjectRepository(Sede)
    private readonly sedesRepository: Repository<Sede>,
    @InjectRepository(AnioLectivo)
    private readonly aniosLectivosRepository: Repository<AnioLectivo>,
    @InjectRepository(PeriodoAcademico)
    private readonly periodosRepository: Repository<PeriodoAcademico>,
    @InjectRepository(ConfiguracionInstitucion)
    private readonly configuracionesRepository: Repository<ConfiguracionInstitucion>,
    @InjectRepository(EscalaValoracion)
    private readonly escalasRepository: Repository<EscalaValoracion>,
    @InjectRepository(NivelEscalaValoracion)
    private readonly nivelesRepository: Repository<NivelEscalaValoracion>,
  ) {}

  async createInstitucion(dto: CrearInstitucionDto, currentUser: JwtPayload) {
    if (!currentUser.superadministrador) {
      throw new ForbiddenException('Solo el superadministrador puede crear instituciones');
    }

    return this.institucionesRepository.save(
      this.institucionesRepository.create({
        codigo: dto.codigo,
        nombre: dto.nombre,
        activo: true,
        eliminadoEn: null,
        version: 1,
      }),
    );
  }

  findInstituciones(currentUser: JwtPayload) {
    if (currentUser.superadministrador) {
      return this.institucionesRepository.find({ order: { nombre: 'ASC' } });
    }

    return this.institucionesRepository.find({
      where: { id: currentUser.institucionId ?? undefined },
      order: { nombre: 'ASC' },
    });
  }

  async findInstitucionById(id: string) {
    const institucion = await this.institucionesRepository.findOneBy({ id });
    if (!institucion) {
      throw new NotFoundException('Institucion no encontrada');
    }

    return institucion;
  }

  async updateInstitucion(id: string, dto: ActualizarInstitucionDto) {
    const institucion = await this.findInstitucionById(id);
    Object.assign(institucion, dto);
    return this.institucionesRepository.save(institucion);
  }

  async createSede(institucionId: string, dto: CrearSedeDto) {
    await this.findInstitucionById(institucionId);
    return this.sedesRepository.save(
      this.sedesRepository.create({
        institucionId,
        codigo: dto.codigo,
        nombre: dto.nombre,
        activo: true,
        eliminadoEn: null,
        version: 1,
      }),
    );
  }

  findSedes(institucionId: string) {
    return this.sedesRepository.find({
      where: { institucionId },
      order: { nombre: 'ASC' },
    });
  }

  async createAnioLectivo(institucionId: string, dto: CrearAnioLectivoDto) {
    await this.findInstitucionById(institucionId);
    return this.aniosLectivosRepository.save(
      this.aniosLectivosRepository.create({
        codigo: randomUUID().slice(0, 8),
        institucionId,
        nombre: dto.nombre,
        anio: new Date(dto.fechaInicio).getUTCFullYear(),
        fechaInicio: dto.fechaInicio,
        fechaFin: dto.fechaFin,
        estado: 'activo',
        eliminadoEn: null,
        version: 1,
      }),
    );
  }

  findAniosLectivos(institucionId: string) {
    return this.aniosLectivosRepository.find({
      where: { institucionId },
      order: { fechaInicio: 'DESC' },
    });
  }

  async createPeriodo(
    anioLectivoId: string,
    dto: CrearPeriodoAcademicoDto,
    currentUser: JwtPayload,
  ) {
    await this.findAnioLectivoById(anioLectivoId, currentUser);
    return this.periodosRepository.save(
      this.periodosRepository.create({
        codigo: randomUUID().slice(0, 8),
        anioLectivoId,
        nombre: dto.nombre,
        fechaInicio: dto.fechaInicio,
        fechaFin: dto.fechaFin,
        orden: dto.orden,
        estado: 'abierto',
        modoCierre: 'manual',
        cerradoPorUsuarioId: null,
        eliminadoEn: null,
        version: 1,
      }),
    );
  }

  async findPeriodos(anioLectivoId: string, currentUser: JwtPayload) {
    await this.findAnioLectivoById(anioLectivoId, currentUser);
    return this.periodosRepository.find({
      where: { anioLectivoId },
      order: { orden: 'ASC' },
    });
  }

  async cerrarPeriodo(periodoId: string, currentUser: JwtPayload) {
    const periodo = await this.findPeriodoById(periodoId, currentUser);

    periodo.estado = 'cerrado';
    return this.periodosRepository.save(periodo);
  }

  async upsertConfiguracion(
    institucionId: string,
    dto: ConfiguracionInstitucionDto,
  ) {
    await this.findInstitucionById(institucionId);
    const existente = await this.configuracionesRepository.findOne({
      where: { institucionId },
    });

    if (existente) {
      existente.modeloPedagogico =
        (dto.configuracion?.modeloPedagogico as string | undefined) ??
        dto.idioma ??
        existente.modeloPedagogico;
      existente.enfoquePedagogico =
        (dto.configuracion?.enfoquePedagogico as string | undefined) ??
        dto.zonaHoraria ??
        existente.enfoquePedagogico;
      existente.tipoEscalaValoracion =
        (dto.configuracion?.tipoEscalaValoracion as string | undefined) ??
        existente.tipoEscalaValoracion;
      return this.configuracionesRepository.save(existente);
    }

    return this.configuracionesRepository.save(
      this.configuracionesRepository.create({
        institucionId,
        logoUrl: null,
        modeloPedagogico:
          (dto.configuracion?.modeloPedagogico as string | undefined) ?? dto.idioma ?? null,
        enfoquePedagogico:
          (dto.configuracion?.enfoquePedagogico as string | undefined) ??
          dto.zonaHoraria ??
          null,
        tipoEscalaValoracion:
          (dto.configuracion?.tipoEscalaValoracion as string | undefined) ?? 'numerica',
        actualizadoPorUsuarioId: null,
        version: 1,
      }),
    );
  }

  async getConfiguracion(institucionId: string) {
    await this.findInstitucionById(institucionId);
    return this.configuracionesRepository.findOne({
      where: { institucionId },
    });
  }

  async createEscalaValoracion(
    institucionId: string,
    dto: CrearEscalaValoracionDto,
  ) {
    await this.findInstitucionById(institucionId);
    const escala = await this.escalasRepository.save(
      this.escalasRepository.create({
        institucionId,
        nombre: dto.nombre,
        tipo: 'numerica',
        valorMinimo: dto.niveles[0]?.valorMinimo ?? null,
        valorMaximo: dto.niveles[dto.niveles.length - 1]?.valorMaximo ?? null,
        valorAprobacion: null,
        esPredeterminada: false,
        activo: true,
      }),
    );

    const niveles = dto.niveles.map((nivel) =>
      this.nivelesRepository.create({
        escalaValoracionId: escala.id,
        nombre: nivel.nombre,
        etiquetaCorta: nivel.codigo,
        valorMinimo: nivel.valorMinimo,
        valorMaximo: nivel.valorMaximo,
        orden: nivel.orden,
        colorHex: null,
      }),
    );

    await this.nivelesRepository.save(niveles);
    return this.findEscalasValoracion(institucionId);
  }

  async findEscalasValoracion(institucionId: string) {
    const escalas = await this.escalasRepository.find({
      where: { institucionId },
      order: { nombre: 'ASC' },
    });

    const result = [];
    for (const escala of escalas) {
      const niveles = await this.nivelesRepository.find({
        where: { escalaValoracionId: escala.id },
        order: { orden: 'ASC' },
      });
      result.push({ ...escala, niveles });
    }

    return result;
  }

  private async findAnioLectivoById(id: string, currentUser?: JwtPayload) {
    const anio = await this.aniosLectivosRepository.findOneBy({ id });
    if (!anio) {
      throw new NotFoundException('Anio lectivo no encontrado');
    }

    this.assertInstitutionAccess(anio.institucionId, currentUser);

    return anio;
  }

  private async findPeriodoById(id: string, currentUser?: JwtPayload) {
    const periodo = await this.periodosRepository.findOneBy({ id });
    if (!periodo) {
      throw new NotFoundException('Periodo academico no encontrado');
    }

    const anio = await this.findAnioLectivoById(periodo.anioLectivoId, currentUser);
    this.assertInstitutionAccess(anio.institucionId, currentUser);

    return periodo;
  }

  private assertInstitutionAccess(institucionId: string, currentUser?: JwtPayload) {
    if (!currentUser || currentUser.superadministrador) {
      return;
    }

    if (!currentUser.institucionId || currentUser.institucionId !== institucionId) {
      throw new ForbiddenException(
        'No puede operar fuera de la institucion asociada a su usuario',
      );
    }
  }
}
