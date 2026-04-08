import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { setAuditAfterState, setAuditBeforeState, setAuditEntityId } from '@libs/audit';
import { Genero, Persona, TipoDocumento } from '@libs/database';
import { ActualizarPersonaDto, CrearPersonaDto } from './dto';

@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(Persona)
    private readonly personasRepository: Repository<Persona>,
    @InjectRepository(TipoDocumento)
    private readonly tiposDocumentoRepository: Repository<TipoDocumento>,
    @InjectRepository(Genero)
    private readonly generosRepository: Repository<Genero>,
  ) {}

  async createPersona(dto: CrearPersonaDto) {
    const existente = await this.personasRepository.findOne({
      where: {
        tipoDocumentoId: dto.tipoDocumentoId,
        numeroDocumento: dto.numeroDocumento,
      },
    });
    if (existente) {
      throw new ConflictException('La persona ya existe con ese documento');
    }

    const persona = await this.personasRepository.save(
      this.personasRepository.create({
        codigo: dto.numeroDocumento || randomUUID().slice(0, 12),
        tipoDocumentoId: dto.tipoDocumentoId,
        generoId: dto.generoId ?? null,
        numeroDocumento: dto.numeroDocumento,
        primerNombre: dto.primerNombre,
        segundoNombre: dto.segundoNombre ?? null,
        primerApellido: dto.primerApellido,
        segundoApellido: dto.segundoApellido ?? null,
        correoPersonal: dto.correoElectronico ?? null,
        correoInstitucional: null,
        telefono: dto.telefono ?? null,
        activo: true,
        eliminadoEn: null,
        version: 1,
      }),
    );
    setAuditEntityId(persona.id);
    setAuditAfterState(persona);
    return persona;
  }

  async getPersonaById(id: string) {
    const persona = await this.personasRepository.findOne({
      where: { id },
      relations: { tipoDocumento: true, genero: true },
    });
    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }

    return persona;
  }

  async updatePersona(id: string, dto: ActualizarPersonaDto) {
    const persona = await this.getPersonaById(id);
    setAuditEntityId(id);
    setAuditBeforeState(persona);
    Object.assign(persona, {
      generoId: dto.generoId ?? persona.generoId,
      primerNombre: dto.primerNombre ?? persona.primerNombre,
      segundoNombre: dto.segundoNombre ?? persona.segundoNombre,
      primerApellido: dto.primerApellido ?? persona.primerApellido,
      segundoApellido: dto.segundoApellido ?? persona.segundoApellido,
      correoPersonal: dto.correoElectronico ?? persona.correoPersonal,
      telefono: dto.telefono ?? persona.telefono,
    });

    const updated = await this.personasRepository.save(persona);
    setAuditAfterState(updated);
    return updated;
  }

  async buscarPorDocumento(tipoDocumentoId: string, numeroDocumento: string) {
    setAuditBeforeState({ tipoDocumentoId, numeroDocumento });
    const persona = await this.personasRepository.findOne({
      where: { tipoDocumentoId, numeroDocumento },
      relations: { tipoDocumento: true, genero: true },
    });
    if (!persona) {
      throw new NotFoundException('No existe persona con el documento consultado');
    }

    setAuditEntityId(persona.id);
    setAuditAfterState({
      personaId: persona.id,
      tipoDocumentoId,
      numeroDocumento,
    });
    return persona;
  }

  getTiposDocumento() {
    return this.tiposDocumentoRepository.find({ order: { nombre: 'ASC' } });
  }

  getGeneros() {
    return this.generosRepository.find({ order: { nombre: 'ASC' } });
  }
}
